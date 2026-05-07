// ── Housing Controller ──────────────────────────────────────────────────────
// Handles request/response logic for housing resources.
// Delegates data access to the Housing model.

const path = require('path');
const fs   = require('fs');
const HousingModel = require('../models/Housing');
const { HousingMongoose } = HousingModel;
const { s3 } = require('../config/s3');
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');

// GET /api/housing
// Returns all housing areas with their reviews as JSON.
const getHousing = async (req, res) => {
  try {
    const housing = await HousingModel.getAll();
    res.json(housing);
  } catch (err) {
    console.error('Failed to fetch housing:', err);
    res.status(500).json({ message: 'Failed to fetch housing' });
  }
};

// Rewrites mockData.js with current DB state so the seed file stays in sync.
async function syncMockData() {
  const areas = await HousingMongoose.find({}).lean();
  const mockDataPath = path.join(__dirname, '../data/mockData.js');

  // Preserve existing emoji values (they live only in the file, not in the DB).
  let existingEmoji = {};
  try {
    // Clear require cache so we get the latest file contents
    delete require.cache[require.resolve('../data/mockData')];
    const { housing: existing } = require('../data/mockData');
    for (const h of existing) existingEmoji[h.name] = h.emoji || '';
  } catch (_) {}

  const housingJs = areas.map((a, i) => {
    const obj = {
      id:            i + 101,
      emoji:         existingEmoji[a.name] || '',
      name:          a.name,
      type:          a.type,
      description:   a.description,
      distance:      a.distance,
      rentMin:       a.rentMin,
      rentMax:       a.rentMax,
      amenities:     a.amenities,
      busRoutes:     a.busRoutes,
      imageUrls:     a.imageUrls,
      floorPlans:    a.floorPlans.map(fp => ({
        layout:      fp.layout,
        sqft:        fp.sqft,
        description: fp.description,
        imageUrl:    fp.imageUrl,
        imageKey:    fp.imageKey,
      })),
      coordinates:   a.coordinates,
      mapEmbedUrl:   a.mapEmbedUrl,
      averageRating: a.averageRating,
      reviewCount:   a.reviewCount,
      contact:       a.contact,
      housingReviews: [],
    };
    return '  ' + JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');
  });

  const content = `// ── Backend mock data ──────────────────────────────────────────────────────────
// Housing seed data for the neighbourhood guide.
// Listings and users are created via the app — no mock data needed.
// AUTO-GENERATED: do not edit by hand — updated by updateHousing controller.

const housing = [\n${housingJs.join(',\n')},\n];\n\nmodule.exports = { housing };\n`;

  fs.writeFileSync(mockDataPath, content, 'utf8');
}

// PATCH /api/housing/:id
// Updates housing area data, carousel images, and per-floor-plan images.
//
// Multipart fields accepted:
//   name, type, description, distance, rentMin, rentMax,
//   amenities (JSON array string), busRoutes (JSON array string),
//   mapEmbedUrl, contact (JSON object string),
//   removeCarouselKeys (JSON array of S3 keys to delete from carousel),
//   floorPlanUpdates (JSON array: [{ index, description, sqft, layout,
//                                    removeImageKey? }])
//
// Files accepted (via multer field names):
//   carouselImages[]       – new carousel photos to append
//   floorPlanImage_<index> – replacement image for floor plan at <index>
const updateHousing = async (req, res) => {
  try {
    const area = await HousingMongoose.findById(req.params.id);
    if (!area) return res.status(404).json({ message: 'Housing area not found' });

    // ── Carousel image removals ──────────────────────────────────────────
    const removeCarouselKeys = req.body.removeCarouselKeys
      ? JSON.parse(req.body.removeCarouselKeys)
      : [];

    if (removeCarouselKeys.length > 0) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: removeCarouselKeys.map(k => ({ Key: k })) },
      }));
      area.imageUrls = area.imageUrls.filter(img => !removeCarouselKeys.includes(img.key));
    }

    // ── New carousel images ──────────────────────────────────────────────
    const carouselFiles = (req.files || []).filter(f => f.fieldname === 'carouselImages');
    if (carouselFiles.length > 0) {
      area.imageUrls.push(...carouselFiles.map(f => ({ url: f.location, key: f.key })));
    }

    // ── Floor plan updates (text fields + image removals + new images) ───
    const floorPlanUpdates = req.body.floorPlanUpdates
      ? JSON.parse(req.body.floorPlanUpdates)
      : [];

    const floorPlanImageKeys = [];

    for (const update of floorPlanUpdates) {
      const { index, layout, sqft, description, removeImageKey } = update;
      if (index == null || index < 0 || index >= area.floorPlans.length) continue;

      const fp = area.floorPlans[index];

      if (layout !== undefined)      fp.layout      = layout;
      if (sqft !== undefined)        fp.sqft        = sqft;
      if (description !== undefined) fp.description = description;

      // Remove existing floor plan image from S3 if requested
      if (removeImageKey && fp.imageKey === removeImageKey) {
        floorPlanImageKeys.push(removeImageKey);
        fp.imageUrl = '';
        fp.imageKey = '';
      }

      // Attach a newly uploaded floor plan image
      const fpFile = (req.files || []).find(f => f.fieldname === `floorPlanImage_${index}`);
      if (fpFile) {
        fp.imageUrl = fpFile.location;
        fp.imageKey = fpFile.key;
      }
    }

    if (floorPlanImageKeys.length > 0) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: floorPlanImageKeys.map(k => ({ Key: k })) },
      }));
    }

    // ── Scalar fields ────────────────────────────────────────────────────
    const { removeCarouselKeys: _r, floorPlanUpdates: _f, ...rest } = req.body;

    if (rest.amenities)  rest.amenities  = JSON.parse(rest.amenities);
    if (rest.busRoutes)  rest.busRoutes  = JSON.parse(rest.busRoutes);
    if (rest.contact)    rest.contact    = JSON.parse(rest.contact);
    if (rest.distance)   rest.distance   = Number(rest.distance);
    if (rest.rentMin)    rest.rentMin    = Number(rest.rentMin);
    if (rest.rentMax)    rest.rentMax    = Number(rest.rentMax);

    Object.assign(area, rest);
    const updated = await area.save();

    // Sync all housing areas back to mockData.js so the file stays current
    syncMockData().catch(err => console.error('mockData sync failed:', err));

    return res.json({
      ...updated.toObject(),
      id: updated._id.toString(),
    });
  } catch (err) {
    console.error('Failed to update housing:', err);
    return res.status(500).json({ message: 'Failed to update housing' });
  }
};

module.exports = { getHousing, updateHousing };
