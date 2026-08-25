import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, CheckCircle2, Phone, ShieldCheck, Tag } from 'lucide-react';
import { createLead } from '../api';

export default function SmartLeadPopup({ onStartBookingWithOffer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState('popup'); // 'popup' | 'exit_intent'
  const [offerType, setOfferType] = useState('vacuum'); // 'vacuum' | 'discount'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedService, setSelectedService] = useState('General Wash & Spa');
  const [loading, setLoading] = useState(false);
  const [submittedOffer, setSubmittedOffer] = useState(null);

  useEffect(() => {
    // Check local storage suppression rules
    const leadCaptured = localStorage.getItem('leadCaptured');
    const leadDismissedAt = localStorage.getItem('leadPopupDismissed');

    if (leadCaptured === 'true') return;

    if (leadDismissedAt) {
      const daysSinceDismiss = (Date.now() - Number(leadDismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 3) return; // Suppress for 3 days after dismissal
    }

    // 1. Time-based trigger (15 seconds)
    const timer = setTimeout(() => {
      setTriggerSource('popup');
      setIsOpen(true);
    }, 15000);

    // 2. Exit-intent trigger (Desktop top mouse leave)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !localStorage.getItem('leadCaptured')) {
        setTriggerSource('exit_intent');
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('leadPopupDismissed', Date.now().toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const offerCode = 'FLAT20';

    setLoading(true);
    try {
      await createLead({
        name: name || 'Valued Customer',
        phone: cleanPhone,
        source: triggerSource,
        serviceName: selectedService,
        offerClaimed: offerCode
      });

      localStorage.setItem('leadCaptured', 'true');
      setSubmittedOffer(offerCode);
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(0, 20, 24, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '28px 24px',
        borderRadius: '24px',
        border: '2px solid var(--accent-aqua)',
        boxShadow: '0 20px 60px rgba(0, 229, 255, 0.35)',
        position: 'relative',
        background: 'linear-gradient(160deg, #002d33 0%, #001f24 100%)',
        animation: 'popupBounce 0.4s ease-out'
      }}>
        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <X size={18} />
        </button>

        {/* SUCCESS CELEBRATION STATE */}
        {submittedOffer ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(0, 229, 255, 0.15)',
              border: '2px solid var(--accent-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={32} color="var(--accent-aqua)" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
              Offer Code Unlocked
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px' }}>
              Your code is active for <strong>+91 {phone}</strong>
            </p>

            <div style={{
              background: 'rgba(0, 49, 53, 0.8)',
              border: '1.5px dashed var(--accent-gold)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>PROMO CODE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-gold)', letterSpacing: '0.08em', marginTop: '2px' }}>
                {submittedOffer}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#CCD0CF', marginTop: '4px' }}>
                Flat 20% Discount Applied on Your First Wash
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onStartBookingWithOffer) onStartBookingWithOffer(submittedOffer);
              }}
              className="btn-slot-hover"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
                color: '#003135',
                fontWeight: 900,
                fontSize: '0.95rem',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Book Wash Now
            </button>
          </div>
        ) : (
          /* LEAD CAPTURE FORM STATE */
          <div>
            {/* HEADER BADGE */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 195, 0, 0.12)', border: '1px solid var(--accent-gold)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 800, marginBottom: '14px' }}>
              FIRST-TIME WELCOME OFFER
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginBottom: '8px' }}>
              {triggerSource === 'exit_intent' ? 'Before You Leave' : 'Unlock Flat 20% OFF'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Enter your mobile number to unlock your exclusive 20% welcome discount.
            </p>

            {/* FLAT 20% DISCOUNT BANNER */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 195, 0, 0.15) 0%, rgba(255, 89, 100, 0.15) 100%)',
              border: '1.5px solid var(--accent-gold)',
              borderRadius: '12px',
              padding: '12px 16px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
                FLAT 20% DISCOUNT
              </div>
              <div style={{ fontSize: '0.78rem', color: '#CCD0CF', marginTop: '2px' }}>
                Instant 20% OFF on all car wash & detailing packages
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#CCD0CF', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                  Your Mobile Number *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    color: 'var(--accent-cyan)',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}>
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-Digit Mobile"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="input-field"
                    style={{ paddingLeft: '56px', fontSize: '0.95rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#CCD0CF', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#CCD0CF', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                  Interested Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.88rem' }}
                >
                  <option value="General Wash & Spa">General Wash & Spa</option>
                  <option value="Express Exterior Wash">Express Exterior Wash (₹299)</option>
                  <option value="Premium Shine Package">Premium Shine Package (₹799)</option>
                  <option value="Interior Deep Spa">Interior Deep Spa (₹1,499)</option>
                  <option value="9H Nano Ceramic Coating">9H Nano Ceramic Coating (₹4,999)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-slot-hover"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
                  color: '#003135',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                {loading ? 'Unlocking Offer...' : 'Unlock Offer'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <ShieldCheck size={14} color="var(--accent-aqua)" />
                <span>We only contact you regarding your wash offer.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
