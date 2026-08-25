import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Car, Check, ArrowRight, Star, Gift, Users, Award, Clock, Phone, MapPin, Send, MessageCircle, Search, Tag, Copy, CheckCircle, CheckCircle2, Sun, Plus, Trash2 } from 'lucide-react';
import { getServices, getPackages, getBeforeAfterGallery, getCustomerDetails } from '../api';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

export default function CustomerHome({ onStartBooking, onSelectVehicle, onSelectService, onSelectPackage }) {
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

  // Category & Vehicle Size Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vehicleSize, setVehicleSize] = useState('Sedan');

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
    // 🚿 1. REGULAR WASH SERVICES
    { category: 'wash', title: 'Express Exterior Wash', prices: { Hatchback: 249, Sedan: 299, SUV: 349 }, origPrices: { Hatchback: 399, Sedan: 499, SUV: 599 }, desc: 'High-pressure foam wash, wheel scrub & blow dry.', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=500&q=80', badge: 'QUICK WASH' },
    { category: 'wash', title: 'Foam Wash', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, desc: 'Thick snow foam lifting dirt and grime without scratches.', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80', badge: 'SNOW FOAM' },
    { category: 'wash', title: 'Basic Interior + Exterior Wash', prices: { Hatchback: 499, Sedan: 549, SUV: 649 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, desc: 'Full foam wash + cabin vacuuming & footmat cleaning.', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=500&q=80', badge: 'COMBO WASH' },
    { category: 'wash', title: 'Premium Car Wash ⭐', prices: { Hatchback: 699, Sedan: 799, SUV: 899 }, origPrices: { Hatchback: 999, Sedan: 1199, SUV: 1399 }, desc: 'Foam wash, exterior clean, interior vacuum, dash polish, door panels, tyre shine & air freshener.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80', badge: '⭐ BEST VALUE' },
    { category: 'wash', title: 'Underbody Wash', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, desc: 'High-pressure underbody mud extraction & chassis rinse.', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=500&q=80', badge: 'CHASSIS CARE' },

    // 🧹 2. INTERIOR CLEANING SERVICES
    { category: 'interior', title: 'Interior Vacuum & Dusting', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, desc: 'Deep cabin vacuuming & dust extraction from seats & footmats.', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80', badge: 'CABIN DUSTING' },
    { category: 'interior', title: 'Dashboard & Door Panel Cleaning', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, desc: 'UV protective non-greasy dashboard polish & door panel scrub.', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=500&q=80', badge: 'UV POLISH' },
    { category: 'interior', title: 'Seat Cleaning & Fabric Scrub', prices: { Hatchback: 499, Sedan: 599, SUV: 699 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 1099 }, desc: 'Deep upholstery stain extraction & fabric/leather hydration.', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80', badge: 'SEAT SPA' },
    { category: 'interior', title: 'Interior Deep Cleaning ⭐', prices: { Hatchback: 1299, Sedan: 1499, SUV: 1799 }, origPrices: { Hatchback: 1899, Sedan: 2199, SUV: 2499 }, desc: 'Complete interior steam extraction, carpet shampooing & sanitization.', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=500&q=80', badge: '⭐ DEEP CLEAN' },
    { category: 'interior', title: 'Roof & Carpet Cleaning', prices: { Hatchback: 499, Sedan: 599, SUV: 699 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 1099 }, desc: 'Fabric headliner stain removal & carpet steam extraction.', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80', badge: 'CARPET SPA' },
    { category: 'interior', title: 'AC Vent Cleaning & Steam Sanitize', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, desc: 'Ozone steam sanitization inside AC ducts eliminating vent mold.', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=500&q=80', badge: 'VENT SANITIZE' },
    { category: 'interior', title: 'Odour Removal & Sanitisation', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, desc: 'Permanent smoke & pet odor elimination with anti-bacterial fogging.', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80', badge: 'FRESH CABIN' },

    // ✨ 3. EXTERIOR CARE & SHINE
    { category: 'exterior', title: 'Tyre & Alloy Deep Cleaning', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, desc: 'Brake dust acid wash & alloy rim polishing.', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=500&q=80', badge: 'ALLOY SHINE' },
    { category: 'exterior', title: 'Tyre Dressing & Shine', prices: { Hatchback: 99, Sedan: 149, SUV: 199 }, origPrices: { Hatchback: 199, Sedan: 249, SUV: 299 }, desc: 'Long-lasting deep wet look tire dressing.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80', badge: 'TIRE DRESS' },
    { category: 'exterior', title: 'Exterior Wax Polish', prices: { Hatchback: 799, Sedan: 999, SUV: 1199 }, origPrices: { Hatchback: 1199, Sedan: 1499, SUV: 1799 }, desc: 'Hand wax application for smooth paint shine & UV protection.', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80', badge: 'HAND WAX' },
    { category: 'exterior', title: 'Machine Polish / Paint Enhancement', prices: { Hatchback: 1999, Sedan: 2499, SUV: 2999 }, origPrices: { Hatchback: 2999, Sedan: 3499, SUV: 3999 }, desc: 'Dual action machine buffing to remove swirl marks & restore gloss.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80', badge: 'MACHINE BUFF' },
    { category: 'exterior', title: 'Scratch Removal – Minor', prices: { Hatchback: 499, Sedan: 599, SUV: 699 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, desc: 'Spot compounding & buffing to eliminate minor surface scratches.', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80', badge: 'SCRATCH FIX' },
    { category: 'exterior', title: 'Headlight Restoration', prices: { Hatchback: 499, Sedan: 499, SUV: 499 }, origPrices: { Hatchback: 799, Sedan: 799, SUV: 799 }, desc: 'Yellow oxidation removal & clear UV acrylic sealant.', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=500&q=80', badge: 'LIGHT RESTORE' },

    // ⚙️ 4. ENGINE & UNDERBODY CARE
    { category: 'engine', title: 'Engine Bay Cleaning', prices: { Hatchback: 499, Sedan: 549, SUV: 599 }, origPrices: { Hatchback: 799, Sedan: 899, SUV: 999 }, desc: '300°F steam degreasing of engine block & plastic covers.', img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=500&q=80', badge: 'ENGINE STEAM' },
    { category: 'engine', title: 'Engine Bay Dressing', prices: { Hatchback: 199, Sedan: 249, SUV: 299 }, origPrices: { Hatchback: 349, Sedan: 399, SUV: 499 }, desc: 'Protective hose & rubber wire conditioning.', img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=500&q=80', badge: 'HOSE CARE' },
    { category: 'engine', title: 'Underbody Cleaning', prices: { Hatchback: 299, Sedan: 349, SUV: 399 }, origPrices: { Hatchback: 499, Sedan: 599, SUV: 699 }, desc: '360° pressure underbody mud removal.', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=500&q=80', badge: 'MUD EXTRACTION' },
    { category: 'engine', title: 'Anti-Rust Treatment', prices: { Hatchback: 1499, Sedan: 1799, SUV: 2199 }, origPrices: { Hatchback: 2199, Sedan: 2499, SUV: 2999 }, desc: 'Heavy-duty rubberized anti-corrosion chassis coating.', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=500&q=80', badge: 'ANTI-RUST' },

    // 🛋️ 5. PREMIUM DETAILING
    { category: 'premium', title: 'Complete Interior Detailing', isStartingPrice: true, prices: { Hatchback: 1999, Sedan: 1999, SUV: 1999 }, origPrices: { Hatchback: 2999, Sedan: 2999, SUV: 2999 }, desc: 'Deep steam sanitization, leather spa, carpet extraction & AC vent cleaning.', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=500&q=80', badge: 'FULL INTERIOR' },
    { category: 'premium', title: 'Exterior Detailing & Polish', isStartingPrice: true, prices: { Hatchback: 2499, Sedan: 2499, SUV: 2499 }, origPrices: { Hatchback: 3499, Sedan: 3499, SUV: 3499 }, desc: 'Multi-stage paint correction, clay bar treatment & synthetic wax polish.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80', badge: 'PAINT CORRECTION' },
    { category: 'premium', title: 'Complete Car Detailing ⭐', isStartingPrice: true, prices: { Hatchback: 3999, Sedan: 3999, SUV: 3999 }, origPrices: { Hatchback: 5999, Sedan: 5999, SUV: 5999 }, desc: 'Full interior + exterior showroom transformation with engine bay & tire dressing.', img: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=500&q=80', badge: '⭐ SHOWROOM FLAGSHIP' },
    { category: 'premium', title: 'Teflon / Paint Protection', isStartingPrice: true, prices: { Hatchback: 2499, Sedan: 2499, SUV: 2499 }, origPrices: { Hatchback: 3999, Sedan: 3999, SUV: 3999 }, desc: 'Hydrophobic paint barrier enhancing color depth & swirl masking.', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80', badge: 'TEFLON SHIELD' },
    { category: 'premium', title: 'Nano Ceramic Protection', isStartingPrice: true, prices: { Hatchback: 4999, Sedan: 4999, SUV: 4999 }, origPrices: { Hatchback: 6999, Sedan: 6999, SUV: 6999 }, desc: '9H Nano ceramic paint shield with 1-year gloss guarantee.', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80', badge: 'NANO CERAMIC' },
    { category: 'premium', title: '1-Year Ceramic Coating', isStartingPrice: true, prices: { Hatchback: 7999, Sedan: 7999, SUV: 7999 }, origPrices: { Hatchback: 10999, Sedan: 10999, SUV: 10999 }, desc: 'Professional multi-layer 9H ceramic coating with warranty card.', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80', badge: '1-YEAR WARRANTY' },
    { category: 'premium', title: 'PPF – Partial Protection Film', isStartingPrice: true, prices: { Hatchback: 25000, Sedan: 25000, SUV: 25000 }, origPrices: { Hatchback: 35000, Sedan: 35000, SUV: 35000 }, desc: 'Self-healing Paint Protection Film for high-impact front bumper & bonnet.', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80', badge: 'PPF ARMOR' }
  ];

  return (
    <div style={{ position: 'relative' }}>
      
      {/* SECTION 1: HERO SECTION WITH VIBRANT TEAL OVERLAY */}
      <section style={{
        position: 'relative',
        minHeight: '580px',
        padding: '90px 0 100px 0',
        background: `linear-gradient(to right, rgba(6, 20, 27, 0.96) 0%, rgba(17, 33, 45, 0.85) 50%, rgba(37, 55, 69, 0.5) 100%), url('/hero-bg.jpg') center/cover no-repeat`,
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
              every <span style={{ color: 'var(--accent-gold)' }}>single visit.</span>
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

            <div className="hero-cta-group" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '44px' }}>
              <button
                onClick={() => onStartBooking(selectedVehicle)}
                className="btn-primary"
                style={{
                  padding: '16px 36px',
                  borderRadius: '30px',
                  fontSize: '1rem',
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

            {/* Stats Counter Glass Cards with Multi-color Distinction */}
            <div className="hero-stats-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(255, 195, 0, 0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--accent-gold)',
                padding: '14px 24px',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>15+</div>
                <div style={{ fontSize: '0.78rem', color: '#CCD0CF' }}>Years Experience</div>
              </div>

              <div style={{
                background: 'rgba(0, 229, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--accent-cyan)',
                padding: '14px 24px',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>5.0 ★</div>
                <div style={{ fontSize: '0.78rem', color: '#CCD0CF' }}>Customer Rating</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE BEFORE / AFTER SLIDER (#11212D BACKGROUND) */}
      <section style={{
        background: '#11212D',
        padding: '50px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <BeforeAfterSlider />
        </div>
      </section>

      {/* SECTION 3: SERVICES WE PROVIDE (#06141B BACKGROUND) */}
      <section id="services-section" style={{
        background: '#06141B',
        padding: '60px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '6px' }}>
              RECOMMENDED CAR WASH SERVICE PRICE LIST
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800 }}>Services & Transparent Pricing</h2>
            <p style={{ color: 'var(--ice-tint)' }}>Professional vehicle restoration & hygiene packages tailored to your vehicle size</p>
          </div>

          {/* INTERACTIVE VEHICLE SIZE SWITCHER & CATEGORY FILTER BARS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
            
            {/* 1. VEHICLE SIZE SWITCHER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(17, 33, 45, 0.95)', padding: '6px 14px', borderRadius: '30px', border: '1px solid var(--accent-gold)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SELECT VEHICLE SIZE:
              </span>
              {[
                { type: 'Hatchback', label: '🚗 Hatchback' },
                { type: 'Sedan', label: '🚘 Sedan' },
                { type: 'SUV', label: '🚙 SUV / MUV' }
              ].map((v) => (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => setVehicleSize(v.type)}
                  style={{
                    background: vehicleSize === v.type ? 'var(--accent-gold)' : 'transparent',
                    color: vehicleSize === v.type ? '#06141B' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* 2. CATEGORY TABS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { id: 'all', label: 'All Services' },
                { id: 'wash', label: '🚿 Regular Wash' },
                { id: 'interior', label: '🧹 Interior Care' },
                { id: 'exterior', label: '✨ Exterior & Polish' },
                { id: 'engine', label: '⚙️ Engine & Chassis' },
                { id: 'premium', label: '🛋️ Premium Detailing' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: selectedCategory === cat.id ? 'var(--accent-cyan)' : 'rgba(0, 49, 53, 0.6)',
                    color: selectedCategory === cat.id ? '#003135' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: selectedCategory === cat.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>

          {/* DYNAMIC SERVICE CARDS GRID */}
          {(() => {
            const filteredServices = selectedCategory === 'all' 
              ? serviceCategoriesList 
              : serviceCategoriesList.filter(s => s.category === selectedCategory);

            return (
              <div className="grid-3" style={{ gap: '20px' }}>
                {filteredServices.map((sc, idx) => {
                  const currentPrice = sc.prices[vehicleSize] || sc.prices['Sedan'];
                  const currentOrigPrice = sc.origPrices[vehicleSize] || sc.origPrices['Sedan'];

                  return (
                    <div
                      key={idx}
                      className="glass-card service-zoom-card"
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
                        borderRadius: '16px',
                        cursor: 'pointer',
                        border: '1px solid var(--border-light)',
                        background: 'rgba(17, 33, 45, 0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%'
                      }}
                    >
                      <div style={{ height: '160px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={sc.img} alt={sc.title} className="zoom-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,20,27,0.95) 0%, transparent 65%)' }} />
                        <span className="badge badge-cyan" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', fontWeight: 800 }}>
                          {sc.badge || 'PRO'}
                        </span>
                      </div>

                      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', flex: 1, minWidth: '150px' }}>{sc.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexShrink: 0 }}>
                              {sc.isStartingPrice && <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>From </span>}
                              <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '0.78rem', opacity: 0.75 }}>₹{currentOrigPrice}</span>
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)' }}>₹{currentPrice}</span>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', lineHeight: '1.4' }}>{sc.desc}</p>
                        </div>
                        
                        <button
                          className="btn-gold"
                          style={{ width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '8px', justifyContent: 'center' }}
                        >
                          Book Service (₹{currentPrice})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* SECTION 4: PACKAGES & INDIVIDUAL STANDALONE SERVICES MATRIX (#11212D GRADIENT BACKGROUND) */}
      <section id="pricing-section" style={{
        background: 'linear-gradient(180deg, #11212D 0%, #253745 50%, #06141B 100%)',
        padding: '70px 0',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="badge badge-gold">TRANSPARENT PRICING & CUSTOM MENU</span>
            <h2 style={{ fontSize: '2.3rem', marginTop: '8px', color: '#FFFFFF' }}>Wash Packages & Individual Services</h2>
            <p style={{ color: '#CCD0CF' }}>Select a complete full package or pick individual single services according to your budget</p>
          </div>

          {/* VIEW MODE TOGGLE BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              📦 Full Detailing Packages (Save up to 25%)
            </button>
          </div>

          {(() => {
            const default3Packages = [
              {
                title: 'Basic Refresh',
                name: 'Basic Refresh',
                price: 499,
                originalPrice: 699,
                tagline: 'Best for: Regular maintenance',
                includedServices: ['Exterior Foam Wash', 'Interior Vacuum', 'Dashboard Dusting', 'Tyre Cleaning', 'Glass Cleaning'],
                isPopular: false
              },
              {
                title: '🥈 Premium Shine ⭐',
                name: '🥈 Premium Shine ⭐',
                price: 799,
                originalPrice: 1099,
                tagline: 'Best for: Complete regular cleaning',
                includedServices: ['Premium Foam Wash', 'Interior Vacuum', 'Dashboard Polish', 'Door Panel Cleaning', 'Tyre & Rim Cleaning', 'Tyre Shine', 'Underbody Wash', 'Air Freshener'],
                isPopular: true
              },
              {
                title: '🥇 Ultimate Detail',
                name: '🥇 Ultimate Detail',
                price: 1499,
                originalPrice: 1999,
                tagline: 'Best for: Deep cleaning',
                includedServices: ['Premium Foam Wash', 'Full Interior Cleaning', 'Deep Vacuum', 'Dashboard & Door Panel Polish', 'Seat Surface Cleaning', 'Roof & Carpet Cleaning', 'AC Vent Cleaning', 'Tyre Shine', 'Exterior Wax Protection'],
                isPopular: false
              }
            ];

            const displayPackages = (packages.length >= 3 ? packages : default3Packages).slice().sort((a, b) => a.price - b.price);

            return (
              <div className="grid-3" style={{ marginBottom: '50px' }}>
                {displayPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '32px',
                      position: 'relative',
                      borderRadius: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: pkg.isPopular ? '2px solid #FFC300' : '1px solid var(--border-light)',
                      background: pkg.isPopular ? 'linear-gradient(135deg, rgba(37,55,69,0.95) 0%, rgba(17,33,45,0.95) 100%)' : 'var(--bg-glass-card)',
                      boxShadow: pkg.isPopular ? '0 12px 35px var(--accent-gold-glow)' : 'none'
                    }}
                  >
                    {pkg.isPopular && (
                      <div style={{
                        position: 'absolute',
                        top: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #FFC300 0%, #E0A800 100%)',
                        color: '#06141B',
                        padding: '4px 16px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}>
                        ⭐ MOST POPULAR
                      </div>
                    )}

                    <div>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: '6px', fontWeight: 800 }}>{pkg.title || pkg.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginBottom: '20px' }}>{pkg.tagline}</p>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '1.1rem', opacity: 0.75 }}>
                          ₹{pkg.originalPrice || (pkg.price === 499 ? 699 : pkg.price === 799 ? 1099 : 1999)}
                        </span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: pkg.isPopular ? 'var(--accent-gold)' : 'var(--accent-cyan)' }}>
                          ₹{pkg.price}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#CCD0CF' }}>/ wash</span>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '28px' }}>
                        <div style={{ fontSize: '0.82rem', color: '#CCD0CF', fontWeight: 700, marginBottom: '12px' }}>
                          INCLUDED SERVICES:
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(pkg.includedServices || []).map((service, sIdx) => (
                            <li key={sIdx} style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                              <CheckCircle size={16} color={pkg.isPopular ? 'var(--accent-gold)' : 'var(--accent-cyan)'} />
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectPackage(pkg)}
                      className={pkg.isPopular ? "btn-gold" : "btn-cyan"}
                      style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
                    >
                      Book Package (₹{pkg.price})
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
                <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 24px', fontSize: '0.88rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
                        className="btn-primary"
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
                    <div style={{ padding: '12px 16px', background: 'rgba(255,195,0,0.12)', border: '1px solid var(--accent-gold)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>WELCOME20</div>
                        <div style={{ fontSize: '0.75rem', color: '#CCD0CF' }}>20% OFF 1st Detailing Wash</div>
                      </div>
                      <span className="badge badge-gold">READY TO USE</span>
                    </div>

                    <div style={{ padding: '12px 16px', background: 'rgba(0,229,255,0.12)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>FRESH50</div>
                        <div style={{ fontSize: '0.75rem', color: '#CCD0CF' }}>₹200 Flat Off Deep Interior Spa</div>
                      </div>
                      <span className="badge badge-cyan">READY TO USE</span>
                    </div>

                    <div style={{ padding: '12px 16px', background: 'rgba(255,89,100,0.12)', border: '1px solid #FF5964', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#FF5964' }}>CARWASH-MARCUS88</div>
                        <div style={{ fontSize: '0.75rem', color: '#CCD0CF' }}>Referral Code (Share for ₹150 Credit)</div>
                      </div>
                      <span className="badge badge-coral">MY REFERRAL</span>
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

                <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '10px', fontSize: '0.88rem' }}>
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
