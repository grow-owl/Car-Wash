const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  trackingCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  vehicleType: { type: String, required: true }, // Sedan, SUV, Hatchback, Luxury, Truck
  vehicleNumber: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  serviceName: { type: String, required: true },
  packageName: { type: String },
  addons: [{
    name: String,
    price: Number
  }],
  date: { type: String, required: true },
  slotTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'received', 'washing', 'detailing', 'quality_check', 'ready_for_pickup', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponApplied: { type: String, default: '' },
  paymentMode: { type: String, enum: ['UPI', 'Card', 'Cash', 'Online'], default: 'Online' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  bayAssigned: { type: String, default: 'Bay 1' },
  staffAssigned: { type: String, default: 'Unassigned' },
  notes: { type: String },
  isWalkIn: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
