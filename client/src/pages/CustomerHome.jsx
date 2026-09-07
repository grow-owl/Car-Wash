import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, Phone, MapPin, Send, MessageCircle, CheckCircle } from 'lucide-react';
import { getPackages, getServices } from '../api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { cleanText } from '../utils/cleanText';

export default function CustomerHome({ onStartBooking, onSelectVehicle, onSelectService, onSelectPackage }) {
  const [packages, setPackages] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const [selectedVehicle] = useState('Sedan');
  const [vehicleSize, setVehicleSize] = useState('Sedan');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Quick Enquiry Form state
  const [enqName, setEnqName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqService, setEnqService] = useState('Car Washing');
  const [enqMsg, setEnqMsg] = useState('');
  const [enqSubmitted, setEnqSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedVehicle, vehicleSize]);

  const fetchData = async () => {
    try {
      const [pkgRes, svcRes] = await Promise.all([
        getPackages(selectedVehicle),
        getServices(vehicleSize)
      ]);
      if (pkgRes.data && pkgRes.data.length > 0) {
        setPackages(pkgRes.data);
      }
      if (svcRes.data && svcRes.data.length > 0) {
        setDbServices(svcRes.data);
      }
    } catch {
      // Keep defaults if API fails
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
      alert('Thank you! Your enquiry has been received. We will contact you shortly.');
    }, 600);
  };

  // Default fallback catalog from Cloudinary
  const defaultServicesList = [
    // Wash
    { category: 'wash', title: 'Exterior Car Wash', prices: { Hatchback: 249, Sedan: 299, SUV: 349 }, origPrices: { Hatchback: 399, Sedan: 499, SUV: 599 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764056/car-wash/services/Exterior_Car_Wash_Foam_wash_pressure_wash_hand_drying.jpg' },
    { category: 'wash', title: 'Full Car Wash', prices: { Hatchback: 549, Sedan: 649, SUV: 749 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764057/car-wash/services/Full_Car_Wash_Complete_interior_exterior_cleaning.jpg' },
    { category: 'wash', title: 'Wheel & Tyre Cleaning', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764061/car-wash/services/Wheel_Tyre_Cleaning_Wheel_cleaning_tyre_dressing.jpg' },

    // Interior
    { category: 'interior', title: 'Interior Cleaning', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764058/car-wash/services/Interior_Cleaning_Dashboard_doors_seats_surfaces.jpg' },
    { category: 'interior', title: 'Interior Vacuum Cleaning', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764059/car-wash/services/Interior_Vacuum_Cleaning_Seats_mats_floor_boot.jpg' },
    { category: 'interior', title: 'Car Interior Detailing', prices: { Hatchback: 1299, Sedan: 1499, SUV: 1799 }, origPrices: { Hatchback: 1899, Sedan: 2199, SUV: 2499 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764060/car-wash/services/Car_Interior_Detailing_Deep_cleaning_of_complete_cabin.jpg' },

    // Polish & Detailing
    { category: 'detailing', title: 'Car Waxing', prices: { Hatchback: 749, Sedan: 899, SUV: 1099 }, origPrices: { Hatchback: 1199, Sedan: 1499, SUV: 1799 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764062/car-wash/services/Car_Waxing_Shine_basic_paint_protection.jpg' },
    { category: 'detailing', title: 'Car Polishing', prices: { Hatchback: 1599, Sedan: 1899, SUV: 2299 }, origPrices: { Hatchback: 2499, Sedan: 2899, SUV: 3499 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764063/car-wash/services/Car_Polishing_Restore_gloss_remove_minor_dullness.jpg' },
    { category: 'detailing', title: 'Engine Bay Cleaning', prices: { Hatchback: 449, Sedan: 549, SUV: 649 }, origPrices: { Hatchback: 699, Sedan: 799, SUV: 899 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764064/car-wash/services/Engine_Bay_Cleaning_Safe_cleaning_of_engine_compartment.jpg' },
    { category: 'detailing', title: 'Car Spa & Premium Detailing', prices: { Hatchback: 2999, Sedan: 3499, SUV: 3999 }, origPrices: { Hatchback: 4499, Sedan: 4999, SUV: 5999 }, img: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764066/car-wash/services/Car_Spa_Premium_Detailing_Comprehensive_exterior_interior_treatment.jpg' }
  ];

  const defaultPackages = [
    {
      title: 'Basic Refresh',
      price: 499,
      originalPrice: 699,
      tagline: 'Standard Maintenance',
      services: ['Exterior Foam Wash', 'Cabin Vacuuming', 'Dashboard Dusting', 'Tyre Cleaning', 'Glass Cleaning'],
      isPopular: false
    },
    {
      title: 'Premium Shine',
      price: 799,
      originalPrice: 1099,
      tagline: 'Complete Regular Care',
      services: ['Premium Snow Foam', 'Deep Vacuum', 'Dashboard UV Polish', 'Tyre & Rim Dressing', 'Underbody Wash', 'Air Freshener'],
      isPopular: true
    },
    {
      title: 'Ultimate Detail',
      price: 1499,
      originalPrice: 1999,
      tagline: 'Full Interior & Exterior Spa',
      services: ['Premium Foam Wash', 'Full Steam Interior Spa', 'Seat Stain Removal', 'Roof & Carpet Cleaning', 'AC Vent Sanitization', 'Exterior Wax Shield'],
      isPopular: false
    }
  ];

  const displayPackages = packages.length >= 3 ? packages : defaultPackages;

  const multiplierMap = {
    Hatchback: 0.85,
    Sedan: 1.0,
    SUV: 1.25
  };
  const mult = multiplierMap[vehicleSize] || 1.0;

  // Resolve service images with fallback to Cloudinary hosted images
  const getFallbackServiceImage = (titleOrCategory = '') => {
    const s = titleOrCategory.toLowerCase();
    if (s.includes('wax')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764062/car-wash/services/Car_Waxing_Shine_basic_paint_protection.jpg';
    if (s.includes('polish')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764063/car-wash/services/Car_Polishing_Restore_gloss_remove_minor_dullness.jpg';
    if (s.includes('engine')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764064/car-wash/services/Engine_Bay_Cleaning_Safe_cleaning_of_engine_compartment.jpg';
    if (s.includes('tyre') || s.includes('wheel')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764061/car-wash/services/Wheel_Tyre_Cleaning_Wheel_cleaning_tyre_dressing.jpg';
    if (s.includes('vacuum')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764059/car-wash/services/Interior_Vacuum_Cleaning_Seats_mats_floor_boot.jpg';
    if (s.includes('detail') || s.includes('spa') || s.includes('ceramic')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764066/car-wash/services/Car_Spa_Premium_Detailing_Comprehensive_exterior_interior_treatment.jpg';
    if (s.includes('interior')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764058/car-wash/services/Interior_Cleaning_Dashboard_doors_seats_surfaces.jpg';
    if (s.includes('full')) return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764057/car-wash/services/Full_Car_Wash_Complete_interior_exterior_cleaning.jpg';
    return 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764056/car-wash/services/Exterior_Car_Wash_Foam_wash_pressure_wash_hand_drying.jpg';
  };

  const resolvedServices = dbServices && dbServices.length > 0
    ? dbServices.map(s => {
        const base = Number(s.basePrice || s.price || 499);
        return {
          _id: s._id,
          category: (s.category || 'wash').toLowerCase(),
          title: s.name || s.title || 'Car Service',
          name: s.name || s.title || 'Car Service',
          prices: {
            Hatchback: Math.round(base * 0.85),
            Sedan: base,
            SUV: Math.round(base * 1.25)
          },
          origPrices: {
            Hatchback: Math.round(base * 0.85 * 1.35),
            Sedan: Math.round(base * 1.35),
            SUV: Math.round(base * 1.25 * 1.35)
          },
          img: s.image && typeof s.image === 'string' && s.image.trim().length > 3
            ? s.image.trim()
            : getFallbackServiceImage(s.name || s.category)
        };
      })
    : defaultServicesList;

  const filteredServices = selectedCategory === 'all'
    ? resolvedServices
    : resolvedServices.filter(s => (s.category || '').toLowerCase().includes(selectedCategory.toLowerCase()));


  return (
    <div style={{ position: 'relative' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '480px',
        padding: '70px 0 80px 0',
        background: `linear-gradient(to right, rgba(6, 20, 27, 0.95) 0%, rgba(17, 33, 45, 0.82) 60%, rgba(37, 55, 69, 0.4) 100%), url('/hero-bg.webp') center/cover no-repeat`,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '580px' }}>
            
            <h1 style={{
              fontSize: '3rem',
              lineHeight: '1.15',
              fontWeight: 800,
              marginBottom: '16px',
              color: '#FFFFFF'
            }}>
              Premium Car Wash & Detailing
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--ice-tint)',
              marginBottom: '28px',
              lineHeight: '1.6'
            }}>
              High-pressure foam wash, 300°F steam interior sanitization & ceramic coatings.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onStartBooking(selectedVehicle)}
                className="btn-primary"
                style={{
                  padding: '14px 30px',
                  borderRadius: '24px',
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Book Your Wash <ArrowRight size={18} />
              </button>

              <button
                onClick={() => {
                  const servicesEl = document.getElementById('services-section');
                  if (servicesEl) servicesEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ borderRadius: '24px', padding: '14px 26px', fontSize: '0.95rem' }}
              >
                View Services
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BEFORE / AFTER SLIDER */}
      <section style={{
        background: '#11212D',
        padding: '40px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <BeforeAfterSlider />
        </div>
      </section>

      {/* 3. SERVICES CATALOG */}
      <section id="services-section" style={{
        background: '#06141B',
        padding: '50px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Individual Services</h2>
            <p style={{ color: 'var(--ice-tint)', fontSize: '0.9rem', marginTop: '6px' }}>
              Custom standalone treatments for your vehicle
            </p>
          </div>

          {/* Vehicle & Category Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            
            {/* Vehicle Size Selector */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 30, 35, 0.7)', padding: '4px', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
              {['Hatchback', 'Sedan', 'SUV'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVehicleSize(type)}
                  style={{
                    background: vehicleSize === type ? 'var(--accent-cyan)' : 'transparent',
                    color: vehicleSize === type ? '#003135' : '#CCD0CF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'wash', label: 'Washing' },
                { id: 'interior', label: 'Interior Spa' },
                { id: 'detailing', label: 'Polish & Detailing' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: selectedCategory === cat.id ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                    color: selectedCategory === cat.id ? 'var(--accent-cyan)' : 'var(--ice-tint)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    border: selectedCategory === cat.id ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                    padding: '6px 14px',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid-3" style={{ gap: '16px' }}>
            {filteredServices.map((sc, idx) => {
              const currentPrice = sc.prices[vehicleSize] || sc.prices['Sedan'];
              const currentOrigPrice = sc.origPrices[vehicleSize] || sc.origPrices['Sedan'];

              return (
                <div
                  key={idx}
                  className="glass-card"
                  onClick={() => {
                    const itemToBook = {
                      ...sc,
                      name: sc.title,
                      price: currentPrice,
                      originalPrice: currentOrigPrice
                    };
                    if (onSelectService) onSelectService(itemToBook);
                    else onStartBooking(vehicleSize);
                  }}
                  style={{
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: '1px solid var(--border-light)',
                    background: 'rgba(17, 33, 45, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                    <img src={sc.img} alt={sc.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{sc.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.75rem', opacity: 0.75 }}>₹{currentOrigPrice}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>₹{currentPrice}</span>
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ width: '100%', padding: '6px', fontSize: '0.78rem', justifyContent: 'center', borderRadius: '8px' }}
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. POPULAR WASH PACKAGES */}
      <section id="pricing-section" style={{
        background: '#11212D',
        padding: '50px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Wash Packages</h2>
            <p style={{ color: 'var(--ice-tint)', fontSize: '0.9rem', marginTop: '6px' }}>
              Transparent pricing with all-inclusive services
            </p>
          </div>

          <div className="grid-3" style={{ gap: '20px' }}>
            {displayPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: pkg.isPopular ? '2px solid #FFC300' : '1px solid var(--border-light)',
                  background: pkg.isPopular ? 'linear-gradient(135deg, rgba(37,55,69,0.95) 0%, rgba(17,33,45,0.95) 100%)' : 'var(--bg-glass-card)'
                }}
              >
                <div>
                  {pkg.isPopular && (
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--accent-gold)',
                      color: '#06141B',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      marginBottom: '10px'
                    }}>
                      MOST POPULAR
                    </span>
                  )}

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0' }}>{cleanText(pkg.title || pkg.name)}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', marginBottom: '16px' }}>{cleanText(pkg.tagline)}</div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '18px' }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.95rem', opacity: 0.75 }}>
                      ₹{pkg.originalPrice || (pkg.price === 499 ? 699 : pkg.price === 799 ? 1099 : 1999)}
                    </span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: pkg.isPopular ? 'var(--accent-gold)' : 'var(--accent-cyan)' }}>
                      ₹{pkg.price}
                    </span>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(pkg.services || pkg.includedServices || []).map((service, sIdx) => (
                      <li key={sIdx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                        <CheckCircle size={15} color={pkg.isPopular ? 'var(--accent-gold)' : 'var(--accent-cyan)'} />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onSelectPackage(pkg)}
                  className={pkg.isPopular ? "btn-gold" : "btn-cyan"}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem', fontWeight: 800, borderRadius: '10px' }}
                >
                  Book Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. QUICK ENQUIRY & LOCATION */}
      <section id="contact-section" style={{
        background: '#11212D',
        padding: '50px 0'
      }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '20px' }}>
            
            {/* Quick Enquiry Form */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>Quick Enquiry</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', margin: '0 0 16px 0' }}>
                Fill your details and we will call you back.
              </p>

              <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="grid-2" style={{ gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
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
                  <option value="Interior Spa">Interior Spa & Steam Cleaning</option>
                  <option value="Ceramic Coating">9H Ceramic Coating</option>
                  <option value="Paint Correction">Machine Polish & Buffing</option>
                  <option value="Underbody Coating">Underbody Anti-Rust</option>
                </select>

                <textarea
                  placeholder="Additional note (optional)..."
                  rows={2}
                  value={enqMsg}
                  onChange={(e) => setEnqMsg(e.target.value)}
                  className="input-field"
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />

                <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '10px', fontSize: '0.88rem', borderRadius: '8px' }}>
                  <Send size={15} /> Submit Enquiry
                </button>
              </form>
            </div>

            {/* Location Info */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 16px 0' }}>Visit Our Bay</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="var(--accent-cyan)" />
                    <span>Sevoke Road, Siliguri, West Bengal</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={18} color="var(--accent-cyan)" />
                    <span>+91 8609504186</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={18} color="var(--accent-gold)" />
                    <span>Mon - Sat: 08:00 AM - 07:00 PM (Sun: 09:00 AM - 05:00 PM)</span>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(0, 229, 255, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                fontSize: '0.8rem',
                color: 'var(--ice-tint)'
              }}>
                Free pick-up & drop available for full detailing packages within 5 km.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000
      }}>
        <a
          href="https://wa.me/918609504186?text=Hi%20CAR%20WASH!%20I%20want%20to%20book%20a%20car%20wash%20slot."
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Contact"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.5)',
            textDecoration: 'none'
          }}
        >
          <MessageCircle size={26} />
        </a>
      </div>

    </div>
  );
}
