import React from 'react';
import { X, User } from 'lucide-react';

export default function StaffFormModal({
  isOpen,
  onClose,
  editingStaff,
  stfName,
  setStfName,
  stfPhone,
  setStfPhone,
  stfStatus,
  setStfStatus,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '14px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={stfName}
              onChange={(e) => setStfName(e.target.value)}
              className="input-field"
              style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
              Phone Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98765 11223"
              value={stfPhone}
              onChange={(e) => setStfPhone(e.target.value)}
              className="input-field"
              style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
              Duty Status
            </label>
            <select
              value={stfStatus}
              onChange={(e) => setStfStatus(e.target.value)}
              className="input-field"
              style={{ width: '100%', minHeight: '42px', fontSize: '0.85rem' }}
            >
              <option value="Available">Available</option>
              <option value="On Job">On Job</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ marginTop: '6px', minHeight: '42px', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 800, width: '100%', justifyContent: 'center' }}
          >
            {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
          </button>
        </form>
      </div>
    </div>
  );
}
