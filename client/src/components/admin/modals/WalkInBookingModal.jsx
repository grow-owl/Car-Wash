import React from 'react';
import { X } from 'lucide-react';

export default function WalkInBookingModal({
  isOpen,
  onClose,
  walkInName,
  setWalkInName,
  walkInPhone,
  setWalkInPhone,
  walkInVeh,
  setWalkInVeh,
  walkInVehType,
  setWalkInVehType,
  walkInService,
  setWalkInService,
  walkInAmount,
  setWalkInAmount,
  walkInPayMode,
  setWalkInPayMode,
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Register Walk-in Car</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Customer Name"
            value={walkInName}
            onChange={(e) => setWalkInName(e.target.value)}
            className="input-field"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          />

          <input
            type="text"
            placeholder="Phone Number (e.g. +91 8609504186)"
            value={walkInPhone}
            onChange={(e) => setWalkInPhone(e.target.value)}
            className="input-field"
            style={{ minHeight: '42px', fontSize: '0.88rem' }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              required
              placeholder="Vehicle Number *"
              value={walkInVeh}
              onChange={(e) => setWalkInVeh(e.target.value.toUpperCase())}
              className="input-field"
              style={{ flex: 1, minHeight: '42px', fontSize: '0.88rem' }}
            />

            <select
              value={walkInVehType}
              onChange={(e) => setWalkInVehType(e.target.value)}
              className="input-field"
              style={{ width: '135px', minHeight: '42px', fontSize: '0.88rem' }}
            >
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          <select
            value={walkInService}
            onChange={(e) => setWalkInService(e.target.value)}
            className="input-field"
            style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
          >
            <option value="Express Foam Wash">Express Foam Wash</option>
            <option value="Interior + Exterior Wash">Interior + Exterior Wash</option>
            <option value="Premium Deep Wash">Premium Deep Wash</option>
            <option value="Interior Steam Spa">Interior Steam Spa</option>
            <option value="9H Ceramic Coating">9H Ceramic Coating</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              required
              placeholder="Amount (₹)"
              value={walkInAmount}
              onChange={(e) => setWalkInAmount(e.target.value)}
              className="input-field"
              style={{ flex: 1, minHeight: '42px', fontSize: '0.88rem' }}
            />

            <select
              value={walkInPayMode}
              onChange={(e) => setWalkInPayMode(e.target.value)}
              className="input-field"
              style={{ width: '125px', minHeight: '42px', fontSize: '0.88rem' }}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <button type="submit" className="btn-gold" style={{ marginTop: '8px', minHeight: '42px', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 800 }}>
            Add to Bay
          </button>
        </form>
      </div>
    </div>
  );
}
