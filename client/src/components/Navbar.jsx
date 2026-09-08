import React, { useState, useEffect, useRef } from 'react';
import { Car, Search, PhoneCall, Calendar, Menu, X, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, activeBookingCode, currentUser, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isManualScrollingRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (activeTab !== 'home' || isManualScrollingRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const servicesEl = document.getElementById('services-section');
          const pricingEl = document.getElementById('pricing-section');
          const contactEl = document.getElementById('contact-section');

          const scrollPos = window.scrollY + window.innerHeight * 0.35;

          if (contactEl && scrollPos >= contactEl.offsetTop) {
            setActiveSection('contact');
          } else if (pricingEl && scrollPos >= pricingEl.offsetTop) {
            setActiveSection('pricing');
          } else if (servicesEl && scrollPos >= servicesEl.offsetTop) {
            setActiveSection('services');
          } else {
            setActiveSection('home');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const scrollToSection = (sectionId, sectionName) => {
    setActiveTab('home');
    setActiveSection(sectionName);
    setMobileOpen(false);
    isManualScrollingRef.current = true;
    window.location.hash = `#${sectionName}`;

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1000);
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'home') {
      setActiveSection('home');
      window.location.hash = '#home';
    } else if (tabName === 'booking') {
      window.location.hash = '#booking';
    } else if (tabName === 'track') {
      window.location.hash = '#track';
    } else if (tabName === 'crm') {
      window.location.hash = '#login';
    }
    setMobileOpen(false);
    isManualScrollingRef.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1000);
  };

  const isHomeActive = activeTab === 'home' && activeSection === 'home';
  const isServicesActive = activeTab === 'home' && activeSection === 'services';
  const isPricingActive = activeTab === 'home' && activeSection === 'pricing';
  const isContactActive = activeTab === 'home' && activeSection === 'contact';
  const isBookingActive = activeTab === 'booking';
  const isTrackActive = activeTab === 'track';
  const isCrmActive = activeTab === 'crm';

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
      padding: '10px clamp(14px, 3vw, 32px)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>

        {/* TOP LEFT: CAR WASH Logo Image + Text Branding */}
        <div
          onClick={() => handleTabClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
        >
          <img
            src="/logo.webp"
            alt="CAR WASH Logo"
            width="42"
            height="42"
            decoding="async"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 10px rgba(0, 229, 255, 0.35))'
            }}
          />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.05 }}>
              CAR<span style={{ color: 'var(--accent-cyan)' }}>WASH</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--ice-tint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1px' }}>
              AUTO SPA & MANAGEMENT
            </div>
          </div>
        </div>

        {/* DESKTOP NAVIGATION LINKS - DEAD CENTERED */}
        <nav className="desktop-nav" style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
          gap: '24px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <button
            onClick={() => handleTabClick('home')}
            className="simple-nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: isHomeActive ? 'var(--accent-cyan)' : '#FFFFFF',
              cursor: 'pointer',
              fontWeight: isHomeActive ? 800 : 600,
              fontSize: '0.92rem',
              transition: 'color 0.2s ease'
            }}
          >
            Home
          </button>

          {/* LOGGED IN CUSTOMER CLEAN NAVBAR: SHOW ONLY CUSTOMER ESSENTIALS */}
          {currentUser ? (
            <>
              <button
                onClick={() => handleTabClick('crm')}
                className="simple-nav-link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isCrmActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isCrmActive ? 800 : 600,
                  fontSize: '0.92rem',
                  transition: 'color 0.2s ease'
                }}
              >
                My Garage & VIP
              </button>

              <button
                onClick={() => handleTabClick('track')}
                className="simple-nav-link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isTrackActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isTrackActive ? 800 : 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s ease'
                }}
              >
                <Search size={15} color={isTrackActive ? 'var(--accent-cyan)' : 'var(--accent-cyan)'} /> Live Track
                {activeBookingCode && (
                  <span className="badge badge-terracotta" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                    LIVE
                  </span>
                )}
              </button>
            </>
          ) : (
            /* LOGGED OUT VISITOR NAVBAR: SHOW PUBLIC EXPLORATION OPTIONS */
            <>
              <button
                onClick={() => scrollToSection('services-section', 'services')}
                className="simple-nav-link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isServicesActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isServicesActive ? 800 : 600,
                  fontSize: '0.92rem',
                  transition: 'color 0.2s ease'
                }}
              >
                Services
              </button>

              <button
                onClick={() => scrollToSection('pricing-section', 'pricing')}
                className="simple-nav-link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isPricingActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isPricingActive ? 800 : 600,
                  fontSize: '0.92rem',
                  transition: 'color 0.2s ease'
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
                  color: isBookingActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isBookingActive ? 800 : 600,
                  fontSize: '0.92rem',
                  transition: 'color 0.2s ease'
                }}
              >
                Booking
              </button>

              <button
                onClick={() => scrollToSection('contact-section', 'contact')}
                className="simple-nav-link"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isContactActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isContactActive ? 800 : 600,
                  fontSize: '0.92rem',
                  transition: 'color 0.2s ease'
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
                  color: isTrackActive ? 'var(--accent-cyan)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: isTrackActive ? 800 : 600,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s ease'
                }}
              >
                <Search size={15} color={isTrackActive ? 'var(--accent-cyan)' : 'var(--accent-cyan)'} /> Live Track
                {activeBookingCode && (
                  <span className="badge badge-terracotta" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                    LIVE
                  </span>
                )}
              </button>
            </>
          )}

        </nav>

        {/* TOP RIGHT ACTION BUTTONS: DYNAMIC LOGGED IN / LOGGED OUT */}
        <div className="desktop-actions" style={{ alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: 'auto' }}>
          {currentUser ? (
            <>
              <button
                onClick={() => handleTabClick('crm')}
                className="btn-gold"
                style={{
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '9px 18px',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <User size={16} /> Hi, {currentUser.name ? currentUser.name.split(' ')[0] : 'Member'}
              </button>

              <button
                onClick={onSignOut}
                className="btn-secondary"
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  padding: '8px 14px',
                  borderRadius: '24px'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => handleTabClick('crm')}
              className="btn-gold"
              style={{
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '9px 18px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={16} /> Customer Login
            </button>
          )}

          <button
            onClick={() => handleTabClick('booking')}
            className="btn-primary"
            style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              padding: '9px 22px',
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
            background: 'rgba(17, 33, 45, 0.8)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '8px',
            padding: '8px',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* MOBILE EXPANDABLE DRAWER NAVIGATION */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(6, 20, 27, 0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(74, 92, 106, 0.4)',
          padding: '20px 24px',
          animation: 'fadeIn 0.2s ease',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => handleTabClick('home')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isHomeActive ? 'var(--accent-cyan)' : '#FFFFFF',
                fontWeight: isHomeActive ? 800 : 600,
                fontSize: '1rem',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              Home
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => handleTabClick('crm')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isCrmActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isCrmActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  My Garage & VIP Account
                </button>

                <button
                  onClick={() => handleTabClick('track')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isTrackActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isTrackActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Search size={16} color="var(--accent-cyan)" /> Live Wash Track
                  {activeBookingCode && (
                    <span className="badge badge-terracotta" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                      LIVE
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('services-section', 'services')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isServicesActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isServicesActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Services
                </button>

                <button
                  onClick={() => scrollToSection('pricing-section', 'pricing')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isPricingActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isPricingActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Pricing
                </button>

                <button
                  onClick={() => handleTabClick('booking')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isBookingActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isBookingActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Booking
                </button>

                <button
                  onClick={() => scrollToSection('contact-section', 'contact')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isContactActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isContactActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Contact
                </button>

                <button
                  onClick={() => handleTabClick('track')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isTrackActive ? 'var(--accent-cyan)' : '#FFFFFF',
                    fontWeight: isTrackActive ? 800 : 600,
                    fontSize: '1rem',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Search size={16} color="var(--accent-cyan)" /> Live Track
                  {activeBookingCode && (
                    <span className="badge badge-terracotta" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                      LIVE
                    </span>
                  )}
                </button>
              </>
            )}

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentUser ? (
                <>
                  <button
                    onClick={() => handleTabClick('crm')}
                    className="btn-gold"
                    style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      padding: '12px',
                      borderRadius: '24px',
                      width: '100%',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={18} /> Hi, {currentUser.name ? currentUser.name.split(' ')[0] : 'Member'}
                  </button>

                  <button
                    onClick={() => { onSignOut(); setMobileOpen(false); }}
                    className="btn-secondary"
                    style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      padding: '12px',
                      borderRadius: '24px',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleTabClick('crm')}
                  className="btn-gold"
                  style={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '12px',
                    borderRadius: '24px',
                    width: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <User size={18} /> Customer Login
                </button>
              )}

              <button
                onClick={() => handleTabClick('booking')}
                className="btn-primary"
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '12px',
                  borderRadius: '24px',
                  width: '100%',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calendar size={18} /> Book Your Slot
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
