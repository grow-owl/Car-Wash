import React from 'react';
import { MessageSquare, ExternalLink, X } from 'lucide-react';

export default function WhatsappNotificationToast({
  toast,
  onClose
}) {
  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      background: 'linear-gradient(135deg, #072e23 0%, #061e1b 100%)',
      border: '1px solid #25D366',
      boxShadow: '0 10px 30px rgba(37, 211, 102, 0.35)',
      borderRadius: '12px',
      padding: '16px 20px',
      maxWidth: '420px',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#25D366', fontSize: '0.9rem' }}>
          <MessageSquare size={18} color="#25D366" />
          WhatsApp Alert Auto-Dispatched
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#8A99AD', cursor: 'pointer', padding: 0 }}
        >
          <X size={16} />
        </button>
      </div>
      <div style={{ fontSize: '0.82rem', color: '#CCD0CF' }}>
        Live status alert & tracking link sent to <strong>{toast.customerName}</strong> ({toast.phone}).
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
        <a
          href={toast.waLinkCustomer || toast.waLink}
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#25D366',
            color: '#06141B',
            padding: '6px 14px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <ExternalLink size={13} /> Open WhatsApp
        </a>

        {toast.waLinkOwner && (
          <a
            href={toast.waLinkOwner}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'rgba(0, 229, 255, 0.15)',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            Send to Owner
          </a>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--border-light)',
            color: '#CCD0CF',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
