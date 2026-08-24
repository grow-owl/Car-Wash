const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');

// GET all bookings (Admin) with filter options
router.get('/', async (req, res) => {
  try {
    const { status, date, search } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (date) query.date = date;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { trackingCode: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET slots availability for date
router.get('/slots', async (req, res) => {
  const { date } = req.query;
  const allSlots = ['08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];
  const maxCapacityPerSlot = 3;

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const existingBookings = await Booking.find({ date: targetDate, status: { $ne: 'cancelled' } });

    const slotCounts = {};
    existingBookings.forEach(b => {
      slotCounts[b.slotTime] = (slotCounts[b.slotTime] || 0) + 1;
    });

    const availability = allSlots.map(slot => ({
      slotTime: slot,
      booked: slotCounts[slot] || 0,
      capacity: maxCapacityPerSlot,
      available: (slotCounts[slot] || 0) < maxCapacityPerSlot
    }));

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single booking by tracking code
router.get('/track/:code', async (req, res) => {
  try {
    const booking = await Booking.findOne({ trackingCode: req.params.code.toUpperCase() });
    if (!booking) {
      return res.status(404).json({ error: 'Booking code not found. Please check your tracking ID.' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create new customer booking
router.post('/', async (req, res) => {
  try {
    const {
      customerName, phone, email, vehicleType, vehicleNumber, vehicleModel,
      serviceName, packageName, addons, date, slotTime, paymentMode, couponCode
    } = req.body;

    // Generate unique tracking code (e.g. CW-7482)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `CW-${randomNum}`;

    let totalAmount = req.body.totalAmount || 0;
    let discountAmount = 0;

    // Handle coupon application
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        if (coupon.discountType === 'percent') {
          discountAmount = (totalAmount * coupon.value) / 100;
        } else {
          discountAmount = coupon.value;
        }
        totalAmount = Math.max(0, totalAmount - discountAmount);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const newBooking = new Booking({
      trackingCode,
      customerName,
      phone,
      email,
      vehicleType,
      vehicleNumber,
      vehicleModel: vehicleModel || vehicleType,
      serviceName,
      packageName,
      addons: addons || [],
      date: date || new Date().toISOString().split('T')[0],
      slotTime: slotTime || '10:00 AM',
      totalAmount,
      discountAmount,
      couponApplied: couponCode ? couponCode.toUpperCase() : '',
      paymentMode: paymentMode || 'Online',
      paymentStatus: paymentMode === 'Cash' ? 'Pending' : 'Paid',
      status: 'confirmed',
      bayAssigned: 'Bay 1 - Receiving'
    });

    await newBooking.save();

    // Sync / Update Customer CRM
    let customer = await Customer.findOne({ phone });
    if (customer) {
      customer.totalBookings += 1;
      customer.totalSpent += totalAmount;
      customer.lastVisit = newBooking.date;
      customer.loyaltyPoints += Math.floor(totalAmount / 2);
      // Check if vehicle exists in list
      const hasVeh = customer.vehicles.some(v => v.number === vehicleNumber);
      if (!hasVeh) {
        customer.vehicles.push({ number: vehicleNumber, model: vehicleModel || vehicleType, vehicleType });
      }
      await customer.save();
    } else {
      customer = new Customer({
        name: customerName,
        phone,
        email,
        totalBookings: 1,
        totalSpent: totalAmount,
        lastVisit: newBooking.date,
        favoriteService: serviceName,
        loyaltyPoints: Math.floor(totalAmount / 2),
        vehicles: [{ number: vehicleNumber, model: vehicleModel || vehicleType, vehicleType }]
      });
      await customer.save();
    }

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: newBooking,
      trackingCode: newBooking.trackingCode,
      whatsAppNotice: `Simulated WhatsApp sent to ${phone}: "Hi ${customerName}, your booking ${trackingCode} is confirmed for ${newBooking.date} at ${newBooking.slotTime}!"`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST Admin Walk-in Booking
router.post('/walkin', async (req, res) => {
  try {
    const { customerName, phone, vehicleNumber, vehicleType, serviceName, totalAmount, staffAssigned, bayAssigned } = req.body;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `CW-W${randomNum}`;

    const walkInBooking = new Booking({
      trackingCode,
      customerName: customerName || 'Walk-in Customer',
      phone: phone || '+1 555-WALKIN',
      vehicleType: vehicleType || 'Sedan',
      vehicleNumber: vehicleNumber || 'WALKIN-AUTO',
      vehicleModel: vehicleType || 'Sedan',
      serviceName: serviceName || 'Express Exterior Wash',
      date: new Date().toISOString().split('T')[0],
      slotTime: 'NOW (Walk-in)',
      status: 'washing',
      totalAmount: totalAmount || 35,
      paymentMode: 'Cash',
      paymentStatus: 'Paid',
      bayAssigned: bayAssigned || 'Bay 1',
      staffAssigned: staffAssigned || 'Michael Scott',
      isWalkIn: true
    });

    await walkInBooking.save();
    res.status(201).json({ message: 'Walk-in job registered', booking: walkInBooking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Update status / bay / staff assigned
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, bayAssigned, staffAssigned, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (bayAssigned) updateData.bayAssigned = bayAssigned;
    if (staffAssigned) updateData.staffAssigned = staffAssigned;
    if (notes) updateData.notes = notes;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({
      message: `Status updated to ${booking.status}`,
      booking,
      notification: `Simulated WhatsApp notice: "Your car (${booking.vehicleNumber}) status updated to: ${booking.status.toUpperCase()}"`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
