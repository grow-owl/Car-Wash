import React from 'react';

export default function DeleteConfirmModal({ confirmModal, onClose, onConfirm }) {
  if (!confirmModal?.isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 11000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '340px',
        padding: '20px',
        borderRadius: '12px',
        background: '#0a1a24'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px 0', color: '#FFFFFF' }}>
          {confirmModal.title}
        </h3>

        {confirmModal.itemName && (
          <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginBottom: '16px' }}>
            {confirmModal.itemName}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: '#FF5964',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
