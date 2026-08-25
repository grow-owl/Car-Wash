const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Package = require('../models/Package');
const Addon = require('../models/Addon');

// GET all services (optional query vehicleType, category)
router.get('/', async (req, res) => {
  try {
    const { vehicleType, category } = req.query;
    let query = {};
    if (vehicleType) query.vehicleType = vehicleType;
    if (category) query.category = category;

    let services = await Service.find(query);
    if (services.length === 0) {
      services = await Service.find({});
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all packages (Ensures 3 distinct pricing tiers: Basic, Pro, VIP)
router.get('/packages', async (req, res) => {
  try {
    const { vehicleType } = req.query;
    let packages = await Package.find({}).sort({ price: 1 });
    
    const multiplierMap = {
      Hatchback: 0.9,
      Sedan: 1.0,
      SUV: 1.25,
      Luxury: 1.6,
      Truck: 1.4
    };
    const mult = multiplierMap[vehicleType] || 1.0;

    const scaledPackages = packages.map(pkg => ({
      ...pkg.toObject(),
      price: Math.round(pkg.price * mult)
    }));

    res.json(scaledPackages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET smart upselling add-ons
router.get('/addons', async (req, res) => {
  try {
    const addons = await Addon.find({});
    res.json(addons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN SERVICE CRUD: Create service
router.post('/', async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      basePrice: req.body.basePrice || req.body.price || 499
    });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADMIN SERVICE CRUD: Update service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADMIN SERVICE CRUD: Delete service
router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN PACKAGE CRUD: Create package
router.post('/packages', async (req, res) => {
  try {
    const pkg = new Package(req.body);
    await pkg.save();
    res.status(201).json(pkg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADMIN PACKAGE CRUD: Update package
router.put('/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pkg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADMIN PACKAGE CRUD: Delete package
router.delete('/packages/:id', async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
