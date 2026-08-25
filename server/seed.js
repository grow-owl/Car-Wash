require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const Package = require('./models/Package');
const Addon = require('./models/Addon');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Staff = require('./models/Staff');
const Expense = require('./models/Expense');
const Coupon = require('./models/Coupon');
const Membership = require('./models/Membership');
const GiftCard = require('./models/GiftCard');
const BeforeAfter = require('./models/BeforeAfter');
const AbandonedLead = require('./models/AbandonedLead');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('Connected to MongoDB for seeding positive profit data...');

    // Clear existing data & indexes
    try { await Booking.collection.dropIndexes(); } catch(e){}
    await Service.deleteMany({});
    await Package.deleteMany({});
    await Addon.deleteMany({});
    await Booking.deleteMany({});
    await Customer.deleteMany({});
    await Staff.deleteMany({});
    await Expense.deleteMany({});
    await Coupon.deleteMany({});
    await Membership.deleteMany({});
    await GiftCard.deleteMany({});
    await BeforeAfter.deleteMany({});
    await AbandonedLead.deleteMany({});

    // 1. Standalone Individual Services (Genuine INR Pricing)
    await Service.insertMany([
      {
        name: 'Express Exterior Foam Wash',
        category: 'Wash',
        price: 299,
        vehicleType: 'Sedan',
        durationMins: 25,
        description: 'High-pressure foam wash, tire shine, exterior glass cleaning and blow dry.',
        features: ['High Pressure Foam Wash', 'Wheel & Tire Scrub', 'Exterior Glass Shine', 'Air Dryer Finish'],
        badge: 'Popular Wash',
        isPopular: true
      },
      {
        name: 'Interior Vacuum & Dusting',
        category: 'Interior',
        price: 349,
        vehicleType: 'Sedan',
        durationMins: 30,
        description: 'Deep cabin vacuuming, mat cleaning, and dust extraction from dashboard & seats.',
        features: ['Deep Cabin Vacuuming', 'Footmat Washing & Drying', 'Dashboard Dusting', 'Boot Space Cleaning'],
        badge: 'Interior Care',
        isPopular: false
      },
      {
        name: 'Underbody Anti-Rust Hydro-Wash',
        category: 'Wash',
        price: 499,
        vehicleType: 'SUV',
        durationMins: 35,
        description: 'High-pressure underbody mud extraction and anti-corrosion rinse treatment.',
        features: ['360° Underbody Pressure Wash', 'Mud & Dirt Extraction', 'Chassis Anti-Rust Rinse'],
        badge: 'Chassis Protect',
        isPopular: false
      },
      {
        name: 'Engine Bay Steam & Degreasing',
        category: 'Detailing',
        price: 599,
        vehicleType: 'Sedan',
        durationMins: 40,
        description: 'High-temperature steam degreasing of engine block, rubber hoses, and plastic covers.',
        features: ['300°F Steam Degreasing', 'Hose & Cable Protection', 'Plastics Conditioning'],
        badge: 'Engine Care',
        isPopular: false
      },
      {
        name: 'Hydrophobic Glass & Windshield Shield',
        category: 'Glass',
        price: 349,
        vehicleType: 'Sedan',
        durationMins: 20,
        description: 'Rain-repellent nano coating for crystal clear driving visibility during monsoon.',
        features: ['Rain Repellent Layer', 'Water Spot Removal', 'Night Glare Reduction'],
        badge: 'Monsoon Ready',
        isPopular: true
      },
      {
        name: 'Ceramic Hydro-Polish & Paint Sealant',
        category: 'Ceramic',
        price: 1299,
        vehicleType: 'Sedan',
        durationMins: 60,
        description: 'Hand polish with synthetic ceramic wax for high gloss paint shine and water repellency.',
        features: ['Hand Wax & Polish', '6-Month Hydrophobic Barrier', 'Swirl Masking Treatment'],
        badge: 'Best Value Polish',
        isPopular: true
      },
      {
        name: '9H Nano-Ceramic Paint Coating',
        category: 'Ceramic',
        price: 3999,
        vehicleType: 'Luxury',
        durationMins: 120,
        description: 'Multi-stage paint correction to remove swirl marks, followed by a 2-year hydrophobic 9H ceramic shield.',
        features: ['2-Stage Paint Correction', '9H Nano-Ceramic Layer', '2-Year Hydrophobic Guarantee', 'UV Protection'],
        badge: 'Premium Coating',
        isPopular: true
      },
      {
        name: 'AC Vent Steam Sanitize & Odor Spa',
        category: 'Sanitization',
        price: 449,
        vehicleType: 'Sedan',
        durationMins: 30,
        description: 'Kills 99.9% bacteria inside AC ducts and permanently eliminates smoke and pet odors.',
        features: ['Ozone Air Purification', 'AC Vent Steam Treatment', 'Germ & Odor Elimination'],
        badge: 'Hygiene Spa',
        isPopular: false
      },
      {
        name: 'Leather Seat Conditioning & Spa',
        category: 'Interior',
        price: 699,
        vehicleType: 'SUV',
        durationMins: 45,
        description: 'Deep leather cleaning, hydration, and UV protectant cream application for crack prevention.',
        features: ['Deep Leather Scrub', 'Moisture Replenish Cream', 'UV Damage Shield'],
        badge: 'Leather Care',
        isPopular: false
      },
      {
        name: 'Alloy Wheel Polish & Tire Dressing',
        category: 'Wheels',
        price: 249,
        vehicleType: 'Sedan',
        durationMins: 25,
        description: 'Brake dust removal, alloy wheel polishing, and high-gloss wet look tire dressing.',
        features: ['Brake Dust Acid Wash', 'Alloy Rim Polish', 'Deep Wet Look Tire Dressing'],
        badge: 'Wheel Shine',
        isPopular: false
      }
    ]);

    // 2. Packages (INR Pricing & Requested Bundles)
    await Package.insertMany([
      {
        title: 'Basic Refresh',
        name: 'Basic Refresh',
        price: 499,
        originalPrice: 699,
        vehicleType: 'Sedan',
        includedServices: ['Exterior Foam Wash', 'Interior Vacuum', 'Dashboard Dusting', 'Tyre Cleaning', 'Glass Cleaning'],
        discountPct: 28,
        tagline: 'Best for: Regular maintenance',
        isPopular: false
      },
      {
        title: 'Premium Shine',
        name: 'Premium Shine',
        price: 799,
        originalPrice: 1099,
        vehicleType: 'Sedan',
        includedServices: ['Premium Foam Wash', 'Interior Vacuum', 'Dashboard Polish', 'Door Panel Cleaning', 'Tyre & Rim Cleaning', 'Tyre Shine', 'Underbody Wash', 'Air Freshener'],
        discountPct: 27,
        tagline: 'Best for: Complete regular cleaning',
        isPopular: true
      },
      {
        title: 'Ultimate Detail',
        name: 'Ultimate Detail',
        price: 1499,
        originalPrice: 1999,
        vehicleType: 'SUV',
        includedServices: ['Premium Foam Wash', 'Full Interior Cleaning', 'Deep Vacuum', 'Dashboard & Door Panel Polish', 'Seat Surface Cleaning', 'Roof & Carpet Cleaning', 'AC Vent Cleaning', 'Tyre Shine', 'Exterior Wax Protection'],
        discountPct: 25,
        tagline: 'Best for: Deep cleaning',
        isPopular: false
      }
    ]);

    // 3. Addons - Enhance Your Wash (Smart Upselling System)
    await Addon.insertMany([
      { name: 'Tyre Shine', price: 99, icon: 'Disc', description: 'Long-lasting deep wet look tire dressing.', highConverting: true, recommendationReason: '89% customers add this!' },
      { name: 'Dashboard Polish', price: 149, icon: 'Sparkles', description: 'UV protective non-greasy dashboard shine.', highConverting: true, recommendationReason: 'Protects dash from sun cracks.' },
      { name: 'Interior Vacuum', price: 199, icon: 'Wind', description: 'High-power cabin & footmat dust extraction.', highConverting: true, recommendationReason: 'Popular add-on for clean cabin air.' },
      { name: 'Engine Bay Cleaning', price: 499, icon: 'Cpu', description: '300°F steam degreasing of engine block & hoses.', highConverting: true, recommendationReason: 'Extends hose lifespan.' },
      { name: 'Underbody Wash', price: 249, icon: 'Shield', description: '360° pressure underbody mud removal & anti-rust rinse.', highConverting: true, recommendationReason: 'Essential for monsoon protection.' },
      { name: 'AC Vent Cleaning', price: 199, icon: 'Thermometer', description: 'Ozone steam sanitization inside AC ducts.', highConverting: true, recommendationReason: 'Kills 99.9% vent bacteria & odors.' },
      { name: 'Air Freshener', price: 99, icon: 'Smile', description: 'Long-lasting premium organic scent card.', highConverting: true, recommendationReason: 'Keeps car smelling fresh for 30 days.' },
      { name: 'Headlight Restoration', price: 499, icon: 'Sun', description: 'Yellow oxidation removal & clear UV acrylic sealant.', highConverting: true, recommendationReason: 'Restores 100% night driving vision.' },
      { name: 'Rain Repellent Coating', price: 299, icon: 'Droplets', description: 'Hydrophobic windshield coating for crystal clear driving.', highConverting: true, recommendationReason: 'Must-have for rainy season.' },
      { name: 'Seat Cleaning', price: 499, icon: 'Check', description: 'Deep upholstery stain extraction & fabric scrub.', highConverting: true, recommendationReason: 'Removes deep seat stains.' }
    ]);

    // 4. Sample Bookings (High Completed Revenue for Positive Net Profit)
    const todayStr = new Date().toISOString().split('T')[0];
    await Booking.insertMany([
      {
        trackingCode: 'CW-8921',
        customerName: 'Marcus Vance',
        phone: '+91 8609504186',
        email: 'marcus@example.com',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-AX-8821',
        vehicleModel: 'BMW X5 xDrive',
        serviceName: 'Ultimate Hydro-Polishing & Wash',
        packageName: 'Pro Shine & Protection Package',
        addons: [
          { name: 'Windshield Hydrophobic Shield', price: 299 },
          { name: 'Ceramic Tire Armor & Wheel Polish', price: 349 }
        ],
        date: todayStr,
        slotTime: '10:00 AM',
        status: 'detailing',
        totalAmount: 2447,
        discountAmount: 200,
        couponApplied: 'WELCOME20',
        paymentMode: 'Online',
        paymentStatus: 'Paid',
        bayAssigned: 'Bay 2 - Detailing',
        staffAssigned: 'Alex Rivera (Master Detailer)',
        notes: 'Pay special attention to brake dust on front rims.'
      },
      {
        trackingCode: 'CW-8922',
        customerName: 'Sophia Lin',
        phone: '+91 9800112233',
        email: 'sophia@example.com',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-CB-4091',
        vehicleModel: 'Audi A6 Spec',
        serviceName: 'Deep Interior Spa & Steam Sanitize',
        packageName: 'Basic Refresh Package',
        addons: [
          { name: 'Ozone Sanitization & Odor Eliminator', price: 499 }
        ],
        date: todayStr,
        slotTime: '11:30 AM',
        status: 'washing',
        totalAmount: 1398,
        discountAmount: 0,
        couponApplied: '',
        paymentMode: 'UPI',
        paymentStatus: 'Paid',
        bayAssigned: 'Bay 1 - High Pressure Wash',
        staffAssigned: 'David Chen',
        notes: 'Child seat installed in rear right seat.'
      },
      {
        trackingCode: 'CW-8910',
        customerName: 'Rajesh Sharma',
        phone: '+91 9831002233',
        email: 'rajesh@example.com',
        vehicleType: 'Luxury',
        vehicleNumber: 'WB-74-LX-9999',
        vehicleModel: 'Mercedes Benz E-Class',
        serviceName: '9H Ceramic Coating & Paint Restoration',
        packageName: 'VIP Platinum Showroom Package',
        addons: [{ name: 'Engine Bay Detailing & Dressing', price: 699 }],
        date: todayStr,
        slotTime: '09:00 AM',
        status: 'completed',
        totalAmount: 12698,
        discountAmount: 500,
        couponApplied: 'FRESH50',
        paymentMode: 'Card',
        paymentStatus: 'Paid',
        bayAssigned: 'Bay 3 - Ceramic Shield',
        staffAssigned: 'Alex Rivera',
        notes: '2-year warranty card issued.'
      },
      {
        trackingCode: 'CW-8901',
        customerName: 'Siliguri Luxury Rental Fleet',
        phone: '+91 8609504186',
        email: 'fleet@example.com',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-FL-1001',
        vehicleModel: 'Toyota Camry Hybrid',
        serviceName: 'Pro Shine & Protection Package',
        date: todayStr,
        slotTime: '01:00 PM',
        status: 'completed',
        totalAmount: 45000,
        paymentStatus: 'Paid',
        paymentMode: 'Online'
      },
      {
        trackingCode: 'CW-8902',
        customerName: 'Himalayan Tourers Club',
        phone: '+91 8609504186',
        email: 'tours@example.com',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-FL-2002',
        vehicleModel: 'Toyota Fortuner 4x4',
        serviceName: 'Deep Interior Spa & Steam Sanitize',
        date: todayStr,
        slotTime: '03:00 PM',
        status: 'completed',
        totalAmount: 68000,
        paymentStatus: 'Paid',
        paymentMode: 'UPI'
      },
      {
        trackingCode: 'CW-8903',
        customerName: 'Vance Executive Detailing',
        phone: '+91 8609504186',
        email: 'exec@example.com',
        vehicleType: 'Luxury',
        vehicleNumber: 'WB-74-FL-3003',
        vehicleModel: 'BMW 7 Series',
        serviceName: '9H Ceramic Coating & Paint Restoration',
        date: todayStr,
        slotTime: '04:00 PM',
        status: 'completed',
        totalAmount: 32000,
        paymentStatus: 'Paid',
        paymentMode: 'Online'
      }
    ]);

    // 5. Customer CRM Data
    await Customer.insertMany([
      {
        name: 'Dhiraj Kumar',
        phone: '+91 8609504186',
        email: 'dhiraj@example.com',
        totalBookings: 8,
        totalSpent: 12450,
        lastVisit: todayStr,
        favoriteService: 'Pro Shine & Protection Package',
        membershipStatus: 'VIP Member',
        loyaltyPoints: 420,
        vehicles: [
          { regNumber: 'WB-74-AY-1200', brand: 'Hyundai', model: 'Creta', type: 'SUV' },
          { regNumber: 'WB-74-BY-1100', brand: 'Tata', model: 'Nexon', type: 'SUV' }
        ]
      },
      {
        name: 'Marcus Vance',
        phone: '+91 9800112244',
        email: 'marcus@example.com',
        totalBookings: 6,
        totalSpent: 12400,
        lastVisit: todayStr,
        favoriteService: 'Pro Shine & Protection Package',
        membershipStatus: 'Gold Detailer',
        loyaltyPoints: 320,
        vehicles: [{ regNumber: 'WB-74-AX-8821', brand: 'BMW', model: 'X5 xDrive', type: 'SUV' }]
      },
      {
        name: 'Rajesh Sharma',
        phone: '+91 9831002233',
        email: 'rajesh@example.com',
        totalBookings: 8,
        totalSpent: 42600,
        lastVisit: todayStr,
        favoriteService: '9H Ceramic Coating',
        membershipStatus: 'Platinum VIP',
        loyaltyPoints: 850,
        vehicles: [{ regNumber: 'WB-74-LX-9999', brand: 'Mercedes', model: 'E-Class', type: 'Luxury' }]
      }
    ]);

    // 6. Staff Profiles
    await Staff.insertMany([
      {
        name: 'Alex Rivera',
        role: 'Master Detailer',
        phone: '+91 8609504186',
        completedJobs: 142,
        workingHours: '08:00 AM - 05:00 PM',
        rating: 4.9,
        status: 'On Job'
      },
      {
        name: 'Elena Rostova',
        role: 'QC Inspector',
        phone: '+91 9800112244',
        completedJobs: 210,
        workingHours: '09:00 AM - 06:00 PM',
        rating: 5.0,
        status: 'On Job'
      }
    ]);

    // 7. Expense Records (Balanced for Strong Net Profit Margin)
    await Expense.insertMany([
      { category: 'Water', amount: 3500, date: todayStr, notes: 'Municipal high-pressure water supply utility bill' },
      { category: 'Chemicals', amount: 8200, date: todayStr, notes: 'Sonax Foam Shampoo & Gyeon Ceramic Coating supply refill' },
      { category: 'Electricity', amount: 4800, date: todayStr, notes: 'Commercial power bill for steam extractors & blowers' },
      { category: 'Salary', amount: 22000, date: todayStr, notes: 'Monthly staff payroll for 4 detailers & supervisor' },
      { category: 'Rent', amount: 15000, date: todayStr, notes: 'Monthly bay facility lease in Siliguri' }
    ]);

    // 8. Coupons (INR)
    await Coupon.insertMany([
      {
        code: 'WELCOME20',
        discountType: 'percent',
        value: 20,
        minOrder: 499,
        expiryDate: '2026-12-31',
        usageLimit: 500,
        usedCount: 84,
        description: '20% off your first wash booking in Siliguri'
      },
      {
        code: 'FRESH50',
        discountType: 'fixed',
        value: 200,
        minOrder: 999,
        expiryDate: '2026-12-31',
        usageLimit: 200,
        usedCount: 42,
        description: '₹200 flat off deep interior spa and detailing'
      }
    ]);

    // 9. Memberships (INR)
    await Membership.insertMany([
      {
        name: 'Silver Shine Pass',
        priceMonthly: 1499,
        includedWashes: 2,
        discountPct: 10,
        priorityBooking: false,
        perks: ['2 Express Exterior Washes/mo', '10% off all detailing add-ons', 'Free tire dressing'],
        isPopular: false
      },
      {
        name: 'Gold Detailer Club',
        priceMonthly: 2999,
        includedWashes: 4,
        discountPct: 20,
        priorityBooking: true,
        perks: ['4 Ultimate Hydro-Washes/mo', '20% off ceramic coatings', 'Priority bay queue access', 'Free interior ozone sanitization'],
        isPopular: true
      },
      {
        name: 'Platinum VIP Unlimited',
        priceMonthly: 4999,
        includedWashes: 8,
        discountPct: 30,
        priorityBooking: true,
        perks: ['Unlimited Express Exterior washes', '2 Full Interior Spas/mo', '30% off all premium services', 'Dedicated account manager'],
        isPopular: false
      }
    ]);

    // 10. Gift Cards (INR)
    await GiftCard.insertMany([
      {
        code: 'GIFT-CARWASHS-1000',
        initialValue: 1000,
        balance: 1000,
        recipientEmail: 'friend@example.com',
        senderName: 'Marcus Vance',
        isRedeemed: false
      }
    ]);

    // 11. Before / After Gallery
    await BeforeAfter.insertMany([
      {
        bookingId: 'CW-8921',
        vehicleNumber: 'WB-74-AX-8821',
        serviceType: 'Mud & Dirt Off-road Detailing',
        beforeUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        notes: 'Full dirt extraction on BMW SUV chassis and ceramic paint restore in Siliguri.'
      }
    ]);

    // 12. Abandoned Leads
    await AbandonedLead.insertMany([
      {
        customerName: 'Jonathan Davis',
        phone: '+91 8609504186',
        vehicleType: 'SUV',
        selectedService: 'Ultimate Hydro-Polishing & Wash',
        status: 'Pending'
      }
    ]);

    console.log('Database Seeding Positive Net Profit Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
