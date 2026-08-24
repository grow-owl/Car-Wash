const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  number: { type: String },
  model: { type: String },
  vehicleType: { type: String }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  totalBookings: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: String },
  favoriteService: { type: String, default: 'Ultimate Premium Wash' },
  membershipStatus: { type: String, default: 'None' },
  loyaltyPoints: { type: Number, default: 50 },
  vehicles: [VehicleSchema]
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
