const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Wash, Detailing, Ceramic, Interior
  price: { type: Number, required: true },
  vehicleType: { type: String, required: true }, // Hatchback, Sedan, SUV, Luxury, Truck
  durationMins: { type: Number, default: 45 },
  description: { type: String },
  features: [{ type: String }],
  badge: { type: String, default: '' },
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
