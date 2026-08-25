const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  category: { type: String, default: 'Wash' }, // Wash, Detailing, Ceramic, Interior
  basePrice: { type: Number },
  price: { type: Number, required: true },
  vehicleType: { type: String, default: 'Sedan' }, // Hatchback, Sedan, SUV, Luxury, Truck
  durationMins: { type: Number, default: 45 },
  description: { type: String, default: '' },
  features: [{ type: String }],
  badge: { type: String, default: '' },
  image: { type: String, default: '/hero-bg.jpg' },
  active: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
