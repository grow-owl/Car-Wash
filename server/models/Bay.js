const mongoose = require('mongoose');

const BaySchema = new mongoose.Schema({
  bayNumber: { type: Number, required: true, unique: true },
  name: { type: String, default: 'Wash Bay' },
  type: { type: String, enum: ['Express Wash', 'Steam & Interior', 'Detailing & Polish', 'Ceramic Shield'], default: 'Express Wash' },
  currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Bay', BaySchema);
