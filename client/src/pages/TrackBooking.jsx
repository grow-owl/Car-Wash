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
      desc: 'Appointment booked & bay assigned',
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
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '70px', maxWidth: '960px' }}>
      
      {/* COMPACT CLEAN HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 210, 180, 0.12)',
          border: '1px solid var(--accent-aqua)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: 'var(--accent-aqua)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-aqua)', boxShadow: '0 0 8px var(--accent-aqua)', animation: 'pulse 1.8s infinite' }} />
          Live Bay Telemetry
        </div>

        <h1 className="track-header-title" style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
          Vehicle Service Tracker
        </h1>
      </div>

      {/* SLEEK SEARCH BAR */}
      <form onSubmit={handleSearch} className="track-search-wrapper">
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Enter Tracking Code (e.g. CW-9669)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="input-field"
            style={{
              paddingLeft: '42px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 800,
              fontSize: '0.92rem',
              height: '44px',
              background: 'rgba(0, 31, 35, 0.85)',
              border: '1px solid rgba(0, 210, 180, 0.35)',
              borderRadius: '10px'
            }}
          />
          <Search size={18} color="var(--accent-aqua)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '0 22px',
            height: '44px',
            fontWeight: 800,
            fontSize: '0.88rem',
            borderRadius: '10px',
            background: 'var(--accent-aqua)',
            color: '#003135',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(0, 210, 180, 0.3)'
          }}
        >
          <Search size={16} /> Track
        </button>
      </form>

      {/* SUCCESS MESSAGE */}
      {paySuccessMsg && (
        <div style={{
          background: 'rgba(0, 210, 180, 0.15)',
          border: '1px solid var(--accent-aqua)',
          padding: '12px 16px',
          borderRadius: '10px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '18px',
          fontSize: '0.85rem'
        }}>
          <CheckCircle2 size={20} color="var(--accent-aqua)" />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 89, 100, 0.15)',
          border: '1px solid var(--accent-coral)',
          borderRadius: '10px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '18px',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={20} color="var(--accent-coral)" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--accent-aqua)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RefreshCw size={18} className="animate-spin" /> Synchronizing with bay sensors...
        </div>
      )}

      {/* ACTIVE TRACKING DATA CARD */}
      {booking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* MAIN STATUS CARD */}
          <div className="track-main-card">
            
            {/* Top Bar: Code, Vehicle & Live Status Pill */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid rgba(74, 92, 106, 0.3)',
              paddingBottom: '16px',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-aqua)', letterSpacing: '0.04em' }}>
                    {booking.trackingCode}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 229, 255, 0.12)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {booking.vehicleNumber}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
                  {booking.vehicleBrand || ''} {booking.vehicleModel || booking.vehicleType} • {booking.customerName}
                </div>
              </div>

              {/* Status & Bay Info Pill */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: currentStageIndex === 5
                    ? 'rgba(37, 211, 102, 0.2)'
                    : 'rgba(0, 210, 180, 0.2)',
                  border: currentStageIndex === 5
                    ? '1px solid #25D366'
                    : '1px solid var(--accent-aqua)',
                  color: currentStageIndex === 5 ? '#25D366' : '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: currentStageIndex === 5 ? '#25D366' : 'var(--accent-aqua)',
                    boxShadow: currentStageIndex === 5 ? '0 0 6px #25D366' : '0 0 6px var(--accent-aqua)'
                  }} />
                  {currentStageObj.label}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>
                  Bay: <strong style={{ color: 'var(--accent-aqua)' }}>{booking.bayAssigned || booking.assignedBay || 'BAY 1'}</strong>
                </div>
              </div>
            </div>

            {/* 6-STAGE VISUAL PROGRESSION PIPELINE */}
            <div style={{ marginBottom: '20px' }}>
              
              {/* Stepper Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--ice-tint)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Progress: Stage {currentStageIndex + 1} of 6
                </span>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
                  {Math.round(((currentStageIndex + 1) / 6) * 100)}% Completed
                </span>
              </div>

              {/* 1. DESKTOP STEPPER VIEW (Spacious 6 Columns) */}
              <div className="track-stepper-desktop">
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
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isCurrent
                          ? 'linear-gradient(135deg, #00D2B4 0%, #0096B4 100%)'
                          : isCompleted
                            ? 'rgba(0, 210, 180, 0.2)'
                            : 'rgba(10, 30, 39, 0.7)',
                        border: isCurrent
                          ? '2.5px solid #FFFFFF'
                          : isCompleted
                            ? '2px solid var(--accent-aqua)'
                            : '2px solid rgba(74, 92, 106, 0.4)',
                        color: isCurrent ? '#003135' : isCompleted ? 'var(--accent-aqua)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.88rem',
                        boxShadow: isCurrent
                          ? '0 0 20px rgba(0, 210, 180, 0.8)'
                          : 'none',
                        transition: 'all 0.3s ease',
                        marginBottom: '6px'
                      }}>
                        {isCompleted ? (
                          <Check size={18} strokeWidth={3.5} />
                        ) : isCurrent ? (
                          <StageIcon size={18} strokeWidth={2.5} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '0.74rem',
                        fontWeight: isCurrent ? 900 : isCompleted ? 700 : 500,
                        color: isCurrent ? 'var(--accent-aqua)' : isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                        lineHeight: 1.2
                      }}>
                        {stage.shortLabel || stage.label}
                      </div>

                      {isCurrent && (
                        <span style={{
                          marginTop: '3px',
                          background: 'rgba(0, 210, 180, 0.2)',
                          color: 'var(--accent-aqua)',
                          border: '1px solid var(--accent-aqua)',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '8px',
                          textTransform: 'uppercase'
                        }}>
                          LIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 2. MOBILE STEPPER VIEW (Sleek App Segmented Bar + Active Card) */}
              <div className="track-stepper-mobile">
                {/* Segmented Progress Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                  {stages.map((st, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isNow = idx === currentStageIndex;
                    return (
                      <div
                        key={st.key}
                        style={{
                          height: '6px',
                          borderRadius: '4px',
                          background: isNow
                            ? 'var(--accent-aqua)'
                            : isDone
                              ? 'rgba(0, 210, 180, 0.7)'
                              : 'rgba(74, 92, 106, 0.35)',
                          boxShadow: isNow ? '0 0 8px var(--accent-aqua)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Active Stage Highlight Card for Mobile */}
                <div style={{
                  background: 'rgba(0, 31, 35, 0.85)',
                  border: '1px solid var(--accent-aqua)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '4px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--accent-aqua)',
                    color: '#003135',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 900
                  }}>
                    {React.createElement(currentStageObj.icon || Sparkles, { size: 20, strokeWidth: 2.5 })}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-aqua)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ACTIVE STAGE {currentStageIndex + 1} OF 6
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', marginTop: '1px' }}>
                      {currentStageObj.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentStageObj.desc}
                    </div>
                  </div>

                  <span style={{
                    background: 'rgba(0, 210, 180, 0.25)',
                    color: 'var(--accent-aqua)',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    border: '1px solid var(--accent-aqua)'
                  }}>
                    LIVE
                  </span>
                </div>

                {/* Compact Horizontal Stage Tags */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none'
                }}>
                  {stages.map((st, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isNow = idx === currentStageIndex;
                    return (
                      <span
                        key={st.key}
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: '0.68rem',
                          fontWeight: isNow ? 800 : 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isNow
                            ? 'rgba(0, 210, 180, 0.25)'
                            : isDone
                              ? 'rgba(37, 211, 102, 0.12)'
                              : 'rgba(74, 92, 106, 0.2)',
                          color: isNow
                            ? 'var(--accent-aqua)'
                            : isDone
                              ? '#25D366'
                              : 'var(--ice-tint)',
                          border: isNow ? '1px solid var(--accent-aqua)' : '1px solid transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isDone ? '✓' : `${idx + 1}.`} {st.shortLabel || st.label}
                      </span>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* DETAILS GRID & PAYMENT CONTROL */}
            <div className="track-details-grid">
              
              {/* Service Info */}
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--ice-tint)', fontWeight: 800, letterSpacing: '0.04em' }}>SERVICE</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF', marginTop: '2px' }}>
                  {booking.serviceName || booking.packageName || 'Pro Detailing Package'}
                </div>
              </div>

              {/* Slot Info */}
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--ice-tint)', fontWeight: 800, letterSpacing: '0.04em' }}>APPOINTMENT</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF', marginTop: '2px' }}>
                  {booking.date} • {booking.slotTime}
                </div>
              </div>

              {/* Payment Status & Direct Online Pay Button */}
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--ice-tint)', fontWeight: 800, letterSpacing: '0.04em' }}>PAYMENT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                  <span className={booking.paymentStatus === 'Paid' ? 'badge badge-aqua' : 'badge badge-gold'} style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                    {booking.paymentStatus === 'Paid' ? `PAID (₹${booking.totalAmount})` : `PENDING (₹${booking.totalAmount})`}
                  </span>

                  {/* If not paid, show instant Online Pay Button */}
                  {booking.paymentStatus !== 'Paid' && (
                    <button
                      onClick={handleLaunchRazorpayPayment}
                      disabled={paying}
                      className="btn-primary"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        borderRadius: '16px',
                        background: 'var(--accent-aqua)',
                        color: '#003135',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CreditCard size={12} />
                      {paying ? '...' : 'Pay Online'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* INSPECTOR NOTES & INVOICE BUTTON */}
            <div style={{
              marginTop: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(74, 92, 106, 0.3)',
              paddingTop: '12px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ fontSize: '0.78rem', color: '#CCD0CF', flex: 1, minWidth: '200px' }}>
                <span style={{ color: 'var(--ice-tint)', fontWeight: 700 }}>Notes: </span>
                {booking.notes || 'Full showroom delivery & quality check active in Bay.'}
              </div>

              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '5px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <FileText size={13} /> View Invoice / PDF
              </button>
            </div>

          </div>

          {/* CELEBRATORY COMPLETED STATE BANNER */}
          {currentStageIndex === 5 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 210, 180, 0.15) 0%, rgba(230, 176, 0, 0.15) 100%)',
              border: '1.5px solid var(--accent-aqua)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Award size={42} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Vehicle Service Completed & Ready!
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#CCD0CF', maxWidth: '520px', margin: 0 }}>
                Your car has received premium showroom treatment with final quality approval. You have earned <strong>{Math.floor((booking.totalAmount || 500) / 10)} Loyalty Points</strong> with this wash.
              </p>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="btn-primary"
                style={{
                  marginTop: '8px',
                  background: 'var(--accent-aqua)',
                  color: '#003135',
                  fontWeight: 800,
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Download Paid Tax Invoice
              </button>
            </div>
          )}

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
