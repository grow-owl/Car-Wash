const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Valued Customer'
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['popup', 'exit_intent', 'booking', 'contact_form', 'whatsapp'],
    default: 'popup'
  },
  serviceName: {
    type: String,
    default: 'General Wash & Spa'
  },
  interestedService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'follow_up', 'converted', 'not_interested'],
    default: 'new'
  },
  offerClaimed: {
    type: String,
    default: 'FIRST100'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
