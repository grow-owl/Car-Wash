const mongoose = require('mongoose');

const AbandonedLeadSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Guest Lead' },
  phone: { type: String, required: true },
  vehicleType: { type: String, default: 'Sedan' },
  selectedService: { type: String, default: 'Premium Foam Wash' },
  status: { type: String, enum: ['Pending', 'Recovered', 'Offer Sent'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('AbandonedLead', AbandonedLeadSchema);
