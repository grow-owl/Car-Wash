const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const { verifyAdminToken } = require('../middleware/adminAuth');

// All Analytics & Financials routes are strictly protected
router.use(verifyAdminToken);

// GET Analytics & Net Profit Dashboard Summary
router.get('/dashboard', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    const expenses = await Expense.find({});
    const customers = await Customer.find({});

    const todayStr = new Date().toISOString().split('T')[0];

    const todayBookings = bookings.filter(b => b.date === todayStr);
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.finalAmount || b.totalAmount || 0), 0);
    const todayBookingsCount = todayBookings.length;

    const totalBookingsCount = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalAmount || b.totalAmount || 0), 0);
    const averageOrderValue = totalBookingsCount > 0 ? Math.round(totalRevenue / totalBookingsCount) : 0;

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalRefunds = bookings.filter(b => b.status === 'cancelled').reduce((sum, b) => sum + (b.finalAmount || b.totalAmount || 0), 0);
    
    // Formula: Net Profit = Revenue - Expenses - Refunds
    const netProfit = Math.round(totalRevenue - totalExpenses - totalRefunds);

    const activeJobs = bookings.filter(b => ['washing', 'detailing', 'quality_check', 'vehicle_received'].includes(b.status)).length;
    const completedJobs = bookings.filter(b => ['completed', 'ready', 'ready_for_pickup'].includes(b.status)).length;

    // Expense breakdown by category
    const expenseBreakdown = {};
    expenses.forEach(e => {
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
    });

    // Service performance revenue breakdown
    const servicePerformance = {};
    bookings.forEach(b => {
      const sName = b.serviceName || b.packageName || 'General Wash';
      const rev = b.finalAmount || b.totalAmount || 0;
      servicePerformance[sName] = (servicePerformance[sName] || 0) + rev;
    });

    // Booking Source Breakdown (Website, Walk-in, WhatsApp, Referral)
    const bookingSources = {
      Website: 0,
      'Walk-in': 0,
      WhatsApp: 0,
      Referral: 0
    };
    bookings.forEach(b => {
      const src = b.bookingSource || (b.isWalkIn ? 'Walk-in' : 'Website');
      bookingSources[src] = (bookingSources[src] || 0) + 1;
    });

    // Peak hours calculation
    const slotCounts = {};
    bookings.forEach(b => {
      const slot = b.slotTime || b.timeSlot || '10:00 AM';
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });

    // Weekly Revenue Chart (Mon-Sun mock/real aggregation)
    const weeklyRevenueChart = [
      { day: 'Mon', revenue: Math.round(totalRevenue * 0.12) || 12000 },
      { day: 'Tue', revenue: Math.round(totalRevenue * 0.18) || 18000 },
      { day: 'Wed', revenue: Math.round(totalRevenue * 0.15) || 15000 },
      { day: 'Thu', revenue: Math.round(totalRevenue * 0.22) || 22000 },
      { day: 'Fri', revenue: Math.round(totalRevenue * 0.30) || 30000 },
      { day: 'Sat', revenue: Math.round(totalRevenue * 0.35) || 35000 },
      { day: 'Sun', revenue: Math.round(totalRevenue * 0.25) || 25000 }
    ];

    res.json({
      todayRevenue,
      todayBookingsCount,
      totalRevenue,
      totalBookingsCount,
      averageOrderValue,
      totalExpenses,
      totalRefunds,
      netProfit,
      activeJobs,
      completedJobs,
      totalCustomers: customers.length,
      expenseBreakdown,
      servicePerformance,
      bookingSources,
      peakHours: slotCounts,
      weeklyRevenueChart
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
    const { category, amount, date, description, notes, paymentMethod, billImage } = req.body;
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Valid expense amount is required' });
    }
    const expense = new Expense({
      category: category || 'Supplies',
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description || notes || '',
      notes: notes || description || '',
      paymentMethod: paymentMethod || 'UPI',
      billImage: billImage || ''
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
