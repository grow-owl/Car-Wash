const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Membership = require('../models/Membership');
const GiftCard = require('../models/GiftCard');
const AbandonedLead = require('../models/AbandonedLead');
const Customer = require('../models/Customer');

// COUPONS: Validate
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    if (coupon.minOrder && amount < coupon.minOrder) {
      return res.status(400).json({
        error: `Coupon requires a minimum order value of $${coupon.minOrder}`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = (amount * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discountCalculated: Math.min(discount, amount),
      description: coupon.description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COUPONS: List & Create
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// MEMBERSHIPS: List
router.get('/memberships', async (req, res) => {
  try {
    const memberships = await Membership.find({});
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MEMBERSHIPS: Subscribe
router.post('/memberships/subscribe', async (req, res) => {
  try {
    const { phone, name, email, membershipName } = req.body;
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({ name, phone, email, membershipStatus: membershipName });
    } else {
      customer.membershipStatus = membershipName;
      customer.loyaltyPoints += 100; // Membership bonus
    }
    await customer.save();
    res.json({ message: `Successfully subscribed to ${membershipName}!`, customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GIFT CARDS: Purchase & Redeem
router.get('/giftcards', async (req, res) => {
  try {
    const cards = await GiftCard.find({});
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/giftcards/buy', async (req, res) => {
  try {
    const { initialValue, recipientEmail, senderName } = req.body;
    const randomCode = `GIFT-CW-${Math.floor(100000 + Math.random() * 900000)}`;

    const card = new GiftCard({
      code: randomCode,
      initialValue,
      balance: initialValue,
      recipientEmail,
      senderName
    });

    await card.save();
    res.status(201).json({ message: 'Gift Card issued successfully!', giftCard: card });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/giftcards/redeem', async (req, res) => {
  try {
    const { code } = req.body;
    const card = await GiftCard.findOne({ code: code.toUpperCase() });
    if (!card) return res.status(404).json({ error: 'Gift Card code not found' });
    if (card.balance <= 0) return res.status(400).json({ error: 'Gift Card balance is $0' });

    res.json({ valid: true, balance: card.balance, code: card.code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ABANDONED LEADS: Log & Recover
router.post('/abandoned', async (req, res) => {
  try {
    const lead = new AbandonedLead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/abandoned', async (req, res) => {
  try {
    const leads = await AbandonedLead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/abandoned/:id/recover', async (req, res) => {
  try {
    const lead = await AbandonedLead.findByIdAndUpdate(
      req.params.id,
      { status: 'Offer Sent' },
      { new: true }
    );
    res.json({
      message: 'Automated recovery SMS with 15% discount code sent!',
      lead
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
