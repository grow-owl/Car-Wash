const mongoose = require('mongoose');

const AddonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String, default: 'Sparkles' },
  description: { type: String },
  highConverting: { type: Boolean, default: true },
  recommendationReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Addon', AddonSchema);
