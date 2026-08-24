import React, { useState } from 'react';
import { Car, Search, PhoneCall, Calendar, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeBookingCode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveTab('home');
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 9999,
      background: 'rgba(6, 20, 27, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(74, 92, 106, 0.4)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      padding: '12px 24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* TOP LEFT: CAR WASH Logo */}
        <div 
          onClick={() => handleTabClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #FFC300 0%, #00E5FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)',
            border: '1px solid rgba(0, 229, 255, 0.4)'
          }}>
            <Car size={22} color="#06141B" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.05 }}>
              CAR<span style={{ color: 'var(--accent-cyan)' }}>WASH</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--ice-tint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1px' }}>
              Auto Spa & Management
            </div>
          </div>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="desktop-nav" style={{
          alignItems: 'center',
          gap: '24px',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          <button
            onClick={() => handleTabClick('home')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'home' ? 'var(--accent-aqua)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem'
            }}
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('services-section')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem'
            }}
          >
            Services
          </button>

          <button
            onClick={() => scrollToSection('pricing-section')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem'
            }}
          >
            Pricing
          </button>

          <button
            onClick={() => handleTabClick('booking')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'booking' ? 'var(--accent-aqua)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem'
            }}
          >
            Booking
          </button>

          <button
            onClick={() => scrollToSection('contact-section')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem'
            }}
          >
            Contact
          </button>

          <button
            onClick={() => handleTabClick('track')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'track' ? 'var(--accent-aqua)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={15} color="var(--accent-aqua)" /> Live Track
            {activeBookingCode && (
              <span className="badge badge-terracotta" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                LIVE
              </span>
            )}
          </button>
        </nav>

        {/* DESKTOP RIGHT ACTIONS */}
        <div className="desktop-actions" style={{ alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--ice-tint)' }}>
            <PhoneCall size={16} color="var(--accent-aqua)" />
            <span>+91 8609504186</span>
          </div>

          <button
            onClick={() => handleTabClick('booking')}
            className="btn-primary"
            style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              padding: '10px 22px',
              borderRadius: '24px'
            }}
          >
            <Calendar size={16} /> Book Your Slot
          </button>
        </div>

        {/* MOBILE HAMBURGER TOGGLE BUTTON */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-hamburger"
          style={{
            background: 'rgba(0, 49, 53, 0.8)',
            border: '1px solid var(--accent-aqua)',
            borderRadius: '8px',
            padding: '8px',
            color: 'var(--accent-aqua)',
            cursor: 'pointer',
            display: 'none'
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* MOBILE EXPANDABLE DRAWER MENU */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(0, 31, 35, 0.98)',
          borderTop: '1px solid var(--border-light)',
          padding: '20px 24px',
          marginTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <button
            onClick={() => handleTabClick('home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'home' ? 'var(--accent-aqua)' : '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'left'
            }}
          >
            🏠 Home
          </button>

          <button
            onClick={() => scrollToSection('services-section')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'left'
            }}
          >
            🛠️ Services We Provide
          </button>

          <button
            onClick={() => scrollToSection('pricing-section')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'left'
            }}
          >
            💰 Pricing Packages
          </button>

          <button
            onClick={() => handleTabClick('booking')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'booking' ? 'var(--accent-aqua)' : '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'left'
            }}
          >
            📅 Reserve Slot
          </button>

          <button
            onClick={() => handleTabClick('track')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'track' ? 'var(--accent-aqua)' : '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'left'
            }}
          >
            🔍 Live Bay Track
          </button>

          <button
            onClick={() => scrollToSection('contact-section')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'left'
            }}
          >
            📞 Contact Us
          </button>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="tel:8609504186"
              style={{
                color: 'var(--ice-tint)',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PhoneCall size={18} color="var(--accent-aqua)" /> Call +91 8609504186
            </a>

            <button
              onClick={() => handleTabClick('booking')}
              className="btn-primary"
              style={{
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '12px',
                borderRadius: '24px',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Book Your Slot Now
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
