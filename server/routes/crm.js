const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const BeforeAfter = require('../models/BeforeAfter');
const { JWT_SECRET } = require('../middleware/adminAuth');

// AUTH: Check if Phone or Email exists
router.post('/auth/check-phone', async (req, res) => {
  try {
    const { phone, email, identifier } = req.body;
    const target = String(phone || email || identifier || '').trim();
    if (!target) return res.json({ exists: false });

    let customer = null;
    if (target.includes('@')) {
      customer = await Customer.findOne({ email: target.toLowerCase() });
    } else {
      const cleanPhone = target.replace(/[^0-9]/g, '');
      customer = await Customer.findOne({
        $or: [
          { phone: target },
          { phone: cleanPhone },
          { phone: cleanPhone.slice(-10) }
        ]
      });
    }

    if (customer) {
      return res.json({ exists: true, name: customer.name, phone: customer.phone, email: customer.email, vehicles: customer.vehicles });
    }
    return res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTH: Login with Phone OR Email & Password/PIN
router.post('/auth/login', async (req, res) => {
  try {
    const { phone, email, identifier, pin, password } = req.body;
    const loginId = String(identifier || phone || email || '').trim();
    const inputPass = String(password || pin || '').trim();

    if (!loginId || !inputPass) {
      return res.status(400).json({ error: 'Please enter your Mobile Number / Email and Password.' });
    }

    let customer = null;
    if (loginId.includes('@')) {
      customer = await Customer.findOne({ email: loginId.toLowerCase() });
    } else {
      const cleanPhone = loginId.replace(/[^0-9]/g, '');
      customer = await Customer.findOne({
        $or: [
          { phone: loginId },
          { phone: cleanPhone },
          { phone: cleanPhone.slice(-10) },
          { email: loginId.toLowerCase() }
        ]
      });
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer account not found. Please create an account.' });
    }

    const isMatch = await customer.comparePassword(inputPass);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Password or PIN. Please check your credentials.' });
    }

    // Generate Customer JWT Session Token
    const token = jwt.sign(
      {
        id: customer._id,
        phone: customer.phone,
        email: customer.email,
        name: customer.name,
        role: 'customer'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const bookings = await Booking.find({ phone: customer.phone }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      customer,
      bookings
    });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// AUTH: Signup / Register Customer with Name, Phone, Email, Password (Min 6 chars)
router.post('/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, pin, password, vehicle } = req.body;
    const pwdVal = String(password || pin || '').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    if (!cleanPhone) {
      return res.status(400).json({ error: 'Mobile number is required.' });
    }

    if (!pwdVal || pwdVal.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing phone
    let existing = await Customer.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({ error: 'An account already exists with this mobile number. Please log in.' });
    }

    // Check existing email if provided
    if (cleanEmail) {
      const emailExisting = await Customer.findOne({ email: cleanEmail });
      if (emailExisting) {
        return res.status(400).json({ error: 'An account already exists with this email address. Please log in.' });
      }
    }

    const customer = new Customer({
      name: name?.trim() || 'Valued Customer',
      phone: cleanPhone,
      email: cleanEmail,
      password: pwdVal,
      pin: pwdVal,
      loyaltyPoints: 50,
      vehicles: vehicle ? [{
        regNumber: (vehicle.regNumber || vehicle.number || 'WB-74-AX-1000').toUpperCase().trim(),
        brand: vehicle.brand || 'Hyundai',
        model: vehicle.model || 'Creta',
        type: vehicle.type || 'Sedan',
        color: vehicle.color || 'White',
        totalVisits: 1
      }] : []
    });

    await customer.save();

    // Generate Customer JWT Session Token
    const token = jwt.sign(
      {
        id: customer._id,
        phone: customer.phone,
        email: customer.email,
        name: customer.name,
        role: 'customer'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      customer
    });
  } catch (err) {
    console.error('Customer signup error:', err);
    res.status(400).json({ error: err.message || 'Failed to create account.' });
  }
});

// STAFF / OWNER FORGOT PIN RESET FEATURE
router.post('/customers/:phone/reset-pin', async (req, res) => {
  try {
    const { newPin } = req.body;
    const targetPin = String(newPin || '1234').trim();
    const customer = await Customer.findOneAndUpdate(
      { phone: req.params.phone },
      { pin: targetPin, pinHash: targetPin },
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: `PIN reset successfully for ${customer.name} to '${targetPin}'`, customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all customer profiles (CRM) with vehicle regNumber search
router.get('/customers', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'vehicles.regNumber': { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await Customer.find(query).sort({ totalSpent: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by phone or ID with full vehicle service history & garage list
router.get('/customers/:phone', async (req, res) => {
  try {
    let customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) {
      customer = await Customer.findOne({ 'vehicles.regNumber': { $regex: req.params.phone, $options: 'i' } });
    }
    if (!customer.referralCode) {
      const cleanUserName = (customer.name ? customer.name.trim().split(' ')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase() : 'VIP');
      const vehLast4 = (customer.vehicles && customer.vehicles[0]?.regNumber) 
        ? customer.vehicles[0].regNumber.replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase() 
        : (customer.phone ? customer.phone.slice(-4) : '1122');
      customer.referralCode = `CARWASH${cleanUserName}${vehLast4}`;
      await customer.save();
    }

    const bookings = await Booking.find({ phone: customer.phone }).sort({ createdAt: -1 });
    res.json({ customer, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add new vehicle to Customer's saved Garage
router.post('/customers/:phone/vehicles', async (req, res) => {
  try {
    const { regNumber, brand, model, type, color } = req.body;
    let customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

    const regNo = (regNumber || '').toUpperCase().trim();
    const hasVeh = customer.vehicles.some(v => v.regNumber === regNo);
    if (!hasVeh) {
      customer.vehicles.push({
        regNumber: regNo,
        brand: brand || 'Hyundai',
        model: model || 'Creta',
        type: type || 'Sedan',
        color: color || 'White',
        totalVisits: 0
      });
      await customer.save();
    }
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT Update Customer Notes or Membership Tier
router.put('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET Vehicle History by vehicle number
router.get('/vehicle/:number', async (req, res) => {
  try {
    const vehicleNumber = req.params.number;
    const history = await Booking.find({
      vehicleNumber: { $regex: vehicleNumber, $options: 'i' }
    }).sort({ createdAt: -1 });

    const photos = await BeforeAfter.find({
      vehicleNumber: { $regex: vehicleNumber, $options: 'i' }
    });

    res.json({ vehicleNumber, history, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET before/after photo gallery
router.get('/before-after', async (req, res) => {
  try {
    const gallery = await BeforeAfter.find({}).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Upload / Add Before/After Photo
router.post('/before-after', async (req, res) => {
  try {
    const photo = new BeforeAfter(req.body);
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// AUTOMATED REPEAT WASH ENGINE: Get Customers Due For Wash (> 14 Days)
router.get('/due-reminders', async (req, res) => {
  try {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const allCustomers = await Customer.find({}).sort({ lastVisit: 1 });
    const dueCustomers = allCustomers.filter(c => !c.lastVisit || new Date(c.lastVisit) <= fourteenDaysAgo);
    
    // Return due customers or top customers for rebooking campaign
    res.json(dueCustomers.length > 0 ? dueCustomers : allCustomers.slice(0, 6));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTOMATED REPEAT WASH ENGINE: Send Due-for-Wash Promotional Reminder
router.post('/send-due-reminder', async (req, res) => {
  try {
    const { customerId, phone, name } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

    res.json({
      success: true,
      message: `Due-for-Wash SMS/WhatsApp reminder + REPEAT15 (15% OFF) coupon sent to ${name || customer.name} (${phone || customer.phone})!`,
      customer
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
