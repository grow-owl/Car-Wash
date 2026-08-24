const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const BeforeAfter = require('../models/BeforeAfter');

// GET all customer profiles (CRM)
router.get('/customers', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await Customer.find(query).sort({ totalSpent: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by phone with full vehicle service history
router.get('/customers/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

    const bookings = await Booking.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json({ customer, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = router;
