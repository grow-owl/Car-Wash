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

  const fetchData = async () => {
    try {
      const [svcRes, pkgRes, addRes, slotRes] = await Promise.all([
        getServices(vehicleType),
        getPackages(vehicleType),
        getAddons(),
        getSlotsAvailability(selectedDate)
      ]);
      setServices(svcRes.data);
      setPackages(pkgRes.data);
      setAllAddons(addRes.data);
      setSlots(slotRes.data);
      if (!selectedService && svcRes.data.length > 0) {
        setSelectedService(svcRes.data[0]);
      }
    } catch (err) {
      console.error('Error loading booking data:', err);
    }
  };

  const handleToggleAddon = (addon) => {
    if (selectedAddons.some(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, { name: addon.name, price: addon.price }]);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const basePrice = (selectedService?.price || 0) + selectedAddons.reduce((s, a) => s + a.price, 0);
      const res = await validateCoupon(couponCode, basePrice);
      if (res.data.valid) {
        setCouponDiscount(res.data.discountCalculated);
        setCouponStatus(`Success: ₹${res.data.discountCalculated} discount applied!`);
      }
    } catch (err) {
      setCouponStatus(err.response?.data?.error || 'Invalid Coupon Code');
      setCouponDiscount(0);
    }
  };

  const calculateSubtotal = () => {
    const base = selectedService?.price || 0;
    const addOnTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return base + addOnTotal;
  };

  const calculateFinalTotal = () => {
    return Math.max(0, calculateSubtotal() - couponDiscount);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !vehicleNumber) {
      alert('Please fill in your name, phone number, and vehicle registration number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        phone,
        email,
        vehicleType,
        vehicleNumber,
        vehicleModel: vehicleModel || vehicleType,
        serviceName: selectedService?.name || selectedService?.title || 'Custom Wash Service',
        packageName: selectedService?.title ? selectedService.title : '',
        addons: selectedAddons,
        date: selectedDate,
        slotTime: selectedSlot,
        totalAmount: calculateFinalTotal(),
        paymentMode,
        couponCode: couponDiscount > 0 ? couponCode : ''
      };

      const res = await createBooking(payload);
      setIsSubmitting(false);
      setConfirmedBooking(res.data.booking);
      setShowInvoiceModal(true);

      if (onBookingComplete) {
        onBookingComplete(res.data.booking.trackingCode);
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('Booking error: ' + (err.response?.data?.error || err.message));
    }
  };

  const stepLabels = [
    { num: 1, label: 'Service Selection' },
    { num: 2, label: 'Vehicle Selection' },
    { num: 3, label: 'Booking & Slot' },
    { num: 4, label: 'Online Payment' }
  ];

  const vehiclesList = [
    { type: 'Hatchback', icon: '🚗', desc: 'Compact 4-Seater Cars' },
    { type: 'Sedan', icon: '🚘', desc: 'Executive Midsize Sedans' },
    { type: 'SUV', icon: '🚙', desc: 'Full-size Crossovers & 7-Seaters' },
    { type: 'Luxury', icon: '🏎️', desc: 'Sports & Premium Luxury Vehicles' },
    { type: 'Truck', icon: '🛻', desc: 'Pickup Trucks & Commercial Vans' }
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '1100px' }}>
      
      {/* EXPLICIT 4-STEP REVENUE FLOW INDICATOR BAR */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-aqua">CORE REVENUE FLOW</span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '6px' }}>4-Step Online Booking & Payment</h1>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          background: 'rgba(0, 49, 53, 0.8)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '16px 24px'
        }}>
          {stepLabels.map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;

            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num <= step) setStep(s.num);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: s.num <= step ? 'pointer' : 'default',
                  opacity: isActive || isDone ? 1 : 0.45
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--accent-aqua)' : isDone ? 'var(--accent-terracotta)' : 'rgba(2, 73, 80, 0.8)',
                  color: isActive ? '#003135' : '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 0 15px var(--accent-aqua-glow)' : 'none'
                }}>
                  {isDone ? <Check size={20} /> : s.num}
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700 }}>STEP 0{s.num}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--accent-aqua)' : '#FFFFFF' }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '36px', border: '1px solid var(--accent-aqua)' }}>
        
        {/* STEP 1: SERVICE SELECTION */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>1. Select Desired Wash or Detailing Package</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Choose from our flagship foam wash, interior steam sanitization, or ceramic coating</p>
              </div>
              <span className="badge badge-aqua">Step 1 of 4</span>
            </div>

            <div className="grid-2" style={{ gap: '20px', marginBottom: '32px' }}>
              {services.map(svc => (
                <div
                  key={svc._id}
                  onClick={() => setSelectedService(svc)}
                  style={{
                    background: selectedService?.name === svc.name ? 'rgba(15, 164, 175, 0.18)' : 'var(--bg-glass-card)',
                    border: selectedService?.name === svc.name ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '22px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF' }}>{svc.name}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{svc.price}</div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>{svc.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>⏱️ Duration: ~{svc.durationMins} mins</span>
                    {selectedService?.name === svc.name && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-aqua)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{v.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '4px' }}>{v.type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ArrowLeft size={18} /> Back to Service
              </button>

              <button
                onClick={() => {
                  setStep(3);
                  setShowUpsellModal(true); // Offer smart upselling add-ons before booking slot
                }}
                className="btn-aqua"
                style={{ padding: '14px 32px' }}
              >
                Next: Booking & Slot Selection <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING (DATE, SLOT & CONTACT DETAILS) */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>3. Select Date, Time Slot & Contact Info</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Pick an open bay slot and provide your vehicle registration details</p>
              </div>
              <span className="badge badge-aqua">Step 3 of 4</span>
            </div>

            {/* Smart Addons Summary Pill Bar */}
            <div style={{ background: 'rgba(0, 49, 53, 0.7)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)' }}>SELECTED ADD-ONS:</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {selectedAddons.length > 0 ? selectedAddons.map(a => a.name).join(', ') : 'No extra add-ons added'}
                </div>
              </div>
              <button onClick={() => setShowUpsellModal(true)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                <Sparkles size={14} color="var(--accent-aqua)" /> Add Smart Upgrades
              </button>
            </div>

            <div className="grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '6px' }}>Appointment Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '6px' }}>Select Bay Time Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="input-field"
                >
                  {slots.map((s, i) => (
                    <option key={i} value={s.slotTime} disabled={!s.available}>
                      {s.slotTime} {s.available ? `(${s.capacity - s.booked} bay slots available)` : '(SLOT FULL)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '20px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '6px' }}>Full Customer Name *</label>
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
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '6px' }}>Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 555-0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '6px' }}>Vehicle Reg. Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-MJ-8821"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="input-field"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '6px' }}>Promo Coupon Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-field"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button type="button" onClick={handleApplyCoupon} className="btn-primary">Apply</button>
                </div>
                {couponStatus && (
                  <div style={{ fontSize: '0.78rem', color: couponDiscount > 0 ? 'var(--accent-aqua)' : '#e0725a', marginTop: '4px', fontWeight: 700 }}>
                    {couponStatus}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} className="btn-secondary">
                <ArrowLeft size={18} /> Back to Vehicle
              </button>

              <button
                onClick={() => {
                  if (!customerName || !phone || !vehicleNumber) {
                    alert('Please enter your name, phone number, and vehicle registration number.');
                    return;
                  }
                  setStep(4);
                }}
                className="btn-aqua"
                style={{ padding: '14px 32px' }}
              >
                Proceed to Online Payment <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ONLINE PAYMENT & DIGITAL INVOICE */}
        {step === 4 && (
          <form onSubmit={handleFinalSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>4. Online Payment & Order Finalization</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Select payment method to complete booking & generate printable digital invoice</p>
              </div>
              <span className="badge badge-terracotta">Step 4 of 4</span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--ice-tint)', marginBottom: '10px', fontWeight: 700 }}>
                SELECT PAYMENT MODE:
              </label>

              <div className="grid-3" style={{ gap: '16px', marginBottom: '24px' }}>
                {[
                  { mode: 'Online', label: 'Online Card Payment', desc: 'Instant confirmation & digital invoice' },
                  { mode: 'UPI', label: 'UPI / QR Code', desc: 'GPay, PhonePe, Paytm QR' },
                  { mode: 'Cash', label: 'Pay at Wash Bay (Cash)', desc: 'Pay upon vehicle arrival' }
                ].map(p => (
                  <div
                    key={p.mode}
                    onClick={() => setPaymentMode(p.mode)}
                    style={{
                      background: paymentMode === p.mode ? 'rgba(15, 164, 175, 0.2)' : 'var(--bg-glass-card)',
                      border: paymentMode === p.mode ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                      borderRadius: '12px',
                      padding: '18px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF', marginBottom: '4px' }}>{p.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ORDER SUMMARY BREAKDOWN */}
            <div style={{
              background: 'rgba(0, 49, 53, 0.95)',
              border: '1px solid var(--accent-aqua)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '28px'
            }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '14px', color: '#FFFFFF' }}>Order Summary & Payable Total</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                <span>Base Service ({selectedService?.name}):</span>
                <span>₹{selectedService?.price || 0}</span>
              </div>

              {selectedAddons.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>+ {a.name}</span>
                  <span>+₹{a.price}</span>
                </div>
              ))}

              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0725a', fontWeight: 700, marginTop: '8px', fontSize: '0.95rem' }}>
                  <span>Promo Discount ({couponCode}):</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px' }}>
                <span>Total Amount Payable:</span>
                <span>₹{calculateFinalTotal()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                <ArrowLeft size={18} /> Back to Details
              </button>

              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
                {isSubmitting ? 'Processing Order...' : 'Pay Online & Confirm Booking'} <CheckCircle2 size={20} />
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Smart Upsell Modal */}
      <SmartUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        addons={allAddons}
        selectedAddons={selectedAddons}
        onToggleAddon={handleToggleAddon}
        onProceed={() => {
          setShowUpsellModal(false);
        }}
      />

      {/* Digital Receipt Invoice Modal */}
      <DigitalInvoiceModal
        booking={confirmedBooking}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onTrackLive={(code) => {
          setShowInvoiceModal(false);
          onTrackLive(code);
        }}
      />

    </div>
  );
}
