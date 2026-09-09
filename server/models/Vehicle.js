const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  regNumber: { type: String, required: true, uppercase: true, trim: true },
  brand: { type: String, default: 'Hyundai' },
  model: { type: String, default: 'Creta' },
  type: { type: String, enum: ['2-Wheeler', 'Bike', 'Hatchback', 'Sedan', 'Compact SUV', 'SUV', 'SUV / MUV', 'Luxury', 'Truck'], default: 'Sedan' },
  color: { type: String, default: 'White' },
  totalVisits: { type: Number, default: 0 },
  lastWashDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
