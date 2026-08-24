const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Water', 'Electricity', 'Chemicals', 'Salary', 'Rent', 'Equipment', 'Marketing'],
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
