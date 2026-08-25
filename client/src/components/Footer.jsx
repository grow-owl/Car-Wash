import React from 'react';
import { ShieldCheck, Phone, MapPin, Clock, Lock } from 'lucide-react';

export default function Footer({ onOpenOwnerPortal }) {
  return (
    <footer style={{
      background: 'var(--bg-primary)',
      borderTop: '1px solid var(--border-light)',
      padding: '48px 0 24px 0',
      marginTop: '80px'
    }}>
      <div className="container grid-3" style={{ marginBottom: '32px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>CAR<span className="text-aqua">WASH</span></h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Next-Generation Auto Detailing & Car Wash Business Management System in Siliguri. Engineered for maximum shine and customer satisfaction.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--ice-tint)', marginBottom: '12px' }}>Working Hours</h4>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-aqua)" /> Mon - Sat: 08:00 AM - 07:00 PM
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-terracotta)" /> Sunday: 09:00 AM - 05:00 PM
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--ice-tint)', marginBottom: '12px' }}>Location & Contact</h4>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--accent-aqua)" /> Siliguri
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--accent-aqua)" /> +91 8609504186
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid rgba(175, 221, 229, 0.1)',
        paddingTop: '20px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          © 2026 CAR WASH System • Siliguri | Crafted with precision by GrowOwl Pvt. Ltd.
        </div>

        {/* Private discreet owner portal link */}
        <button
          onClick={onOpenOwnerPortal}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(175, 221, 229, 0.3)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Private Owner Portal Access"
        >
          <Lock size={12} /> Owner Portal
        </button>
      </div>
    </footer>
  );
}
