import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Car,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Tag,
  Info,
  CreditCard,
  Smartphone,
  Lock,
  Wallet
} from 'lucide-react';
import {
  getServices,
  getPackages,
  getAddons,
  getSlotsAvailability,
  validateCoupon,
  createBooking,
  checkPhoneExists,
  captureAbandonedBooking,
  createLead,
  createRazorpayOrder,
  verifyRazorpayPayment,
  reportPaymentFailure
} from '../api';
import { launchRazorpayCheckout } from '../utils/razorpay';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';
import { cleanText } from '../utils/cleanText';

export default function BookingFlow({
  initialVehicle = 'Sedan',
  initialStep = 1,
  preselectedItem = null,
  onBookingComplete,
  onTrackLive,
  onBackToHome
}) {
  const [step, setStep] = useState(initialStep);
  const [vehicleType, setVehicleType] = useState(initialVehicle);

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [allAddons, setAllAddons] = useState([]);
  const [slots, setSlots] = useState([]);

  const [bookingMode, setBookingMode] = useState('custom'); // 'custom' | 'packages'
  const [selectedService, setSelectedService] = useState(preselectedItem);
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
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [existingVehicles, setExistingVehicles] = useState([]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState('');

  // Payment Method Selection: 'razorpay' | 'pay_after'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Confirmation Modal
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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
      name: 'Premium Shine',
      title: 'Premium Shine',
      price: 799,
      originalPrice: 1099,
      durationMins: 60,
      description: 'Premium Foam Wash, Interior Vacuum, Dashboard Polish, Door Panel Cleaning, Tyre & Rim Cleaning, Tyre Shine, Underbody Wash & Air Freshener.',
      includedServices: ['Premium Foam Wash', 'Interior Vacuum', 'Dashboard Polish', 'Door Panel Cleaning', 'Tyre & Rim Cleaning', 'Tyre Shine', 'Underbody Wash', 'Air Freshener'],
      isPopular: true
    },
    {
      _id: 'pkg-3',
      name: 'Ultimate Detail',
      title: 'Ultimate Detail',
      price: 1499,
      originalPrice: 1999,
      durationMins: 120,
      description: 'Full interior deep clean, dashboard & door panel polish, seat surface cleaning, roof & carpet clean, AC vent clean & exterior wax.',
      includedServices: ['Premium Foam Wash', 'Full Interior Cleaning', 'Deep Vacuum', 'Dashboard & Door Panel Polish', 'Seat Surface Cleaning', 'Roof & Carpet Cleaning', 'AC Vent Cleaning', 'Tyre Shine', 'Exterior Wax Protection'],
      isPopular: false
    }
  ];

  // Handle preselected item from landing page
  useEffect(() => {
    if (preselectedItem) {
      if (preselectedItem.includedServices || preselectedItem.tagline || preselectedItem.title?.includes('Package') || preselectedItem.name?.includes('Package')) {
        setBookingMode('packages');
        setSelectedService(preselectedItem);
      } else {
        setBookingMode('custom');
        const serviceObj = {
          _id: preselectedItem._id || preselectedItem.id,
          name: preselectedItem.name || preselectedItem.title,
          category: preselectedItem.category || 'wash',
          price: preselectedItem.price || preselectedItem.basePrice || 499,
          originalPrice: preselectedItem.originalPrice || Math.round((preselectedItem.price || 499) * 1.35),
          durationMins: preselectedItem.durationMins || 30,
          description: preselectedItem.description || 'Professional car care service'
        };
        setSelectedCustomServices([serviceObj]);
      }
    }
  }, [preselectedItem]);

  // Fetch dynamic services and packages from database
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
      setServices(svcRes.data || []);
      setPackages((pkgRes.data && pkgRes.data.length >= 3) ? pkgRes.data : primary3Packages);
      setAllAddons(addRes.data || []);
      const slotsData = slotRes.data || [];
      setSlots(slotsData);

      // Auto-select first available slot if currently selected slot is full or not in list
      const currentSlotObj = slotsData.find(s => s.slotTime === selectedSlot);
      if (!currentSlotObj || !currentSlotObj.available) {
        const firstAvailable = slotsData.find(s => s.available);
        if (firstAvailable) {
          setSelectedSlot(firstAvailable.slotTime);
        }
      }
    } catch (err) {
      console.error('Error fetching data for booking wizard:', err);
    }
  };

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const baseTotal = calculateBaseTotal();
      const addonsTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const currentTotal = baseTotal + addonsTotal;

      const res = await validateCoupon(couponCode.trim(), currentTotal);
      if (res.data.valid) {
        setCouponDiscount(res.data.discount);
        setCouponStatus(`Success! ₹${res.data.discount} discount applied.`);
      } else {
        setCouponDiscount(0);
        setCouponStatus(res.data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponDiscount(0);
      setCouponStatus(err.response?.data?.error || 'Coupon could not be applied');
    }
  };

  // Toggle selection for dynamic custom service
  const toggleCustomService = (svc) => {
    setSelectedCustomServices(prev => {
      const exists = prev.some(s => s._id === svc._id || s.name.toLowerCase() === svc.name.toLowerCase());
      if (exists) {
        return prev.filter(s => s._id !== svc._id && s.name.toLowerCase() !== svc.name.toLowerCase());
      } else {
        return [...prev, svc];
      }
    });
  };

  // Pricing calculations
  const calculateBaseTotal = () => {
    if (bookingMode === 'custom') {
      return selectedCustomServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    }
    return Number(selectedService?.price) || 799;
  };

  const calculateFinalTotal = () => {
    const base = calculateBaseTotal();
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const total = base + addonsTotal - couponDiscount;
    return total > 0 ? total : 0;
  };

  // Complete Booking & Razorpay Payment Lifecycle
  const handleConfirmBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    setPaymentError('');

    if (!customerName || !phone || !vehicleNumber) {
      alert('Please fill in Customer Name, Phone Number, and Vehicle Registration Number.');
      return;
    }

    if (bookingMode === 'custom' && selectedCustomServices.length === 0) {
      alert('Please select at least 1 custom service before booking.');
      return;
    }

    setIsSubmitting(true);
    try {
      const serviceNameVal = bookingMode === 'custom'
        ? (selectedCustomServices.map(s => s.name).join(' + ') || 'Custom Wash Combo')
        : (selectedService?.name || selectedService?.title || 'Pro Wash Package');

      const isPayOnline = paymentMethod === 'razorpay';
      const finalAmount = calculateFinalTotal();

      const bookingPayload = {
        customerName: cleanText(customerName),
        phone: phone.replace(/\D/g, ''),
        email: email || 'customer@example.com',
        vehicleType,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vehicleModel: vehicleModel || vehicleType,
        serviceName: cleanText(serviceNameVal),
        packageName: bookingMode === 'custom' ? 'Custom Service Combo' : cleanText(selectedService?.title || selectedService?.name || 'Selected Package'),
        addons: selectedAddons.map(a => ({ name: cleanText(a.name), price: Number(a.price) })),
        date: selectedDate,
        slotTime: selectedSlot,
        totalAmount: finalAmount,
        discountAmount: couponDiscount,
        couponApplied: couponDiscount > 0 ? couponCode : '',
        paymentTiming: isPayOnline ? 'Pay Now' : 'Pay After Service',
        paymentMode: isPayOnline ? 'Razorpay' : 'Pay at Center',
        paymentStatus: 'Pending',
        status: 'confirmed'
      };

      // Step 1: Create Booking in backend database
      const bookingRes = await createBooking(bookingPayload);
      const createdBooking = bookingRes.data.booking || bookingRes.data;
      const trackingCode = createdBooking.trackingCode;

      // Case A: Pay After Service
      if (!isPayOnline) {
        setConfirmedBooking(createdBooking);
        setShowInvoiceModal(true);
        if (onBookingComplete) onBookingComplete(trackingCode);
        setIsSubmitting(false);
        return;
      }

      // Case B: Pay Online via Razorpay
      try {
        // Step 2: Create Razorpay Order
        const orderRes = await createRazorpayOrder({
          trackingCode,
          amount: finalAmount,
          currency: 'INR',
          notes: {
            customerName: cleanText(customerName),
            phone: phone.replace(/\D/g, ''),
            vehicleNumber: vehicleNumber.toUpperCase().trim(),
            serviceName: cleanText(serviceNameVal)
          }
        });

        const { orderId, amount, currency, keyId } = orderRes.data;

        // Step 3: Launch Razorpay Checkout Popup
        await launchRazorpayCheckout({
          keyId,
          orderId,
          amount,
          currency,
          customerName: cleanText(customerName),
          phone: phone.replace(/\D/g, ''),
          email: email || '',
          description: `${cleanText(serviceNameVal)} - Slot: ${selectedSlot}`,
          onSuccess: async (rzpResponse) => {
            try {
              // Step 4: Verify HMAC SHA256 Signature on Backend
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                trackingCode
              });

              const verifiedBooking = verifyRes.data.booking || {
                ...createdBooking,
                paymentStatus: 'Paid',
                paymentMode: 'Razorpay',
                razorpayPaymentId: rzpResponse.razorpay_payment_id,
                razorpayOrderId: rzpResponse.razorpay_order_id
              };

              setConfirmedBooking(verifiedBooking);
              setShowInvoiceModal(true);

              if (onBookingComplete) {
                onBookingComplete(trackingCode);
              }
            } catch (vErr) {
              console.error('Verification error:', vErr);
              alert(vErr.response?.data?.error || 'Payment received, but confirmation sync is in progress. Check tracking portal.');
              setConfirmedBooking(createdBooking);
              setShowInvoiceModal(true);
            } finally {
              setIsSubmitting(false);
            }
          },
          onFailure: async (failErr) => {
            console.warn('Razorpay payment failed:', failErr);
            setPaymentError(failErr?.description || 'Payment was not completed. You can try again or choose Pay After Service.');
            try {
              await reportPaymentFailure({
                trackingCode,
                error: failErr
              });
            } catch (e) {}
            setIsSubmitting(false);
          },
          onDismiss: () => {
            setIsSubmitting(false);
            setPaymentError('Razorpay payment window closed. Your appointment is reserved. You can complete payment now or pay at the center.');
          }
        });
      } catch (orderErr) {
        console.error('Order creation error:', orderErr);
        // Fallback to confirmed booking with pending payment if order fails
        setConfirmedBooking(createdBooking);
        setShowInvoiceModal(true);
        if (onBookingComplete) onBookingComplete(trackingCode);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      alert(err.response?.data?.error || 'Failed to submit booking. Please verify your details or select another slot.');
      setIsSubmitting(false);
    }
  };

  const vehiclesList = [
    { type: 'Hatchback', desc: 'Compact 4-Seater' },
    { type: 'Sedan', desc: 'Executive Midsize' },
    { type: 'SUV', desc: 'Full-Size / Crossover' },
    { type: 'Luxury', desc: 'Premium / Sports Car' },
    { type: 'Truck', desc: 'Pickup / Off-road' }
  ];

  const displayPackagesList = (packages && packages.length >= 3 ? packages : primary3Packages).slice().sort((a, b) => a.price - b.price);

  // Derive active categories dynamically from DB services
  const availableCategories = ['all'];
  services.forEach(s => {
    const cat = (s.category || 'wash').toLowerCase();
    if (!availableCategories.includes(cat)) {
      availableCategories.push(cat);
    }
  });

  const getCategoryLabel = (cat) => {
    if (cat === 'all') return 'All Services';
    if (cat === 'wash') return 'Washing';
    if (cat === 'interior') return 'Interior Care';
    if (cat === 'detailing' || cat === 'exterior') return 'Detailing & Polish';
    if (cat === 'engine') return 'Engine & Chassis';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const filteredServices = customCategoryFilter === 'all'
    ? services
    : services.filter(s => (s.category || 'wash').toLowerCase() === customCategoryFilter);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* HEADER WIZARD TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-aqua">INSTANT APPOINTMENT</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '6px', color: '#FFFFFF' }}>Reserve Your Detailing Slot</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select your services, choose date & slot, and get instant booking confirmation with ₹0 advance payment.
        </p>
      </div>

      {/* 3-STEP WIZARD PROGRESS BAR */}
      <div className="wizard-step-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '36px',
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
          { num: 3, label: 'Slot & Confirmation' }
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
        
        {/* STEP 1: DYNAMIC SERVICE SELECTION (FROM OWNER DATABASE ONLY) */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>1. Choose Services or Package</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Pick standalone custom treatments or select a complete detailing bundle
                </p>
              </div>
              <span className="badge badge-aqua">Step 1 of 3</span>
            </div>

            {/* SWITCHER TABS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', background: 'rgba(0,49,53,0.6)', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border-light)' }}>
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
                Custom Service Combo (Pick Individual Services)
              </button>

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
                Pre-Made Full Packages
              </button>
            </div>

            {/* MODE 1: CUSTOM STANDALONE SERVICES (FROM DATABASE ONLY) */}
            {bookingMode === 'custom' && (
              <div style={{ marginBottom: '32px' }}>
                
                {/* COMBO SUMMARY BAR */}
                <div style={{ background: 'rgba(255, 195, 0, 0.12)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                      Selected Services ({selectedCustomServices.length})
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
                      {selectedCustomServices.length > 0
                        ? selectedCustomServices.map(s => s.name).join(' • ')
                        : 'No service selected yet (Check boxes below to build your combo)'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    Combo Total: ₹{calculateBaseTotal()}
                  </div>
                </div>

                {/* CATEGORY FILTER TABS */}
                {availableCategories.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {availableCategories.map((catId) => (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => setCustomCategoryFilter(catId)}
                        style={{
                          background: customCategoryFilter === catId ? 'var(--accent-cyan)' : 'rgba(0, 49, 53, 0.6)',
                          color: customCategoryFilter === catId ? '#003135' : '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          border: customCategoryFilter === catId ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                          padding: '6px 14px',
                          borderRadius: '18px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {getCategoryLabel(catId)}
                      </button>
                    ))}
                  </div>
                )}

                {/* DYNAMIC DATABASE SERVICES GRID */}
                {filteredServices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <Info size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }} />
                    <p>No services found in this category.</p>
                  </div>
                ) : (
                  <div className="grid-2" style={{ gap: '14px' }}>
                    {filteredServices.map((s) => {
                      const basePrice = Number(s.price || s.basePrice || 499);
                      const origPrice = s.originalPrice ? Number(s.originalPrice) : Math.round(basePrice * 1.35);
                      const isChecked = selectedCustomServices.some(cs => cs._id === s._id || cs.name.toLowerCase() === s.name.toLowerCase());
                      const itemToToggle = {
                        _id: s._id,
                        name: s.name,
                        price: basePrice,
                        originalPrice: origPrice,
                        category: s.category,
                        durationMins: s.durationMins || 30,
                        description: s.description
                      };

                      return (
                        <div
                          key={s._id || s.name}
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
                                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFFFFF' }}>{cleanText(s.name)}</span>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.78rem', opacity: 0.75 }}>₹{origPrice}</span>
                                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-gold)' }}>₹{basePrice}</span>
                              </div>
                              {s.description && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {cleanText(s.description)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                              {s.durationMins || 30} mins
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: PRE-MADE PACKAGES */}
            {bookingMode === 'packages' && (
              <div className="grid-3" style={{ gap: '20px', marginBottom: '32px' }}>
                {displayPackagesList.map((pkg, idx) => {
                  const pkgName = cleanText(pkg.title || pkg.name);
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
                        {cleanText(pkg.description || pkg.tagline)}
                      </p>

                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '14px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '8px' }}>
                          INCLUDED SERVICES:
                        </div>
                        {pkg.includedServices && pkg.includedServices.map((inc, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', marginBottom: '6px', color: '#CCD0CF' }}>
                            <span>• {cleanText(inc)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '16px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>Duration: ~{pkg.durationMins || 50} mins</span>
                        {isSelected && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-aqua)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <button
                onClick={() => {
                  if (bookingMode === 'custom' && selectedCustomServices.length === 0) {
                    alert('Please select at least 1 service to build your custom combo.');
                    return;
                  }
                  setStep(2);
                }}
                className="btn-aqua"
                style={{ width: 'min(100%, 280px)', justifyContent: 'center' }}
              >
                Next: Vehicle Selection <ArrowRight size={16} />
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
              <span className="badge badge-aqua">Step 2 of 3</span>
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
                  <Car size={32} style={{ color: vehicleType === v.type ? 'var(--accent-aqua)' : 'var(--ice-tint)', margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF' }}>{v.type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{v.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: '1 1 140px', justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Back: Services
              </button>

              <button onClick={() => setStep(3)} className="btn-aqua" style={{ flex: '2 1 200px', justifyContent: 'center' }}>
                Next: Slot & Details <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SLOT BOOKING & INSTANT DIRECT CONFIRMATION */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>3. Pick Slot & Confirm Appointment</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Reserve your bay slot instantly. Pay ₹0 upfront & settle after your wash at the center.
                </p>
              </div>
              <span className="badge badge-aqua">Step 3 of 3</span>
            </div>

            <form onSubmit={handleConfirmBookingSubmit}>
              <div className="grid-2" style={{ gap: '28px', marginBottom: '32px' }}>
                
                {/* Left Column: Date, Slot & Customer Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Date & Slot Pickers */}
                  <div style={{ background: 'rgba(0, 49, 53, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> Select Wash Date *
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="input-field"
                          style={{ fontSize: '0.92rem', padding: '10px 12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} /> Selected Slot
                        </label>
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: 'rgba(15, 164, 175, 0.15)',
                          border: '1px solid var(--accent-aqua)',
                          color: 'var(--accent-aqua)',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {selectedSlot}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> Available Bay Time Slots:
                      </label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-aqua)', fontWeight: 700 }}>
                        🟢 Active Bays: 2 (Bay 1 & Bay 2)
                      </span>
                    </div>
                    {(() => {
                      const defaultSlots = [
                        { slotTime: '08:00 AM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '09:00 AM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '10:00 AM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '11:00 AM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '12:00 PM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '01:00 PM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '02:00 PM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '03:00 PM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '04:00 PM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '05:00 PM', available: true, remainingCapacity: 2, booked: 0 },
                        { slotTime: '06:00 PM', available: true, remainingCapacity: 2, booked: 0 }
                      ];

                      const slotsToRender = (slots && slots.length > 0) ? slots : defaultSlots;

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '8px' }}>
                          {slotsToRender.map((s, idx) => {
                            const timeLabel = typeof s === 'string' ? s : (s.slotTime || s.time || '10:00 AM');
                            const isAvailable = typeof s === 'object' ? (s.available !== false && s.remainingCapacity !== 0) : true;
                            const isSelected = selectedSlot === timeLabel;
                            const remaining = typeof s === 'object' ? (s.remainingCapacity ?? 2) : 2;

                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => {
                                  if (isAvailable) setSelectedSlot(timeLabel);
                                }}
                                title={!isAvailable ? `${timeLabel} is fully booked (Both Bay 1 & Bay 2 are occupied)` : `${remaining} Bay(s) available`}
                                style={{
                                  background: !isAvailable
                                    ? 'rgba(239, 68, 68, 0.08)'
                                    : isSelected
                                      ? 'var(--accent-aqua)'
                                      : 'rgba(17, 33, 45, 0.85)',
                                  color: !isAvailable
                                    ? 'rgba(255, 255, 255, 0.35)'
                                    : isSelected
                                      ? '#06141B'
                                      : '#FFFFFF',
                                  border: !isAvailable
                                    ? '1px dashed rgba(239, 68, 68, 0.4)'
                                    : isSelected
                                      ? '2px solid var(--accent-aqua)'
                                      : '1px solid var(--border-light)',
                                  borderRadius: '8px',
                                  padding: '8px 4px',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                                  opacity: isAvailable ? 1 : 0.45,
                                  textAlign: 'center',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                <span style={{ textDecoration: !isAvailable ? 'line-through' : 'none' }}>
                                  {timeLabel}
                                </span>
                                <span style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  color: !isAvailable
                                    ? '#ef4444'
                                    : isSelected
                                      ? '#003135'
                                      : remaining === 1
                                        ? 'var(--accent-gold)'
                                        : 'var(--accent-cyan)'
                                }}>
                                  {!isAvailable ? 'FULL (2/2)' : remaining === 1 ? '1 Bay Left' : 'Available'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Customer Information Inputs */}
                  <div style={{ background: 'rgba(0, 49, 53, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                      Customer & Vehicle Details
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhone(val);
                          const digits = val.replace(/\D/g, '');
                          if (digits.length >= 10) {
                            checkPhoneExists(digits).then(res => {
                              if (res.data?.exists) {
                                setIsExistingCustomer(true);
                                if (res.data.name && !customerName) setCustomerName(res.data.name);
                                if (res.data.vehicles) setExistingVehicles(res.data.vehicles);
                              } else {
                                setIsExistingCustomer(false);
                              }
                            }).catch(() => {});

                            // Capture abandoned lead
                            captureAbandonedBooking({
                              customerName: customerName || 'Valued Customer',
                              phone: digits,
                              vehicleType,
                              vehicleNumber,
                              vehicleModel,
                              serviceName: bookingMode === 'custom' ? selectedCustomServices.map(s => s.name).join(' + ') : selectedService?.name,
                              subtotal: calculateFinalTotal(),
                              stepReached: 3
                            }).catch(() => {});
                          }
                        }}
                        className="input-field"
                      />
                      {isExistingCustomer && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-aqua)', marginTop: '4px', fontWeight: 700 }}>
                          Welcome back! Existing customer record recognized.
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dhiraj Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    {/* Saved Vehicles for Existing Customer */}
                    {isExistingCustomer && existingVehicles.length > 0 && (
                      <div style={{ background: 'rgba(0, 31, 35, 0.8)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--accent-aqua)' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-aqua)', fontWeight: 800 }}>Quick Select Saved Vehicle:</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {existingVehicles.map((v, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setVehicleNumber(v.regNumber);
                                if (v.model) setVehicleModel(v.model);
                              }}
                              className="btn-secondary"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            >
                              {v.regNumber} {v.model ? `(${v.model})` : ''}
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
                          placeholder="e.g. WB-02-AK-1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>Car Model (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Nexon / Creta"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Add-ons & Order Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* Optional Add-ons */}
                  {allAddons.length > 0 && (
                    <div style={{ background: 'rgba(0, 49, 53, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>Recommended Add-ons (Optional)</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                        {allAddons.slice(0, 6).map((addon, idx) => {
                          const isChecked = selectedAddons.some(a => a.name === addon.name);
                          return (
                            <label
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: isChecked ? 'rgba(0, 229, 255, 0.15)' : 'rgba(17, 33, 45, 0.7)',
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
                                <span>{cleanText(addon.name)}</span>
                              </div>
                              <span style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>+₹{addon.price}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary & Coupon */}
                  <div style={{ background: 'rgba(0, 49, 53, 0.85)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#FFFFFF' }}>Booking Summary</h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#CCD0CF' }}>
                      <span>Vehicle:</span>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{vehicleType}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#CCD0CF' }}>
                      <span>Date & Slot:</span>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{selectedDate} at {selectedSlot}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#CCD0CF' }}>
                      <span>
                        {bookingMode === 'custom' ? `Custom Combo (${selectedCustomServices.length} items)` : (selectedService?.name || 'Selected Package')}:
                      </span>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>₹{calculateBaseTotal()}</span>
                    </div>

                    {selectedAddons.map((a, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>+ {cleanText(a.name)}</span>
                        <span>+₹{a.price}</span>
                      </div>
                    ))}

                    {/* Coupon Input */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={12} /> Apply Promo Coupon Code:
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="text"
                          placeholder="e.g. WELCOME20"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="input-field"
                          style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                        />
                        <button type="button" onClick={handleApplyCoupon} className="btn-secondary" style={{ padding: '0 14px', fontSize: '0.82rem' }}>
                          Apply
                        </button>
                      </div>
                      {couponStatus && (
                        <div style={{ fontSize: '0.75rem', color: couponStatus.includes('Success') ? 'var(--accent-aqua)' : '#e0725a', marginTop: '4px', fontWeight: 700 }}>
                          {couponStatus}
                        </div>
                      )}
                    </div>

                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0725a', fontWeight: 700, marginTop: '8px', fontSize: '0.88rem' }}>
                        <span>Promo Discount ({couponCode}):</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}

                    {/* Total Amount Payable */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-aqua)', borderTop: '2px solid var(--accent-aqua)', paddingTop: '12px', marginTop: '14px' }}>
                      <span>Total Payable:</span>
                      <span>₹{calculateFinalTotal()}</span>
                    </div>

                    {/* PAYMENT METHOD SELECTION */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <Lock size={14} style={{ color: 'var(--accent-aqua)' }} /> Select Payment Option:
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Option 1: Razorpay Online */}
                        <div
                          onClick={() => setPaymentMethod('razorpay')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: paymentMethod === 'razorpay' ? 'rgba(0, 210, 180, 0.15)' : 'rgba(10, 30, 39, 0.6)',
                            border: paymentMethod === 'razorpay' ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'razorpay'}
                              onChange={() => setPaymentMethod('razorpay')}
                              style={{ accentColor: 'var(--accent-aqua)', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>Pay Online</span>
                                <span className="badge badge-aqua" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>FAST & SECURE</span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
                                UPI (GPay/PhonePe/Paytm), Cards & NetBanking
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Smartphone size={16} style={{ color: 'var(--accent-aqua)' }} />
                            <CreditCard size={16} style={{ color: 'var(--accent-cyan)' }} />
                          </div>
                        </div>

                        {/* Option 2: Pay After Service */}
                        <div
                          onClick={() => setPaymentMethod('pay_after')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: paymentMethod === 'pay_after' ? 'rgba(230, 176, 0, 0.15)' : 'rgba(10, 30, 39, 0.6)',
                            border: paymentMethod === 'pay_after' ? '2px solid var(--accent-gold)' : '1px solid var(--border-light)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'pay_after'}
                              onChange={() => setPaymentMethod('pay_after')}
                              style={{ accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF' }}>
                                Pay After Service
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
                                Pay at center via Cash or UPI after detailing is completed
                              </div>
                            </div>
                          </div>
                          <Wallet size={16} style={{ color: 'var(--accent-gold)' }} />
                        </div>
                      </div>

                      {paymentError && (
                        <div style={{
                          marginTop: '10px',
                          background: 'rgba(224, 114, 90, 0.15)',
                          border: '1px solid #e0725a',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          color: '#e0725a',
                          fontWeight: 600
                        }}>
                          {paymentError}
                        </div>
                      )}

                      {/* Security Guarantee Badge */}
                      <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)'
                      }}>
                        <ShieldCheck size={14} style={{ color: 'var(--accent-aqua)' }} />
                        <span>256-Bit SSL Encrypted & 100% Secure Payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ flex: '1 1 140px', justifyContent: 'center' }}>
                  <ArrowLeft size={16} /> Back: Vehicle
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    background: paymentMethod === 'razorpay' ? 'var(--accent-aqua)' : 'var(--accent-gold)',
                    color: '#003135',
                    fontWeight: 800,
                    fontSize: '1rem',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '28px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: paymentMethod === 'razorpay'
                      ? '0 6px 25px rgba(0, 210, 180, 0.45)'
                      : '0 6px 25px rgba(230, 176, 0, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    flex: '2 1 220px'
                  }}
                >
                  <CheckCircle2 size={18} />
                  {isSubmitting
                    ? 'Processing...'
                    : paymentMethod === 'razorpay'
                      ? `Pay ₹${calculateFinalTotal()} Online`
                      : `Confirm (₹${calculateFinalTotal()})`}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* DIGITAL INVOICE MODAL (INSTANT DIRECT CONFIRMATION) */}
      {showInvoiceModal && confirmedBooking && (
        <DigitalInvoiceModal
          booking={confirmedBooking}
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            if (onTrackLive) onTrackLive(confirmedBooking.trackingCode);
          }}
          onTrackLive={onTrackLive}
        />
      )}

    </div>
  );
}
