const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// GET all staff members
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find({}).sort({ completedJobs: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create new staff member
router.post('/', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH Update staff status / rating
router.patch('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(staff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
