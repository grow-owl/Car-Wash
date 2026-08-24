import React from 'react';
import { Car, Search, PhoneCall, Calendar } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeBookingCode }) {
  const scrollToSection = (sectionId) => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 9999,
      background: 'rgba(0, 31, 35, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(15, 164, 175, 0.25)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      padding: '14px 48px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        
        {/* TOP LEFT: CAR WASH Logo */}
        <div 
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #964734 0%, #0FA4AF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(15, 164, 175, 0.4)',
            border: '1px solid rgba(15, 164, 175, 0.4)'
          }}>
            <Car size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.05 }}>
              CAR<span style={{ color: 'var(--accent-aqua)' }}>WASH</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ice-tint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
              Auto Spa & Management
            </div>
          </div>
        </div>

        {/* CENTER: Clean Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          fontSize: '0.95rem',
          fontWeight: 600
        }}>
          {/* HOME */}
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'home' ? 'var(--accent-aqua)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '4px 0'
            }}
          >
            Home
          </button>

          {/* SERVICES */}
          <button
            onClick={() => scrollToSection('services-section')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '4px 0'
            }}
          >
            Services
          </button>

          {/* PRICING */}
          <button
            onClick={() => scrollToSection('pricing-section')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '4px 0'
            }}
          >
            Pricing
          </button>

          {/* BOOKING */}
          <button
            onClick={() => setActiveTab('booking')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'booking' ? 'var(--accent-aqua)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '4px 0'
            }}
          >
            Booking
          </button>

          {/* CONTACT */}
          <button
            onClick={() => scrollToSection('contact-section')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '4px 0'
            }}
          >
            Contact
          </button>

          {/* LIVE TRACK */}
          <button
            onClick={() => setActiveTab('track')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'track' ? 'var(--accent-aqua)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={15} color="var(--accent-aqua)" /> Live Track
            {activeBookingCode && (
              <span className="badge badge-terracotta" style={{ padding: '2px 6px', fontSize: '0.62rem' }}>
                LIVE
              </span>
            )}
          </button>
        </nav>

        {/* TOP RIGHT: Phone Contact & "Book Your Slot" Pill Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          {/* Vertical Separator */}
          <div style={{ width: '1px', height: '22px', background: 'rgba(175, 221, 229, 0.2)' }} />

          {/* Phone Contact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ice-tint)' }}>
            <PhoneCall size={17} color="var(--accent-aqua)" />
            <span>+91 8609504186</span>
          </div>

          {/* Book Your Slot Pill Button */}
          <button
            onClick={() => setActiveTab('booking')}
            className="btn-slot-hover"
            style={{
              background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
              color: '#003135',
              fontWeight: 800,
              fontSize: '0.92rem',
              border: 'none',
              padding: '11px 26px',
              borderRadius: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(15, 164, 175, 0.45)'
            }}
          >
            <Calendar size={17} /> Book Your Slot
          </button>
        </div>

      </div>
    </header>
  );
}
