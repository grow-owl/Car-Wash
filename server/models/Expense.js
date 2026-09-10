const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'Supplies'
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: String, 
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  description: { 
    type: String, 
    default: '' 
  },
  paymentMethod: { 
    type: String, 
    default: 'UPI' 
  },
  billImage: { 
    type: String, 
    default: '' 
  },
  notes: { 
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
