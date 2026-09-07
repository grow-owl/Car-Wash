import React from 'react';
import { Phone, MapPin, Clock, Mail } from 'lucide-react';

export default function Footer({ onOpenOwnerPortal }) {
  return (
    <footer className="site-footer">
      {/* UPPER FOOTER CONTAINER: 3-COLUMN SPREAD (LEFT, CENTER, EXTREME RIGHT) */}
      <div className="footer-upper-grid">
        {/* LEFT COLUMN: BRAND & SHORT DESCRIPTION */}
        <div className="footer-col-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.webp"
              alt="CAR WASH Logo"
              width="38"
              height="38"
              loading="lazy"
              decoding="async"
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.05, letterSpacing: '0.02em' }}>
                CAR<span style={{ color: 'var(--accent-cyan)' }}>WASH</span>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>
                AUTO SPA & MANAGEMENT
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', lineHeight: '1.5', margin: 0 }}>
            Auto detailing & car spa engineered for maximum gloss and paint protection.
          </p>
        </div>

        {/* CENTER COLUMN: WORKING HOURS (CENTER ALIGNED IN CONTAINER) */}
        <div className="footer-col-center">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.02em', borderBottom: '2px solid rgba(0, 229, 255, 0.3)', paddingBottom: '6px', width: 'fit-content' }}>
            Working Hours
          </h4>

          <div className="footer-list" style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ice-tint)' }}>
              <Clock size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span>Mon - Sat: <strong style={{ color: '#FFFFFF' }}>08:00 AM - 07:00 PM</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ice-tint)' }}>
              <Clock size={16} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
              <span>Sunday: <strong style={{ color: 'var(--accent-gold)' }}>09:00 AM - 05:00 PM</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT & SUPPORT (EXTREME RIGHT ALIGNED) */}
        <div className="footer-col-right">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.02em', borderBottom: '2px solid rgba(0, 229, 255, 0.3)', paddingBottom: '6px', width: 'fit-content' }}>
            Contact & Support
          </h4>

          <div className="footer-list" style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ice-tint)' }}>
              <MapPin size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Sevoke Road, Siliguri, WB 734001</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <a href="tel:+918609504186" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>
                +91 86095 04186
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <a href="mailto:info@carwash.in" style={{ color: 'var(--ice-tint)', textDecoration: 'none' }}>
                info@carwash.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER FOOTER BAR: FULL WIDTH EDGE-TO-EDGE SPREAD */}
      <div className="footer-lower-bar">
        {/* LEFT: COPYRIGHT */}
        <div>
          <span>© 2026 CAR WASH Auto Spa. All rights reserved.</span>
        </div>

        {/* RIGHT: ATTRIBUTION */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '0.76rem', color: '#8A99AD', fontWeight: 500 }}>
            Created and Designed by
          </span>
          <a
            href="https://www.growowl.online"
            target="_blank"
            rel="noopener noreferrer"
            title="GrowOwl"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'opacity 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img
              src="/growowl-logo.png"
              alt="GrowOwl"
              style={{
                height: '14px',
                width: 'auto',
                objectFit: 'contain',
                display: 'inline-block',
                verticalAlign: 'middle',
                background: 'transparent'
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
