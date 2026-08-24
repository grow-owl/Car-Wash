const mongoose = require('mongoose');

const BeforeAfterSchema = new mongoose.Schema({
  bookingId: { type: String },
  vehicleNumber: { type: String, required: true },
  serviceType: { type: String, required: true },
  beforeUrl: { type: String, required: true },
  afterUrl: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BeforeAfter', BeforeAfterSchema);
