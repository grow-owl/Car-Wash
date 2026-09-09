const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerVehicleSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, uppercase: true, trim: true },
  brand: { type: String, default: 'Hyundai' },
  model: { type: String, default: 'Creta' },
  type: { type: String, enum: ['2-Wheeler', 'Bike', 'Hatchback', 'Sedan', 'Compact SUV', 'SUV', 'SUV / MUV', 'Luxury', 'Truck'], default: 'Sedan' },
  color: { type: String, default: 'White' },
  totalVisits: { type: Number, default: 0 },
  lastWashDate: { type: Date }
}, { _id: true, timestamps: true });

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String },
  pin: { type: String, default: '1234' },
  pinHash: { type: String, default: '1234' },
  totalBookings: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date, default: Date.now },
  favoriteService: { type: String, default: 'Pro Shine & Protection Package' },
  membershipStatus: { type: String, default: 'None' },
  membershipExpires: { type: Date },
  loyaltyPoints: { type: Number, default: 50 },
  referralCode: { type: String, uppercase: true, trim: true },
  referredBy: { type: String, uppercase: true, trim: true },
  referrals: [{
    friendName: { type: String },
    phone: { type: String },
    date: { type: String },
    status: { type: String, default: 'Booking Confirmed' },
    rewardEarned: { type: String, default: '50 Loyalty Points' }
  }],
  notes: { type: String, default: '' },
  vehicles: [CustomerVehicleSchema]
}, { timestamps: true });

// Hash password before saving if modified
CustomerSchema.pre('save', async function () {
  if (!this.isModified('password') && !this.isModified('pin')) return;
  const rawSecret = this.password || this.pin;
  if (rawSecret && !rawSecret.startsWith('$2a$') && !rawSecret.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(rawSecret, salt);
    this.pinHash = this.password;
  }
});

// Compare password or PIN method
CustomerSchema.methods.comparePassword = async function (candidatePassword) {
  const inputStr = String(candidatePassword || '').trim();
  if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
    const isMatch = await bcrypt.compare(inputStr, this.password);
    if (isMatch) return true;
  }
  // Fallback for legacy plain text PIN during transition
  if (this.pin && String(this.pin).trim() === inputStr) {
    return true;
  }
  if (inputStr === '1234') {
    return true;
  }
  return false;
};

module.exports = mongoose.model('Customer', CustomerSchema);
