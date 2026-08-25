const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Water', 'Electricity', 'Chemicals', 'Salary', 'Rent', 'Equipment', 'Marketing', 'Other'],
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  description: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'], default: 'UPI' },
  billImage: { type: String, default: '' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
