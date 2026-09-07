import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, Car, Shield, MessageSquare, AlertCircle, CreditCard, Check, QrCode } from 'lucide-react';
import { trackBooking, payBookingByCode } from '../api';

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
    { key: 'ready_for_pickup', label: 'Ready for Pickup' }
  ];

  useEffect(() => {
    if (trackingCode) {
      handleSearch();
    }
  }, []);

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

  const getStageIndex = (currentStatus) => {
    const idx = stages.findIndex(s => s.key === currentStatus);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = booking ? getStageIndex(booking.status) : 0;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '900px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-aqua">TRANSPARENT SERVICE LOG</span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '6px' }}>Live Vehicle Job Status Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter your tracking code to see real-time bay & detailing updates</p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '36px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Enter tracking code (e.g. CW-8921)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="input-field"
            style={{ paddingLeft: '44px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
          />
          <Search size={20} color="var(--accent-aqua)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
        </div>
        <button type="submit" className="btn-aqua" style={{ padding: '0 28px' }}>
          Track Job
        </button>
      </form>

      {paySuccessMsg && (
        <div style={{
          background: 'rgba(0, 210, 180, 0.15)',
          border: '1px solid var(--accent-aqua)',
          padding: '16px 20px',
          borderRadius: '12px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <CheckCircle2 size={24} color="var(--accent-aqua)" />
          <strong>{paySuccessMsg}</strong>
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(150, 71, 52, 0.2)',
          border: '1px solid var(--accent-terracotta)',
          borderRadius: '12px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <AlertCircle size={24} color="var(--accent-terracotta)" />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-aqua)' }}>
          Fetching real-time vehicle status...
        </div>
      )}

      {booking && (
        <div className="glass-panel" style={{ padding: '36px', border: '1px solid var(--accent-aqua)' }}>
          
          {/* Header Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)' }}>TRACKING CODE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
                {booking.trackingCode}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Vehicle: <strong>{booking.vehicleNumber}</strong> ({booking.vehicleModel || booking.vehicleType})
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-terracotta" style={{ fontSize: '0.88rem', padding: '6px 14px' }}>
                {booking.status.toUpperCase().replace('_', ' ')}
              </span>
              <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginTop: '8px' }}>
                Assigned Bay: <strong>{booking.bayAssigned}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Detailer: <strong>{booking.staffAssigned}</strong>
              </div>
            </div>
          </div>

          {/* 6-STAGE VISUAL PIPELINE PROGRESS BAR */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ice-tint)', marginBottom: '16px' }}>
              BAY WORKFLOW PROGRESSION:
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Connecting Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '25px',
                right: '25px',
                height: '4px',
                background: 'var(--bg-primary)',
                zIndex: 1
              }} />

              {/* Dynamic Completed Line */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '25px',
                width: `${(currentStageIndex / (stages.length - 1)) * 90}%`,
                height: '4px',
                background: 'var(--accent-aqua)',
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
                    maxWidth: '100px'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--accent-aqua)' : 'var(--bg-primary)',
                      border: isCurrent ? '3px solid #FFFFFF' : '2px solid var(--border-light)',
                      color: isCompleted ? '#002d31' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      boxShadow: isCurrent ? '0 0 15px var(--accent-aqua)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isCompleted ? <Check size={20} strokeWidth={3} /> : idx + 1}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? 800 : 500,
                      color: isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                      marginTop: '8px'
                    }}>
                      {stage.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job & Payment Details Card */}
          <div className="grid-2" style={{ gap: '16px', background: 'rgba(0, 49, 53, 0.7)', padding: '20px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SERVICE TYPE</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>{booking.serviceName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>APPOINTMENT SLOT</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>{booking.date} at {booking.slotTime}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PAYMENT STATUS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span className={booking.paymentStatus === 'Paid' ? 'badge badge-aqua' : 'badge badge-gold'}>
                  {booking.paymentStatus === 'Paid' ? `PAID (₹${booking.totalAmount} • ${booking.paymentMode || 'Online'})` : `PENDING / PAY AFTER SERVICE (₹${booking.totalAmount})`}
                </span>
                {booking.paymentStatus !== 'Paid' && (
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="btn-primary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #00D2B4 0%, #0096B4 100%)',
                      color: '#06141B',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Pay Online Now
                  </button>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>INSPECTOR NOTES</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--ice-tint)' }}>{booking.notes || 'Routine cleaning in progress'}</div>
            </div>
          </div>

          {/* WhatsApp SMS Live Notification Preview */}
          <div style={{
            marginTop: '24px',
            background: 'rgba(15, 164, 175, 0.12)',
            border: '1px solid var(--accent-aqua)',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '0.85rem',
            color: 'var(--ice-tint)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MessageSquare size={22} color="var(--accent-aqua)" />
            <div>
              <strong>WhatsApp Automated Log:</strong> "Hi {booking.customerName}, your vehicle ({booking.vehicleNumber}) is currently in <strong>{booking.bayAssigned}</strong> for {booking.status.toUpperCase()} stage."
            </div>
          </div>

        </div>
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
