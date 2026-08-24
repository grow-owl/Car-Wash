const mongoose = require('mongoose');

const GiftCardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  initialValue: { type: Number, required: true },
  balance: { type: Number, required: true },
  recipientEmail: { type: String, required: true },
  senderName: { type: String, required: true },
  isRedeemed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('GiftCard', GiftCardSchema);
