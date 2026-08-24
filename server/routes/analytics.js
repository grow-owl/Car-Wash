const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');

// GET Analytics Dashboard Summary
router.get('/dashboard', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    const expenses = await Expense.find({});
    const customers = await Customer.find({});

    // Calculations
    const totalBookingsCount = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const averageOrderValue = totalBookingsCount > 0 ? (totalRevenue / totalBookingsCount).toFixed(2) : 0;

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = (totalRevenue - totalExpenses).toFixed(2);

    const activeJobs = bookings.filter(b => ['washing', 'detailing', 'quality_check'].includes(b.status)).length;
    const completedJobs = bookings.filter(b => b.status === 'completed' || b.status === 'ready_for_pickup').length;

    // Expense breakdown by category
    const expenseBreakdown = {};
    expenses.forEach(e => {
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
    });

    // Service popularity breakdown
    const servicePopularity = {};
    bookings.forEach(b => {
      servicePopularity[b.serviceName] = (servicePopularity[b.serviceName] || 0) + 1;
    });

    // Peak hours calculation
    const slotCounts = {};
    bookings.forEach(b => {
      slotCounts[b.slotTime] = (slotCounts[b.slotTime] || 0) + 1;
    });

    res.json({
      totalRevenue,
      totalBookingsCount,
      averageOrderValue,
      totalExpenses,
      netProfit,
      activeJobs,
      completedJobs,
      totalCustomers: customers.length,
      expenseBreakdown,
      servicePopularity,
      peakHours: slotCounts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Expenses list
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add new expense
router.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
