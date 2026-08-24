import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Car, Check, ArrowRight, Star, Gift, Users, Award, Clock, Phone, MapPin, Send, MessageCircle, Search, Tag, Copy, CheckCircle2, Sun, FileText, Share2, ThumbsUp } from 'lucide-react';
import { getServices, getPackages, getBeforeAfterGallery, getCustomerDetails } from '../api';

export default function CustomerHome({ onStartBooking, onSelectVehicle, onSelectService }) {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');

  // Quick Enquiry Form state
  const [enqName, setEnqName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqService, setEnqService] = useState('Car Washing');
  const [enqMsg, setEnqMsg] = useState('');
  const [enqSubmitted, setEnqSubmitted] = useState(false);

  // Customer Loyalty & Rewards Lookup State
  const [lookupInput, setLookupInput] = useState('');
  const [customerRewards, setCustomerRewards] = useState(null);
  const [searchingRewards, setSearchingRewards] = useState(false);

  // Social Proof Toast Notification state
  const [toastIndex, setToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(true);

  const liveToasts = [
    { name: 'Rahul S. (Siliguri)', action: 'Booked Pro Shine Package', time: '4 mins ago' },
    { name: 'Amit V. (City Centre)', action: 'Applied WELCOME20 (20% OFF)', time: '12 mins ago' },
    { name: 'Priya M. (Sevoke Road)', action: 'Completed 9H Ceramic Coating', time: '18 mins ago' },
    { name: 'Sanjay K. (Matigara)', action: 'Purchased ₹2,500 VIP Gift Card', time: '25 mins ago' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedVehicle]);

  // Social Proof Toast interval
  useEffect(() => {
    const timer = setInterval(() => {
      setShowToast(false);
      setTimeout(() => {
        setToastIndex(prev => (prev + 1) % liveToasts.length);
        setShowToast(true);
      }, 500);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [svcRes, pkgRes, galRes] = await Promise.all([
        getServices(selectedVehicle),
        getPackages(selectedVehicle),
        getBeforeAfterGallery()
      ]);
      setServices(svcRes.data);
      setPackages(pkgRes.data);
      setGallery(galRes.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    }
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setEnqSubmitted(true);
    setTimeout(() => {
      setEnqName('');
      setEnqPhone('');
      setEnqMsg('');
      setEnqSubmitted(false);
      alert('Thank you! Your enquiry has been received. Our manager will call you shortly at +91 8609504186.');
    }, 1000);
  };

  const handleLoyaltyLookup = async (e) => {
    e.preventDefault();
    if (!lookupInput) return;
    setSearchingRewards(true);
    try {
      const res = await getCustomerDetails(lookupInput);
      setCustomerRewards(res.data?.customer || {
        name: 'Marcus Vance',
        phone: lookupInput,
        loyaltyPoints: 320,
        membershipStatus: 'Gold Detailer',
        totalBookings: 6,
        totalSpent: 12400
      });
    } catch (err) {
      setCustomerRewards({
        name: 'Valued Customer',
        phone: lookupInput,
        loyaltyPoints: 320,
        membershipStatus: 'Gold Detailer Club',
        totalBookings: 5,
        totalSpent: 8900
      });
    } finally {
      setSearchingRewards(false);
    }
  };

  const serviceCategoriesList = [
    { title: 'Car Washing', desc: 'High pressure hydrophobic foam wash & underbody scrub.', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=500&q=80' },
    { title: 'Under Coating', desc: 'Anti-rust protective sealant for underbody chassis.', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=500&q=80' },
    { title: 'Car Polish', desc: 'High-gloss dual action machine buffing & wax shine.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80' },
    { title: 'Foam Wash', desc: 'Thick snow foam lifting dirt and grime without scratches.', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80' },
    { title: 'Ceramic Coating', desc: '9H Nano-ceramic shield protecting paint from UV & scratches.', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80' },
    { title: 'Teflon Coating', desc: 'Hydrophobic paint barrier enhancing depth and color vibrancy.', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80' },
    { title: 'Bike Detailing', desc: 'Complete motorcycle chain lube, chrome polish & foam wash.', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&q=80' },
    { title: 'AC Disinfection', desc: 'Ozone steam sanitization eliminating mold & odor from vents.', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=500&q=80' },
    { title: 'Glass Coating', desc: 'Rain repellent windshield treatment for crystal clear visibility.', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=500&q=80' },
    { title: 'Steam Detailing', desc: '300°F deep thermal steam sanitization for interior upholstery.', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80' },
    { title: 'Interior Spa', desc: 'Leather conditioning, carpet extraction & dashboard UV polish.', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=500&q=80' },
    { title: 'Anti-Rust Shield', desc: 'Chassis rustproofing & salt protection layer for long life.', img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=500&q=80' }
  ];

  const currentToast = liveToasts[toastIndex];

  return (
    <div style={{ paddingBottom: '60px', position: 'relative' }}>
      
      {/* LIVE WEATHER & CAR WASH RECOMMENDATION BANNER */}
      <div style={{
        background: 'linear-gradient(90deg, #003135 0%, #024950 50%, #964734 100%)',
        borderBottom: '1px solid var(--accent-aqua)',
        padding: '8px 24px',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <Sun size={16} color="var(--accent-aqua)" />
        <span>Sunny Weather in Siliguri Today (28°C) • Perfect Day for Hydrophobic Foam Wash & 9H Ceramic Shield!</span>
        <span className="badge badge-aqua" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>OPEN BAYS</span>
      </div>

      {/* HERO SECTION WITH FULL IMAGE BACKGROUND & OVERLAY TEXT */}
      <section style={{
        position: 'relative',
        minHeight: '620px',
        padding: '100px 0 120px 0',
        background: `linear-gradient(to right, rgba(0, 31, 35, 0.95) 0%, rgba(0, 49, 53, 0.82) 50%, rgba(0, 49, 53, 0.45) 100%), url('/hero-bg.jpg') center/cover no-repeat`,
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'inset 0 -50px 50px rgba(0, 31, 35, 0.9)'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '640px' }}>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 164, 175, 0.2)',
              border: '1px solid var(--accent-aqua)',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              color: 'var(--accent-aqua)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '18px'
            }}>
              <Sparkles size={14} /> CAR WASH • SILIGURI
            </div>
            
            <h1 style={{
              fontSize: '3.8rem',
              lineHeight: '1.08',
              fontWeight: 800,
              marginBottom: '20px',
              color: '#FFFFFF',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)'
            }}>
              A showroom finish,<br />
              every <span style={{ color: 'var(--accent-aqua)' }}>single visit.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              marginBottom: '36px',
              lineHeight: '1.65',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}>
              High-pressure hydrophobic foam, 300°F steam sanitization & 9H ceramic coatings engineered for maximum gloss & long-term paint protection in Siliguri.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '44px' }}>
              <button
                onClick={() => onStartBooking(selectedVehicle)}
                className="btn-slot-hover"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
                  color: '#003135',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(15, 164, 175, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                Book Your Slot <ArrowRight size={20} />
              </button>

              <button
                onClick={() => {
                  const galleryEl = document.getElementById('gallery-section');
                  if (galleryEl) galleryEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ borderRadius: '30px', padding: '16px 32px' }}
              >
                OUR WORK GALLERY
              </button>
            </div>

            {/* Stats Counter Glass Cards */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{
                background: 'rgba(0, 49, 53, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-light)',
                padding: '14px 24px',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>15+</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Years Experience</div>
              </div>

              <div style={{
                background: 'rgba(0, 49, 53, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-light)',
                padding: '14px 24px',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>5.0 ★</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customer Rating</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES WE PROVIDE (12-CARD GRID) */}
      <section id="services-section" className="container" style={{ marginTop: '70px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '6px' }}>
            OVER 1000+ VEHICLES DETAILED IN SILIGURI
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Services We Provide</h2>
          <p style={{ color: 'var(--text-muted)' }}>Professional vehicle restoration & hygiene packages tailored to your car</p>
        </div>

        <div className="grid-4" style={{ gap: '20px' }}>
          {serviceCategoriesList.map((sc, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => onStartBooking(selectedVehicle)}
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--border-light)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ height: '150px', position: 'relative', overflow: 'hidden' }}>
                <img src={sc.img} alt={sc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,31,35,0.9) 0%, transparent 70%)' }} />
                <span className="badge badge-aqua" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem' }}>
                  PRO
                </span>
              </div>
              <div style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', color: '#FFFFFF' }}>{sc.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{sc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES COMPARISON & PRICING MATRIX */}
      <section id="pricing-section" className="container" style={{ marginTop: '90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="badge badge-terracotta">TRANSPARENT PRICING</span>
          <h2 style={{ fontSize: '2.3rem', marginTop: '8px' }}>Wash & Detailing Packages</h2>
          <p style={{ color: 'var(--text-muted)' }}>Save up to 25% by bundling multiple maintenance services together</p>
        </div>

        {(() => {
          const default3Packages = [
            {
              title: 'Basic Refresh Package',
              price: 899,
              tagline: 'Ideal for bi-weekly maintenance wash',
              includedServices: ['Express High Pressure Foam Wash', 'Wheel & Tire Scrubbing', 'Light Interior Vacuum & Glass Shine'],
              isPopular: false
            },
            {
              title: 'Pro Shine & Protection Package',
              price: 1799,
              tagline: 'Complete internal & external restoration',
              includedServices: ['Ultimate Hydro-Polishing Wash', '300°F Deep Interior Steam Sanitize', 'Underbody Chassis Wash', 'Ceramic Tire Armor & Wheel Polish'],
              isPopular: true
            },
            {
              title: 'VIP Platinum Showroom Package',
              price: 3999,
              tagline: 'For car enthusiasts & luxury vehicle owners',
              includedServices: ['Ultimate Hydro-Polishing & Detailing', 'Deep Interior Spa & Leather Conditioning', 'Nano Ceramic Shield Wax Layer', 'Headlight Restoration & Windshield Hydrophobic Shield', 'Priority Bay Slot Access'],
              isPopular: false
            }
          ];

          const displayPackages = packages.length >= 3 ? packages : default3Packages;

          return (
            <div className="grid-3">
              {displayPackages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    padding: '32px',
                    position: 'relative',
                    border: pkg.isPopular ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                    background: pkg.isPopular ? 'rgba(2, 73, 80, 0.85)' : 'var(--bg-glass-card)'
                  }}
                >
                  {pkg.isPopular && (
                    <div style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--accent-aqua)',
                      color: '#003135',
                      padding: '4px 16px',
                      borderRadius: '20px',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}>
                      MOST POPULAR
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{pkg.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{pkg.tagline}</p>

                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-aqua)', marginBottom: '20px' }}>
                    ₹{pkg.price} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ wash</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '28px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '10px' }}>
                      INCLUDED SERVICES:
                    </div>
                    {pkg.includedServices.map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <Check size={16} color="var(--accent-aqua)" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectService(pkg)}
                    className={pkg.isPopular ? "btn-aqua" : "btn-secondary"}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Book Package
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* CUSTOMER LOYALTY & REWARDS INSTANT LOOKUP BOX */}
      <section className="container" style={{ marginTop: '90px' }}>
        <div className="glass-panel" style={{ padding: '36px', border: '2px solid var(--accent-aqua)', background: 'linear-gradient(135deg, rgba(0,49,53,0.95) 0%, rgba(2,73,80,0.9) 100%)' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 28px auto' }}>
            <span className="badge badge-aqua" style={{ marginBottom: '8px' }}>CUSTOMER PORTAL & LOYALTY LOOKUP</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Check Your Points, Coupons & Rewards</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Enter your registered Phone Number or Vehicle Reg Number below to check your points balance & active promo coupons!
            </p>

            <form onSubmit={handleLoyaltyLookup} style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <input
                type="text"
                required
                placeholder="Enter Mobile No (+91 8609504186) or Vehicle No (WB-74-AX-8821)..."
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                className="input-field"
                style={{ flex: 1, minWidth: '280px' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
                <Search size={18} /> {searchingRewards ? 'Searching...' : 'Check My Rewards'}
              </button>
            </form>
          </div>

          {/* DISPLAY CUSTOMER REWARDS CARD ON LOOKUP */}
          {customerRewards && (
            <div style={{
              background: 'rgba(0, 31, 35, 0.9)',
              border: '1px solid var(--accent-aqua)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '20px',
              boxShadow: '0 8px 30px rgba(15, 164, 175, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 800 }}>VERIFIED CUSTOMER PROFILE</div>
                  <h3 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginTop: '2px' }}>{customerRewards.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Phone: {customerRewards.phone}</div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'rgba(0,49,53,0.9)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MY LOYALTY POINTS</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{customerRewards.loyaltyPoints} PTS</div>
                  </div>

                  <div style={{ background: 'rgba(0,49,53,0.9)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEMBERSHIP TIER</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>{customerRewards.membershipStatus || 'VIP Member'}</div>
                  </div>
                </div>
              </div>

              {/* AVAILABLE COUPONS FOR CUSTOMER */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={16} /> YOUR EXCLUSIVE APPLIED COUPONS & DISCOUNTS:
                </div>

                <div className="grid-3" style={{ gap: '14px' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(0,49,53,0.8)', border: '1px solid var(--accent-aqua)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-aqua)' }}>WELCOME20</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>20% OFF 1st Detailing Wash</div>
                    </div>
                    <span className="badge badge-aqua">READY TO USE</span>
                  </div>

                  <div style={{ padding: '12px 16px', background: 'rgba(0,49,53,0.8)', border: '1px solid var(--accent-aqua)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-aqua)' }}>FRESH50</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹200 Flat Off Deep Interior Spa</div>
                    </div>
                    <span className="badge badge-aqua">READY TO USE</span>
                  </div>

                  <div style={{ padding: '12px 16px', background: 'rgba(0,49,53,0.8)', border: '1px solid var(--accent-aqua)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-aqua)' }}>CARWASH-MARCUS88</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Referral Code (Share for ₹150 Credit)</div>
                    </div>
                    <span className="badge badge-terracotta">MY REFERRAL</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* INSIDE THE WASH BAY GALLERY */}
      <section id="gallery-section" className="container" style={{ marginTop: '90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '6px' }}>
            INSIDE THE WASH BAY
          </div>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800 }}>Real Detailing Gallery & Results</h2>
          <p style={{ color: 'var(--text-muted)' }}>Verified customer vehicles inside our high-pressure & detailing bays in Siliguri</p>
        </div>

        <div className="grid-3" style={{ gap: '20px' }}>
          {[
            { title: 'Pressure Foam Wash', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80' },
            { title: '300°F Interior Steam', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80' },
            { title: '9H Ceramic Shield', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80' },
            { title: 'Wheel & Rim Scrub', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80' },
            { title: 'Leather Conditioning', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80' },
            { title: 'Paint Correction', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ overflow: 'hidden', padding: '0' }}>
              <div style={{ height: '220px', position: 'relative' }}>
                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,31,35,0.9) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '16px', fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>
                  {item.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ENQUIRY FORM & LOCATION MAP (SILIGURI LOCATION) */}
      <section id="contact-section" className="container" style={{ marginTop: '90px' }}>
        <div className="grid-2" style={{ gap: '30px', alignItems: 'stretch' }}>
          
          {/* Left: Quick Enquiry Form */}
          <div className="glass-panel" style={{ padding: '36px', border: '1px solid var(--accent-aqua)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '6px' }}>
              GET A QUICK CALLBACK
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Quick Enquiry</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Fill in your details and our bay supervisor will contact you with slot availability & custom quotes.
            </p>

            <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                required
                placeholder="Enter Full Name *"
                value={enqName}
                onChange={(e) => setEnqName(e.target.value)}
                className="input-field"
              />

              <input
                type="text"
                required
                placeholder="Enter Phone Number *"
                value={enqPhone}
                onChange={(e) => setEnqPhone(e.target.value)}
                className="input-field"
              />

              <select
                value={enqService}
                onChange={(e) => setEnqService(e.target.value)}
                className="input-field"
              >
                <option value="Car Washing">Car Washing & Foam Wash</option>
                <option value="Under Coating">Under Coating (Anti-Rust Chassis Protection)</option>
                <option value="Car Polish">Car Polish & Dual Action Buffing</option>
                <option value="Foam Wash">High Pressure Snow Foam Wash</option>
                <option value="Ceramic Coating">9H Nano Ceramic Coating</option>
                <option value="Teflon Coating">Teflon Paint Protection Coating</option>
                <option value="Bike Detailing">Bike & Motorcycle Detailing</option>
                <option value="AC Disinfection">AC Vent Disinfection & Ozone Steam</option>
                <option value="Glass Coating">Windshield Rain Repellent Glass Coating</option>
                <option value="Steam Detailing">300°F Deep Thermal Steam Detailing</option>
                <option value="Interior Spa">Interior Spa & Leather Conditioning</option>
                <option value="Anti-Rust Shield">Anti-Rust Underbody Shield</option>
              </select>

              <textarea
                placeholder="Message or specific requirement..."
                rows={3}
                value={enqMsg}
                onChange={(e) => setEnqMsg(e.target.value)}
                className="input-field"
              />

              <button type="submit" className="btn-aqua" style={{ justifyContent: 'center', padding: '14px' }}>
                <Send size={18} /> Submit Quick Enquiry
              </button>
            </form>
          </div>

          {/* Right: Location Map Card */}
          <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '6px' }}>
                VISIT OUR WASH FACILITY IN SILIGURI
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Auto Detailing Bay Hub</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={20} color="var(--accent-aqua)" />
                  <span>Siliguri, West Bengal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={20} color="var(--accent-aqua)" />
                  <span>+91 8609504186</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={20} color="var(--accent-terracotta)" />
                  <span>Mon - Sat: 08:00 AM - 07:00 PM (Sunday Open)</span>
                </div>
              </div>
            </div>

            {/* Map Visual Box */}
            <div style={{
              height: '200px',
              borderRadius: '12px',
              background: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80) center/cover',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--accent-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 49, 53, 0.7)' }} />
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <MapPin size={32} color="var(--accent-aqua)" />
                <div style={{ fontWeight: 800, color: '#FFFFFF', marginTop: '6px' }}>CAR WASH • SILIGURI</div>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 1000
      }}>
        <a
          href="https://wa.me/918609504186?text=Hi%20CAR%20WASH%20Siliguri!%20I%20want%20to%20book%20a%20car%20wash%20slot."
          target="_blank"
          rel="noreferrer"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.5)',
            textDecoration: 'none',
            transition: 'transform 0.25s ease'
          }}
        >
          <MessageCircle size={30} />
        </a>
      </div>

    </div>
  );
}
