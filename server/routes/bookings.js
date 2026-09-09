const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Bay = require('../models/Bay');

// GET all bookings (Admin) with filter options (Multi-Year Date Range, Search & Sort)
router.get('/', async (req, res) => {
  try {
    const { status, date, startDate, endDate, from, to, search, paymentStatus, sortBy, sortOrder } = req.query;
    let query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Payment Status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    // Exact Date filter
    if (date) {
      query.date = date;
    }

    // Date Range (From - To) for multi-month / multi-year filtering
    const fromDate = startDate || from;
    const toDate = endDate || to;
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = fromDate;
      if (toDate) query.date.$lte = toDate;
    }

    // Global Search across customer, phone, trackingCode, vehicle & service
    if (search && search.trim().length > 0) {
      const s = search.trim();
      query.$or = [
        { customerName: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { trackingCode: { $regex: s, $options: 'i' } },
        { bookingId: { $regex: s, $options: 'i' } },
        { vehicleNumber: { $regex: s, $options: 'i' } },
        { vehicleModel: { $regex: s, $options: 'i' } },
        { serviceName: { $regex: s, $options: 'i' } },
        { packageName: { $regex: s, $options: 'i' } }
      ];
    }

    // Sorting (Default: Date & createdAt descending)
    let sortObj = { date: -1, createdAt: -1 };
    if (sortBy === 'amount') {
      sortObj = { totalAmount: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'name') {
      sortObj = { customerName: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'date_asc') {
      sortObj = { date: 1, createdAt: 1 };
    }

    const bookings = await Booking.find(query).sort(sortObj);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET complete lifetime multi-year history for a customer by phone / vehicle
router.get('/customer-timeline/:phone', async (req, res) => {
  try {
    const rawPhone = req.params.phone.replace(/\D/g, '');
    const cleanLast10 = rawPhone.slice(-10);

    const history = await Booking.find({
      $or: [
        { phone: { $regex: cleanLast10 } },
        { vehicleNumber: { $regex: req.params.phone, $options: 'i' } }
      ]
    }).sort({ date: -1, createdAt: -1 });

    const totalSpent = history.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const vehiclesUsed = [...new Set(history.map(b => b.vehicleNumber).filter(Boolean))];
    const servicesTaken = [...new Set(history.map(b => b.serviceName || b.packageName).filter(Boolean))];

    res.json({
      phone: rawPhone,
      totalVisits: history.length,
      totalSpent,
      vehicles: vehiclesUsed,
      services: servicesTaken,
      firstVisit: history.length > 0 ? history[history.length - 1].date : null,
      latestVisit: history.length > 0 ? history[0].date : null,
      bookings: history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET slots availability for date (Dynamic Capacity = Total Active Bays = 2)
router.get('/slots', async (req, res) => {
  const { date } = req.query;
  const allSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const totalBaysCount = await Bay.countDocuments({}) || 2;
    // Exactly 2 bays maximum capacity per time slot
    const maxCapacityPerSlot = Math.min(2, Math.max(1, totalBaysCount));

    // Find active bookings on target date (exclude cancelled)
    const existingBookings = await Booking.find({
      date: targetDate,
      status: { $ne: 'cancelled' }
    });

    const slotCounts = {};
    const slotBaysTaken = {};
    existingBookings.forEach(b => {
      const sTime = b.slotTime || b.timeSlot;
      if (sTime) {
        slotCounts[sTime] = (slotCounts[sTime] || 0) + 1;
        if (!slotBaysTaken[sTime]) slotBaysTaken[sTime] = [];
        slotBaysTaken[sTime].push(b.bayAssigned || b.assignedBay || 'BAY 1');
      }
    });

    const availability = allSlots.map(slot => {
      const bookedCount = slotCounts[slot] || 0;
      const remainingCapacity = Math.max(0, maxCapacityPerSlot - bookedCount);
      return {
        slotTime: slot,
        booked: bookedCount,
        capacity: maxCapacityPerSlot,
        remainingCapacity,
        available: remainingCapacity > 0,
        baysTaken: slotBaysTaken[slot] || []
      };
    });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Live Bay Control status grid (Exactly 2 Bays)
router.get('/bays', async (req, res) => {
  try {
    // Clean up any extra bays beyond 2
    await Bay.deleteMany({ bayNumber: { $gt: 2 } });

    let bays = await Bay.find({}).populate('currentBooking').sort({ bayNumber: 1 });
    if (bays.length === 0) {
      // Seed exactly 2 bays
      bays = await Bay.insertMany([
        { bayNumber: 1, name: 'Bay 1', type: 'Express & Foam Wash', status: 'available' },
        { bayNumber: 2, name: 'Bay 2', type: 'Steam & Detailing', status: 'available' }
      ]);
    } else if (bays.length === 1) {
      const bay2 = new Bay({ bayNumber: 2, name: 'Bay 2', type: 'Steam & Detailing', status: 'available' });
      await bay2.save();
      bays = await Bay.find({}).populate('currentBooking').sort({ bayNumber: 1 });
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

// Helper function: Generate sequential yearly invoice number (e.g. CW2026-0001, CW2027-0001)
async function generateYearlyInvoiceNumber(bookingDateStr) {
  const year = (bookingDateStr ? bookingDateStr.slice(0, 4) : new Date().getFullYear().toString()) || '2026';
  const yearPrefix = `CW${year}-`;
  
  // Find latest booking for this specific year
  const latestBooking = await Booking.findOne({
    invoiceNumber: { $regex: `^CW${year}-` }
  }).sort({ invoiceNumber: -1 });

  let nextSeq = 1;
  if (latestBooking && latestBooking.invoiceNumber) {
    const parts = latestBooking.invoiceNumber.split('-');
    if (parts.length === 2) {
      const parsed = parseInt(parts[1], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
  } else {
    // If none has invoiceNumber yet, count documents for this year
    const countForYear = await Booking.countDocuments({
      date: { $regex: `^${year}` }
    });
    nextSeq = countForYear > 0 ? countForYear + 1 : 1;
  }

  const paddedSeq = String(nextSeq).padStart(4, '0');
  return `${yearPrefix}${paddedSeq}`;
}

// POST Create new customer booking (5-Step Flow)
router.post('/', async (req, res) => {
  try {
    const {
      customerName, phone, email, vehicleType, vehicleNumber, vehicleBrand, vehicleModel, vehicleColor,
      serviceName, packageName, addons, date, slotTime, paymentMode, paymentTiming, couponCode, bookingSource
    } = req.body;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `CW-${randomNum}`;
    const bookingDateStr = date || new Date().toISOString().split('T')[0];
    const invoiceNumber = await generateYearlyInvoiceNumber(bookingDateStr);

    let totalAmount = req.body.totalAmount || req.body.finalAmount || 0;
    let discountAmount = 0;
    let isReferralBooking = false;
    let appliedReferralCode = '';

    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();

      // Check if it's a Friend Referral Code (CARWASH... / REF...)
      if (upperCode.startsWith('CARWASH') || upperCode.startsWith('REF')) {
        isReferralBooking = true;
        appliedReferralCode = upperCode;
        discountAmount = Math.min(50, totalAmount);
        totalAmount = Math.max(0, totalAmount - discountAmount);

        // Find referrer customer and add referral tracking entry
        try {
          let referrer = await Customer.findOne({ referralCode: upperCode });
          if (!referrer) {
            const allCust = await Customer.find({});
            referrer = allCust.find(c => {
              const cName = (c.name || '').trim().split(' ')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase();
              return upperCode.includes(cName) || (c.phone && upperCode.includes(c.phone.slice(-4)));
            });
          }
          if (referrer && referrer.phone !== phone) {
            referrer.referrals = referrer.referrals || [];
            const existingRef = referrer.referrals.find(r => r.phone === phone);
            if (!existingRef) {
              referrer.referrals.push({
                friendName: customerName || 'Friend',
                phone: phone,
                date: bookingDateStr,
                status: 'Booking Confirmed',
                rewardEarned: '50 Loyalty Points (Pending Wash)'
              });
              await referrer.save();
            }
          }
        } catch (refErr) {
          console.error('Error tracking referrer on booking:', refErr);
        }
      } else {
        const coupon = await Coupon.findOne({ code: upperCode });
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
    }

    const targetSlot = slotTime || '10:00 AM';

    // Strict Bay Slot Collision Prevention: Exactly 2 bays (Max 2 bookings per slot)
    const existingInSlot = await Booking.find({
      date: bookingDateStr,
      slotTime: targetSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingInSlot.length >= 2) {
      return res.status(400).json({
        error: `Selected slot (${targetSlot}) on ${bookingDateStr} is fully booked (${existingInSlot.length}/2 Bays occupied). Please choose another available time slot.`
      });
    }

    // Auto-allocate Bay 1 or Bay 2 dynamically based on availability
    let allocatedBay = 'BAY 1';
    const takenBays = existingInSlot.map(b => (b.bayAssigned || b.assignedBay || '').toUpperCase());
    if (takenBays.includes('BAY 1') && !takenBays.includes('BAY 2')) {
      allocatedBay = 'BAY 2';
    } else if (takenBays.includes('BAY 2') && !takenBays.includes('BAY 1')) {
      allocatedBay = 'BAY 1';
    } else if (existingInSlot.length === 1) {
      allocatedBay = 'BAY 2';
    }

    const regNo = (vehicleNumber || 'WB-74-TEMP').toUpperCase().trim();
    const brandName = vehicleBrand || 'Hyundai';
    const modelName = vehicleModel || vehicleType || 'Creta';

    const isPayAfter = paymentTiming === 'Pay After Service' || paymentMode === 'Cash' || paymentMode === 'Pay at Center';
    const isPaid = req.body.paymentStatus === 'Paid' || (!isPayAfter && (paymentMode === 'Online' || paymentMode === 'UPI' || paymentMode === 'Card') && req.body.paymentStatus === 'Paid');

    const newBooking = new Booking({
      bookingId: trackingCode,
      trackingCode,
      invoiceNumber,
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
      referralCode: isReferralBooking ? appliedReferralCode : (req.body.referralCode || ''),
      bookingDate: bookingDateStr,
      date: bookingDateStr,
      slotTime: targetSlot,
      timeSlot: targetSlot,
      paymentTiming: paymentTiming || (isPayAfter ? 'Pay After Service' : 'Pay Now'),
      paymentMode: paymentMode || (isPayAfter ? 'Pay at Center' : 'Razorpay'),
      paymentStatus: isPaid ? 'Paid' : (req.body.paymentStatus || 'Pending'),
      razorpayOrderId: req.body.razorpayOrderId || undefined,
      razorpayPaymentId: req.body.razorpayPaymentId || undefined,
      paidAt: isPaid ? new Date() : null,
      status: req.body.status || 'confirmed',
      assignedBay: allocatedBay,
      bayAssigned: allocatedBay,
      staffAssigned: allocatedBay === 'BAY 2' ? 'Vikram Singh' : 'Rahul Kumar',
      bookingSource: isReferralBooking ? 'Referral' : (bookingSource || 'Website')
    });

    await newBooking.save();

    // Mark any abandoned lead for this phone as 'recovered'
    const AbandonedBooking = require('../models/AbandonedBooking');
    await AbandonedBooking.updateMany(
      { phone: phone?.trim(), status: { $ne: 'recovered' } },
      { status: 'recovered', lastActivityAt: new Date() }
    );

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

    // Generate Automated WhatsApp Notification Payload with Tracking Link
    const clientOrigin = req.headers.origin || req.headers.referer ? new URL(req.headers.origin || req.headers.referer).origin : '';
    const waNotification = buildOfficialInvoiceWhatsAppMessage(newBooking, newBooking.status, clientOrigin);

    res.status(201).json({
      message: 'Booking confirmed successfully! Automated WhatsApp notification generated.',
      booking: newBooking,
      trackingCode: newBooking.trackingCode,
      whatsappNotification: {
        sent: true,
        phone: newBooking.phone,
        customerName: newBooking.customerName,
        message: waNotification.text,
        waLink: waNotification.waLinkCustomer,
        waLinkCustomer: waNotification.waLinkCustomer,
        waLinkOwner: waNotification.waLinkOwner,
        trackUrl: waNotification.trackUrl,
        invoiceUrl: waNotification.invoiceUrl,
        invoiceNumber: waNotification.invoiceNumber,
        trackingCode: waNotification.trackingCode,
        status: waNotification.status
      }
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

    const todayStr = new Date().toISOString().split('T')[0];
    const invoiceNumber = await generateYearlyInvoiceNumber(todayStr);

    const walkInBooking = new Booking({
      bookingId: trackingCode,
      trackingCode,
      invoiceNumber,
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

    const clientOrigin = req.headers.origin || req.headers.referer ? new URL(req.headers.origin || req.headers.referer).origin : '';
    const waNotification = buildOfficialInvoiceWhatsAppMessage(walkInBooking, walkInBooking.status, clientOrigin);

    res.status(201).json({
      message: 'Walk-in Ticket created & Job started in Bay',
      booking: walkInBooking,
      trackingCode: walkInBooking.trackingCode,
      whatsappNotification: {
        sent: true,
        phone: walkInBooking.phone,
        customerName: walkInBooking.customerName,
        message: waNotification.text,
        waLink: waNotification.waLinkCustomer,
        waLinkCustomer: waNotification.waLinkCustomer,
        waLinkOwner: waNotification.waLinkOwner,
        trackUrl: waNotification.trackUrl,
        invoiceUrl: waNotification.invoiceUrl,
        invoiceNumber: waNotification.invoiceNumber,
        trackingCode: waNotification.trackingCode,
        status: waNotification.status
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper to build official Tax Invoice & Live Status WhatsApp payload with direct link for Customer & Owner
const buildOfficialInvoiceWhatsAppMessage = (booking, newStatus, origin = '') => {
  const invoiceNo = booking.invoiceNumber || 'CW2026-0001';
  const trackingCode = booking.trackingCode || booking.bookingId;
  const cleanPhone = (booking.phone || '').replace(/\D/g, '');
  const customerWaPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
  const ownerWaPhone = '918609504186';
  
  const statusLabels = {
    pending: 'Booking Confirmed',
    confirmed: 'Booking Confirmed',
    vehicle_received: 'Vehicle Received at Center',
    in_progress: 'Service In Progress',
    service_in_progress: 'Service In Progress',
    washing: 'High Pressure Wash in Bay',
    detailing: 'Interior Detailing & Polish',
    quality_check: '21-Point Quality Inspection',
    ready: 'Ready for Pickup',
    ready_for_pickup: 'Ready for Pickup',
    completed: 'Service Completed & Delivered',
    cancelled: 'Booking Cancelled'
  };

  const currentStatusKey = (newStatus || booking.status || 'confirmed').toLowerCase();
  const stageLabel = statusLabels[currentStatusKey] || (newStatus ? newStatus.toUpperCase().replace('_', ' ') : 'Booking Confirmed');

  const baseOrigin = process.env.SITE_URL || process.env.CLIENT_ORIGIN || origin || 'https://car-wash-grow-owl.vercel.app';
  const trackUrl = `${baseOrigin}/?track=${trackingCode}`;
  const invoiceUrl = `${baseOrigin}/?track=${trackingCode}&invoice=1`;

  // Format long service lists cleanly
  const rawService = booking.serviceName || booking.packageName || 'Full Auto Spa & Wash';
  const svcParts = rawService.split('+').map(s => s.trim()).filter(Boolean);
  const formattedService = svcParts.length > 3 
    ? `${svcParts.slice(0, 2).join(', ')} + ${svcParts.length - 2} more services` 
    : svcParts.join(', ');

  const addonsList = Array.isArray(booking.addons) && booking.addons.length > 0 
    ? `\n• Add-ons: ${booking.addons.map(a => typeof a === 'string' ? a : (a.name || a.addonName)).join(', ')}`
    : '';

  const bayInfo = booking.bayAssigned || booking.assignedBay ? ` | Bay: ${booking.bayAssigned || booking.assignedBay}` : '';

  let actionHeading = 'Official Service Notification';
  let greetingIntro = `Your vehicle service status has been updated to: *${stageLabel}*`;

  if (['pending', 'confirmed'].includes(currentStatusKey)) {
    actionHeading = 'Appointment Confirmation';
    greetingIntro = 'Your car wash appointment has been successfully confirmed.';
  } else if (['ready', 'ready_for_pickup'].includes(currentStatusKey)) {
    actionHeading = 'Vehicle Ready for Pickup';
    greetingIntro = 'Your vehicle wash and detailing is complete and ready for pickup.';
  } else if (currentStatusKey === 'completed') {
    actionHeading = 'Service Completed & Delivered';
    greetingIntro = 'Thank you for choosing Car Wash Auto Spa. Your service has been completed.';
  }

  const siteDisplayUrl = (process.env.SITE_URL || process.env.CLIENT_ORIGIN || 'https://car-wash-grow-owl.vercel.app').replace(/^https?:\/\//, '');

  const text = 
    `*CAR WASH AUTO SPA*\n` +
    `_${actionHeading}_\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Dear *${booking.customerName || 'Valued Customer'}*,\n` +
    `${greetingIntro}\n\n` +
    `*APPOINTMENT & VEHICLE DETAILS*\n` +
    `• Tracking ID: *${trackingCode}*\n` +
    `• Invoice No: ${invoiceNo}\n` +
    `• Vehicle: *${booking.vehicleNumber}* (${booking.vehicleModel || booking.vehicleType || 'Car'})\n` +
    `• Date & Time: ${booking.date || new Date().toISOString().split('T')[0]} at ${booking.slotTime || '10:00 AM'}${bayInfo}\n` +
    `• Service: ${formattedService}` +
    addonsList + `\n` +
    `• Total Amount: Rs. ${booking.totalAmount} (${booking.paymentStatus || 'Pending'})\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `*LIVE STATUS TRACKING*\n` +
    `Track live bay progress and technician updates in real-time:\n` +
    `${trackUrl}\n\n` +
    `*DIGITAL TAX INVOICE*\n` +
    `View and download your official tax invoice:\n` +
    `${invoiceUrl}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*CAR WASH AUTO SPA*\n` +
    `• Helpline: +91 86095 04186\n` +
    `• Website: ${siteDisplayUrl}\n` +
    `_Drive Clean. Go Further._`;

  const waLinkCustomer = `https://wa.me/${customerWaPhone}?text=${encodeURIComponent(text)}`;
  const waLinkOwner = `https://wa.me/${ownerWaPhone}?text=${encodeURIComponent(text)}`;

  return {
    text,
    waLink: waLinkCustomer,
    waLinkCustomer,
    waLinkOwner,
    trackUrl,
    invoiceUrl,
    invoiceNumber: invoiceNo,
    trackingCode,
    customerName: booking.customerName,
    phone: booking.phone,
    totalAmount: booking.totalAmount,
    status: stageLabel,
    recipientCustomer: booking.phone,
    recipientOwner: '+91 86095 04186'
  };
};

const buildStatusWhatsAppMessage = buildOfficialInvoiceWhatsAppMessage;

// Helper to award 50 loyalty points to referrer upon wash completion or payment
const awardReferralPointsIfApplicable = async (booking) => {
  if (!booking) return;
  const refCode = (booking.referralCode || (booking.couponApplied?.startsWith('CARWASH') ? booking.couponApplied : '')).toUpperCase().trim();
  if (!refCode) return;

  try {
    let referrer = await Customer.findOne({ referralCode: refCode });
    if (!referrer) {
      const allCust = await Customer.find({});
      referrer = allCust.find(c => {
        const cName = (c.name || '').trim().split(' ')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        return refCode.includes(cName) || (c.phone && refCode.includes(c.phone.slice(-4)));
      });
    }

    if (referrer && referrer.phone !== booking.phone) {
      referrer.referrals = referrer.referrals || [];
      const refEntry = referrer.referrals.find(r => r.phone === booking.phone || r.friendName === booking.customerName);
      if (!refEntry || !refEntry.status.includes('Completed')) {
        referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + 50;
        if (refEntry) {
          refEntry.status = 'Completed Wash';
          refEntry.rewardEarned = '+50 Loyalty Points';
        } else {
          referrer.referrals.push({
            friendName: booking.customerName || 'Friend',
            phone: booking.phone,
            date: booking.date || new Date().toISOString().split('T')[0],
            status: 'Completed Wash',
            rewardEarned: '+50 Loyalty Points'
          });
        }
        await referrer.save();
        console.log(`[REFERRAL REWARD] Awarded 50 Loyalty Points to ${referrer.name} (${referrer.phone}) for ${booking.customerName}`);
      }
    }
  } catch (err) {
    console.error('Error in awardReferralPointsIfApplicable:', err);
  }
};

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

    // If status is completed/ready, award referral points
    if (['completed', 'ready', 'ready_for_pickup'].includes(booking.status)) {
      await awardReferralPointsIfApplicable(booking);
    }

    // Generate Automated WhatsApp Notification Payload
    const clientOrigin = req.headers.origin || req.headers.referer ? new URL(req.headers.origin || req.headers.referer).origin : '';
    const waNotification = buildOfficialInvoiceWhatsAppMessage(booking, booking.status, clientOrigin);
    console.log(`[AUTOMATED WHATSAPP INVOICE TRIGGERED] To: ${booking.phone} (${booking.customerName}) & Owner (+91 86095 04186) | Status: ${booking.status}`);

    res.json({
      message: `Status updated to ${booking.status}. Official Invoice WhatsApp notification generated!`,
      booking,
      whatsappNotification: {
        sent: true,
        phone: booking.phone,
        customerName: booking.customerName,
        message: waNotification.text,
        waLink: waNotification.waLinkCustomer,
        waLinkCustomer: waNotification.waLinkCustomer,
        waLinkOwner: waNotification.waLinkOwner,
        trackUrl: waNotification.trackUrl,
        invoiceUrl: waNotification.invoiceUrl,
        invoiceNumber: waNotification.invoiceNumber,
        trackingCode: waNotification.trackingCode,
        status: waNotification.status
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Mark payment completed anytime (Pay Now / Pay After Service / Bay Collection)
router.patch('/:id/pay', async (req, res) => {
  try {
    const { paymentMode, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        paymentMode: paymentMode || 'UPI',
        paymentStatus: paymentStatus || 'Paid',
        paidAt: new Date()
      },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    await awardReferralPointsIfApplicable(booking);

    const clientOrigin = req.headers.origin || req.headers.referer ? new URL(req.headers.origin || req.headers.referer).origin : '';
    const waNotification = buildOfficialInvoiceWhatsAppMessage(booking, booking.status, clientOrigin);

    res.json({
      message: 'Payment recorded successfully',
      booking,
      whatsappNotification: {
        sent: true,
        phone: booking.phone,
        customerName: booking.customerName,
        message: waNotification.text,
        waLink: waNotification.waLinkCustomer,
        waLinkCustomer: waNotification.waLinkCustomer,
        waLinkOwner: waNotification.waLinkOwner,
        trackUrl: waNotification.trackUrl,
        invoiceUrl: waNotification.invoiceUrl
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Mark payment completed by Tracking Code (Customer Tracking / Invoice portal)
router.patch('/track/:code/pay', async (req, res) => {
  try {
    const { paymentMode, paymentStatus } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { trackingCode: req.params.code.toUpperCase() },
      {
        paymentMode: paymentMode || 'UPI',
        paymentStatus: paymentStatus || 'Paid',
        paidAt: new Date()
      },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking tracking code not found' });
    await awardReferralPointsIfApplicable(booking);

    const clientOrigin = req.headers.origin || req.headers.referer ? new URL(req.headers.origin || req.headers.referer).origin : '';
    const waNotification = buildOfficialInvoiceWhatsAppMessage(booking, booking.status, clientOrigin);

    res.json({
      message: 'Payment confirmed successfully',
      booking,
      whatsappNotification: {
        sent: true,
        phone: booking.phone,
        customerName: booking.customerName,
        message: waNotification.text,
        waLink: waNotification.waLinkCustomer,
        waLinkCustomer: waNotification.waLinkCustomer,
        waLinkOwner: waNotification.waLinkOwner,
        trackUrl: waNotification.trackUrl,
        invoiceUrl: waNotification.invoiceUrl
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ABANDONED BOOKING RECOVERY API: Capture Draft Lead
router.post('/abandoned', async (req, res) => {
  try {
    const { customerName, phone, email, vehicleType, vehicleNumber, vehicleModel, serviceName, subtotal, stepReached } = req.body;
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Valid phone number required' });
    }

    const AbandonedBooking = require('../models/AbandonedBooking');
    let lead = await AbandonedBooking.findOne({ phone: phone.trim(), status: 'abandoned' });

    if (lead) {
      if (customerName) lead.customerName = customerName;
      if (vehicleType) lead.vehicleType = vehicleType;
      if (vehicleNumber) lead.vehicleNumber = vehicleNumber;
      if (vehicleModel) lead.vehicleModel = vehicleModel;
      if (serviceName) lead.serviceName = serviceName;
      if (subtotal) lead.subtotal = subtotal;
      if (stepReached) lead.stepReached = stepReached;
      lead.lastActivityAt = new Date();
      await lead.save();
    } else {
      lead = new AbandonedBooking({
        customerName: customerName || 'Lead User',
        phone: phone.trim(),
        email: email || '',
        vehicleType: vehicleType || 'Sedan',
        vehicleNumber: vehicleNumber || '',
        vehicleModel: vehicleModel || '',
        serviceName: serviceName || 'Pro Shine & Protection Package',
        subtotal: subtotal || 499,
        stepReached: stepReached || 2,
        status: 'abandoned'
      });
      await lead.save();
    }

    res.json({ success: true, message: 'Draft lead captured', lead });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ABANDONED BOOKING RECOVERY API: Get All Leads for Owner Dashboard
router.get('/abandoned', async (req, res) => {
  try {
    const AbandonedBooking = require('../models/AbandonedBooking');
    const leads = await AbandonedBooking.find({}).sort({ lastActivityAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ABANDONED BOOKING RECOVERY API: Send Recovery Offer SMS/WhatsApp
router.post('/abandoned/:id/send-offer', async (req, res) => {
  try {
    const AbandonedBooking = require('../models/AbandonedBooking');
    const lead = await AbandonedBooking.findByIdAndUpdate(
      req.params.id,
      { recoveryOfferSent: true, status: 'contacted', lastActivityAt: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    res.json({
      success: true,
      message: `Recovery offer code RECOVER150 (₹150 OFF) sent to ${lead.customerName} (${lead.phone})!`,
      lead
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Booking by ID
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
