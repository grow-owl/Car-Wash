const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

// GET Live Simulated WhatsApp/SMS Notification Log
router.get('/log', async (req, res) => {
  try {
    const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10);
    const customers = await Customer.find({}).limit(5);

    const logs = [];

    recentBookings.forEach(b => {
      logs.push({
        id: `LOG-CONF-${b.trackingCode}`,
        type: 'WhatsApp Confirmation',
        recipient: b.phone,
        customerName: b.customerName,
        message: `Booking Confirmed (${b.trackingCode}) for ${b.serviceName} on ${b.date} at ${b.slotTime}. Track live: /track/${b.trackingCode}`,
        timestamp: b.createdAt,
        status: 'Sent ✓'
      });

      if (['washing', 'detailing', 'ready_for_pickup'].includes(b.status)) {
        logs.push({
          id: `LOG-STAT-${b.trackingCode}`,
          type: 'SMS Job Alert',
          recipient: b.phone,
          customerName: b.customerName,
          message: `Vehicle ${b.vehicleNumber} status update: ${b.status.toUpperCase()} in ${b.bayAssigned}.`,
          timestamp: new Date(new Date(b.createdAt).getTime() + 15 * 60000),
          status: 'Delivered ✓'
        });
      }
    });

    customers.forEach((c, idx) => {
      logs.push({
        id: `LOG-REBOOK-${idx}`,
        type: 'Automated 25-Day Rebooking Promo',
        recipient: c.phone,
        customerName: c.name,
        message: `Hi ${c.name}! It's been 25 days since your last wash. Protect your paint with 15% off using code WEEKEND15!`,
        timestamp: new Date(Date.now() - 2 * 86400000),
        status: 'Sent ✓'
      });
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
