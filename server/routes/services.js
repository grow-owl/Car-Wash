const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const Service = require('../models/Service');
const Package = require('../models/Package');
const Addon = require('../models/Addon');

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhiraj',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

const cleanText = (str) => {
  if (typeof str !== 'string') return str || '';
  return str
    .replace(/[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|🥈|🥇|🥉|🏅|🎖️|⭐|🌟|✨|🏷️|📦|🛠️|⏱️|🟢|🔴|🚗|🚘|🚙|🏎️|🛻|✓|✔|🛠|💡|📍|🎁|💵|🔍|🧼|🔑|📝/gu, '')
    .trim();
};

// POST /api/services/upload - Upload Image to Cloudinary (Base64 data or URL)
router.post('/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: 'car-wash/services',
          resource_type: 'auto'
        });
        return res.json({ url: uploadRes.secure_url || uploadRes.url, public_id: uploadRes.public_id });
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning:', cloudErr.message);
        // Graceful fallback to image string if cloud_name needs manual adjustment
        return res.json({ url: image });
      }
    }

    res.json({ url: image });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: 'Image upload failed: ' + err.message });
  }
});

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
    const cleanedServices = services.map(s => {
      const obj = s.toObject ? s.toObject() : s;
      return {
        ...obj,
        name: cleanText(obj.name),
        title: cleanText(obj.title || obj.name),
        description: cleanText(obj.description),
        category: cleanText(obj.category),
        badge: cleanText(obj.badge),
        image: obj.image || ''
      };
    });
    res.json(cleanedServices);
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

    const scaledPackages = packages.map(pkg => {
      const obj = pkg.toObject ? pkg.toObject() : pkg;
      return {
        ...obj,
        title: cleanText(obj.title || obj.name),
        name: cleanText(obj.name || obj.title),
        tagline: cleanText(obj.tagline),
        description: cleanText(obj.description),
        price: Math.round(obj.price * mult)
      };
    });

    res.json(scaledPackages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET smart upselling add-ons
router.get('/addons', async (req, res) => {
  try {
    const addons = await Addon.find({});
    const cleanedAddons = addons.map(a => {
      const obj = a.toObject ? a.toObject() : a;
      return {
        ...obj,
        name: cleanText(obj.name),
        description: cleanText(obj.description),
        recommendationReason: cleanText(obj.recommendationReason)
      };
    });
    res.json(cleanedAddons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN SERVICE CRUD: Create service
router.post('/', async (req, res) => {
  try {
    const priceVal = Number(req.body.price || req.body.basePrice || 499);
    const service = new Service({
      ...req.body,
      name: req.body.name || req.body.title || 'Car Service',
      title: req.body.title || req.body.name || 'Car Service',
      category: req.body.category || 'Wash',
      image: req.body.image || '',
      basePrice: priceVal,
      price: priceVal
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
    const priceVal = Number(req.body.price || req.body.basePrice || 499);
    const updateData = {
      ...req.body,
      name: req.body.name || req.body.title,
      title: req.body.title || req.body.name,
      basePrice: priceVal,
      price: priceVal
    };
    if (req.body.image !== undefined) {
      updateData.image = req.body.image;
    }
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
