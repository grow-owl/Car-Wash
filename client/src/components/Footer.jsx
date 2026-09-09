import React from 'react';
import { Phone, MapPin, Clock, Mail } from 'lucide-react';

export default function Footer({ onOpenOwnerPortal }) {
  return (
    <footer className="site-footer">
      {/* UPPER FOOTER CONTAINER: 3-COLUMN SPREAD (LEFT, CENTER, EXTREME RIGHT) */}
      <div className="footer-upper-grid">
        {/* LEFT COLUMN: BRAND & SHORT DESCRIPTION */}
        <div className="footer-col-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo.webp"
              alt="CAR WASH Logo"
              width="34"
              height="34"
              loading="lazy"
              decoding="async"
              style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
            />
            <div>
              <div className="footer-brand-title">
                CAR<span style={{ color: 'var(--accent-cyan)' }}>WASH</span>
              </div>
              <div className="footer-brand-sub">
                AUTO SPA & MANAGEMENT
              </div>
            </div>
          </div>

          <p className="footer-brand-desc">
            Auto detailing & car spa engineered for maximum gloss and paint protection.
          </p>
        </div>

        {/* CENTER COLUMN: WORKING HOURS */}
        <div className="footer-col-center">
          <h4 className="footer-col-heading">
            Working Hours
          </h4>

          <div className="footer-list">
            <div className="footer-list-item">
              <Clock size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span>Mon - Sat: <strong style={{ color: '#FFFFFF' }}>08:00 AM - 07:00 PM</strong></span>
            </div>

            <div className="footer-list-item">
              <Clock size={15} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
              <span>Sunday: <strong style={{ color: 'var(--accent-gold)' }}>09:00 AM - 05:00 PM</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT & SUPPORT */}
        <div className="footer-col-right">
          <h4 className="footer-col-heading">
            Contact & Support
          </h4>

          <div className="footer-list">
            <div className="footer-list-item">
              <MapPin size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <span style={{ color: '#FFFFFF' }}>Sevoke Road, Siliguri, WB 734001</span>
            </div>

            <div className="footer-list-item">
              <Phone size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <a href="tel:+918609504186" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>
                +91 86095 04186
              </a>
            </div>

            <div className="footer-list-item">
              <Mail size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
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
        <div className="footer-copyright">
          <span>© 2026 CAR WASH Auto Spa. All rights reserved.</span>
        </div>

        {/* RIGHT: ATTRIBUTION */}
        <div className="footer-attribution">
          <span className="footer-attribution-text">
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
              src="/growowl-logo.webp"
              alt="GrowOwl"
              width="58"
              height="12"
              className="growowl-footer-logo"
              style={{
                height: '12px',
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
