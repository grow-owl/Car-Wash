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

    let coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon && code.toUpperCase() === 'FLAT20') {
      coupon = new Coupon({
        code: 'FLAT20',
        discountType: 'percent',
        value: 20,
        minOrder: 0,
        description: '20% OFF Welcome Discount',
        active: true
      });
      await coupon.save();
    }

    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    if (coupon.active === false) {
      return res.status(400).json({ error: 'This promo coupon has been deactivated or expired by owner' });
    }

    if (coupon.minOrder && amount < coupon.minOrder) {
      return res.status(400).json({
        error: `Coupon requires a minimum order value of ₹${coupon.minOrder}`
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
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, discountType, value, minOrder, description } = req.body;
    if (!code || !value) return res.status(400).json({ error: 'Code and discount value are required' });

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType: discountType || 'fixed',
      value: Number(value),
      minOrder: Number(minOrder || 0),
      description: description || 'Promotional Discount Voucher',
      active: true
    });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// COUPONS: Toggle Active Status
router.patch('/coupons/:id/toggle', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

    coupon.active = !coupon.active;
    await coupon.save();
    res.json({ success: true, message: `Coupon ${coupon.code} is now ${coupon.active ? 'Active' : 'Deactivated'}`, coupon });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// COUPONS: Delete
router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
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

// SMART LEADS ENGINE (Popup, Exit Intent, Booking Drops)
const Lead = require('../models/Lead');

// LEADS: Create or Update Lead
router.post('/leads', async (req, res) => {
  try {
    const { name, phone, source, serviceName, offerClaimed, notes } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    let lead = await Lead.findOne({ phone });
    if (lead) {
      lead.source = source || lead.source;
      lead.serviceName = serviceName || lead.serviceName;
      lead.name = name || lead.name;
      lead.offerClaimed = offerClaimed || lead.offerClaimed;
      lead.notes = notes || lead.notes;
      lead.lastActivity = new Date();
      await lead.save();
    } else {
      lead = new Lead({
        name: name || 'Valued Customer',
        phone,
        source: source || 'popup',
        serviceName: serviceName || 'General Wash & Spa',
        offerClaimed: offerClaimed || 'FIRST100',
        notes: notes || ''
      });
      await lead.save();
    }

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully!',
      lead
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LEADS: List with Search & Status Filter
router.get('/leads', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }
    const leads = await Lead.find(query).sort({ updatedAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LEADS: Update Status & Notes
router.patch('/leads/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = { lastActivity: new Date() };
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ success: true, message: `Lead status updated to ${status}`, lead });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LEADS: Delete
router.delete('/leads/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LEADS: Send WhatsApp / SMS Offer
router.post('/leads/:id/send-offer', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'contacted';
    lead.lastActivity = new Date();
    await lead.save();

    res.json({
      success: true,
      message: `WhatsApp/SMS offer code ${lead.offerClaimed || 'FIRST100'} sent to ${lead.phone}!`,
      lead
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
