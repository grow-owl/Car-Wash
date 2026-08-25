const mongoose = require('mongoose');

const AbandonedBookingSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Lead User' },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  vehicleType: { type: String, default: 'Sedan' },
  vehicleNumber: { type: String, default: '' },
  vehicleModel: { type: String, default: '' },
  serviceName: { type: String, default: 'Pro Shine & Protection Package' },
  subtotal: { type: Number, default: 499 },
  stepReached: { type: Number, default: 2 },
  status: { type: String, enum: ['abandoned', 'contacted', 'recovered'], default: 'abandoned' },
  recoveryOfferSent: { type: Boolean, default: false },
  recoveryCode: { type: String, default: 'RECOVER150' },
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AbandonedBooking', AbandonedBookingSchema);
