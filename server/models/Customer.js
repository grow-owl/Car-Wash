const mongoose = require('mongoose');

const CustomerVehicleSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, uppercase: true, trim: true },
  brand: { type: String, default: 'Hyundai' },
  model: { type: String, default: 'Creta' },
  type: { type: String, enum: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Truck'], default: 'Sedan' },
  color: { type: String, default: 'White' },
  totalVisits: { type: Number, default: 0 },
  lastWashDate: { type: Date }
}, { _id: true, timestamps: true });

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  pin: { type: String, default: '1234' },
  pinHash: { type: String, default: '1234' },
  email: { type: String },
  totalBookings: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date, default: Date.now },
  favoriteService: { type: String, default: 'Pro Shine & Protection Package' },
  membershipStatus: { type: String, default: 'None' },
  membershipExpires: { type: Date },
  loyaltyPoints: { type: Number, default: 50 },
  notes: { type: String, default: '' },
  vehicles: [CustomerVehicleSchema]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
