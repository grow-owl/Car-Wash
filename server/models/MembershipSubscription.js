const mongoose = require('mongoose');

const MembershipSubscriptionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  membershipPlan: { type: String, required: true },
  price: { type: Number, required: true },
  durationDays: { type: Number, default: 30 },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  paymentMode: { type: String, default: 'Razorpay' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('MembershipSubscription', MembershipSubscriptionSchema);
