import React from 'react';
import { X } from 'lucide-react';

export default function CouponFormModal({
  isOpen,
  onClose,
  cpnCode,
  setCpnCode,
  cpnValue,
  setCpnValue,
  cpnMinOrder,
  setCpnMinOrder,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '22px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Add Coupon</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            required
            placeholder="Code (e.g. CARWASHFLAT50)"
            value={cpnCode}
            onChange={(e) => setCpnCode(e.target.value.toUpperCase())}
            className="input-field"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          />

          <input
            type="number"
            required
            placeholder="Discount (₹, e.g. 50)"
            value={cpnValue}
            onChange={(e) => setCpnValue(e.target.value)}
            className="input-field"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          />

          <input
            type="number"
            placeholder="Min Order (₹)"
            value={cpnMinOrder}
            onChange={(e) => setCpnMinOrder(e.target.value)}
            className="input-field"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          />

          <button type="submit" className="btn-gold" style={{ minHeight: '42px', fontSize: '0.88rem', borderRadius: '8px', fontWeight: 700 }}>
            Save Coupon
          </button>
        </form>
      </div>
    </div>
  );
}
