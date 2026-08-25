import React, { useState, useEffect } from 'react';
import { Car, CheckCircle2, Calendar, Clock, CreditCard, Tag, ArrowRight, ArrowLeft, Sparkles, Shield, User, DollarSign, Check } from 'lucide-react';
import { getServices, getPackages, getAddons, getSlotsAvailability, validateCoupon, createBooking, checkPhoneExists, captureAbandonedBooking, createLead } from '../api';
import SmartUpsellModal from '../components/SmartUpsellModal';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';

export default function BookingFlow({ initialVehicle = 'Sedan', initialStep = 1, preselectedItem = null, onBookingComplete, onTrackLive }) {
  const [step, setStep] = useState(initialStep);
  const [vehicleType, setVehicleType] = useState(initialVehicle);

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [allAddons, setAllAddons] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedService, setSelectedService] = useState(preselectedItem);
  const [bookingMode, setBookingMode] = useState('packages'); // 'packages' | 'custom'
  const [selectedCustomServices, setSelectedCustomServices] = useState([]);
  const [customCategoryFilter, setCustomCategoryFilter] = useState('all');

  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');

  // Customer Form
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [paymentMode, setPaymentMode] = useState('Online');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState('');

  // Modals
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primary3Packages = [
    {
      _id: 'pkg-1',
      name: 'Basic Refresh',
      title: 'Basic Refresh',
      price: 499,
      originalPrice: 699,
      durationMins: 35,
      description: 'Exterior Foam Wash, Interior Vacuum, Dashboard Dusting, Tyre Cleaning & Glass Cleaning.',
      includedServices: ['Exterior Foam Wash', 'Interior Vacuum', 'Dashboard Dusting', 'Tyre Cleaning', 'Glass Cleaning'],
      isPopular: false
    },
    {
      _id: 'pkg-2',
      name: '🥈 Premium Shine ⭐',
      title: '🥈 Premium Shine ⭐',
      price: 799,
      originalPrice: 1099,
      durationMins: 60,
      description: 'Premium Foam Wash, Interior Vacuum, Dashboard Polish, Door Panel Cleaning, Tyre & Rim Cleaning, Tyre Shine, Underbody Wash & Air Freshener.',
      includedServices: ['Premium Foam Wash', 'Interior Vacuum', 'Dashboard Polish', 'Door Panel Cleaning', 'Tyre & Rim Cleaning', 'Tyre Shine', 'Underbody Wash', 'Air Freshener'],
      isPopular: true
    },
    {
      _id: 'pkg-3',
      name: '🥇 Ultimate Detail',
      title: '🥇 Ultimate Detail',
      price: 1499,
      originalPrice: 1999,
      durationMins: 120,
      description: 'Full interior deep clean, dashboard & door panel polish, seat surface cleaning, roof & carpet clean, AC vent clean & exterior wax.',
      includedServices: ['Premium Foam Wash', 'Full Interior Cleaning', 'Deep Vacuum', 'Dashboard & Door Panel Polish', 'Seat Surface Cleaning', 'Roof & Carpet Cleaning', 'AC Vent Cleaning', 'Tyre Shine', 'Exterior Wax Protection'],
      isPopular: false
    }
  ];

  useEffect(() => {
    if (preselectedItem) {
      setSelectedService(preselectedItem);
    }
  }, [preselectedItem]);

  useEffect(() => {
    fetchData();
  }, [vehicleType, selectedDate]);

  const fetchData = async () => {
    try {
      const [svcRes, pkgRes, addRes, slotRes] = await Promise.all([
        getServices(vehicleType),
        getPackages(vehicleType),
        getAddons(),
        getSlotsAvailability(selectedDate)
      ]);
      setServices(svcRes.data);
      setPackages(pkgRes.data.length >= 3 ? pkgRes.data : primary3Packages);
      setAllAddons(addRes.data);
      setSlots(slotRes.data);
      if (!selectedService && !preselectedItem) {
        setSelectedService(primary3Packages[1]);
      }
    } catch (err) {
      console.error('Error loading booking data:', err);
      if (!selectedService && !preselectedItem) setSelectedService(primary3Packages[1]);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const basePrice = selectedService?.price || 0;
      const res = await validateCoupon(couponCode, basePrice);
      if (res.data.valid) {
        setCouponDiscount(res.data.discountCalculated);
        setCouponStatus(`Success: ₹${res.data.discountCalculated} discount applied!`);
      }
    } catch (err) {
      setCouponStatus(err.response?.data?.error || 'Invalid Coupon Code');
    }
  };

  const toggleCustomService = (svc) => {
    setSelectedCustomServices(prev => {
      const exists = prev.some(s => s.name === svc.name);
      if (exists) {
        return prev.filter(s => s.name !== svc.name);
      } else {
        return [...prev, svc];
      }
    });
  };

  const calculateBaseTotal = () => {
    if (bookingMode === 'custom') {
      return selectedCustomServices.reduce((sum, s) => sum + (s.price || 0), 0);
    }
    return selectedService?.price || 799;
  };

  const calculateFinalTotal = () => {
    const base = calculateBaseTotal();
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
    const total = base + addonsTotal - couponDiscount;
    return total > 0 ? total : 0;
  };

  const handleConfirmBookingSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !vehicleNumber) {
      alert('Please fill in Customer Name, Phone Number, and Vehicle Registration Number.');
      return;
    }

    if (bookingMode === 'custom' && selectedCustomServices.length === 0) {
      alert('Please select at least 1 custom service.');
      return;
    }

    setIsSubmitting(true);
    try {
      const serviceNameVal = bookingMode === 'custom'
        ? (selectedCustomServices.map(s => s.name).join(' + ') || 'Custom Wash Combo')
        : (selectedService?.name || 'Pro Shine & Protection Package');

      const payload = {
        customerName,
        phone,
        email: email || 'customer@example.com',
        vehicleType,
        vehicleNumber,
        vehicleModel: vehicleModel || vehicleType,
        serviceName: serviceNameVal,
        packageName: bookingMode === 'custom' ? 'Custom Service Combo' : (selectedService?.title || selectedService?.name),
        addons: selectedAddons.map(a => ({ name: a.name, price: a.price })),
        date: selectedDate,
        slotTime: selectedSlot,
        totalAmount: calculateFinalTotal(),
        discountAmount: couponDiscount,
        couponApplied: couponDiscount > 0 ? couponCode : '',
        paymentMode,
        paymentStatus: 'Paid'
      };

      const res = await createBooking(payload);
      setConfirmedBooking(res.data);

      if (onBookingComplete) onBookingComplete(res.data.trackingCode);

      // Trigger Smart Upsell Modal after booking step
      setShowUpsellModal(true);
    } catch (err) {
      console.error('Booking submission error:', err);
      alert('Failed to submit booking. Please check your fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpsellModalClose = () => {
    setShowUpsellModal(false);
    setShowInvoiceModal(true);
  };

  const vehiclesList = [
    { type: 'Hatchback', desc: 'Compact 4-Seater', icon: '🚗' },
    { type: 'Sedan', desc: 'Executive Midsize', icon: '🚘' },
    { type: 'SUV', desc: 'Full-Size / Crossover', icon: '🚙' },
    { type: 'Luxury', desc: 'Premium / Sports Car', icon: '🏎️' },
    { type: 'Truck', desc: 'Pickup / Off-road', icon: '🛻' }
  ];

  const displayPackagesList = (packages.length >= 3 ? packages : primary3Packages).slice().sort((a, b) => a.price - b.price);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* HEADER WIZARD TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-aqua">AUTO SPA APPOINTMENT</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '6px' }}>Reserve Your Detailing Slot</h1>
        <p style={{ color: 'var(--text-muted)' }}>Simple 4-step instant booking & digital invoice in Siliguri</p>
      </div>

      {/* 4-STEP WIZARD PROGRESS BAR */}
      <div className="wizard-step-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '40px',
        background: 'var(--bg-glass-card)',
        padding: '16px 24px',
        borderRadius: '16px',
        border: '1px solid var(--border-light)',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { num: 1, label: 'Service Selection' },
          { num: 2, label: 'Vehicle Selection' },
          { num: 3, label: 'Booking & Slot' },
          { num: 4, label: 'Online Payment' }
        ].map(st => (
          <div
            key={st.num}
            onClick={() => setStep(st.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              opacity: step === st.num ? 1 : 0.65
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: step === st.num ? 'var(--accent-aqua)' : 'rgba(0, 49, 53, 0.8)',
              color: step === st.num ? '#003135' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              border: step === st.num ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)'
            }}>
              {st.num}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>STEP 0{st.num}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: step === st.num ? 800 : 600, color: step === st.num ? 'var(--accent-aqua)' : '#FFFFFF' }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN STEP CONTENT CONTAINER */}
      <div className="glass-panel" style={{ padding: '36px', border: '1px solid var(--accent-aqua)' }}>
        
        {/* STEP 1: SERVICE PACKAGE OR CUSTOM STANDALONE SELECTION */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>1. Choose Package or Custom Service Combo</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Select a pre-made package bundle or manually pick individual standalone services</p>
              </div>
              <span className="badge badge-aqua">Step 1 of 4</span>
            </div>

            {/* BOOKING MODE SWITCHER TABS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', background: 'rgba(0,49,53,0.6)', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setBookingMode('packages')}
                style={{
                  background: bookingMode === 'packages' ? 'var(--accent-aqua)' : 'transparent',
                  color: bookingMode === 'packages' ? '#003135' : '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                📦 Pre-Made Full Packages
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('custom')}
                style={{
                  background: bookingMode === 'custom' ? 'var(--accent-gold)' : 'transparent',
                  color: bookingMode === 'custom' ? '#06141B' : '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🛠️ Custom Service Combo (Pick Individual Services)
              </button>
            </div>

            {/* MODE 1: PRE-MADE PACKAGES */}
            {bookingMode === 'packages' && (
              <div className="grid-3" style={{ gap: '20px', marginBottom: '32px' }}>
                {displayPackagesList.map((pkg, idx) => {
                  const pkgName = pkg.title || pkg.name;
                  const isSelected = (selectedService?.name === pkgName) || (selectedService?.title === pkgName);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedService(pkg)}
                      style={{
                        background: isSelected ? 'rgba(15, 164, 175, 0.2)' : 'var(--bg-glass-card)',
                        border: isSelected ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                        borderRadius: '16px',
                        padding: '24px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {pkg.isPopular && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'var(--accent-aqua)',
                          color: '#003135',
                          padding: '3px 12px',
                          borderRadius: '20px',
                          fontWeight: 800,
                          fontSize: '0.7rem'
                        }}>
                          MOST POPULAR
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>{pkgName}</h4>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{pkg.price}</div>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                        {pkg.description || pkg.tagline}
                      </p>

                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '14px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '8px' }}>
                          INCLUDED SERVICES:
                        </div>
                        {pkg.includedServices && pkg.includedServices.map((inc, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', marginBottom: '6px' }}>
                            <Check size={14} color="var(--accent-aqua)" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '16px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>⏱️ Duration: ~{pkg.durationMins || 50} mins</span>
                        {isSelected && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-aqua)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={16} /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODE 2: CUSTOM STANDALONE INDIVIDUAL SERVICES SELECTOR */}
            {bookingMode === 'custom' && (
              <div style={{ marginBottom: '32px' }}>
                
                {/* COMBO SUMMARY BAR */}
                <div style={{ background: 'rgba(255, 195, 0, 0.12)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                      Selected Custom Services ({selectedCustomServices.length})
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
                      {selectedCustomServices.length > 0 ? selectedCustomServices.map(s => s.name).join(' • ') : 'No service selected yet (Check boxes below to build your combo)'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    Combo Total: ₹{calculateBaseTotal()}
                  </div>
                </div>

                {/* CATEGORY FILTER TABS FOR CUSTOM SERVICES */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {[
                    { id: 'all', label: 'All Services' },
                    { id: 'wash', label: 'Regular Wash' },
                    { id: 'interior', label: 'Interior Care' },
                    { id: 'exterior', label: 'Exterior & Polish' },
                    { id: 'engine', label: 'Engine & Chassis' },
                    { id: 'premium', label: 'Premium Detailing' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCustomCategoryFilter(cat.id)}
                      style={{
                        background: customCategoryFilter === cat.id ? 'var(--accent-cyan)' : 'rgba(0, 49, 53, 0.6)',
                        color: customCategoryFilter === cat.id ? '#003135' : '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        border: customCategoryFilter === cat.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                        padding: '6px 14px',
                        borderRadius: '18px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* DYNAMIC 25+ CUSTOM SERVICES GRID */}
                {(() => {
                  const masterServicesList = [
                    // 🚿 1. REGULAR WASH SERVICES
                    { category: 'wash', name: 'Express Exterior Wash', prices: { Hatchback: 249, Sedan: 299, SUV: 349 }, origPrices: { Hatchback: 399, Sedan: 499, SUV: 599 }, duration: '25 mins', desc: 'High-pressure foam wash, wheel scrub & blow dry' },
                    { category: 'wash', name: 'Foam Wash', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, duration: '30 mins', desc: 'Thick snow foam lifting dirt and grime without scratches' },
                    { category: 'wash', name: 'Basic Interior + Exterior Wash', prices: { Hatchback: 499, Sedan: 549, SUV: 649 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, duration: '40 mins', desc: 'Full foam wash + cabin vacuuming & footmat cleaning' },
                    { category: 'wash', name: 'Premium Car Wash ⭐', prices: { Hatchback: 699, Sedan: 799, SUV: 899 }, origPrices: { Hatchback: 999, Sedan: 1199, SUV: 1399 }, duration: '50 mins', desc: 'Foam wash, exterior clean, interior vacuum, dash polish, door panels, tyre shine & air freshener' },
                    { category: 'wash', name: 'Underbody Wash', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, duration: '20 mins', desc: 'High-pressure underbody mud extraction & chassis rinse' },

                    // 🧹 2. INTERIOR CLEANING SERVICES
                    { category: 'interior', name: 'Interior Vacuum & Dusting', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, duration: '30 mins', desc: 'Deep cabin vacuuming & dust extraction from seats & footmats' },
                    { category: 'interior', name: 'Dashboard & Door Panel Cleaning', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, duration: '25 mins', desc: 'UV protective non-greasy dashboard polish & door panel scrub' },
                    { category: 'interior', name: 'Seat Cleaning & Fabric Scrub', prices: { Hatchback: 499, Sedan: 599, SUV: 699 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 1099 }, duration: '45 mins', desc: 'Deep upholstery stain extraction & fabric/leather hydration' },
                    { category: 'interior', name: 'Interior Deep Cleaning ⭐', prices: { Hatchback: 1299, Sedan: 1499, SUV: 1799 }, origPrices: { Hatchback: 1899, Sedan: 2199, SUV: 2499 }, duration: '90 mins', desc: 'Complete interior steam extraction, carpet shampooing & sanitization' },
                    { category: 'interior', name: 'Roof & Carpet Cleaning', prices: { Hatchback: 499, Sedan: 599, SUV: 699 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 1099 }, duration: '45 mins', desc: 'Fabric headliner stain removal & carpet steam extraction' },
                    { category: 'interior', name: 'AC Vent Cleaning & Steam Sanitize', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, duration: '25 mins', desc: 'Ozone steam sanitization inside AC ducts eliminating vent mold' },
                    { category: 'interior', name: 'Odour Removal & Sanitisation', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, duration: '30 mins', desc: 'Permanent smoke & pet odor elimination with anti-bacterial fogging' },

                    // ✨ 3. EXTERIOR CARE & SHINE
                    { category: 'exterior', name: 'Tyre & Alloy Deep Cleaning', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, duration: '25 mins', desc: 'Brake dust acid wash & alloy rim polishing' },
                    { category: 'exterior', name: 'Tyre Dressing & Shine', prices: { Hatchback: 99, Sedan: 149, SUV: 199 }, origPrices: { Hatchback: 199, Sedan: 249, SUV: 299 }, duration: '15 mins', desc: 'Long-lasting deep wet look tire dressing' },
                    { category: 'exterior', name: 'Exterior Wax Polish', prices: { Hatchback: 799, Sedan: 999, SUV: 1199 }, origPrices: { Hatchback: 1199, Sedan: 1499, SUV: 1799 }, duration: '50 mins', desc: 'Hand wax application for smooth paint shine & UV protection' },
                    { category: 'exterior', name: 'Machine Polish / Paint Enhancement', prices: { Hatchback: 1999, Sedan: 2499, SUV: 2999 }, origPrices: { Hatchback: 2999, Sedan: 3499, SUV: 3999 }, duration: '90 mins', desc: 'Dual action machine buffing to remove swirl marks & restore gloss' },
                    { category: 'exterior', name: 'Scratch Removal – Minor', prices: { Hatchback: 499, Sedan: 599, SUV: 699 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, duration: '35 mins', desc: 'Spot compounding & buffing to eliminate minor surface scratches' },
                    { category: 'exterior', name: 'Headlight Restoration', prices: { Hatchback: 499, Sedan: 499, SUV: 499 }, origPrices: { Hatchback: 799, Sedan: 799, SUV: 799 }, duration: '30 mins', desc: 'Yellow oxidation removal & clear UV acrylic sealant' },

                    // ⚙️ 4. ENGINE & UNDERBODY CARE
                    { category: 'engine', name: 'Engine Bay Cleaning', prices: { Hatchback: 499, Sedan: 549, SUV: 599 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, duration: '40 mins', desc: '300°F steam degreasing of engine block & plastic covers' },
                    { category: 'engine', name: 'Engine Bay Dressing', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, duration: '20 mins', desc: 'Protective hose & rubber wire conditioning' },
                    { category: 'engine', name: 'Underbody Cleaning', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, duration: '25 mins', desc: '360° pressure underbody mud removal' },
                    { category: 'engine', name: 'Anti-Rust Treatment', prices: { Hatchback: 1499, Sedan: 1799, SUV: 2199 }, origPrices: { Hatchback: 2199, Sedan: 2499, SUV: 2999 }, duration: '60 mins', desc: 'Heavy-duty rubberized anti-corrosion chassis coating' },

                    // 🛋️ 5. PREMIUM DETAILING
                    { category: 'premium', name: 'Complete Interior Detailing', prices: { Hatchback: 1999, Sedan: 1999, SUV: 1999 }, origPrices: { Hatchback: 2999, Sedan: 2999, SUV: 2999 }, duration: '120 mins', desc: 'Deep steam sanitization, leather spa, carpet extraction & AC vent cleaning' },
                    { category: 'premium', name: 'Exterior Detailing & Polish', prices: { Hatchback: 2499, Sedan: 2499, SUV: 2499 }, origPrices: { Hatchback: 3499, Sedan: 3499, SUV: 3499 }, duration: '150 mins', desc: 'Multi-stage paint correction, clay bar treatment & synthetic wax polish' },
                    { category: 'premium', name: 'Complete Car Detailing ⭐', prices: { Hatchback: 3999, Sedan: 3999, SUV: 3999 }, origPrices: { Hatchback: 5999, Sedan: 5999, SUV: 5999 }, duration: '180 mins', desc: 'Full interior + exterior showroom transformation with engine bay & tire dressing' },
                    { category: 'premium', name: 'Teflon / Paint Protection', prices: { Hatchback: 2499, Sedan: 2499, SUV: 2499 }, origPrices: { Hatchback: 3999, Sedan: 3999, SUV: 3999 }, duration: '120 mins', desc: 'Hydrophobic paint barrier enhancing color depth & swirl masking' },
                    { category: 'premium', name: 'Nano Ceramic Protection', prices: { Hatchback: 4999, Sedan: 4999, SUV: 4999 }, origPrices: { Hatchback: 6999, Sedan: 6999, SUV: 6999 }, duration: '240 mins', desc: '9H Nano ceramic paint shield with 1-year gloss guarantee' },
                    { category: 'premium', name: '1-Year Ceramic Coating', prices: { Hatchback: 7999, Sedan: 7999, SUV: 7999 }, origPrices: { Hatchback: 10999, Sedan: 10999, SUV: 10999 }, duration: '360 mins', desc: 'Professional multi-layer 9H ceramic coating with warranty card' },
                    { category: 'premium', name: 'PPF – Partial Protection Film', prices: { Hatchback: 25000, Sedan: 25000, SUV: 25000 }, origPrices: { Hatchback: 35000, Sedan: 35000, SUV: 35000 }, duration: '480 mins', desc: 'Self-healing Paint Protection Film for high-impact front bumper & bonnet' }
                  ];

                  const filteredList = customCategoryFilter === 'all'
                    ? masterServicesList
                    : masterServicesList.filter(s => s.category === customCategoryFilter);

                  const activeVeh = vehicleType || 'Sedan';

                  return (
                    <div className="grid-2" style={{ gap: '14px' }}>
                      {filteredList.map((s, idx) => {
                        const calculatedPrice = s.prices[activeVeh] || s.prices['Sedan'];
                        const calculatedOrigPrice = s.origPrices[activeVeh] || s.origPrices['Sedan'];
                        const itemToToggle = { ...s, price: calculatedPrice, originalPrice: calculatedOrigPrice };
                        const isChecked = selectedCustomServices.some(cs => cs.name === s.name);

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleCustomService(itemToToggle)}
                            style={{
                              background: isChecked ? 'rgba(0, 229, 255, 0.15)' : 'rgba(0,49,53,0.6)',
                              border: isChecked ? '2px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '14px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                              />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFFFFF' }}>{s.name}</span>
                                  <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.78rem', opacity: 0.75 }}>₹{calculatedOrigPrice}</span>
                                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-gold)' }}>₹{calculatedPrice}</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{s.duration}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setStep(2)}
                className="btn-aqua"
                style={{ padding: '14px 32px' }}
              >
                Next: Vehicle Selection <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VEHICLE SELECTION */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>2. Select Vehicle Category</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Choose your car type to get exact sizing and bay slot allocation</p>
              </div>
              <span className="badge badge-aqua">Step 2 of 4</span>
            </div>

            <div className="grid-3" style={{ gap: '20px', marginBottom: '32px' }}>
              {vehiclesList.map(v => (
                <div
                  key={v.type}
                  onClick={() => setVehicleType(v.type)}
                  style={{
                    background: vehicleType === v.type ? 'rgba(15, 164, 175, 0.2)' : 'var(--bg-glass-card)',
                    border: vehicleType === v.type ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{v.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF' }}>{v.type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{v.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ArrowLeft size={18} /> Back: Service Selection
              </button>

              <button onClick={() => setStep(3)} className="btn-aqua" style={{ padding: '14px 32px' }}>
                Next: Date & Slot <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME SLOT SELECTION */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>3. Pick Preferred Date & Wash Bay Slot</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Select an open time slot for your appointment in Siliguri</p>
              </div>
              <span className="badge badge-aqua">Step 3 of 4</span>
            </div>

            <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                  Select Wash Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '1rem', padding: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '8px', display: 'block' }}>
                  Select Available Time Slot:
                </label>
                {(() => {
                  const defaultSlots = [
                    { slotTime: '08:00 AM', available: true },
                    { slotTime: '09:30 AM', available: true },
                    { slotTime: '11:00 AM', available: true },
                    { slotTime: '01:00 PM', available: true },
                    { slotTime: '02:30 PM', available: true },
                    { slotTime: '04:00 PM', available: true },
                    { slotTime: '05:30 PM', available: true }
                  ];

                  const slotsToRender = (slots && slots.length > 0) ? slots : defaultSlots;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {slotsToRender.map((s, idx) => {
                        const timeLabel = typeof s === 'string' ? s : (s.slotTime || s.time || '10:00 AM');
                        const isAvailable = typeof s === 'object' ? (s.available !== false) : true;
                        const remaining = typeof s === 'object' ? (s.remainingCapacity ?? (isAvailable ? 3 : 0)) : 3;
                        const isSelected = selectedSlot === timeLabel;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(timeLabel)}
                            style={{
                              background: isSelected ? 'var(--accent-aqua)' : 'rgba(17, 33, 45, 0.85)',
                              color: isSelected ? '#06141B' : '#FFFFFF',
                              border: isSelected ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                              borderRadius: '8px',
                              padding: '12px',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              opacity: isAvailable ? 1 : 0.45,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={15} color={isSelected ? '#06141B' : 'var(--accent-aqua)'} />
                              <span>{timeLabel}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isSelected ? '#06141B' : 'var(--text-muted)' }}>
                              {isAvailable ? `🟢 ${remaining} Bays Open` : '🔴 Fully Booked'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn-secondary">
                <ArrowLeft size={18} /> Back: Vehicle Category
              </button>

              <button onClick={() => setStep(4)} className="btn-aqua" style={{ padding: '14px 32px' }}>
                Next: Payment & Confirm <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ONLINE PAYMENT & FINAL CONFIRMATION */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>4. Customer Details & Online Payment</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Enter your contact info to receive digital receipt & SMS updates</p>
              </div>
              <span className="badge badge-aqua">Step 4 of 4</span>
            </div>

            <form onSubmit={handleConfirmBookingSubmit}>
              <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
                {/* Left Column: Form Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 8609504186"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        if (val.replace(/\D/g, '').length >= 10) {
                          checkPhoneExists(val).then(res => {
                            if (res.data.exists) {
                              setIsExistingCustomer(true);
                              if (res.data.name) setCustomerName(res.data.name);
                              if (res.data.vehicles) setExistingVehicles(res.data.vehicles);
                            } else {
                              setIsExistingCustomer(false);
                            }
                          });

                          // Capture abandoned lead draft
                          captureAbandonedBooking({
                            customerName: customerName || 'Lead User',
                            phone: val,
                            vehicleType,
                            vehicleNumber,
                            vehicleModel,
                            serviceName: selectedService?.name || 'Pro Shine Package',
                            subtotal: calculateFinalTotal(),
                            stepReached: step
                          }).catch(() => {});

                          createLead({
                            name: customerName || 'Valued Customer',
                            phone: val.replace(/\D/g, ''),
                            source: 'booking',
                            serviceName: selectedService?.name || 'Pro Shine Package'
                          }).catch(() => {});
                        }
                      }}
                      className="input-field"
                    />
                    {isExistingCustomer && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-aqua)', marginTop: '4px', fontWeight: 700 }}>
                        ✓ Welcome back, {customerName}! Existing customer account found.
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>
                      {isExistingCustomer ? 'Enter Your Account PIN / Password *' : 'Full Name *'}
                    </label>
                    {!isExistingCustomer ? (
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dhiraj Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="input-field"
                      />
                    ) : null}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>
                      {isExistingCustomer ? 'Enter Account Password *' : 'Create Password (Min 6 Characters) *'}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Enter Password (min 6 characters)"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* SAVED VEHICLES SELECTION FOR EXISTING CUSTOMERS */}
                  {isExistingCustomer && existingVehicles.length > 0 && (
                    <div style={{ background: 'rgba(0, 49, 53, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--accent-aqua)' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--accent-aqua)', fontWeight: 800 }}>1-Click Select Saved Vehicle:</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {existingVehicles.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setVehicleNumber(v.regNumber);
                              setVehicleModel(v.model);
                            }}
                            className="btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            🚘 {v.regNumber} ({v.model})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid-2" style={{ gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Vehicle Reg Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WB-74-AY-1200"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Car Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Creta / Nexon"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Payment Method</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="input-field"
                    >
                      <option value="Online">Instant Online UPI / QR Code</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Cash">Pay Cash at Bay Counter</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Order Summary, Enhance Your Wash & Coupon */}
                <div style={{ background: 'rgba(0, 49, 53, 0.85)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  
                  {/* 🔥 SMART UPSELLING SYSTEM: ENHANCE YOUR WASH */}
                  <div style={{ background: 'rgba(255, 195, 0, 0.12)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Sparkles size={18} color="var(--accent-gold)" />
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-gold)' }}>Enhance Your Wash ✨ (Add-ons)</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                      {[
                        { name: 'Tyre Shine', price: 99 },
                        { name: 'Dashboard Polish', price: 149 },
                        { name: 'Interior Vacuum', price: 199 },
                        { name: 'Engine Bay Cleaning', price: 499 },
                        { name: 'Underbody Wash', price: 249 },
                        { name: 'AC Vent Cleaning', price: 199 },
                        { name: 'Air Freshener', price: 99 },
                        { name: 'Headlight Restoration', price: 499 },
                        { name: 'Rain Repellent Coating', price: 299 },
                        { name: 'Seat Cleaning', price: 499 }
                      ].map((addon, idx) => {
                        const isChecked = selectedAddons.some(a => a.name === addon.name);
                        return (
                          <label
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isChecked ? 'rgba(0, 229, 255, 0.18)' : 'rgba(17, 33, 45, 0.7)',
                              border: isChecked ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              color: '#FFFFFF'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedAddons(prev => prev.filter(a => a.name !== addon.name));
                                  } else {
                                    setSelectedAddons(prev => [...prev, addon]);
                                  }
                                }}
                                style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                              />
                              <span>{addon.name}</span>
                            </div>
                            <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>+₹{addon.price}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#FFFFFF' }}>Order Summary</h4>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                    <span>Base Service ({selectedService?.title || selectedService?.name || 'Selected Wash'}):</span>
                    <span>₹{calculateBaseTotal()}</span>
                  </div>

                  {selectedAddons.map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>+ {a.name}</span>
                      <span>+₹{a.price}</span>
                    </div>
                  ))}

                  {/* Coupon Code Input */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Apply Promo Coupon Code:</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="text"
                        placeholder="e.g. WELCOME20 or FRESH50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="input-field"
                      />
                      <button type="button" onClick={handleApplyCoupon} className="btn-secondary" style={{ padding: '0 16px' }}>
                        Apply
                      </button>
                    </div>
                    {couponStatus && (
                      <div style={{ fontSize: '0.8rem', color: couponStatus.includes('Success') ? 'var(--accent-aqua)' : '#e0725a', marginTop: '4px', fontWeight: 700 }}>
                        {couponStatus}
                      </div>
                    )}
                  </div>

                  {couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0725a', fontWeight: 700, marginTop: '8px', fontSize: '0.95rem' }}>
                      <span>Promo Discount ({couponCode}):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-aqua)', borderTop: '2px solid var(--accent-aqua)', paddingTop: '14px', marginTop: '16px' }}>
                    <span>Total Amount Payable:</span>
                    <span>₹{calculateFinalTotal()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                  <ArrowLeft size={18} /> Back: Date & Slot
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    background: '#DCD6C4',
                    color: '#002d31',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    padding: '14px 36px',
                    borderRadius: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 25px rgba(220, 214, 196, 0.45)'
                  }}
                >
                  {isSubmitting ? 'Confirming Appointment...' : `Pay ₹${calculateFinalTotal()} & Confirm Slot`}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* SMART UPSELL MODAL */}
      {showUpsellModal && (
        <SmartUpsellModal
          onClose={handleUpsellModalClose}
          onAddonsSelected={(addons) => {
            setSelectedAddons(addons);
            handleUpsellModalClose();
          }}
        />
      )}

      {/* DIGITAL INVOICE MODAL */}
      {showInvoiceModal && confirmedBooking && (
        <DigitalInvoiceModal
          booking={confirmedBooking}
          onClose={() => {
            setShowInvoiceModal(false);
            if (onTrackLive) onTrackLive(confirmedBooking.trackingCode);
          }}
        />
      )}

    </div>
  );
}
