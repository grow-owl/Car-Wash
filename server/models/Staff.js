const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // Wash Specialist, Detailing Expert, QC Inspector, Bay Supervisor
  phone: { type: String, required: true },
  completedJobs: { type: Number, default: 0 },
  workingHours: { type: String, default: '08:00 AM - 05:00 PM' },
  rating: { type: Number, default: 4.9 },
  status: { type: String, enum: ['Available', 'On Job', 'Off Duty'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
