import React, { useState, useEffect } from 'react';
import { Award, Gift, Share2, Shield, Star, Check, Copy, Sparkles, CreditCard, MessageCircle, Users, CheckCircle, Clock, LogOut, User, Phone, Lock, Car, Plus, Key } from 'lucide-react';
import { getMemberships, getCustomerDetails, buyGiftCard, loginCustomer, signupCustomer, addCustomerVehicle } from '../api';

export default function CustomerPortal({ currentUser: propUser, setCurrentUser: propSetUser, onSignOut: propSignOut }) {
  const [memberships, setMemberships] = useState([]);
  
  // Auth state
  const [localUser, setLocalUser] = useState(propUser || null);
  const currentUser = propUser !== undefined ? propUser : localUser;

  const updateCustomerState = (user) => {
    setLocalUser(user);
    if (propSetUser) propSetUser(user);
  };

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login form state (empty placeholders)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Signup form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpRegNo, setSignUpRegNo] = useState('');
  const [signUpModel, setSignUpModel] = useState('');

  // Garage state
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehModel, setNewVehModel] = useState('');
  const [vehMsg, setVehMsg] = useState('');

  // Gift card & Referral states
  const [giftVal, setGiftVal] = useState(1000);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftSender, setGiftSender] = useState('');
  const [giftMsg, setGiftMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [referralsList] = useState([
    { friendName: 'Rahul Sharma', phone: '+91 9800112211', date: '2026-08-20', status: 'Completed Wash', rewardEarned: '100 Pts + ₹150 Credit' },
    { friendName: 'Priya Mukherjee', phone: '+91 9831004455', date: '2026-08-22', status: 'Completed Wash', rewardEarned: '100 Pts + ₹150 Credit' },
    { friendName: 'Amit Verma', phone: '+91 9874558899', date: '2026-08-23', status: 'Joined (Pending 1st Wash)', rewardEarned: 'Pending' }
  ]);

  useEffect(() => {
    fetchMemberships();
    
    // Check saved login in localStorage
    const saved = localStorage.getItem('carwash_customer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone) {
          fetchLatestCustomer(parsed.phone);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await getMemberships();
      setMemberships(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLatestCustomer = async (phone) => {
    try {
      const res = await getCustomerDetails(phone);
      if (res.data?.customer) {
        setCurrentUser(res.data.customer);
        localStorage.setItem('carwash_customer', JSON.stringify(res.data.customer));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HANDLER: LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await loginCustomer(loginPhone, loginPin);
      if (res.data?.customer) {
        updateCustomerState(res.data.customer);
        localStorage.setItem('carwash_customer', JSON.stringify(res.data.customer));
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Invalid phone number or PIN. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // HANDLER: SIGN UP
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!signUpPin || signUpPin.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await signupCustomer({
        name: signUpName,
        phone: signUpPhone,
        pin: signUpPin,
        vehicle: {
          regNumber: signUpRegNo,
          model: signUpModel,
          brand: 'Hyundai'
        }
      });
      if (res.data?.customer) {
        updateCustomerState(res.data.customer);
        localStorage.setItem('carwash_customer', JSON.stringify(res.data.customer));
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Failed to create account.');
    } finally {
      setAuthLoading(false);
    }
  };

  // HANDLER: SIGN OUT
  const handleSignOut = () => {
    if (propSignOut) {
      propSignOut();
    } else {
      localStorage.removeItem('carwash_customer');
      updateCustomerState(null);
      setAuthError('');
    }
  };

  // HANDLER: ADD VEHICLE TO GARAGE
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehReg || !currentUser) return;
    try {
      const res = await addCustomerVehicle(currentUser.phone, {
        regNumber: newVehReg,
        model: newVehModel || 'Car',
        brand: 'Hyundai'
      });
      setCurrentUser(res.data);
      localStorage.setItem('carwash_customer', JSON.stringify(res.data));
      setNewVehReg('');
      setNewVehModel('');
      setVehMsg('✓ Vehicle added to your garage successfully!');
      setTimeout(() => setVehMsg(''), 3000);
    } catch (err) {
      setVehMsg('Failed to add vehicle.');
    }
  };

  const handleBuyGiftCard = async (e) => {
    e.preventDefault();
    if (!giftRecipient || !giftSender) return;
    try {
      const res = await buyGiftCard({
        initialValue: giftVal,
        recipientEmail: giftRecipient,
        senderName: giftSender
      });
      setGiftMsg(`Success! Digital Gift Card ${res.data.giftCard?.code || 'GIFT-100'} (₹${giftVal}) sent to ${giftRecipient}`);
      setGiftRecipient('');
    } catch (err) {
      setGiftMsg('Failed to issue gift card.');
    }
  };

  const referralCode = `CARWASH-${currentUser?.name ? currentUser.name.split(' ')[0].toUpperCase() : 'VIP'}88`;
  const referralLink = `https://carwash.com/ref?code=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Hi! Get ₹200 OFF your 1st car wash at CAR WASH Siliguri! Use my referral code: ${referralCode} or click: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* HEADER TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge badge-aqua">CAR WASH VIP CLUB & MY GARAGE</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '6px' }}>Customer Account, Garage & Loyalty Rewards</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your saved vehicles, track loyalty points & claim referral rewards in Siliguri</p>
      </div>

      {/* IF NOT LOGGED IN: DISPLAY AUTHENTICATION PANEL (LOGIN / SIGNUP) */}
      {!currentUser ? (
        <div style={{ maxWidth: '440px', margin: '0 auto 60px auto' }}>
          <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--accent-aqua)', borderRadius: '16px' }}>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '6px', color: '#FFFFFF' }}>
              {authMode === 'login' ? 'Log In to Customer Account' : 'Register New Account'}
            </h3>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {authMode === 'login' ? 'Enter your details to access My Garage & rewards' : 'Create your free account to track bookings'}
            </p>

            {authError && (
              <div style={{ background: 'rgba(255, 89, 100, 0.15)', border: '1px solid var(--accent-coral)', color: 'var(--accent-coral)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            {/* FORM 1: LOG IN */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Mobile Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Mobile Phone Number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Password (Min 6 Characters) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter Password (min 6 characters)"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '6px', fontSize: '1rem', fontWeight: 800 }}
                >
                  {authLoading ? 'Logging In...' : 'Log In'}
                </button>

                {/* SIGN UP BUTTON LINK BELOW FORM */}
                <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Sign Up / Register
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: SIGN UP / REGISTER */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Full Name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Mobile Phone Number"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Create Password (Min 6 Characters) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter Password (min 6 characters)"
                    value={signUpPin}
                    onChange={(e) => setSignUpPin(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="grid-2" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Vehicle Reg Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WB-74-AX-8821"
                      value={signUpRegNo}
                      onChange={(e) => setSignUpRegNo(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Car Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Creta / Nexon"
                      value={signUpModel}
                      onChange={(e) => setSignUpModel(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px', fontSize: '1rem', fontWeight: 800 }}
                >
                  {authLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* LOG IN BUTTON LINK BELOW FORM */}
                <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-light)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      ) : (
        <>
          {/* LOGGED IN CUSTOMER SUMMARY & SIGNOUT HEADER CARD */}
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', border: '1px solid var(--accent-aqua)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="badge badge-aqua">VIP CLUB MEMBER</span>
                <h2 style={{ fontSize: '2rem', color: '#FFFFFF', marginTop: '4px' }}>{currentUser.name}</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>Phone: {currentUser.phone}</div>
                
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'rgba(255, 89, 100, 0.15)',
                    border: '1px solid var(--accent-coral)',
                    color: 'var(--accent-coral)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '12px'
                  }}
                >
                  <LogOut size={14} /> Sign Out / Logout
                </button>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', background: 'rgba(0, 49, 53, 0.8)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MY LOYALTY POINTS</div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{currentUser.loyaltyPoints || 50} PTS</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>Earn 10 pts per ₹100 spent</div>
                </div>

                <div style={{ textAlign: 'center', background: 'rgba(0, 49, 53, 0.8)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE MEMBERSHIP</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>{currentUser.membershipStatus || 'VIP Member'}</div>
                  <span className="badge badge-terracotta" style={{ marginTop: '4px' }}>Priority Bay Access</span>
                </div>
              </div>
            </div>

            {/* FREE WASH MILESTONE PROGRESS TRACKER */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>Free Express Wash Milestone Tracker</span>
                <span style={{ color: 'var(--accent-aqua)' }}>{currentUser.loyaltyPoints || 50} / 350 PTS</span>
              </div>
              <div style={{ height: '12px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round(((currentUser.loyaltyPoints || 50) / 350) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-terracotta) 0%, var(--accent-aqua) 100%)' }} />
              </div>
            </div>
          </div>

          {/* MY GARAGE: SAVED VEHICLES LIST & ADD VEHICLE FORM */}
          <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px', border: '1px solid var(--accent-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={20} color="var(--accent-gold)" /> My Garage (Saved Vehicles)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>1-Click select your saved cars during fast slot booking</p>
              </div>
            </div>

            {vehMsg && (
              <div style={{ color: 'var(--accent-aqua)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>
                {vehMsg}
              </div>
            )}

            <div className="grid-3" style={{ gap: '16px', marginBottom: '24px' }}>
              {(currentUser.vehicles || [
                { regNumber: 'WB-74-AY-1200', brand: 'Hyundai', model: 'Creta', type: 'Sedan', totalVisits: 5 },
                { regNumber: 'WB-74-BY-1100', brand: 'Tata', model: 'Nexon', type: 'SUV', totalVisits: 3 }
              ]).map((v, i) => (
                <div key={i} style={{ background: 'rgba(0, 49, 53, 0.7)', border: '1px solid var(--border-light)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{v.regNumber}</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '2px' }}>{v.brand || 'Vehicle'} {v.model}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Type: {v.type || 'Sedan'}</span>
                    <span>{v.totalVisits || 1} Wash Visits</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD VEHICLE FORM */}
            <form onSubmit={handleAddVehicle} style={{ background: 'rgba(0, 31, 35, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '10px' }}>
                + Add New Vehicle to My Garage
              </div>
              <div className="grid-3" style={{ gap: '12px' }}>
                <input
                  type="text"
                  required
                  placeholder="Reg No (e.g. WB-74-CY-9900)"
                  value={newVehReg}
                  onChange={(e) => setNewVehReg(e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. BMW X5 / Nexon)"
                  value={newVehModel}
                  onChange={(e) => setNewVehModel(e.target.value)}
                  className="input-field"
                />
                <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '10px' }}>
                  <Plus size={16} /> Save to Garage
                </button>
              </div>
            </form>
          </div>

          {/* REFERRAL SYSTEM & TRACKING */}
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', border: '2px solid var(--accent-aqua)' }}>
            <div className="grid-2" style={{ gap: '30px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 800, marginBottom: '4px' }}>
                  REFERRAL PROGRAM & REWARDS
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
                  Refer Friends, Earn Free Washes & Cash Credits!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                  Share your unique referral code with friends & family in Siliguri:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                    <span style={{ background: 'var(--accent-aqua)', color: '#003135', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</span>
                    <span><strong>Referred Friend Gets:</strong> ₹200 Flat Discount on 1st Wash.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem' }}>
                    <span style={{ background: 'var(--accent-aqua)', color: '#003135', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</span>
                    <span><strong>You (Existing Customer) Get:</strong> 100 Bonus Loyalty Points + ₹150 Wash Credit.</span>
                  </div>
                </div>

                {/* Unique Referral Code Input & Share Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="input-field"
                    style={{ flex: 1, fontWeight: 700, minWidth: '240px' }}
                  />
                  <button onClick={copyReferral} className="btn-primary" style={{ padding: '12px 20px' }}>
                    <Copy size={17} /> {copiedCode ? 'Copied Link!' : 'Copy Code'}
                  </button>
                  <button onClick={shareOnWhatsApp} style={{
                    background: '#25D366', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <MessageCircle size={18} /> Share WhatsApp
                  </button>
                </div>
              </div>

              {/* Referral Tracking Live Table */}
              <div style={{ background: 'rgba(0,49,53,0.85)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--accent-aqua)" /> My Referral Tracking (3 Referred)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {referralsList.map((ref, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,31,35,0.7)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{ref.friendName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ref.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${ref.status.includes('Completed') ? 'badge-aqua' : 'badge-terracotta'}`} style={{ fontSize: '0.68rem' }}>
                          {ref.status}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', marginTop: '2px' }}>{ref.rewardEarned}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MEMBERSHIP PLANS */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2.1rem' }}>Monthly VIP Membership Passes</h2>
            <p style={{ color: 'var(--text-muted)' }}>Unlimited priority washes, zero queues & discounted detailing for regular drivers</p>
          </div>

          <div className="grid-3" style={{ marginBottom: '60px' }}>
            {memberships.map((m, i) => (
              <div key={i} className="glass-panel" style={{
                padding: '32px',
                position: 'relative',
                border: m.isPopular ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                background: m.isPopular ? 'rgba(2, 73, 80, 0.85)' : 'var(--bg-glass-card)'
              }}>
                {m.isPopular && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent-aqua)', color: '#003135', padding: '4px 16px', borderRadius: '20px',
                    fontWeight: 800, fontSize: '0.75rem'
                  }}>
                    MOST POPULAR VIP
                  </div>
                )}
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{m.name}</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-aqua)', marginBottom: '16px' }}>
                  ₹{m.price}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/{m.durationMonths}mo</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                  {m.features?.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color="var(--accent-aqua)" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Select {m.name}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
