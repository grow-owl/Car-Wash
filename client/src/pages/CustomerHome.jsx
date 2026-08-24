import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Car, Check, ArrowRight, Star, Gift, Users, Award, Clock, Phone, MapPin, Send, MessageCircle, Search, Tag, Copy, CheckCircle2, Sun, Plus, Trash2 } from 'lucide-react';
import { getServices, getPackages, getBeforeAfterGallery, getCustomerDetails } from '../api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

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

  // Multi-Vehicle Garage State
  const [garageVehicles, setGarageVehicles] = useState([
    { regNumber: 'WB-74-AX-8821', model: 'Creta (SUV)', type: 'SUV' },
    { regNumber: 'WB-74-BY-1200', model: 'i20 (Hatchback)', type: 'Hatchback' }
  ]);
  const [newRegNo, setNewRegNo] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('Sedan');

  // Customer Reviews List
  const [reviewsList] = useState([
    {
      name: 'Rahul Sharma',
      vehicle: 'Hyundai Creta • WB-74-AX-8821',
      rating: 5,
      comment: 'Best hydrophobic foam wash in Siliguri! Water just slides off the bonnet. Staff is very professional.',
      date: '2 Days Ago',
      photo: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Amit Agarwal',
      vehicle: 'BMW 3 Series • WB-74-BM-9900',
      rating: 5,
      comment: 'Got 9H Ceramic coating done. The showroom mirror gloss is incredible! Highly recommended VIP package.',
      date: '5 Days Ago',
      photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Priya Mukherjee',
      vehicle: 'Maruti Baleno • WB-74-BL-4512',
      rating: 5,
      comment: 'Interior 300°F steam sanitization eliminated all vent mold smell. Super clean car interior!',
      date: '1 Week Ago',
      photo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  useEffect(() => {
    fetchData();
  }, [selectedVehicle]);

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

  const handleAddGarageVehicle = (e) => {
    e.preventDefault();
    if (!newRegNo) return;
    setGarageVehicles([...garageVehicles, { regNumber: newRegNo, model: newModel || newType, type: newType }]);
    setNewRegNo('');
    setNewModel('');
  };

  const handleRemoveGarageVehicle = (idx) => {
    setGarageVehicles(garageVehicles.filter((_, i) => i !== idx));
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

  return (
    <div style={{ position: 'relative' }}>
      
      {/* SECTION 1: HERO SECTION WITH VIBRANT TEAL OVERLAY */}
      <section style={{
        position: 'relative',
        minHeight: '580px',
        padding: '90px 0 100px 0',
        background: `linear-gradient(to right, rgba(1, 59, 64, 0.92) 0%, rgba(4, 94, 103, 0.78) 50%, rgba(4, 94, 103, 0.45) 100%), url('/hero-bg.jpg') center/cover no-repeat`,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '640px' }}>
            
            <h1 style={{
              fontSize: '3.8rem',
              lineHeight: '1.08',
              fontWeight: 800,
              marginBottom: '20px',
              color: '#FFFFFF',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              A showroom finish,<br />
              every <span style={{ color: 'var(--accent-aqua)' }}>single visit.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--ice-tint)',
              marginBottom: '36px',
              lineHeight: '1.65',
              textShadow: '0 2px 10px rgba(0,0,0,0.6)'
            }}>
              High-pressure hydrophobic foam, 300°F steam sanitization & 9H ceramic coatings engineered for maximum gloss & long-term paint protection in Siliguri.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '44px' }}>
              <button
                onClick={() => onStartBooking(selectedVehicle)}
                className="btn-slot-hover"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #26dbea 100%)',
                  color: '#002d31',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(20, 199, 212, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                Book Your Slot <ArrowRight size={20} />
              </button>

              <button
                onClick={() => {
                  const servicesEl = document.getElementById('services-section');
                  if (servicesEl) servicesEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ borderRadius: '30px', padding: '16px 32px' }}
              >
                Our Services
              </button>
            </div>

            {/* Stats Counter Glass Cards */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{
                background: 'rgba(4, 94, 103, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-light)',
                padding: '14px 24px',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>15+</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>Years Experience</div>
              </div>

              <div style={{
                background: 'rgba(4, 94, 103, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-light)',
                padding: '14px 24px',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>5.0 ★</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>Customer Rating</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE BEFORE / AFTER SLIDER (BRIGHT TEAL BACKGROUND) */}
      <section style={{
        background: 'rgba(2, 60, 66, 0.75)',
        padding: '50px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <BeforeAfterSlider />
        </div>
      </section>

      {/* SECTION 3: SERVICES WE PROVIDE (LIGHTER AQUA TINT BACKGROUND) */}
      <section id="services-section" style={{
        background: 'rgba(4, 94, 103, 0.35)',
        padding: '60px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '6px' }}>
              OVER 1000+ VEHICLES DETAILED IN SILIGURI
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800 }}>Services We Provide</h2>
            <p style={{ color: 'var(--ice-tint)' }}>Professional vehicle restoration & hygiene packages tailored to your car</p>
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
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,59,64,0.9) 0%, transparent 70%)' }} />
                  <span className="badge badge-aqua" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem' }}>
                    PRO
                  </span>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px', color: '#FFFFFF' }}>{sc.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', lineHeight: '1.4' }}>{sc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PACKAGES COMPARISON & PRICING MATRIX (RICH GRADIENT BACKGROUND) */}
      <section id="pricing-section" style={{
        background: 'linear-gradient(180deg, rgba(2, 73, 80, 0.6) 0%, rgba(4, 94, 103, 0.8) 50%, rgba(1, 59, 64, 0.9) 100%)',
        padding: '70px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-terracotta">TRANSPARENT PRICING</span>
            <h2 style={{ fontSize: '2.3rem', marginTop: '8px' }}>Wash & Detailing Packages</h2>
            <p style={{ color: 'var(--ice-tint)' }}>Save up to 25% by bundling multiple maintenance services together</p>
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
                      background: pkg.isPopular ? 'rgba(4, 94, 103, 0.88)' : 'var(--bg-glass-card)'
                    }}
                  >
                    {pkg.isPopular && (
                      <div style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--accent-aqua)',
                        color: '#002d31',
                        padding: '4px 16px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}>
                        MOST POPULAR
                      </div>
                    )}

                    <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{pkg.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginBottom: '20px' }}>{pkg.tagline}</p>

                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-aqua)', marginBottom: '20px' }}>
                      ₹{pkg.price} <span style={{ fontSize: '0.9rem', color: 'var(--ice-tint)', fontWeight: 400 }}>/ wash</span>
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
        </div>
      </section>

      {/* SECTION 5: MULTI-VEHICLE GARAGE & LOYALTY LOOKUP (BRIGHT CYAN-TEAL BACKGROUND) */}
      <section style={{
        background: 'rgba(1, 52, 57, 0.92)',
        padding: '60px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: '24px', border: '2px solid var(--accent-aqua)', background: 'linear-gradient(135deg, rgba(2,73,80,0.95) 0%, rgba(4,94,103,0.9) 100%)' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 20px auto' }}>
              <span className="badge badge-aqua" style={{ marginBottom: '6px' }}>CUSTOMER PORTAL & MULTI-VEHICLE GARAGE</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>My Garage & Rewards Lookup</h2>
              <p style={{ color: 'var(--ice-tint)', fontSize: '0.85rem', marginTop: '2px' }}>
                Manage all your family vehicles in one place & check points balance for 1-click slot booking!
              </p>

              {/* SEARCH LOOKUP FORM */}
              <form onSubmit={handleLoyaltyLookup} style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  placeholder="Enter Mobile No (+91 8609504186) or Vehicle No (WB-74-AX-8821)..."
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, minWidth: '260px', height: '44px', padding: '10px 16px', fontSize: '0.88rem', borderRadius: '8px' }}
                />
                <button type="submit" className="btn-primary" style={{ height: '44px', padding: '0 24px', fontSize: '0.88rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={16} /> {searchingRewards ? 'Searching...' : 'Check My Garage'}
                </button>
              </form>
            </div>

            {/* MULTI-VEHICLE GARAGE LIST & ADD FORM */}
            <div style={{
              background: 'rgba(1, 46, 50, 0.85)',
              border: '1px solid var(--border-light)',
              borderRadius: '14px',
              padding: '18px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={18} color="var(--accent-aqua)" /> My Saved Vehicles Garage ({garageVehicles.length})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>1-Click Select Vehicle to Book</div>
              </div>

              {/* VEHICLE CARDS GRID */}
              <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
                {garageVehicles.map((v, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(4, 94, 103, 0.75)',
                    border: '1px solid var(--accent-aqua)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{v.regNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', marginTop: '2px' }}>{v.model} • {v.type}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <button
                        onClick={() => onStartBooking(v.type)}
                        className="btn-aqua"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', height: '32px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center' }}
                      >
                        Book Slot
                      </button>
                      <button
                        onClick={() => handleRemoveGarageVehicle(idx)}
                        title="Remove Vehicle"
                        style={{ background: 'transparent', border: 'none', color: '#f2856e', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ADD NEW VEHICLE FORM */}
              <form onSubmit={handleAddGarageVehicle} className="garage-add-form" style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '14px'
              }}>
                <input
                  type="text"
                  required
                  placeholder="Vehicle No (e.g. WB-74-BY-1200)"
                  value={newRegNo}
                  onChange={(e) => setNewRegNo(e.target.value.toUpperCase())}
                  className="input-field"
                  style={{ height: '42px', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                />

                <input
                  type="text"
                  placeholder="Car Model (e.g. i20)"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="input-field"
                  style={{ height: '42px', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                />

                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="input-field"
                  style={{ height: '42px', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
                >
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Luxury">Luxury</option>
                </select>

                <button type="submit" className="btn-secondary" style={{ height: '42px', padding: '0 16px', fontSize: '0.85rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <Plus size={16} /> Add Car to Garage
                </button>
              </form>

            </div>

            {/* DISPLAY CUSTOMER REWARDS CARD ON LOOKUP */}
            {customerRewards && (
              <div style={{
                background: 'rgba(2, 73, 80, 0.95)',
                border: '1px solid var(--accent-aqua)',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '20px',
                boxShadow: '0 8px 30px rgba(20, 199, 212, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 800 }}>VERIFIED CUSTOMER PROFILE</div>
                    <h3 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginTop: '2px' }}>{customerRewards.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Registered Phone: {customerRewards.phone}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ background: 'rgba(4,94,103,0.9)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>MY LOYALTY POINTS</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{customerRewards.loyaltyPoints} PTS</div>
                    </div>

                    <div style={{ background: 'rgba(4,94,103,0.9)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>MEMBERSHIP TIER</div>
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
                    <div style={{ padding: '12px 16px', background: 'rgba(4,94,103,0.85)', border: '1px solid var(--accent-aqua)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-aqua)' }}>WELCOME20</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>20% OFF 1st Detailing Wash</div>
                      </div>
                      <span className="badge badge-aqua">READY TO USE</span>
                    </div>

                    <div style={{ padding: '12px 16px', background: 'rgba(4,94,103,0.85)', border: '1px solid var(--accent-aqua)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-aqua)' }}>FRESH50</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>₹200 Flat Off Deep Interior Spa</div>
                      </div>
                      <span className="badge badge-aqua">READY TO USE</span>
                    </div>

                    <div style={{ padding: '12px 16px', background: 'rgba(4,94,103,0.85)', border: '1px solid var(--accent-aqua)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-aqua)' }}>CARWASH-MARCUS88</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>Referral Code (Share for ₹150 Credit)</div>
                      </div>
                      <span className="badge badge-terracotta">MY REFERRAL</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* SECTION 6: GOOGLE MAPS REVIEWS & TESTIMONIALS (SOFT ICE TINT BACKGROUND) */}
      <section style={{
        background: 'rgba(4, 94, 103, 0.45)',
        padding: '60px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="badge badge-aqua">GOOGLE MAPS REVIEWS</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>Customer Testimonials & Ratings</h2>
            <p style={{ color: 'var(--ice-tint)' }}>4.9 ★★★★★ Verified Customer Reviews on Google Maps • Siliguri</p>
          </div>

          <div className="grid-3" style={{ gap: '20px' }}>
            {reviewsList.map((rev, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{rev.date}</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#FFFFFF', lineHeight: '1.5', marginBottom: '16px', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                </div>

                <div>
                  {rev.photo && (
                    <div style={{ height: '140px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                      <img src={rev.photo} alt="Customer vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ fontWeight: 800, color: 'var(--accent-aqua)', fontSize: '0.95rem' }}>{rev.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>{rev.vehicle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: QUICK ENQUIRY FORM & LOCATION MAP (CLEAN DEEP TEAL) */}
      <section id="contact-section" style={{
        background: 'rgba(1, 59, 64, 0.95)',
        padding: '50px 0 70px 0'
      }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '20px', alignItems: 'stretch' }}>
            
            {/* Left: Quick Enquiry Form */}
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-aqua)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '4px' }}>
                GET A QUICK CALLBACK
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>Quick Enquiry</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', marginBottom: '14px' }}>
                Fill in your details and our supervisor will contact you with slot availability.
              </p>

              <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="grid-2" style={{ gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={enqName}
                    onChange={(e) => setEnqName(e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  />

                  <input
                    type="text"
                    required
                    placeholder="Phone Number *"
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                </div>

                <select
                  value={enqService}
                  onChange={(e) => setEnqService(e.target.value)}
                  className="input-field"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="Car Washing">Car Washing & Foam Wash</option>
                  <option value="Under Coating">Under Coating (Anti-Rust Protection)</option>
                  <option value="Car Polish">Car Polish & Buffing</option>
                  <option value="Foam Wash">High Pressure Snow Foam Wash</option>
                  <option value="Ceramic Coating">9H Nano Ceramic Coating</option>
                  <option value="Teflon Coating">Teflon Coating</option>
                  <option value="Bike Detailing">Bike Detailing</option>
                  <option value="AC Disinfection">AC Vent Disinfection</option>
                  <option value="Glass Coating">Windshield Glass Coating</option>
                  <option value="Steam Detailing">300°F Steam Detailing</option>
                  <option value="Interior Spa">Interior Spa</option>
                  <option value="Anti-Rust Shield">Anti-Rust Shield</option>
                </select>

                <textarea
                  placeholder="Specific requirement..."
                  rows={2}
                  value={enqMsg}
                  onChange={(e) => setEnqMsg(e.target.value)}
                  className="input-field"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />

                <button type="submit" className="btn-aqua" style={{ justifyContent: 'center', padding: '10px', fontSize: '0.88rem' }}>
                  <Send size={16} /> Submit Enquiry
                </button>
              </form>
            </div>

            {/* Right: Location Map Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '4px' }}>
                  VISIT OUR FACILITY
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Auto Detailing Bay Hub</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="var(--accent-aqua)" />
                    <span>Siliguri, West Bengal</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={18} color="var(--accent-aqua)" />
                    <span>+91 8609504186</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={18} color="var(--accent-terracotta)" />
                    <span>Mon - Sat: 08:00 AM - 07:00 PM (Sunday Open)</span>
                  </div>
                </div>
              </div>

              {/* Map Visual Box */}
              <div style={{
                height: '110px',
                borderRadius: '10px',
                background: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80) center/cover',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--accent-aqua)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(4, 94, 103, 0.7)' }} />
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <MapPin size={24} color="var(--accent-aqua)" />
                  <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.88rem', marginTop: '2px' }}>CAR WASH • SILIGURI</div>
                </div>
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
