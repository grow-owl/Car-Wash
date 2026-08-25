import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Clock, Car, Shield, MessageSquare, AlertCircle } from 'lucide-react';
import { trackBooking } from '../api';

export default function TrackBooking({ activeCode = '' }) {
  const [trackingCode, setTrackingCode] = useState(activeCode || 'CW-8921');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stages = [
    { key: 'confirmed', label: 'Booking Confirmed', icon: '📝' },
    { key: 'received', label: 'Vehicle Received', icon: '🔑' },
    { key: 'washing', label: 'High Pressure Wash', icon: '🧼' },
    { key: 'detailing', label: 'Interior & Polish', icon: '✨' },
    { key: 'quality_check', label: 'Quality Inspection', icon: '🔍' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: '🚗' }
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
      setError(err.response?.data?.error || 'Booking code not found. Please try CW-8921 or CW-8922.');
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
        <p style={{ color: 'var(--text-muted)' }}>Enter your 6-digit tracking code to see real-time bay & detailing updates</p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '36px' }}>
        <input
          type="text"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="Enter Booking Tracking Code (e.g. CW-8921)"
          className="input-field"
          style={{ textTransform: 'uppercase', fontSize: '1.1rem', padding: '14px 20px' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0 28px' }}>
          <Search size={20} /> Track Job
        </button>
      </form>

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
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
              }}>
                <div style={{
                  height: '100%',
                  width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                  background: 'linear-gradient(90deg, var(--accent-terracotta) 0%, var(--accent-aqua) 100%)',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {stages.map((stg, i) => {
                const isPassed = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;

                return (
                  <div key={stg.key} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isCurrent ? 'var(--accent-aqua)' : isPassed ? 'var(--accent-terracotta)' : 'var(--bg-primary)',
                      color: isCurrent ? '#003135' : '#FFFFFF',
                      border: isCurrent ? '3px solid #FFFFFF' : '2px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      fontWeight: 800,
                      boxShadow: isCurrent ? '0 0 20px var(--accent-aqua-glow)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {stg.icon}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? 800 : 500,
                      color: isCurrent ? 'var(--accent-aqua)' : isPassed ? '#FFFFFF' : 'var(--text-muted)'
                    }}>
                      {stg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Details Card */}
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
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL PAID</div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-aqua)' }}>₹{booking.totalAmount}</div>
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

    </div>
  );
}
