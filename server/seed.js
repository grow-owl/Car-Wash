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

    // 1. Standalone Individual Services (Cloudinary Hosted Images)
    await Service.insertMany([
      {
        name: 'Exterior Car Wash',
        category: 'Wash',
        price: 299,
        vehicleType: 'Sedan',
        durationMins: 25,
        description: 'High-pressure foam wash, pressure wash & hand drying for crystal-clear finish.',
        features: ['High-Pressure Foam Wash', 'Pressure Rinse', 'Microfiber Hand Drying', 'Window & Mirror Clean'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764056/car-wash/services/Exterior_Car_Wash_Foam_wash_pressure_wash_hand_drying.jpg',
        badge: 'Popular Wash',
        isPopular: true
      },
      {
        name: 'Full Car Wash',
        category: 'Wash',
        price: 649,
        vehicleType: 'Sedan',
        durationMins: 45,
        description: 'Complete interior + exterior cleaning with cabin vacuum & exterior foam shine.',
        features: ['Full Exterior Foam Wash', 'Interior Vacuum Cleaning', 'Dashboard & Door Wipe', 'Tyre Polish'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764057/car-wash/services/Full_Car_Wash_Complete_interior_exterior_cleaning.jpg',
        badge: 'Best Value',
        isPopular: true
      },
      {
        name: 'Interior Cleaning',
        category: 'Interior',
        price: 349,
        vehicleType: 'Sedan',
        durationMins: 30,
        description: 'Dashboard, doors, seats & surfaces dust removal and UV protective dressing.',
        features: ['Dashboard Cleaning & Polish', 'Door Panels Scrub', 'AC Vents Dusting', 'Console Cleaning'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764058/car-wash/services/Interior_Cleaning_Dashboard_doors_seats_surfaces.jpg',
        badge: 'Interior Care',
        isPopular: false
      },
      {
        name: 'Interior Vacuum Cleaning',
        category: 'Interior',
        price: 249,
        vehicleType: 'Sedan',
        durationMins: 25,
        description: 'Deep suction vacuuming of seats, floor mats, carpet & boot compartment.',
        features: ['High-Suction Deep Vacuum', 'Footmat Shampoo & Dry', 'Boot Space Dusting', 'Seat Crevice Extraction'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764059/car-wash/services/Interior_Vacuum_Cleaning_Seats_mats_floor_boot.jpg',
        badge: 'Quick Clean',
        isPopular: false
      },
      {
        name: 'Car Interior Detailing',
        category: 'Interior',
        price: 1499,
        vehicleType: 'Sedan',
        durationMins: 90,
        description: 'Deep cleaning and steam sanitization of complete cabin, roof, carpet & seats.',
        features: ['Complete Cabin Steam Spa', 'Roof & Carpet Stain Removal', 'Leather & Fabric Conditioning', 'Ozone Odor Removal'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764060/car-wash/services/Car_Interior_Detailing_Deep_cleaning_of_complete_cabin.jpg',
        badge: 'Deep Clean',
        isPopular: true
      },
      {
        name: 'Wheel & Tyre Cleaning',
        category: 'Exterior',
        price: 249,
        vehicleType: 'Sedan',
        durationMins: 20,
        description: 'Brake dust acid wash, wheel rim scrubbing, and long-lasting deep tyre dressing.',
        features: ['Brake Dust Removal', 'Alloy Rim Deep Wash', 'Tyre Gloss Dressing', 'Mudguard Jet Clean'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764061/car-wash/services/Wheel_Tyre_Cleaning_Wheel_cleaning_tyre_dressing.jpg',
        badge: 'Wheel Shine',
        isPopular: false
      },
      {
        name: 'Car Waxing',
        category: 'Detailing',
        price: 899,
        vehicleType: 'Sedan',
        durationMins: 45,
        description: 'High-gloss carnauba wax application for superior shine + basic paint protection.',
        features: ['Premium Hand Wax Application', 'Hydrophobic Water Beading', 'UV Sun Protection', 'Mirror Gloss Finish'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764062/car-wash/services/Car_Waxing_Shine_basic_paint_protection.jpg',
        badge: 'Paint Gloss',
        isPopular: true
      },
      {
        name: 'Car Polishing',
        category: 'Detailing',
        price: 1899,
        vehicleType: 'Sedan',
        durationMins: 75,
        description: 'Restore gloss & remove minor dullness, swirl marks and surface oxidation.',
        features: ['Machine Buffing Polish', 'Swirl Mark Reduction', 'Paint Gloss Restoration', 'Synthetic Sealant Layer'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764063/car-wash/services/Car_Polishing_Restore_gloss_remove_minor_dullness.jpg',
        badge: 'Restoration',
        isPopular: false
      },
      {
        name: 'Engine Bay Cleaning',
        category: 'Detailing',
        price: 549,
        vehicleType: 'Sedan',
        durationMins: 35,
        description: 'Safe steam cleaning and degreasing of engine compartment & rubber dressing.',
        features: ['300°F Steam Degreasing', 'Hose & Wire Conditioning', 'Plastic Cover Shine', 'Moisture Blow Dry'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764064/car-wash/services/Engine_Bay_Cleaning_Safe_cleaning_of_engine_compartment.jpg',
        badge: 'Engine Care',
        isPopular: false
      },
      {
        name: 'Car Spa & Premium Detailing',
        category: 'Detailing',
        price: 3499,
        vehicleType: 'Sedan',
        durationMins: 150,
        description: 'Comprehensive exterior + interior treatment for a showroom finish inside & out.',
        features: ['Full Interior Steam Spa', 'Machine Polish & Ceramic Seal', 'Engine Bay Degreasing', 'Alloy Wheel Protection'],
        image: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764066/car-wash/services/Car_Spa_Premium_Detailing_Comprehensive_exterior_interior_treatment.jpg',
        badge: 'Showroom Spa',
        isPopular: true
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
    ])    // 4. Sample Bookings (Multi-Year 2024-2026 Real Historical Timeline for Positive Net Profit)
    const todayStr = new Date().toISOString().split('T')[0];
    await Booking.insertMany([
      // --- TODAY'S QUEUE & APPOINTMENTS (2026) ---
      {
        trackingCode: 'CW-8921',
        customerName: 'Marcus Vance',
        phone: '8609504186',
        email: 'marcus@example.com',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-AX-8821',
        vehicleModel: 'BMW X5 xDrive',
        serviceName: 'Car Spa & Premium Detailing',
        packageName: 'Ultimate Detail',
        addons: [
          { name: 'Tyre Shine', price: 99 },
          { name: 'Engine Bay Cleaning', price: 499 }
        ],
        date: todayStr,
        slotTime: '10:00 AM',
        status: 'detailing',
        totalAmount: 2447,
        discountAmount: 200,
        couponApplied: 'WELCOME20',
        paymentMode: 'Online',
        paymentTiming: 'Pay After Service',
        paymentStatus: 'Pending',
        bayAssigned: 'BAY 2',
        staffAssigned: 'Alex Rivera (Master Detailer)',
        notes: 'Pay special attention to brake dust on front rims.'
      },
      {
        trackingCode: 'CW-8922',
        customerName: 'Sophia Lin',
        phone: '9800112233',
        email: 'sophia@example.com',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-CB-4091',
        vehicleModel: 'Audi A6 Matrix',
        serviceName: 'Car Interior Detailing',
        packageName: 'Basic Refresh',
        addons: [
          { name: 'AC Vent Cleaning', price: 199 }
        ],
        date: todayStr,
        slotTime: '11:30 AM',
        status: 'washing',
        totalAmount: 1398,
        discountAmount: 0,
        couponApplied: '',
        paymentMode: 'UPI',
        paymentTiming: 'Pay After Service',
        paymentStatus: 'Pending',
        bayAssigned: 'BAY 1',
        staffAssigned: 'David Chen',
        notes: 'Child seat installed in rear right seat.'
      },
      {
        trackingCode: 'CW-8910',
        customerName: 'Rajesh Sharma',
        phone: '9831002233',
        email: 'rajesh@example.com',
        vehicleType: 'Luxury',
        vehicleNumber: 'WB-74-LX-9999',
        vehicleModel: 'Mercedes Benz E-Class',
        serviceName: 'Car Polishing',
        packageName: 'Ultimate Detail',
        addons: [{ name: 'Engine Bay Cleaning', price: 499 }],
        date: todayStr,
        slotTime: '09:00 AM',
        status: 'completed',
        totalAmount: 3499,
        discountAmount: 0,
        couponApplied: '',
        paymentMode: 'Card',
        paymentTiming: 'Pay After Service',
        paymentStatus: 'Paid',
        bayAssigned: 'BAY 1',
        staffAssigned: 'Ramesh Kumar',
        notes: 'Full showroom delivery check passed.'
      },
      {
        trackingCode: 'CW-8901',
        customerName: 'Siliguri Luxury Rental Fleet',
        phone: '8609504186',
        email: 'fleet@example.com',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-FL-1001',
        vehicleModel: 'Toyota Camry Hybrid',
        serviceName: 'Full Car Wash',
        packageName: 'Premium Shine',
        date: todayStr,
        slotTime: '01:00 PM',
        status: 'confirmed',
        totalAmount: 45000,
        paymentStatus: 'Paid',
        paymentTiming: 'Pay After Service',
        paymentMode: 'Online'
      },
      {
        trackingCode: 'CW-8902',
        customerName: 'Himalayan Tourers Club',
        phone: '9876543210',
        email: 'tours@example.com',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-FL-2002',
        vehicleModel: 'Toyota Fortuner 4x4',
        serviceName: 'Car Interior Detailing',
        date: todayStr,
        slotTime: '02:30 PM',
        status: 'pending',
        totalAmount: 68000,
        paymentStatus: 'Pending',
        paymentTiming: 'Pay After Service',
        paymentMode: 'UPI'
      },

      // --- RECENT 2026 PAST VISITS ---
      {
        trackingCode: 'CW-7801',
        customerName: 'Marcus Vance',
        phone: '8609504186',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-AX-8821',
        vehicleModel: 'BMW X5 xDrive',
        serviceName: 'Car Waxing',
        date: '2026-08-15',
        slotTime: '11:00 AM',
        status: 'completed',
        totalAmount: 1099,
        paymentStatus: 'Paid',
        paymentMode: 'UPI'
      },
      {
        trackingCode: 'CW-7754',
        customerName: 'Rajesh Sharma',
        phone: '9831002233',
        vehicleType: 'Luxury',
        vehicleNumber: 'WB-74-LX-9999',
        vehicleModel: 'Mercedes Benz E-Class',
        serviceName: 'Exterior Car Wash',
        date: '2026-06-20',
        slotTime: '10:00 AM',
        status: 'completed',
        totalAmount: 499,
        paymentStatus: 'Paid',
        paymentMode: 'Cash'
      },
      {
        trackingCode: 'CW-7612',
        customerName: 'Sophia Lin',
        phone: '9800112233',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-CB-4091',
        vehicleModel: 'Audi A6 Matrix',
        serviceName: 'Full Car Wash',
        date: '2026-04-10',
        slotTime: '01:00 PM',
        status: 'completed',
        totalAmount: 799,
        paymentStatus: 'Paid',
        paymentMode: 'Card'
      },

      // --- 2025 HISTORICAL WASHES (1 YEAR AGO) ---
      {
        trackingCode: 'CW-6540',
        customerName: 'Marcus Vance',
        phone: '8609504186',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-AX-8821',
        vehicleModel: 'BMW X5 xDrive',
        serviceName: 'Car Spa & Premium Detailing',
        date: '2025-11-18',
        slotTime: '09:30 AM',
        status: 'completed',
        totalAmount: 3999,
        paymentStatus: 'Paid',
        paymentMode: 'Online'
      },
      {
        trackingCode: 'CW-6320',
        customerName: 'Dhiraj Kumar',
        phone: '8609504186',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-DK-1122',
        vehicleModel: 'Hyundai Verna SX',
        serviceName: 'Car Polishing',
        date: '2025-08-25',
        slotTime: '02:30 PM',
        status: 'completed',
        totalAmount: 1899,
        paymentStatus: 'Paid',
        paymentMode: 'UPI'
      },
      {
        trackingCode: 'CW-6110',
        customerName: 'Rajesh Sharma',
        phone: '9831002233',
        vehicleType: 'Luxury',
        vehicleNumber: 'WB-74-LX-9999',
        vehicleModel: 'Mercedes Benz E-Class',
        serviceName: 'Car Spa & Premium Detailing',
        date: '2025-04-12',
        slotTime: '10:00 AM',
        status: 'completed',
        totalAmount: 4999,
        paymentStatus: 'Paid',
        paymentMode: 'Card'
      },
      {
        trackingCode: 'CW-5890',
        customerName: 'Sophia Lin',
        phone: '9800112233',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-CB-4091',
        vehicleModel: 'Audi A6 Matrix',
        serviceName: 'Car Interior Detailing',
        date: '2025-01-20',
        slotTime: '11:00 AM',
        status: 'completed',
        totalAmount: 1499,
        paymentStatus: 'Paid',
        paymentMode: 'UPI'
      },

      // --- 2024 HISTORICAL WASHES (2 YEARS AGO) ---
      {
        trackingCode: 'CW-4820',
        customerName: 'Marcus Vance',
        phone: '8609504186',
        vehicleType: 'SUV',
        vehicleNumber: 'WB-74-AX-8821',
        vehicleModel: 'BMW X5 xDrive',
        serviceName: 'Full Car Wash',
        date: '2024-10-14',
        slotTime: '10:00 AM',
        status: 'completed',
        totalAmount: 799,
        paymentStatus: 'Paid',
        paymentMode: 'Cash'
      },
      {
        trackingCode: 'CW-4450',
        customerName: 'Dhiraj Kumar',
        phone: '8609504186',
        vehicleType: 'Sedan',
        vehicleNumber: 'WB-74-DK-1122',
        vehicleModel: 'Hyundai Verna SX',
        serviceName: 'Car Waxing',
        date: '2024-06-18',
        slotTime: '04:00 PM',
        status: 'completed',
        totalAmount: 899,
        paymentStatus: 'Paid',
        paymentMode: 'UPI'
      },
      {
        trackingCode: 'CW-4110',
        customerName: 'Rajesh Sharma',
        phone: '9831002233',
        vehicleType: 'Luxury',
        vehicleNumber: 'WB-74-LX-9999',
        vehicleModel: 'Mercedes Benz E-Class',
        serviceName: 'Car Polishing',
        date: '2024-03-05',
        slotTime: '09:30 AM',
        status: 'completed',
        totalAmount: 2499,
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
        salary: 18000,
        completedJobs: 142,
        workingHours: '08:00 AM - 05:00 PM',
        rating: 4.9,
        status: 'Active'
      },
      {
        name: 'Elena Rostova',
        role: 'QC Inspector',
        phone: '+91 9800112244',
        salary: 22000,
        completedJobs: 210,
        workingHours: '09:00 AM - 06:00 PM',
        rating: 5.0,
        status: 'Active'
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
        priceMonthly: 199,
        originalPrice: 249,
        includedWashes: 2,
        discountPct: 10,
        priorityBooking: false,
        perks: ['2 Express Exterior Washes/mo', '10% off all detailing add-ons', 'Free tire dressing'],
        isPopular: false
      },
      {
        name: 'Gold Detailer Club',
        priceMonthly: 299,
        originalPrice: 399,
        includedWashes: 4,
        discountPct: 20,
        priorityBooking: true,
        perks: ['4 Ultimate Hydro-Washes/mo', '20% off ceramic coatings', 'Priority bay queue access', 'Free interior ozone sanitization'],
        isPopular: true
      },
      {
        name: 'Platinum VIP Unlimited',
        priceMonthly: 449,
        originalPrice: 599,
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
