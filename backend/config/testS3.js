require('dotenv').config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function test() {
  const data = await s3.send(new ListBucketsCommand({}));
  console.log('S3 connected! Buckets:', data.Buckets.map(b => b.Name));
}

test().catch(console.error);
