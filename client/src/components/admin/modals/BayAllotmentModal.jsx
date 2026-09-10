import React from 'react';
import { X } from 'lucide-react';

export default function BayAllotmentModal({
  allotModalBay,
  onClose,
  bookings = [],
  onAllotCarToBay
}) {
  if (!allotModalBay) return null;

  const waitingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'vehicle_received');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '26px', border: '1.5px solid var(--accent-cyan)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              Allot Car to <span style={{ color: 'var(--accent-cyan)' }}>{allotModalBay}</span>
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
              Select an upcoming waiting vehicle from the queue to start washing in {allotModalBay}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#CCD0CF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {waitingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No waiting cars in queue right now. You can create a new Walk-in car!
            </div>
          ) : (
            waitingBookings.map((b) => (
              <div
                key={b._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'rgba(0, 31, 35, 0.55)',
                  borderRadius: '10px',
                  border: '1px solid rgba(74, 92, 106, 0.3)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚗 {b.vehicleNumber} <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>({b.trackingCode})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
                    {b.customerName} • {b.serviceName || b.packageName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                    Slot: {b.date} at {b.slotTime}
                  </div>
                </div>

                <button
                  onClick={() => onAllotCarToBay(b._id, allotModalBay)}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ⚡ Allot & Start Wash →
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
