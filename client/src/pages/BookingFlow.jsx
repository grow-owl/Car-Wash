import React, { useState, useEffect } from 'react';
import { Car, CheckCircle2, Calendar, Clock, CreditCard, Tag, ArrowRight, ArrowLeft, Sparkles, Shield, User, DollarSign, Check } from 'lucide-react';
import { getServices, getPackages, getAddons, getSlotsAvailability, validateCoupon, createBooking } from '../api';
import SmartUpsellModal from '../components/SmartUpsellModal';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';

export default function BookingFlow({ initialVehicle = 'Sedan', initialStep = 1, onBookingComplete, onTrackLive }) {
  const [step, setStep] = useState(initialStep);
  const [vehicleType, setVehicleType] = useState(initialVehicle);

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [allAddons, setAllAddons] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
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

  useEffect(() => {
    fetchData();
  }, [vehicleType, selectedDate]);

  const primary3Packages = [
    {
      _id: 'pkg-1',
      name: 'Basic Refresh Package',
      title: 'Basic Refresh Package',
      price: 899,
      durationMins: 35,
      description: 'Express high-pressure foam wash, wheel scrub, tire dressing & light interior vacuum.',
      includedServices: ['Express High Pressure Foam Wash', 'Wheel & Tire Scrubbing', 'Light Interior Vacuum & Glass Shine'],
      isPopular: false
    },
    {
      _id: 'pkg-2',
      name: 'Pro Shine & Protection Package',
      title: 'Pro Shine & Protection Package',
      price: 1799,
      durationMins: 60,
      description: 'Complete interior deep steam sanitization, underbody wash & dual action wax polish.',
      includedServices: ['Ultimate Hydro-Polishing Wash', '300°F Deep Interior Steam Sanitize', 'Underbody Chassis Wash', 'Ceramic Tire Armor & Wheel Polish'],
      isPopular: true
    },
    {
      _id: 'pkg-3',
      name: 'VIP Platinum Showroom Package',
      title: 'VIP Platinum Showroom Package',
      price: 3999,
      durationMins: 120,
      description: '9H nano ceramic wax layer, leather spa, headlight restoration & priority bay slot.',
      includedServices: ['Ultimate Hydro-Polishing & Detailing', 'Deep Interior Spa & Leather Conditioning', 'Nano Ceramic Shield Wax Layer', 'Headlight Restoration & Windshield Hydrophobic Shield', 'Priority Bay Slot Access'],
      isPopular: false
    }
  ];

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
      if (!selectedService) {
        setSelectedService(primary3Packages[1]);
      }
    } catch (err) {
      console.error('Error loading booking data:', err);
      if (!selectedService) setSelectedService(primary3Packages[1]);
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

  const calculateFinalTotal = () => {
    const base = selectedService?.price || 0;
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

    setIsSubmitting(true);
    try {
      const payload = {
        customerName,
        phone,
        email: email || 'customer@example.com',
        vehicleType,
        vehicleNumber,
        vehicleModel: vehicleModel || vehicleType,
        serviceName: selectedService?.name || 'Pro Shine & Protection Package',
        packageName: selectedService?.title || selectedService?.name,
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

  const displayPackagesList = packages.length >= 3 ? packages : primary3Packages;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* HEADER WIZARD TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-aqua">AUTO SPA APPOINTMENT</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '6px' }}>Reserve Your Detailing Slot</h1>
        <p style={{ color: 'var(--text-muted)' }}>Simple 4-step instant booking & digital invoice in Siliguri</p>
      </div>

      {/* 4-STEP WIZARD PROGRESS BAR */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
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
        
        {/* STEP 1: SERVICE PACKAGE SELECTION (₹899, ₹1,799, ₹3,999) */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>1. Select Desired Wash or Detailing Package</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Choose from our 3 primary flagship detailing packages</p>
              </div>
              <span className="badge badge-aqua">Step 1 of 4</span>
            </div>

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
                        const isSelected = selectedSlot === timeLabel;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(timeLabel)}
                            style={{
                              background: isSelected ? 'var(--accent-aqua)' : 'rgba(0,49,53,0.85)',
                              color: isSelected ? '#003135' : '#FFFFFF',
                              border: isSelected ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                              borderRadius: '8px',
                              padding: '12px',
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              opacity: isAvailable ? 1 : 0.45,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Clock size={15} color={isSelected ? '#003135' : 'var(--accent-aqua)'} />
                            <span>{timeLabel}</span>
                            {!isAvailable && <span style={{ fontSize: '0.7rem' }}>(Booked)</span>}
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
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Vance"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 8609504186"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Vehicle Reg Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WB-74-AX-8821"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Car Model</label>
                      <input
                        type="text"
                        placeholder="e.g. BMW X5 / Creta"
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

                {/* Right Column: Order Summary & Coupon */}
                <div style={{ background: 'rgba(0, 49, 53, 0.85)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#FFFFFF' }}>Order Summary</h4>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                    <span>Selected Package ({selectedService?.title || selectedService?.name}):</span>
                    <span>₹{selectedService?.price || 899}</span>
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
                  className="btn-slot-hover"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
                    color: '#003135',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    padding: '14px 36px',
                    borderRadius: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 25px rgba(15, 164, 175, 0.5)'
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
