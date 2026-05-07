const fs   = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const BUCKET      = process.env.S3_BUCKET_NAME  || "reloop-umass-images";
const REGION      = process.env.AWS_REGION       || "us-east-1";
const IMAGES_ROOT = path.join(__dirname, "..", "housing_images");
const MOCKDATA    = path.join(__dirname, "..", "backend", "data", "mockData.js");

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const PROPERTY_MAP = {
  sugarloaf_estates:        106,
  crestview_apartments:     107,
  rolling_green_apartments: 109,
};

const MIME = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".gif":  "image/gif",
};

function getMime(file) {
  return MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
}

async function uploadFile(localPath, s3Key) {
  const body        = fs.readFileSync(localPath);
  const contentType = getMime(localPath);
  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         s3Key,
    Body:        body,
    ContentType: contentType,
  }));
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
  console.log(`  ✅ ${s3Key}`);
  return { s3Key, url };
}

async function collectUploads() {
  const results = {};

  for (const [folder, propId] of Object.entries(PROPERTY_MAP)) {
    const base = path.join(IMAGES_ROOT, folder);
    results[propId] = { imageUrls: [], floorPlans: [] };

    // Property images
    const imagesDir = path.join(base, "images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir).filter(f => MIME[path.extname(f).toLowerCase()]);
      for (const file of files) {
        const s3Key = `housing/${folder}/images/${file}`;
        const { url } = await uploadFile(path.join(imagesDir, file), s3Key);
        results[propId].imageUrls.push(url);
      }
    }

    // Floor plans
    const fpDir = path.join(base, "floor_plans");
    if (fs.existsSync(fpDir)) {
      const files = fs.readdirSync(fpDir).filter(f => MIME[path.extname(f).toLowerCase()]);
      for (const file of files) {
        const s3Key = `housing/${folder}/floor_plans/${file}`;
        const { url } = await uploadFile(path.join(fpDir, file), s3Key);
        results[propId].floorPlans.push({ imageUrl: url, imageKey: s3Key });
      }
    }
  }

  return results;
}

function patchMockData(uploads) {
  let src = fs.readFileSync(MOCKDATA, "utf8");

  for (const [propId, data] of Object.entries(uploads)) {
    const id = Number(propId);

    // Update imageUrls
    const imageUrlsLiteral = JSON.stringify(data.imageUrls);
    src = src.replace(
      new RegExp(`(id:\\s*${id}[\\s\\S]*?imageUrls:\\s*)\\[[^\\]]*\\]`),
      `$1${imageUrlsLiteral}`
    );

    // Update floorPlan imageUrl / imageKey
    for (let i = 0; i < data.floorPlans.length; i++) {
      const { imageUrl, imageKey } = data.floorPlans[i];
      src = src.replace(
        new RegExp(`(id:\\s*${id}[\\s\\S]*?floorPlans[\\s\\S]*?imageUrl:\\s*)('')([\\s\\S]*?imageKey:\\s*)('')`),
        `$1'${imageUrl}'$3'${imageKey}'`
      );
    }
  }

  fs.writeFileSync(MOCKDATA, src, "utf8");
  console.log(`\n✅ mockData.js patched with S3 URLs`);
}

(async () => {
  console.log("=== ReLoop S3 Image Uploader ===\n");

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ AWS credentials not set.");
    process.exit(1);
  }

  const uploads = await collectUploads();
  const totalImages = Object.values(uploads).reduce((n, v) => n + v.imageUrls.length, 0);
  const totalFPs    = Object.values(uploads).reduce((n, v) => n + v.floorPlans.length, 0);
  console.log(`\nUploaded ${totalImages} property images and ${totalFPs} floor plans.\n`);

  if (totalImages + totalFPs > 0) {
    patchMockData(uploads);
  } else {
    console.log("No images found to upload.");
  }
})();
