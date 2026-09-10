const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  salary: { type: Number, default: 0 },
  role: { type: String, default: 'Staff Member' },
  completedJobs: { type: Number, default: 0 },
  workingHours: { type: String, default: '08:00 AM - 05:00 PM' },
  rating: { type: Number, default: 4.9 },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);

