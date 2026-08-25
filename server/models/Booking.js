const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, sparse: true },
  trackingCode: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleType: { type: String, required: true }, // Sedan, SUV, Hatchback, Luxury, Truck
  vehicleNumber: { type: String, required: true },
  vehicleBrand: { type: String, default: 'Hyundai' },
  vehicleModel: { type: String, required: true },
  serviceName: { type: String, required: true },
  services: [{ type: String }],
  package: { type: String },
  packageName: { type: String },
  addons: [{
    name: String,
    price: Number
  }],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number },
  totalAmount: { type: Number, required: true },
  coupon: { type: String, default: '' },
  couponApplied: { type: String, default: '' },
  bookingDate: { type: String },
  date: { type: String, required: true },
  slotTime: { type: String, required: true },
  timeSlot: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'vehicle_received', 'washing', 'detailing', 'quality_check', 'ready', 'ready_for_pickup', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  paymentMode: { type: String, enum: ['UPI', 'Card', 'Cash', 'Online'], default: 'Online' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  assignedBay: { type: String, default: 'BAY 1' },
  bayAssigned: { type: String, default: 'BAY 1' },
  assignedStaff: [{ type: String }],
  staffAssigned: { type: String, default: 'Rahul Kumar' },
  notes: { type: String },
  bookingSource: { type: String, enum: ['Website', 'Walk-in', 'WhatsApp', 'Referral'], default: 'Website' },
  isWalkIn: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
