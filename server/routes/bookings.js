const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Bay = require('../models/Bay');

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
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { vehicleBrand: { $regex: search, $options: 'i' } },
        { vehicleModel: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET slots availability for date (Dynamic Capacity = Total Active Bays - Already Booked Slots)
router.get('/slots', async (req, res) => {
  const { date } = req.query;
  const allSlots = ['08:00 AM', '09:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const totalBaysCount = await Bay.countDocuments({}) || 4;
    const maxCapacityPerSlot = Math.max(1, totalBaysCount);

    const existingBookings = await Booking.find({ date: targetDate, status: { $ne: 'cancelled' } });

    const slotCounts = {};
    existingBookings.forEach(b => {
      slotCounts[b.slotTime] = (slotCounts[b.slotTime] || 0) + 1;
    });

    const availability = allSlots.map(slot => {
      const bookedCount = slotCounts[slot] || 0;
      const remainingCapacity = Math.max(0, maxCapacityPerSlot - bookedCount);
      return {
        slotTime: slot,
        booked: bookedCount,
        capacity: maxCapacityPerSlot,
        remainingCapacity,
        available: remainingCapacity > 0
      };
    });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Live Bay Control status grid
router.get('/bays', async (req, res) => {
  try {
    let bays = await Bay.find({}).populate('currentBooking').sort({ bayNumber: 1 });
    if (bays.length === 0) {
      // Seed default 4 bays if none exist
      bays = await Bay.insertMany([
        { bayNumber: 1, name: 'BAY 1', type: 'Express Wash', status: 'available' },
        { bayNumber: 2, name: 'BAY 2', type: 'Steam & Interior', status: 'available' },
        { bayNumber: 3, name: 'BAY 3', type: 'Detailing & Polish', status: 'available' },
        { bayNumber: 4, name: 'BAY 4', type: 'Ceramic Shield', status: 'available' }
      ]);
    }
    res.json(bays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Bay status / Assign booking to Bay
router.put('/bays/:id', async (req, res) => {
  try {
    const { status, currentBooking, assignedStaff } = req.body;
    const bay = await Bay.findByIdAndUpdate(req.params.id, { status, currentBooking, assignedStaff }, { new: true });
    res.json(bay);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

// POST Create new customer booking (5-Step Flow)
router.post('/', async (req, res) => {
  try {
    const {
      customerName, phone, email, vehicleType, vehicleNumber, vehicleBrand, vehicleModel, vehicleColor,
      serviceName, packageName, addons, date, slotTime, paymentMode, couponCode, bookingSource
    } = req.body;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `CW-${randomNum}`;

    let totalAmount = req.body.totalAmount || req.body.finalAmount || 0;
    let discountAmount = 0;

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

    const regNo = (vehicleNumber || 'WB-74-TEMP').toUpperCase().trim();
    const brandName = vehicleBrand || 'Hyundai';
    const modelName = vehicleModel || vehicleType || 'Creta';

    const newBooking = new Booking({
      bookingId: trackingCode,
      trackingCode,
      customerName,
      phone,
      email,
      vehicleType: vehicleType || 'Sedan',
      vehicleNumber: regNo,
      vehicleBrand: brandName,
      vehicleModel: modelName,
      serviceName: serviceName || packageName || 'Pro Shine & Protection Package',
      packageName,
      addons: addons || [],
      subtotal: req.body.subtotal || totalAmount + discountAmount,
      discount: discountAmount,
      discountAmount,
      finalAmount: totalAmount,
      totalAmount,
      coupon: couponCode ? couponCode.toUpperCase() : '',
      couponApplied: couponCode ? couponCode.toUpperCase() : '',
      bookingDate: date || new Date().toISOString().split('T')[0],
      date: date || new Date().toISOString().split('T')[0],
      slotTime: slotTime || '10:00 AM',
      timeSlot: slotTime || '10:00 AM',
      paymentMode: paymentMode || 'Online',
      paymentStatus: paymentMode === 'Cash' ? 'Pending' : 'Paid',
      status: 'confirmed',
      assignedBay: 'BAY 1',
      bayAssigned: 'BAY 1',
      staffAssigned: 'Rahul Kumar',
      bookingSource: bookingSource || 'Website'
    });

    await newBooking.save();

    // Sync Customer CRM & Multi-Vehicle garage list
    let customer = await Customer.findOne({ phone });
    if (customer) {
      customer.totalBookings += 1;
      customer.totalSpent += totalAmount;
      customer.lastVisit = new Date();
      customer.loyaltyPoints += Math.floor(totalAmount / 10);
      
      const hasVeh = customer.vehicles.some(v => v.regNumber === regNo);
      if (!hasVeh) {
        customer.vehicles.push({
          regNumber: regNo,
          brand: brandName,
          model: modelName,
          type: vehicleType || 'Sedan',
          color: vehicleColor || 'White',
          totalVisits: 1,
          lastWashDate: new Date()
        });
      } else {
        const vObj = customer.vehicles.find(v => v.regNumber === regNo);
        if (vObj) {
          vObj.totalVisits += 1;
          vObj.lastWashDate = new Date();
        }
      }
      await customer.save();
    } else {
      customer = new Customer({
        name: customerName,
        phone,
        pin: req.body.pin || '1234',
        pinHash: req.body.pin || '1234',
        email,
        totalBookings: 1,
        totalSpent: totalAmount,
        lastVisit: new Date(),
        favoriteService: serviceName || packageName || 'Pro Shine & Protection Package',
        loyaltyPoints: Math.floor(totalAmount / 10),
        vehicles: [{
          regNumber: regNo,
          brand: brandName,
          model: modelName,
          type: vehicleType || 'Sedan',
          color: vehicleColor || 'White',
          totalVisits: 1,
          lastWashDate: new Date()
        }]
      });
      await customer.save();
    }

    res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: newBooking,
      trackingCode: newBooking.trackingCode
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST Admin Walk-in Ticket Creation (Instantly creates Customer, Vehicle, Booking, assigns Bay & starts Job)
router.post('/walkin', async (req, res) => {
  try {
    const { customerName, phone, vehicleNumber, vehicleBrand, vehicleModel, vehicleType, serviceName, totalAmount, staffAssigned, bayAssigned, paymentMode } = req.body;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `CW-W${randomNum}`;
    const regNo = (vehicleNumber || 'WALKIN-AUTO').toUpperCase().trim();
    const brandName = vehicleBrand || 'Tata';
    const modelName = vehicleModel || vehicleType || 'Nexon';

    const walkInBooking = new Booking({
      bookingId: trackingCode,
      trackingCode,
      customerName: customerName || 'Walk-in Customer',
      phone: phone || '+91 9900000000',
      vehicleType: vehicleType || 'Sedan',
      vehicleNumber: regNo,
      vehicleBrand: brandName,
      vehicleModel: modelName,
      serviceName: serviceName || 'Express Exterior Wash',
      date: new Date().toISOString().split('T')[0],
      bookingDate: new Date().toISOString().split('T')[0],
      slotTime: 'NOW (Walk-in)',
      timeSlot: 'NOW (Walk-in)',
      status: 'washing',
      totalAmount: totalAmount || 499,
      finalAmount: totalAmount || 499,
      paymentMode: paymentMode || 'Cash',
      paymentStatus: 'Paid',
      assignedBay: bayAssigned || 'BAY 1',
      bayAssigned: bayAssigned || 'BAY 1',
      staffAssigned: staffAssigned || 'Rahul Kumar',
      bookingSource: 'Walk-in',
      isWalkIn: true
    });

    await walkInBooking.save();

    // Auto update/create Customer CRM
    let customer = await Customer.findOne({ phone: walkInBooking.phone });
    if (customer) {
      customer.totalBookings += 1;
      customer.totalSpent += walkInBooking.totalAmount;
      customer.lastVisit = new Date();
      const hasVeh = customer.vehicles.some(v => v.regNumber === regNo);
      if (!hasVeh) {
        customer.vehicles.push({ regNumber: regNo, brand: brandName, model: modelName, type: vehicleType || 'Sedan', totalVisits: 1, lastWashDate: new Date() });
      }
      await customer.save();
    } else {
      customer = new Customer({
        name: walkInBooking.customerName,
        phone: walkInBooking.phone,
        totalBookings: 1,
        totalSpent: walkInBooking.totalAmount,
        lastVisit: new Date(),
        loyaltyPoints: 50,
        vehicles: [{ regNumber: regNo, brand: brandName, model: modelName, type: vehicleType || 'Sedan', totalVisits: 1, lastWashDate: new Date() }]
      });
      await customer.save();
    }

    res.status(201).json({ message: 'Walk-in Ticket created & Job started in Bay', booking: walkInBooking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Update job status / bay / staff
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, bayAssigned, assignedBay, staffAssigned, notes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (bayAssigned || assignedBay) {
      updateData.bayAssigned = bayAssigned || assignedBay;
      updateData.assignedBay = bayAssigned || assignedBay;
    }
    if (staffAssigned) updateData.staffAssigned = staffAssigned;
    if (notes) updateData.notes = notes;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: `Status updated to ${booking.status}`, booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
