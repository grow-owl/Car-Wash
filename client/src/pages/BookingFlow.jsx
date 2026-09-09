import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Car,
  Bike,
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
  currentUser = null,
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

  // Auto-fill logged-in customer info (from prop or localStorage)
  useEffect(() => {
    let user = currentUser;
    if (!user) {
      try {
        const saved = localStorage.getItem('carwash_customer');
        if (saved) user = JSON.parse(saved);
      } catch (e) {}
    }
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.vehicles && user.vehicles.length > 0) {
        setExistingVehicles(user.vehicles);
        setIsExistingCustomer(true);
        if (!vehicleNumber && user.vehicles[0]?.regNumber) {
          setVehicleNumber(user.vehicles[0].regNumber);
        }
        if (!vehicleModel && user.vehicles[0]?.model) {
          setVehicleModel(user.vehicles[0].model);
        }
      }
    }
  }, [currentUser]);

  // Auto-detect and apply Referral Code from URL (?ref=... or ?code=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref') || urlParams.get('code') || urlParams.get('coupon');
    if (refParam && !couponCode) {
      const cleanRef = refParam.toUpperCase().trim();
      setCouponCode(cleanRef);
      validateCoupon(cleanRef, 500).then(res => {
        if (res.data.valid) {
          const discountAmt = res.data.discount !== undefined ? res.data.discount : 50;
          setCouponDiscount(discountAmt);
          setCouponStatus(`🎉 Referral Code Applied! Flat ₹${discountAmt} Discount for your 1st wash.`);
        }
      }).catch(err => {
        console.log('Auto referral check note:', err);
      });
    }
  }, []);

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
        const discountAmt = res.data.discount !== undefined ? res.data.discount : (res.data.discountCalculated || res.data.value || 0);
        setCouponDiscount(discountAmt);
        setCouponStatus(`🎉 Success! ₹${discountAmt} discount applied (${res.data.code || couponCode.toUpperCase().trim()}).`);
      } else {
        setCouponDiscount(0);
        setCouponStatus(res.data.message || res.data.error || 'Invalid coupon code');
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

      // Helper to auto dispatch WhatsApp confirmation with tracking link to customer
      const autoDispatchWhatsApp = (bData, waNotif) => {
        try {
          let targetUrl = waNotif?.waLinkCustomer || waNotif?.waLink;
          if (!targetUrl && bData) {
            const cleanPhone = (bData.phone || phone || '').replace(/\D/g, '');
            const custPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
            const siteBase = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://car-wash-grow-owl.vercel.app');
            const trackUrl = `${siteBase}/?track=${bData.trackingCode || trackingCode}`;
            const invUrl = `${siteBase}/?track=${bData.trackingCode || trackingCode}&invoice=1`;
            const siteDisplay = siteBase.replace(/^https?:\/\//, '');
            const rawSvc = bData.serviceName || serviceNameVal || 'Full Auto Spa & Wash';
            const svcParts = rawSvc.split('+').map(s => s.trim()).filter(Boolean);
            const formattedSvc = svcParts.length > 3 
              ? `${svcParts.slice(0, 2).join(', ')} + ${svcParts.length - 2} more services` 
              : svcParts.join(', ');

            const msg = 
              `*CAR WASH AUTO SPA*\n` +
              `_Appointment Confirmation_\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `Dear *${bData.customerName || customerName}*,\n` +
              `Your car wash appointment has been successfully confirmed.\n\n` +
              `*APPOINTMENT & VEHICLE DETAILS*\n` +
              `• Tracking ID: *${bData.trackingCode || trackingCode}*\n` +
              `• Vehicle: *${bData.vehicleNumber || vehicleNumber}* (${bData.vehicleModel || vehicleType})\n` +
              `• Date & Time: ${bData.date || selectedDate} at ${bData.slotTime || selectedSlot}\n` +
              `• Service: ${formattedSvc}\n` +
              `• Total Amount: Rs. ${bData.totalAmount || finalAmount} (${bData.paymentStatus || 'Pending'})\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `*LIVE STATUS TRACKING*\n` +
              `Track live bay progress and technician updates in real-time:\n` +
              `${trackUrl}\n\n` +
              `*DIGITAL TAX INVOICE*\n` +
              `View and download your official tax invoice:\n` +
              `${invUrl}\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `*CAR WASH AUTO SPA*\n` +
              `• Helpline: +91 86095 04186\n` +
              `• Website: ${siteDisplay}\n` +
              `_Drive Clean. Go Further._`;
            targetUrl = `https://wa.me/${custPhone}?text=${encodeURIComponent(msg)}`;
          }
          if (targetUrl) {
            window.open(targetUrl, '_blank');
          }
        } catch (e) {
          console.warn('Auto WhatsApp dispatch caught:', e);
        }
      };

      // Case A: Pay After Service
      if (!isPayOnline) {
        setConfirmedBooking(createdBooking);
        setShowInvoiceModal(true);
        if (onBookingComplete) onBookingComplete(trackingCode);
        autoDispatchWhatsApp(createdBooking, bookingRes.data?.whatsappNotification);
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
              if (onBookingComplete) onBookingComplete(trackingCode);
              autoDispatchWhatsApp(verifiedBooking, verifyRes.data?.whatsappNotification || bookingRes.data?.whatsappNotification);
            } catch (vErr) {
              console.error('Verification error:', vErr);
              alert(vErr.response?.data?.error || 'Payment received, but confirmation sync is in progress. Check tracking portal.');
              setConfirmedBooking(createdBooking);
              setShowInvoiceModal(true);
              autoDispatchWhatsApp(createdBooking, bookingRes.data?.whatsappNotification);
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
        autoDispatchWhatsApp(createdBooking, bookingRes.data?.whatsappNotification);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      alert(err.response?.data?.error || 'Failed to submit booking. Please verify your details or select another slot.');
      setIsSubmitting(false);
    }
  };

  const vehiclesList = [
    { type: '2-Wheeler', desc: 'Bike / Scooter / Superbike', isBike: true },
    { type: 'Hatchback', desc: 'Alto / Swift / i20 / Kwid' },
    { type: 'Sedan', desc: 'City / Verna / Ciaz / Dzire' },
    { type: 'Compact SUV', desc: 'Nexon / Brezza / Creta / Venue' },
    { type: 'SUV / MUV', desc: 'Fortuner / Innova / Scorpio / XUV700' },
    { type: 'Luxury', desc: 'BMW / Audi / Mercedes / Jaguar' }
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
    <div className="container" style={{ paddingTop: '16px', paddingBottom: 'clamp(50px, 8vw, 90px)', maxWidth: '1040px' }}>
      
      {/* COMPACT MINIMAL HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <h1 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
          Reserve Your Wash Slot
        </h1>
      </div>

      {/* SLEEK 3-STEP PROGRESS TRACK */}
      <div className="wizard-step-bar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        background: 'rgba(0, 31, 35, 0.65)',
        padding: '8px 16px',
        borderRadius: '12px',
        border: '1px solid rgba(74, 92, 106, 0.3)',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {[
          { num: 1, label: 'Services' },
          { num: 2, label: 'Vehicle' },
          { num: 3, label: 'Slot & Confirm' }
        ].map(st => (
          <div
            key={st.num}
            onClick={() => setStep(st.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              opacity: step === st.num ? 1 : 0.6
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: step === st.num ? 'var(--accent-aqua)' : 'rgba(0, 49, 53, 0.8)',
              color: step === st.num ? '#003135' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.74rem',
              border: step === st.num ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)'
            }}>
              {st.num}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: step === st.num ? 800 : 600, color: step === st.num ? 'var(--accent-aqua)' : '#CCD0CF' }}>
              {st.label}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN STEP CONTENT CONTAINER */}
      <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 24px)', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: '16px', marginBottom: 'clamp(30px, 6vw, 50px)' }}>
        
        {/* STEP 1: DYNAMIC SERVICE SELECTION (FROM OWNER DATABASE ONLY) */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid rgba(74, 92, 106, 0.25)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  1. Choose Services or Package
                </h3>
              </div>
              <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Step 1 of 3
              </span>
            </div>

            {/* SWITCHER TABS */}
            <div style={{ display: 'inline-flex', gap: '6px', marginBottom: '16px', background: 'rgba(0, 49, 53, 0.65)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setBookingMode('custom')}
                style={{
                  background: bookingMode === 'custom' ? 'var(--accent-gold)' : 'transparent',
                  color: bookingMode === 'custom' ? '#06141B' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Custom Combo
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('packages')}
                style={{
                  background: bookingMode === 'packages' ? 'var(--accent-aqua)' : 'transparent',
                  color: bookingMode === 'packages' ? '#003135' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Full Packages
              </button>
            </div>

            {/* MODE 1: CUSTOM STANDALONE SERVICES (FROM DATABASE ONLY) */}
            {bookingMode === 'custom' && (
              <div style={{ marginBottom: '20px' }}>
                
                {/* COMBO SUMMARY BAR */}
                <div style={{ background: 'rgba(255, 195, 0, 0.08)', border: '1px solid rgba(255, 195, 0, 0.35)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.84rem' }}>
                      Selected Services ({selectedCustomServices.length})
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--ice-tint)', marginTop: '1px' }}>
                      {selectedCustomServices.length > 0
                        ? selectedCustomServices.map(s => s.name).join(' • ')
                        : 'Tap services below to build your combo'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    ₹{calculateBaseTotal()}
                  </div>
                </div>

                {/* CATEGORY FILTER TABS (HORIZONTAL SCROLL ON MOBILE) */}
                {availableCategories.length > 1 && (
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {availableCategories.map((catId) => (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => setCustomCategoryFilter(catId)}
                        style={{
                          background: customCategoryFilter === catId ? 'var(--accent-cyan)' : 'rgba(0, 49, 53, 0.6)',
                          color: customCategoryFilter === catId ? '#003135' : '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          border: customCategoryFilter === catId ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                          padding: '5px 12px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
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
                  <div style={{ textAlign: 'center', padding: '30px 14px', color: 'var(--text-muted)' }}>
                    <Info size={24} style={{ color: 'var(--accent-cyan)', marginBottom: '6px' }} />
                    <p style={{ fontSize: '0.82rem' }}>No services found in this category.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
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
                            background: isChecked ? 'rgba(0, 229, 255, 0.12)' : 'rgba(0, 49, 53, 0.55)',
                            border: isChecked ? '1px solid var(--accent-cyan)' : '1px solid rgba(74, 92, 106, 0.3)',
                            borderRadius: '11px',
                            padding: '13px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'all 0.15s ease',
                            boxSizing: 'border-box'
                          }}
                        >
                          {/* LEFT: Checkbox + Name + Description + Time */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ width: '17px', height: '17px', accentColor: 'var(--accent-cyan)', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF' }}>{cleanText(s.name)}</span>
                                <span style={{ fontSize: '0.66rem', color: 'var(--ice-tint)', background: 'rgba(255, 255, 255, 0.08)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  ~{s.durationMins || 30}m
                                </span>
                              </div>
                              {s.description && (
                                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {cleanText(s.description)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* RIGHT: Price perfectly right-aligned */}
                          <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            {origPrice > basePrice && (
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.74rem', opacity: 0.7 }}>
                                ₹{origPrice}
                              </span>
                            )}
                            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--accent-gold)' }}>
                              ₹{basePrice}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {displayPackagesList.map((pkg, idx) => {
                  const pkgName = cleanText(pkg.title || pkg.name);
                  const isSelected = (selectedService?.name === pkgName) || (selectedService?.title === pkgName);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedService(pkg)}
                      style={{
                        background: isSelected
                          ? 'rgba(15, 164, 175, 0.18)'
                          : (pkg.isPopular || pkgName.toLowerCase().includes('premium shine'))
                            ? 'rgba(255, 195, 0, 0.06)'
                            : 'rgba(0, 49, 53, 0.55)',
                        border: isSelected
                          ? '2px solid var(--accent-aqua)'
                          : (pkg.isPopular || pkgName.toLowerCase().includes('premium shine'))
                            ? '2px solid var(--accent-gold)'
                            : '1px solid rgba(74, 92, 106, 0.3)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        boxShadow: (pkg.isPopular || pkgName.toLowerCase().includes('premium shine'))
                          ? '0 0 14px rgba(255, 195, 0, 0.18)'
                          : 'none'
                      }}
                    >
                      {(pkg.isPopular || pkgName.toLowerCase().includes('premium shine')) && (
                        <div style={{
                          position: 'absolute',
                          top: '-9px',
                          right: '12px',
                          background: 'var(--accent-gold)',
                          color: '#06141B',
                          padding: '2px 10px',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.64rem',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                        }}>
                          ★ MOST POPULAR
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{pkgName}</h4>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{pkg.price}</div>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>
                        {cleanText(pkg.description || pkg.tagline)}
                      </p>

                      {pkg.includedServices && pkg.includedServices.length > 0 && (
                        <div style={{ borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '8px', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {pkg.includedServices.map((inc, i) => (
                            <span key={i} style={{ fontSize: '0.68rem', color: '#CCD0CF', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                              ✓ {cleanText(inc)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)' }}>~{pkg.durationMins || 50} mins</span>
                        {isSelected && (
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-aqua)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={12} /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '14px' }}>
              <button
                onClick={() => {
                  if (bookingMode === 'custom' && selectedCustomServices.length === 0) {
                    alert('Please select at least 1 service to build your custom combo.');
                    return;
                  }
                  setStep(2);
                }}
                className="btn-aqua"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem' }}
              >
                Next: Vehicle Selection <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VEHICLE SELECTION */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid rgba(74, 92, 106, 0.25)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  2. Select Vehicle Type
                </h3>
              </div>
              <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Step 2 of 3
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {vehiclesList.map(v => (
                <div
                  key={v.type}
                  onClick={() => setVehicleType(v.type)}
                  style={{
                    background: vehicleType === v.type ? 'rgba(15, 164, 175, 0.18)' : 'rgba(0, 49, 53, 0.55)',
                    border: vehicleType === v.type ? '1.5px solid var(--accent-aqua)' : '1px solid rgba(74, 92, 106, 0.3)',
                    borderRadius: '10px',
                    padding: '14px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {v.isBike ? (
                    <Bike size={24} style={{ color: vehicleType === v.type ? 'var(--accent-aqua)' : 'var(--ice-tint)', margin: '0 auto 6px auto' }} />
                  ) : (
                    <Car size={24} style={{ color: vehicleType === v.type ? 'var(--accent-aqua)' : 'var(--ice-tint)', margin: '0 auto 6px auto' }} />
                  )}
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF' }}>{v.type}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{v.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '14px', gap: '10px' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: '1', justifyContent: 'center', padding: '9px 12px', fontSize: '0.84rem' }}>
                <ArrowLeft size={14} /> Back
              </button>

              <button onClick={() => setStep(3)} className="btn-aqua" style={{ flex: '2', justifyContent: 'center', padding: '9px 12px', fontSize: '0.84rem' }}>
                Next: Slot & Details <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SLOT BOOKING & INSTANT DIRECT CONFIRMATION */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(74, 92, 106, 0.25)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  3. Select Slot & Confirm Details
                </h3>
              </div>
              <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Step 3 of 3
              </span>
            </div>

            <form onSubmit={handleConfirmBookingSubmit}>
              <div className="grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
                
                {/* Left Column: Date, Slot & Customer Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Date & Slot Pickers */}
                  <div style={{ background: 'rgba(0, 31, 35, 0.65)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(74, 92, 106, 0.3)' }}>
                    
                    {/* Date Input */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} /> Select Wash Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '0.86rem', padding: '7px 12px', height: '38px' }}
                      />
                    </div>

                    {/* Time Slot Chips */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} /> Select Time Slot *
                        </label>
                        <span style={{ fontSize: '0.74rem', color: 'var(--accent-aqua)', fontWeight: 800 }}>
                          {selectedSlot}
                        </span>
                      </div>

                      {(() => {
                        const defaultSlots = [
                          { slotTime: '08:00 AM', available: true, remainingCapacity: 2 },
                          { slotTime: '09:00 AM', available: true, remainingCapacity: 2 },
                          { slotTime: '10:00 AM', available: true, remainingCapacity: 2 },
                          { slotTime: '11:00 AM', available: true, remainingCapacity: 2 },
                          { slotTime: '12:00 PM', available: true, remainingCapacity: 2 },
                          { slotTime: '01:00 PM', available: true, remainingCapacity: 2 },
                          { slotTime: '02:00 PM', available: true, remainingCapacity: 2 },
                          { slotTime: '03:00 PM', available: true, remainingCapacity: 2 },
                          { slotTime: '04:00 PM', available: true, remainingCapacity: 2 },
                          { slotTime: '05:00 PM', available: true, remainingCapacity: 2 },
                          { slotTime: '06:00 PM', available: true, remainingCapacity: 2 }
                        ];

                        const slotsToRender = (slots && slots.length > 0) ? slots : defaultSlots;

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '6px' }}>
                            {slotsToRender.map((s, idx) => {
                              const timeLabel = typeof s === 'string' ? s : (s.slotTime || s.time || '10:00 AM');
                              const isAvailable = typeof s === 'object' ? (s.available !== false && s.remainingCapacity !== 0) : true;
                              const isSelected = selectedSlot === timeLabel;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    if (isAvailable) setSelectedSlot(timeLabel);
                                  }}
                                  style={{
                                    height: '32px',
                                    padding: '0 4px',
                                    background: isSelected
                                      ? 'var(--accent-aqua)'
                                      : !isAvailable
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'rgba(6, 20, 27, 0.8)',
                                    color: isSelected
                                      ? '#06141B'
                                      : !isAvailable
                                        ? 'rgba(255, 255, 255, 0.3)'
                                        : '#FFFFFF',
                                    border: isSelected
                                      ? '1.5px solid var(--accent-aqua)'
                                      : '1px solid rgba(74, 92, 106, 0.35)',
                                    borderRadius: '6px',
                                    fontWeight: isSelected ? 900 : 700,
                                    fontSize: '0.74rem',
                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                    opacity: isAvailable ? 1 : 0.4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: !isAvailable ? 'line-through' : 'none',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {timeLabel}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Customer Information Inputs */}
                  <div style={{ background: 'rgba(0, 31, 35, 0.65)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(74, 92, 106, 0.3)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(74, 92, 106, 0.25)' }}>
                      Customer & Vehicle Details
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="grid-2" style={{ gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '3px' }}>Mobile Number *</label>
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
                            style={{ height: '36px', fontSize: '0.84rem', padding: '6px 10px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '3px' }}>Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="input-field"
                            style={{ height: '36px', fontSize: '0.84rem', padding: '6px 10px' }}
                          />
                        </div>
                      </div>

                      {/* Saved Vehicles for Existing Customer */}
                      {isExistingCustomer && existingVehicles.length > 0 && (
                        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-aqua)', fontWeight: 800 }}>Saved: </span>
                          <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                            {existingVehicles.map((v, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setVehicleNumber(v.regNumber);
                                  if (v.model) setVehicleModel(v.model);
                                }}
                                style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', border: 'none', cursor: 'pointer' }}
                              >
                                {v.regNumber}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid-2" style={{ gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '3px' }}>Vehicle Reg Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. WB-02-AK-1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            className="input-field"
                            style={{ height: '36px', fontSize: '0.84rem', padding: '6px 10px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '3px' }}>Car Model (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Nexon / Creta"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            className="input-field"
                            style={{ height: '36px', fontSize: '0.84rem', padding: '6px 10px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Add-ons & Order Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Optional Add-ons */}
                  {allAddons.length > 0 && (
                    <div style={{ background: 'rgba(0, 31, 35, 0.65)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(74, 92, 106, 0.3)' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--accent-gold)' }}>Recommended Add-ons (Optional)</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {allAddons.slice(0, 4).map((addon, idx) => {
                          const isChecked = selectedAddons.some(a => a.name === addon.name);
                          return (
                            <label
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: isChecked ? 'rgba(0, 229, 255, 0.15)' : 'rgba(6, 20, 27, 0.7)',
                                border: isChecked ? '1px solid var(--accent-cyan)' : '1px solid rgba(74, 92, 106, 0.25)',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                color: '#FFFFFF',
                                gap: '8px',
                                boxSizing: 'border-box',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
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
                                  style={{ width: '15px', height: '15px', accentColor: 'var(--accent-cyan)', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.78rem' }}>
                                  {cleanText(addon.name)}
                                </span>
                              </div>
                              <span style={{ fontWeight: 800, color: 'var(--accent-gold)', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.8rem' }}>
                                +₹{addon.price}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary & Coupon */}
                  <div style={{ background: 'rgba(0, 31, 35, 0.85)', padding: '16px 18px', borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid rgba(74, 92, 106, 0.25)' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Booking Summary</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{vehicleType}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#CCD0CF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Service:</span>
                        <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          {bookingMode === 'custom' ? `Custom Combo (${selectedCustomServices.length})` : (selectedService?.name || 'Selected Package')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Schedule:</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-aqua)' }}>{selectedDate} at {selectedSlot}</span>
                      </div>

                      {selectedAddons.map((a, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>+ {cleanText(a.name)}</span>
                          <span>+₹{a.price}</span>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Input */}
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(74, 92, 106, 0.2)' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Promo Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="input-field"
                          style={{ padding: '6px 8px', fontSize: '0.78rem', height: '32px' }}
                        />
                        <button type="button" onClick={handleApplyCoupon} className="btn-secondary" style={{ padding: '0 12px', fontSize: '0.76rem', height: '32px' }}>
                          Apply
                        </button>
                      </div>
                      {couponStatus && (
                        <div style={{ fontSize: '0.72rem', color: couponStatus.includes('Success') ? 'var(--accent-aqua)' : '#e0725a', marginTop: '3px', fontWeight: 700 }}>
                          {couponStatus}
                        </div>
                      )}
                    </div>

                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0725a', fontWeight: 700, marginTop: '6px', fontSize: '0.82rem' }}>
                        <span>Promo Discount ({couponCode}):</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}

                    {/* Total Amount Payable */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-aqua)', borderTop: '1.5px solid var(--accent-aqua)', paddingTop: '10px', marginTop: '10px' }}>
                      <span>Total Payable:</span>
                      <span>₹{calculateFinalTotal()}</span>
                    </div>

                    {/* PAYMENT METHOD SELECTION */}
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(74, 92, 106, 0.2)', paddingTop: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {/* Option 1: Razorpay Online */}
                        <div
                          onClick={() => setPaymentMethod('razorpay')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: paymentMethod === 'razorpay' ? 'rgba(0, 210, 180, 0.15)' : 'rgba(6, 20, 27, 0.6)',
                            border: paymentMethod === 'razorpay' ? '1.5px solid var(--accent-aqua)' : '1px solid rgba(74, 92, 106, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'razorpay'}
                            onChange={() => setPaymentMethod('razorpay')}
                            style={{ accentColor: 'var(--accent-aqua)', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#FFFFFF' }}>Pay Online</div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--ice-tint)' }}>UPI / Cards</div>
                          </div>
                        </div>

                        {/* Option 2: Pay After Service */}
                        <div
                          onClick={() => setPaymentMethod('pay_after')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: paymentMethod === 'pay_after' ? 'rgba(230, 176, 0, 0.15)' : 'rgba(6, 20, 27, 0.6)',
                            border: paymentMethod === 'pay_after' ? '1.5px solid var(--accent-gold)' : '1px solid rgba(74, 92, 106, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'pay_after'}
                            onChange={() => setPaymentMethod('pay_after')}
                            style={{ accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#FFFFFF' }}>Pay at Center</div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--ice-tint)' }}>After Service</div>
                          </div>
                        </div>
                      </div>

                      {paymentError && (
                        <div style={{
                          marginTop: '8px',
                          background: 'rgba(224, 114, 90, 0.15)',
                          border: '1px solid #e0725a',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '0.74rem',
                          color: '#e0725a'
                        }}>
                          {paymentError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ flex: '1 1 120px', height: '42px', fontSize: '0.85rem', justifyContent: 'center' }}>
                  <ArrowLeft size={14} /> Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    background: paymentMethod === 'razorpay' ? 'linear-gradient(135deg, #00D2B4 0%, #0096B4 100%)' : 'linear-gradient(135deg, #E6B000 0%, #C99600 100%)',
                    color: '#003135',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    border: 'none',
                    height: '42px',
                    padding: '0 20px',
                    borderRadius: '10px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    flex: '2 1 200px'
                  }}
                >
                  <CheckCircle2 size={16} />
                  {isSubmitting
                    ? 'Processing...'
                    : paymentMethod === 'razorpay'
                      ? `Pay ₹${calculateFinalTotal()} Online`
                      : `Confirm Booking (₹${calculateFinalTotal()})`}
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
