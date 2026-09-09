import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Car,
  Shield,
  MessageSquare,
  AlertCircle,
  CreditCard,
  Check,
  QrCode,
  Sparkles,
  ShieldCheck,
  Award,
  Calendar,
  FileText,
  Phone,
  ArrowRight,
  RefreshCw,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { trackBooking, payBookingByCode, createRazorpayOrder, verifyRazorpayPayment, reportPaymentFailure } from '../api';
import { launchRazorpayCheckout } from '../utils/razorpay';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';
import SectionDivider from '../components/SectionDivider';

export default function TrackBooking({ activeCode = '' }) {
  const [trackingCode, setTrackingCode] = useState(activeCode || 'CW-9669');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pay & Invoice State
  const [showPayModal, setShowPayModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [payMode, setPayMode] = useState('Razorpay');
  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // 6 EXACT STAGES REQUESTED BY USER
  const stages = [
    {
      key: 'confirmed',
      label: 'Booking Confirmed',
      shortLabel: 'Confirmed',
      desc: 'Appointment confirmed',
      icon: Calendar
    },
    {
      key: 'vehicle_received',
      label: 'Vehicle Received',
      shortLabel: 'Received',
      desc: 'Vehicle checked in & inspected',
      icon: Car
    },
    {
      key: 'in_progress',
      label: 'Service In Progress',
      shortLabel: 'In Progress',
      desc: 'High-pressure wash, foam & detailing',
      icon: Sparkles
    },
    {
      key: 'quality_check',
      label: 'Quality Check',
      shortLabel: 'Quality Check',
      desc: '18-point inspection & paint check',
      icon: ShieldCheck
    },
    {
      key: 'ready_for_pickup',
      label: 'Ready for Pickup',
      shortLabel: 'Ready',
      desc: 'Final shine & parked for pickup',
      icon: CheckCircle2
    },
    {
      key: 'completed',
      label: 'Completed',
      shortLabel: 'Completed',
      desc: 'Service finished & delivered',
      icon: Award
    }
  ];

  // Sync activeCode prop
  useEffect(() => {
    if (activeCode) {
      setTrackingCode(activeCode.toUpperCase().trim());
    }
  }, [activeCode]);

  // Auto-detect ?invoice=1 or ?track=... from URL to open Original Digital Invoice immediately
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const trackParam = urlParams.get('track') || urlParams.get('code') || urlParams.get('booking');
    const invoiceParam = urlParams.get('invoice');
    const viewParam = urlParams.get('view');

    if (trackParam) {
      setTrackingCode(trackParam.toUpperCase().trim());
    } else if (invoiceParam && invoiceParam !== '1' && invoiceParam !== 'true') {
      setTrackingCode(invoiceParam.toUpperCase().trim());
    }

    if (invoiceParam === '1' || invoiceParam === 'true' || viewParam === 'invoice' || hash.includes('invoice')) {
      setShowInvoiceModal(true);
    }
  }, []);

  // Auto-sync polling every 3.5s while on Live Track page for instant synchronization with Owner Dashboard!
  useEffect(() => {
    if (trackingCode) {
      handleSearch();
      const interval = setInterval(() => {
        handleSearchSilently();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [trackingCode]);

  const handleSearchSilently = async () => {
    if (!trackingCode) return;
    try {
      const res = await trackBooking(trackingCode);
      if (res.data) setBooking(res.data);
    } catch (e) {
      // silent fallback
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!trackingCode) return;
    setLoading(true);
    setError('');

    try {
      const res = await trackBooking(trackingCode);
      setBooking(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setBooking(null);
      setError(err.response?.data?.error || 'Booking code not found. Please check your tracking ID.');
    }
  };

  // COMPLETE ONLINE RAZORPAY CHECKOUT WITH UPI PRIORITY
  const handleLaunchRazorpayPayment = async () => {
    if (!booking) return;
    setPaying(true);

    try {
      const orderRes = await createRazorpayOrder({
        trackingCode: booking.trackingCode,
        amount: booking.totalAmount,
        currency: 'INR',
        notes: {
          customerName: booking.customerName,
          phone: booking.phone,
          vehicleNumber: booking.vehicleNumber,
          serviceName: booking.serviceName || booking.packageName
        }
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      await launchRazorpayCheckout({
        keyId,
        orderId,
        amount,
        currency,
        customerName: booking.customerName,
        phone: booking.phone,
        email: booking.email || '',
        description: `Pay for ${booking.serviceName || 'Car Wash'} (${booking.trackingCode})`,
        onSuccess: async (rzpResponse) => {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
              trackingCode: booking.trackingCode
            });

            const updatedBooking = verifyRes.data.booking || {
              ...booking,
              paymentStatus: 'Paid',
              paymentMode: 'Razorpay',
              razorpayPaymentId: rzpResponse.razorpay_payment_id
            };

            setBooking(updatedBooking);
            setShowPayModal(false);
            setPaySuccessMsg(`Payment of ₹${booking.totalAmount} via Razorpay confirmed successfully! (ID: ${rzpResponse.razorpay_payment_id})`);
            setShowInvoiceModal(true);
            setTimeout(() => setPaySuccessMsg(''), 8000);
          } catch (vErr) {
            alert(vErr.response?.data?.error || 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        onFailure: async (failErr) => {
          alert(`Payment not completed: ${failErr?.description || 'Gateway error'}`);
          try {
            await reportPaymentFailure({ trackingCode: booking.trackingCode, error: failErr });
          } catch (e) {}
          setPaying(false);
        },
        onDismiss: () => {
          setPaying(false);
        }
      });
    } catch (err) {
      console.error('Track payment error:', err);
      alert(err.response?.data?.error || 'Failed to launch payment gateway');
      setPaying(false);
    }
  };

  const handleCashPaymentConfirm = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const res = await payBookingByCode(booking.trackingCode, {
        paymentMode: 'Cash',
        paymentStatus: 'Paid'
      });
      setBooking(res.data.booking);
      setShowPayModal(false);
      setPaySuccessMsg(`Cash payment of ₹${booking.totalAmount} marked as received!`);
      setTimeout(() => setPaySuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record cash payment');
    } finally {
      setPaying(false);
    }
  };

  // ACCURATE 6-STAGE MAPPING WITH DATABASE & ADMIN DASHBOARD
  const getStageIndex = (currentStatus) => {
    const s = String(currentStatus || '').toLowerCase().trim();
    if (s === 'completed' || s === 'delivered') return 5;
    if (s === 'ready' || s === 'ready_for_pickup') return 4;
    if (s === 'quality_check' || s === 'inspection') return 3;
    if (s === 'in_progress' || s === 'service_in_progress' || s === 'washing' || s === 'wash' || s === 'detailing' || s === 'interior' || s === 'polish' || s === 'in_bay') return 2;
    if (s === 'vehicle_received' || s === 'received' || s === 'checked_in') return 1;
    if (s === 'confirmed' || s === 'pending') return 0;
    return 0;
  };

  const currentStageIndex = booking ? getStageIndex(booking.status) : 0;
  const currentStageObj = stages[currentStageIndex] || stages[0];

  const getCleanPhone = (phoneStr) => {
    const clean = (phoneStr || '').replace(/\D/g, '');
    return clean.startsWith('91') ? clean : `91${clean.slice(-10)}`;
  };

  const waSupportLink = booking
    ? `https://wa.me/${getCleanPhone(booking.phone)}?text=${encodeURIComponent(`Hi Car Wash Auto Spa, I am tracking my vehicle (${booking.vehicleNumber}, Tracking: ${booking.trackingCode}).`)}`
    : '#';

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: 'clamp(50px, 8vw, 90px)', maxWidth: '960px' }}>
         {/* TITLE & HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--accent-aqua)',
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-aqua)', boxShadow: '0 0 6px var(--accent-aqua)' }} />
          Live Telemetry
        </div>

        <h1 className="track-header-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em', margin: 0 }}>
          Vehicle Service Tracker
        </h1>
      </div>

      {/* SLEEK SEARCH BAR */}
      <form onSubmit={handleSearch} className="track-search-wrapper" style={{ marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Enter Tracking Code (e.g. CW-9669)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="input-field track-search-input"
            style={{
              paddingLeft: '44px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              fontSize: '0.86rem',
              height: '40px',
              background: 'rgba(0, 31, 35, 0.7)',
              border: '1px solid rgba(0, 210, 180, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Search size={16} color="var(--accent-aqua)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '0 18px',
            height: '40px',
            fontWeight: 700,
            fontSize: '0.84rem',
            borderRadius: '8px',
            background: 'var(--accent-aqua)',
            color: '#003135',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <Search size={14} /> Track
        </button>
      </form>

      {/* SUCCESS MESSAGE */}
      {paySuccessMsg && (
        <div style={{
          background: 'rgba(0, 210, 180, 0.12)',
          border: '1px solid var(--accent-aqua)',
          padding: '10px 14px',
          borderRadius: '8px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '0.8rem'
        }}>
          <CheckCircle2 size={16} color="var(--accent-aqua)" />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255, 89, 100, 0.12)',
          border: '1px solid var(--accent-coral)',
          borderRadius: '8px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '0.8rem'
        }}>
          <AlertCircle size={16} color="var(--accent-coral)" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--accent-aqua)', fontWeight: 700, fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RefreshCw size={16} className="animate-spin" /> Synchronizing telemetry...
        </div>
      )}

      {/* ACTIVE TRACKING DATA CARD */}
      {booking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: 'clamp(24px, 5vw, 44px)' }}>
          
          {/* MAIN STATUS CARD */}
          <div className="track-main-card" style={{ padding: 'clamp(16px, 3.5vw, 22px)', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(0, 49, 53, 0.85) 0%, rgba(6, 26, 36, 0.92) 100%)', border: '1px solid rgba(0, 210, 180, 0.25)' }}>
            
            {/* Top Bar: Code, Vehicle & Live Status Pill */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(74, 92, 106, 0.2)',
              paddingBottom: '12px',
              marginBottom: '14px',
              gap: '8px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-aqua)', letterSpacing: '0.02em' }}>
                    {booking.trackingCode}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}>
                    {booking.vehicleNumber}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', marginTop: '3px' }}>
                  {booking.vehicleBrand || ''} {booking.vehicleModel || booking.vehicleType} • {booking.customerName}
                </div>
              </div>

              {/* Status Pill */}
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: currentStageIndex === 5
                    ? 'rgba(37, 211, 102, 0.15)'
                    : 'rgba(0, 210, 180, 0.15)',
                  border: currentStageIndex === 5
                    ? '1px solid #25D366'
                    : '1px solid var(--accent-aqua)',
                  color: currentStageIndex === 5 ? '#25D366' : '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: currentStageIndex === 5 ? '#25D366' : 'var(--accent-aqua)',
                    boxShadow: currentStageIndex === 5 ? '0 0 4px #25D366' : '0 0 4px var(--accent-aqua)'
                  }} />
                  {currentStageObj.label}
                </div>
              </div>
            </div>

            {/* 6-STAGE VISUAL PROGRESSION PIPELINE */}
            <div style={{ marginBottom: '14px' }}>
              
              {/* 1. DESKTOP STEPPER VIEW */}
              <div className="track-stepper-desktop" style={{ marginBottom: '8px' }}>
                {stages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const StageIcon = stage.icon;

                  return (
                    <div
                      key={stage.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isCurrent
                          ? 'linear-gradient(135deg, #00D2B4 0%, #0096B4 100%)'
                          : isCompleted
                            ? 'rgba(0, 210, 180, 0.2)'
                            : 'rgba(10, 30, 39, 0.7)',
                        border: isCurrent
                          ? '2px solid #FFFFFF'
                          : isCompleted
                            ? '1.5px solid var(--accent-aqua)'
                            : '1.5px solid rgba(74, 92, 106, 0.4)',
                        color: isCurrent ? '#003135' : isCompleted ? 'var(--accent-aqua)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        boxShadow: isCurrent
                          ? '0 0 12px rgba(0, 210, 180, 0.6)'
                          : 'none',
                        transition: 'all 0.3s ease',
                        marginBottom: '4px'
                      }}>
                        {isCompleted ? (
                          <Check size={14} strokeWidth={3} />
                        ) : isCurrent ? (
                          <StageIcon size={14} strokeWidth={2.5} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '0.68rem',
                        fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                        color: isCurrent ? 'var(--accent-aqua)' : isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                        lineHeight: 1.2
                      }}>
                        {stage.shortLabel || stage.label}
                      </div>

                      {isCurrent && (
                        <span style={{
                          marginTop: '2px',
                          background: 'rgba(0, 210, 180, 0.2)',
                          color: 'var(--accent-aqua)',
                          border: '1px solid var(--accent-aqua)',
                          fontSize: '0.55rem',
                          fontWeight: 800,
                          padding: '1px 4px',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          LIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 2. MOBILE STEPPER VIEW (6 Small Stage Boxes under Progress Bar) */}
              <div className="track-stepper-mobile">
                {/* Segmented Progress Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '6px' }}>
                  {stages.map((st, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isNow = idx === currentStageIndex;
                    return (
                      <div
                        key={st.key}
                        style={{
                          height: '4px',
                          borderRadius: '2px',
                          background: isNow
                            ? 'var(--accent-aqua)'
                            : isDone
                              ? 'rgba(0, 210, 180, 0.7)'
                              : 'rgba(74, 92, 106, 0.35)',
                          boxShadow: isNow ? '0 0 6px var(--accent-aqua)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    );
                  })}
                </div>

                {/* 6 Stage Boxes Grid Directly Under Progress Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {stages.map((st, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isNow = idx === currentStageIndex;
                    return (
                      <div
                        key={st.key}
                        style={{
                          background: isNow
                            ? 'rgba(0, 210, 180, 0.22)'
                            : isDone
                              ? 'rgba(37, 211, 102, 0.1)'
                              : 'rgba(0, 31, 35, 0.55)',
                          border: isNow
                            ? '1px solid var(--accent-aqua)'
                            : isDone
                              ? '1px solid rgba(37, 211, 102, 0.35)'
                              : '1px solid rgba(74, 92, 106, 0.25)',
                          borderRadius: '6px',
                          padding: '4px 2px',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '36px'
                        }}
                      >
                        <div style={{
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          color: isNow ? 'var(--accent-aqua)' : isDone ? '#25D366' : 'var(--text-muted)'
                        }}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div style={{
                          fontSize: '0.55rem',
                          fontWeight: isNow ? 800 : 600,
                          color: isNow ? '#FFFFFF' : isDone ? '#CCD0CF' : 'var(--text-muted)',
                          lineHeight: 1.1,
                          marginTop: '1px'
                        }}>
                          {st.shortLabel || st.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Stage Compact Status Line */}
                <div style={{
                  background: 'rgba(0, 31, 35, 0.75)',
                  border: '1px solid rgba(0, 210, 180, 0.3)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-aqua)', boxShadow: '0 0 5px var(--accent-aqua)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentStageObj.label}: <span style={{ color: 'var(--ice-tint)', fontWeight: 500, fontSize: '0.7rem' }}>{currentStageObj.desc}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--accent-aqua)', background: 'rgba(0,210,180,0.15)', padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
                    LIVE
                  </span>
                </div>
              </div>

            </div>

            {/* DETAILS CONTAINER & PAYMENT CONTROL */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(0, 31, 35, 0.65)',
              border: '1px solid rgba(74, 92, 106, 0.25)'
            }}>
              
              {/* Row 1: Appointment & Slot Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>APPOINTMENT</span>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#FFFFFF' }}>
                    {booking.date} • {booking.slotTime}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>VEHICLE</span>
                  <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--accent-cyan)' }}>
                    {booking.vehicleNumber}
                  </span>
                </div>
              </div>

              {/* Row 2: Clean Spacious Box for Services */}
              <div style={{
                background: 'rgba(0, 20, 26, 0.75)',
                border: '1px solid rgba(0, 210, 180, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    BOOKED SERVICES & DETAILING
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-aqua)', fontWeight: 800 }}>
                    {((booking.serviceName || booking.packageName || '').split('+').filter(Boolean).length || 1)} Item(s)
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {(booking.serviceName || booking.packageName || 'Pro Detailing Package')
                    .split('+')
                    .map(s => s.trim())
                    .filter(Boolean)
                    .map((svc, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(0, 210, 180, 0.12)',
                          border: '1px solid rgba(0, 210, 180, 0.3)',
                          color: '#FFFFFF',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          lineHeight: 1.3
                        }}
                      >
                        {svc}
                      </span>
                    ))}
                </div>
              </div>

              {/* Row 3: Payment & Online Pay Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(74, 92, 106, 0.25)'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>PAYMENT</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge-status-pill ${booking.paymentStatus === 'Paid' ? 'badge-aqua' : 'badge-gold'}`} style={{
                    border: booking.paymentStatus === 'Paid' ? '1px solid rgba(0, 210, 180, 0.5)' : '1px solid rgba(230, 176, 0, 0.6)',
                    background: booking.paymentStatus === 'Paid' ? 'rgba(0, 210, 180, 0.15)' : 'rgba(230, 176, 0, 0.15)'
                  }}>
                    {booking.paymentStatus === 'Paid' ? `PAID (₹${booking.totalAmount})` : `PENDING (₹${booking.totalAmount})`}
                  </span>

                  {/* If not paid, show equal sized Online Pay Button */}
                  {booking.paymentStatus !== 'Paid' && (
                    <button
                      onClick={handleLaunchRazorpayPayment}
                      disabled={paying}
                      className="btn-primary btn-compact-pay"
                      style={{
                        background: 'var(--accent-aqua)',
                        color: '#003135',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <CreditCard size={12} />
                      {paying ? 'Processing...' : 'Pay Online'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* INSPECTOR NOTES & INVOICE BUTTON */}
            <div style={{
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(74, 92, 106, 0.2)',
              paddingTop: '8px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#CCD0CF', flex: 1, minWidth: '160px' }}>
                <span style={{ color: 'var(--ice-tint)', fontWeight: 600 }}>Notes: </span>
                {booking.notes || 'Full showroom delivery active.'}
              </div>

              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="btn-secondary btn-control-item"
                style={{ height: '28px', minHeight: '28px', fontSize: '0.72rem', padding: '0 10px' }}
              >
                <FileText size={12} /> View Invoice
              </button>
            </div>

          </div>

        </div>
      )}

      {/* DIGITAL INVOICE MODAL (OPEN ON DEMAND OR AFTER PAYMENT) */}
      {showInvoiceModal && booking && (
        <DigitalInvoiceModal
          booking={booking}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

    </div>
  );
}
