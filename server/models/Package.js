const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Basic, Premium, Ultimate
  price: { type: Number, required: true },
  vehicleType: { type: String, required: true },
  includedServices: [{ type: String }],
  discountPct: { type: Number, default: 0 },
  tagline: { type: String },
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
