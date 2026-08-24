const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Silver Shine, Gold Detailer, Platinum VIP
  priceMonthly: { type: Number, required: true },
  includedWashes: { type: Number, required: true },
  discountPct: { type: Number, default: 10 },
  priorityBooking: { type: Boolean, default: true },
  perks: [{ type: String }],
  isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Membership', MembershipSchema);
