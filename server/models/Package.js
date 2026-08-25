const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: { type: String },
  title: { type: String, required: true }, // Basic Refresh, Pro Shine & Protection, VIP Platinum
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  vehicleTypes: [{ type: String, default: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Truck'] }],
  vehicleType: { type: String, default: 'Sedan' },
  includedServices: [{ type: String }],
  discountPct: { type: Number, default: 0 },
  tagline: { type: String, default: '' },
  active: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
