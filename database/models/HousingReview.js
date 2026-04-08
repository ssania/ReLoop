const mongoose = require('mongoose');

const housingReviewSchema = new mongoose.Schema({
  reviewer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  area:          { type: mongoose.Schema.Types.ObjectId, ref: 'HousingArea', required: true },
  stars:         { type: Number, min: 1, max: 5, required: true },
  comment:       { type: String },
  tenant_period: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HousingReview', housingReviewSchema);
