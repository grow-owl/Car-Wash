import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, Car, Shield, MessageSquare, AlertCircle, CreditCard, Check, QrCode } from 'lucide-react';
import { trackBooking, payBookingByCode } from '../api';
import SectionDivider from '../components/SectionDivider';

export default function TrackBooking({ activeCode = '' }) {
  const [trackingCode, setTrackingCode] = useState(activeCode || 'CW-8921');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pay Now Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMode, setPayMode] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  const stages = [
    { key: 'confirmed', label: 'Booking Confirmed' },
    { key: 'received', label: 'Vehicle Received' },
    { key: 'washing', label: 'High Pressure Wash' },
    { key: 'detailing', label: 'Interior & Polish' },
    { key: 'quality_check', label: 'Quality Inspection' },
    { key: 'completed', label: 'Ready for Pickup' }
  ];

  // Auto-sync polling every 8s while on Live Track page
  useEffect(() => {
    if (trackingCode) {
      handleSearch();
      const interval = setInterval(() => {
        handleSearchSilently();
      }, 8000);
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

  const handleCompletePayment = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const res = await payBookingByCode(booking.trackingCode, {
        paymentMode: payMode,
        paymentStatus: 'Paid'
      });
      setBooking(res.data.booking);
      setShowPayModal(false);
      setPaySuccessMsg(`Payment of ₹${booking.totalAmount} via ${payMode} confirmed successfully!`);
      setTimeout(() => setPaySuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };

  // ACCURATE STAGE MAPPING WITH ADMIN DASHBOARD STATUSES
  const getStageIndex = (currentStatus) => {
    const s = String(currentStatus || '').toLowerCase().trim();
    if (s === 'completed' || s === 'delivered') return 5;
    if (s === 'ready' || s === 'ready_for_pickup') return 5;
    if (s === 'quality_check' || s === 'inspection') return 4;
    if (s === 'detailing' || s === 'interior' || s === 'polish') return 3;
    if (s === 'washing' || s === 'wash' || s === 'in_bay') return 2;
    if (s === 'vehicle_received' || s === 'received' || s === 'checked_in') return 1;
    if (s === 'confirmed' || s === 'pending') return 0;
    return 0;
  };

  const currentStageIndex = booking ? getStageIndex(booking.status) : 0;

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '70px', maxWidth: '920px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span className="badge badge-aqua" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
          LIVE BAY TRACKER
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#FFFFFF', lineHeight: 1.2 }}>
          Live Vehicle Service Tracker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
          Real-time synced updates directly from bay supervisors & detailers
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Enter tracking code (e.g. CW-8910)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="input-field"
            style={{ paddingLeft: '44px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
          />
          <Search size={18} color="var(--accent-cyan)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0 24px', height: '46px', fontWeight: 800 }}>
          Track Status
        </button>
      </form>

      {paySuccessMsg && (
        <div style={{
          background: 'rgba(0, 229, 255, 0.12)',
          border: '1px solid var(--accent-cyan)',
          padding: '14px 18px',
          borderRadius: '12px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={20} color="var(--accent-cyan)" />
          <strong>{paySuccessMsg}</strong>
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(255, 89, 100, 0.15)',
          border: '1px solid var(--accent-coral)',
          borderRadius: '12px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={20} color="var(--accent-coral)" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          Connecting to live bay telemetry...
        </div>
      )}

      {booking && (
        <>
          <SectionDivider variant="cyan" icon="sparkle" badge="LIVE TELEMETRY" spacing="tight" />
          <div className="glass-panel" style={{
          padding: '28px 30px',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(6, 26, 36, 0.95) 0%, rgba(3, 16, 23, 0.98) 100%)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          borderRadius: '16px'
        }}>
          
          {/* Header Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', borderBottom: '1px solid rgba(74, 92, 106, 0.25)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#8A99AD', letterSpacing: '0.06em', fontWeight: 700 }}>TRACKING CODE</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--accent-cyan)', lineHeight: 1.15, marginTop: '2px' }}>
                {booking.trackingCode}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#CCD0CF', marginTop: '6px' }}>
                Vehicle: <strong style={{ color: '#FFFFFF' }}>{booking.vehicleNumber}</strong> ({booking.vehicleModel || booking.vehicleType})
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${booking.status.toLowerCase() === 'completed' ? 'badge-gold' : 'badge-aqua'}`} style={{
                fontSize: '0.84rem',
                padding: '5px 14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {booking.status.toUpperCase().replace('_', ' ')}
              </span>
              <div style={{ fontSize: '0.84rem', color: '#CCD0CF', marginTop: '8px' }}>
                Assigned Bay: <strong style={{ color: 'var(--accent-cyan)' }}>{booking.bayAssigned || 'BAY 1'}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#8A99AD', marginTop: '2px' }}>
                Detailer: <strong style={{ color: '#FFFFFF' }}>{booking.staffAssigned || 'Auto Spa Team'}</strong>
              </div>
            </div>
          </div>

          {/* 6-STAGE VISUAL PIPELINE PROGRESS BAR */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8A99AD', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Live Workflow Progression:
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              overflowX: 'auto',
              paddingBottom: '10px'
            }}>
              {/* Connecting Background Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '25px',
                right: '25px',
                height: '4px',
                background: 'rgba(6, 20, 27, 0.8)',
                zIndex: 1
              }} />

              {/* Dynamic Completed Glow Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '25px',
                width: `${(currentStageIndex / (stages.length - 1)) * 92}%`,
                height: '4px',
                background: 'linear-gradient(90deg, #00B4D8 0%, var(--accent-cyan) 100%)',
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.6)',
                zIndex: 2,
                transition: 'width 0.5s ease'
              }} />

              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} style={{
                    position: 'relative',
                    zIndex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minWidth: '85px',
                    maxWidth: '100px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: isCompleted ? 'linear-gradient(135deg, var(--accent-cyan) 0%, #008ba3 100%)' : 'rgba(6, 20, 27, 0.9)',
                      border: isCurrent ? '3px solid #FFFFFF' : isCompleted ? '2px solid var(--accent-cyan)' : '2px solid rgba(74, 92, 106, 0.4)',
                      color: isCompleted ? '#06141B' : '#8A99AD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      boxShadow: isCurrent ? '0 0 18px rgba(0, 229, 255, 0.8)' : isCompleted ? '0 2px 8px rgba(0, 229, 255, 0.25)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isCompleted ? <Check size={18} strokeWidth={3.5} /> : idx + 1}
                    </div>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                      color: isCurrent ? 'var(--accent-cyan)' : isCompleted ? '#FFFFFF' : '#8A99AD',
                      marginTop: '8px',
                      lineHeight: 1.25
                    }}>
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job & Payment Details Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            background: 'rgba(0, 31, 35, 0.55)',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(74, 92, 106, 0.25)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#8A99AD', fontWeight: 700, letterSpacing: '0.04em' }}>SERVICE TYPE</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', marginTop: '3px' }}>{booking.serviceName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#8A99AD', fontWeight: 700, letterSpacing: '0.04em' }}>APPOINTMENT SLOT</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', marginTop: '3px' }}>{booking.date} at {booking.slotTime}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#8A99AD', fontWeight: 700, letterSpacing: '0.04em' }}>PAYMENT STATUS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span className={booking.paymentStatus === 'Paid' ? 'badge badge-aqua' : 'badge badge-gold'} style={{ fontSize: '0.72rem' }}>
                  {booking.paymentStatus === 'Paid' ? `PAID (₹${booking.totalAmount} • ${booking.paymentMode || 'Online'})` : `PENDING (₹${booking.totalAmount})`}
                </span>
                {booking.paymentStatus !== 'Paid' && (
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="btn-primary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      borderRadius: '6px'
                    }}
                  >
                    Pay Online
                  </button>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#8A99AD', fontWeight: 700, letterSpacing: '0.04em' }}>INSPECTOR NOTES</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--ice-tint)', marginTop: '3px' }}>{booking.notes || 'Full showroom delivery check passed.'}</div>
            </div>
          </div>

        </div>
        </>
      )}

      {/* QUICK PAY MODAL */}
      {showPayModal && booking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0, 20, 27, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '28px', border: '1px solid var(--accent-aqua)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#FFFFFF' }}>
              Complete Service Payment
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Tracking Code: <strong style={{ color: 'var(--accent-aqua)' }}>{booking.trackingCode}</strong> &bull; Amount: <strong style={{ color: 'var(--accent-aqua)' }}>₹{booking.totalAmount}</strong>
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '6px' }}>
                Select Payment Mode:
              </label>
              <div className="grid-2" style={{ gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPayMode('UPI')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: payMode === 'UPI' ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                    background: payMode === 'UPI' ? 'rgba(0, 210, 180, 0.15)' : 'rgba(10, 30, 39, 0.6)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                  }}
                >
                  Online UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPayMode('Cash')}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: payMode === 'Cash' ? '2px solid var(--accent-gold)' : '1px solid var(--border-light)',
                    background: payMode === 'Cash' ? 'rgba(230, 176, 0, 0.15)' : 'rgba(10, 30, 39, 0.6)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                  }}
                >
                  Cash at Counter
                </button>
              </div>
            </div>

            {payMode === 'UPI' && (
              <div style={{ background: 'rgba(0, 49, 53, 0.6)', border: '1px dashed var(--accent-aqua)', padding: '16px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
                <QrCode size={48} color="var(--accent-aqua)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700 }}>
                  UPI ID: carwash@upi
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Scan with GPay / PhonePe / Paytm to pay ₹{booking.totalAmount}
                </div>
              </div>
            )}

            {payMode === 'Cash' && (
              <div style={{ background: 'rgba(230, 176, 0, 0.1)', border: '1px dashed var(--accent-gold)', padding: '14px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', fontSize: '0.84rem', color: '#FFFFFF' }}>
                Hand over <strong>₹{booking.totalAmount}</strong> cash to the bay supervisor at vehicle delivery.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={paying}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #00D2B4 0%, #0096B4 100%)',
                  color: '#06141B',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {paying ? 'Processing...' : `Confirm Payment (₹${booking.totalAmount})`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
