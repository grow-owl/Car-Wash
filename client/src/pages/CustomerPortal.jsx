import React, { useState, useEffect } from 'react';
import { Award, Gift, Share2, Shield, Star, Check, Copy, Sparkles, CreditCard, MessageCircle, Users, CheckCircle, Clock, LogOut, User, Phone, Lock, Car, Plus, Key, Zap, MapPin } from 'lucide-react';
import { getMemberships, subscribeMembership, getCustomerDetails, buyGiftCard, loginCustomer, signupCustomer, addCustomerVehicle, createRazorpayOrder, verifyRazorpayPayment, reportPaymentFailure } from '../api';
import { launchRazorpayCheckout } from '../utils/razorpay';
import { cleanText } from '../utils/cleanText';
import SectionDivider from '../components/SectionDivider';

export default function CustomerPortal({ currentUser: propUser, setCurrentUser: propSetUser, onSignOut: propSignOut }) {
  const [memberships, setMemberships] = useState([]);
  
  // Auth state
  const [localUser, setLocalUser] = useState(propUser || null);
  const currentUser = propUser !== undefined ? propUser : localUser;

  const updateCustomerState = (user) => {
    setLocalUser(user);
    if (propSetUser) propSetUser(user);
    if (user) {
      localStorage.setItem('carwash_customer', JSON.stringify(user));
    }
  };

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  // Signup form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpRegNo, setSignUpRegNo] = useState('');
  const [signUpModel, setSignUpModel] = useState('');

  // Garage state
  const [newVehReg, setNewVehReg] = useState('');
  const [newVehModel, setNewVehModel] = useState('');
  const [vehMsg, setVehMsg] = useState('');

  // Buy Membership State
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState(null);
  const [buyName, setBuyName] = useState('');
  const [buyPhone, setBuyPhone] = useState('');
  const [buyEmail, setBuyEmail] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [membershipToast, setMembershipToast] = useState('');

  // Gift card & Referral states
  const [giftVal, setGiftVal] = useState(1000);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftSender, setGiftSender] = useState('');
  const [giftMsg, setGiftMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [referralsList] = useState([
    { friendName: 'Rahul Sharma', phone: '+91 9800112211', date: '2026-08-20', status: 'Completed Wash', rewardEarned: '50 Pts + ₹50 Credit' },
    { friendName: 'Priya Mukherjee', phone: '+91 9831004455', date: '2026-08-22', status: 'Completed Wash', rewardEarned: '50 Pts + ₹50 Credit' },
    { friendName: 'Amit Verma', phone: '+91 9874558899', date: '2026-08-23', status: 'Joined (Pending 1st Wash)', rewardEarned: 'Pending' }
  ]);

  const defaultMemberships = [
    {
      _id: 'm1',
      name: 'Silver Shine Pass',
      priceMonthly: 199,
      originalPrice: 249,
      includedWashes: 2,
      discountPct: 10,
      priorityBooking: false,
      perks: ['2 Express Exterior Washes/mo', '10% off all detailing add-ons', 'Free tire dressing'],
      isPopular: false
    },
    {
      _id: 'm2',
      name: 'Gold Detailer Club',
      priceMonthly: 299,
      originalPrice: 399,
      includedWashes: 4,
      discountPct: 20,
      priorityBooking: true,
      perks: ['4 Ultimate Hydro-Washes/mo', '20% off ceramic coatings', 'Priority bay queue access', 'Free interior ozone sanitization'],
      isPopular: true
    },
    {
      _id: 'm3',
      name: 'Platinum VIP Unlimited',
      priceMonthly: 449,
      originalPrice: 599,
      includedWashes: 8,
      discountPct: 30,
      priorityBooking: true,
      perks: ['Unlimited Express Exterior washes', '2 Full Interior Spas/mo', '30% off all premium services', 'Dedicated account manager'],
      isPopular: false
    }
  ];

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
      if (res.data && res.data.length > 0) {
        setMemberships(res.data);
      } else {
        setMemberships(defaultMemberships);
      }
    } catch (err) {
      console.error(err);
      setMemberships(defaultMemberships);
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
      if (res.data?.token) {
        localStorage.setItem('carwash_customer_token', res.data.token);
      }
      if (res.data?.customer) {
        updateCustomerState(res.data.customer);
        localStorage.setItem('carwash_customer', JSON.stringify(res.data.customer));
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Invalid phone number / email or password. Please try again.');
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
        email: signUpEmail,
        pin: signUpPin,
        vehicle: {
          regNumber: signUpRegNo,
          model: signUpModel,
          brand: 'Hyundai'
        }
      });
      if (res.data?.token) {
        localStorage.setItem('carwash_customer_token', res.data.token);
      }
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
    localStorage.removeItem('carwash_customer_token');
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

  // BUY MEMBERSHIP MODAL HANDLERS
  const handleOpenBuyMembershipModal = (plan) => {
    setSelectedPlanForBuy(plan);
    setBuyName(currentUser?.name || '');
    setBuyPhone(currentUser?.phone || '');
    setBuyEmail(currentUser?.email || '');
    setBuyError('');
  };

  const handleConfirmBuyMembership = async (e) => {
    if (e) e.preventDefault();
    if (!buyPhone || !buyName) {
      setBuyError('Please provide your Full Name and Mobile Number.');
      return;
    }
    const cleanPhone = buyPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setBuyError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setBuyLoading(true);
    setBuyError('');

    try {
      const planPrice = selectedPlanForBuy.priceMonthly || 299;
      
      // Step 1: Create Razorpay Order
      const orderRes = await createRazorpayOrder({
        amount: planPrice,
        currency: 'INR',
        notes: {
          membershipPlan: selectedPlanForBuy.name,
          customerName: buyName,
          phone: cleanPhone
        }
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      // Step 2: Open Razorpay Checkout Popup
      await launchRazorpayCheckout({
        keyId,
        orderId,
        amount,
        currency,
        customerName: buyName,
        phone: cleanPhone,
        email: buyEmail || '',
        description: `Activate ${selectedPlanForBuy.name} (30 Days)`,
        onSuccess: async (rzpResponse) => {
          try {
            // Step 3: Activate Membership on Backend
            const subRes = await subscribeMembership({
              phone: cleanPhone,
              name: buyName,
              email: buyEmail,
              membershipName: selectedPlanForBuy.name,
              price: planPrice,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpayOrderId: rzpResponse.razorpay_order_id,
              paymentMode: 'Razorpay'
            });

            if (subRes.data?.customer) {
              updateCustomerState(subRes.data.customer);
            } else {
              const updated = {
                ...(currentUser || {}),
                name: buyName,
                phone: cleanPhone,
                membershipStatus: selectedPlanForBuy.name,
                loyaltyPoints: ((currentUser?.loyaltyPoints || 0) + 150)
              };
              updateCustomerState(updated);
            }

            setSelectedPlanForBuy(null);
            setMembershipToast(`🎉 Congratulations! ${selectedPlanForBuy.name} is now ACTIVE. 150 bonus loyalty points added!`);
            setTimeout(() => setMembershipToast(''), 8000);
          } catch (actErr) {
            console.error('Activation error:', actErr);
            alert(actErr.response?.data?.error || 'Membership payment received. Syncing with account...');
          } finally {
            setBuyLoading(false);
          }
        },
        onFailure: (failErr) => {
          setBuyError(failErr?.description || 'Payment was cancelled or failed. You can try again.');
          setBuyLoading(false);
        },
        onDismiss: () => {
          setBuyLoading(false);
        }
      });
    } catch (err) {
      console.error('Membership order error:', err);
      setBuyError(err.response?.data?.error || 'Failed to initiate VIP pass payment.');
      setBuyLoading(false);
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

  // REFERRAL CODE GENERATION: CARWASH + Username + VEHICLENOlast4DIGIT
  const getVehicleLast4 = () => {
    if (currentUser?.vehicles && currentUser.vehicles.length > 0) {
      const reg = currentUser.vehicles[0].regNumber || currentUser.vehicles[0].regNo || '';
      const cleanReg = reg.replace(/[^A-Za-z0-9]/g, '');
      if (cleanReg.length >= 4) return cleanReg.slice(-4).toUpperCase();
      if (cleanReg.length > 0) return cleanReg.toUpperCase();
    }
    const phoneDigits = (currentUser?.phone || '').replace(/[^0-9]/g, '');
    if (phoneDigits.length >= 4) return phoneDigits.slice(-4);
    return '1122';
  };

  const cleanUserName = (currentUser?.name ? currentUser.name.trim().split(' ')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase() : 'VIP');
  const vehicleLast4 = getVehicleLast4();
  const referralCode = `CARWASH${cleanUserName}${vehicleLast4}`;
  const referralLink = `https://carwash.com/ref?code=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Hi! Get ₹100 OFF your 1st car wash at CAR WASH! Use my referral code: ${referralCode} or click: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      
      {/* IF NOT LOGGED IN: DISPLAY RESPONSIVE SPLIT AUTHENTICATION PANEL */}
      {!currentUser ? (
        <div className="auth-split-card">
          {/* LEFT COLUMN: HERO VISUAL & MINIMAL BRAND HIGHLIGHTS */}
          <div className="auth-hero-side">
            <div>
              <span className="badge badge-aqua" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} /> CAR WASH VIP
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25, marginTop: '8px' }}>
                Fast Booking & Live Tracking
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
                Premium car detailing & steam wash experience.
              </p>

              <div className="auth-hero-features" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.15)', border: '1px solid var(--accent-aqua)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-aqua)', flexShrink: 0 }}>
                    <Zap size={15} />
                  </div>
                  <span>Instant Slot Booking</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.15)', border: '1px solid var(--accent-aqua)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-aqua)', flexShrink: 0 }}>
                    <MapPin size={15} />
                  </div>
                  <span>Live Wash Status Tracking</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 195, 0, 0.15)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', flexShrink: 0 }}>
                    <Car size={15} />
                  </div>
                  <span>Saved Vehicle Garage</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 89, 100, 0.15)', border: '1px solid var(--accent-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-coral)', flexShrink: 0 }}>
                    <Gift size={15} />
                  </div>
                  <span>VIP Points & Milestone Cashback</span>
                </div>
              </div>
            </div>

            <div className="auth-hero-footer" style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid rgba(74, 92, 106, 0.3)', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
              100% Secure &bull; Guaranteed Satisfaction
            </div>
          </div>

          {/* RIGHT COLUMN: CLEAN MINIMAL AUTH FORMS */}
          <div className="auth-form-side">
            
            {/* TABS SWITCHER */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px', background: 'rgba(6, 20, 27, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: authMode === 'login' ? 'linear-gradient(135deg, #00D2B4 0%, #0096B4 100%)' : 'transparent',
                  color: authMode === 'login' ? '#06141B' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: authMode === 'signup' ? 'linear-gradient(135deg, #E6B000 0%, #C99600 100%)' : 'transparent',
                  color: authMode === 'signup' ? '#06141B' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div style={{ background: 'rgba(255, 89, 100, 0.15)', border: '1px solid var(--accent-coral)', color: 'var(--accent-coral)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            {/* FORM 1: LOG IN */}
            {/* FORM 1: LOG IN */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                    Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter phone number or email address"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter password (min 6 chars)"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '4px', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  {authLoading ? 'Logging In...' : 'Log In'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: SIGN UP / REGISTER */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="grid-2" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9800112233"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create Password (min 6 chars)"
                    value={signUpPin}
                    onChange={(e) => setSignUpPin(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="grid-2" style={{ gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Vehicle Reg No</label>
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
                    <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Car Model</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Creta"
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
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '6px', fontSize: '0.95rem', fontWeight: 800 }}
                >
                  {authLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
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
          <div className="glass-panel" style={{
            padding: '24px 28px',
            marginBottom: '32px',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            background: 'linear-gradient(135deg, rgba(6, 26, 36, 0.95) 0%, rgba(3, 16, 23, 0.98) 100%)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            borderRadius: '16px'
          }}>
            {/* TOP BAR: USER IDENTITY & LOGOUT */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(74, 92, 106, 0.25)'
            }}>
              {/* User Avatar & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #008ba3 100%)',
                  color: '#06141B',
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(0, 229, 255, 0.3)',
                  letterSpacing: '0.04em',
                  flexShrink: 0
                }}>
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'VIP'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                      {currentUser.name}
                    </h2>
                    <span className={`badge ${currentUser.membershipStatus && currentUser.membershipStatus !== 'None' ? 'badge-gold' : 'badge-aqua'}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                      {currentUser.membershipStatus && currentUser.membershipStatus !== 'None' ? currentUser.membershipStatus : 'Member Account'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
                    <Phone size={13} color="var(--accent-cyan)" />
                    <span>+91 {currentUser.phone.replace('+91', '').trim()}</span>
                    {currentUser.email && (
                      <>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>{currentUser.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sign Out Action Button */}
              <button
                onClick={handleSignOut}
                style={{
                  background: 'rgba(255, 89, 100, 0.1)',
                  border: '1px solid rgba(255, 89, 100, 0.35)',
                  color: 'var(--accent-coral)',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 89, 100, 0.2)';
                  e.currentTarget.style.borderColor = 'var(--accent-coral)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 89, 100, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 89, 100, 0.35)';
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            {/* MIDDLE STATS GRID: 2 BALANCED SIDE-BY-SIDE CARDS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '14px',
              marginTop: '20px'
            }}>
              {/* Card 1: Loyalty Points */}
              <div style={{
                background: 'rgba(0, 31, 35, 0.6)',
                padding: '16px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 229, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8A99AD', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    My Loyalty Points
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-cyan)', margin: '4px 0 2px 0', lineHeight: 1 }}>
                    {currentUser.loyaltyPoints || 50} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>PTS</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ice-tint)' }}>
                    Earn 10 pts per ₹100 spent
                  </div>
                </div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                  flexShrink: 0
                }}>
                  <Award size={22} />
                </div>
              </div>

              {/* Card 2: Active Membership */}
              <div style={{
                background: 'rgba(0, 31, 35, 0.6)',
                padding: '16px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 195, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8A99AD', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Active Membership
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0 4px 0', lineHeight: 1.2 }}>
                    {currentUser.membershipStatus && currentUser.membershipStatus !== 'None' ? currentUser.membershipStatus : 'None'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: currentUser.membershipStatus && currentUser.membershipStatus !== 'None' ? 'var(--accent-gold)' : '#8A99AD', fontWeight: 600 }}>
                    <Sparkles size={11} />
                    {currentUser.membershipStatus && currentUser.membershipStatus !== 'None' ? 'Priority Bay Access Enabled' : 'Upgrade below for VIP Perks'}
                  </div>
                </div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 195, 0, 0.12)',
                  border: '1px solid rgba(255, 195, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                  flexShrink: 0
                }}>
                  <Shield size={22} />
                </div>
              </div>
            </div>

            {/* BOTTOM: MILESTONE PROGRESS TRACKER */}
            <div style={{
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(74, 92, 106, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', fontWeight: 700, marginBottom: '8px' }}>
                <span style={{ color: '#CCD0CF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="var(--accent-cyan)" /> Free Express Wash Milestone Tracker
                </span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>
                  {currentUser.loyaltyPoints || 50} <span style={{ color: '#8A99AD', fontWeight: 500 }}>/ 350 PTS</span>
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '10px', overflow: 'hidden', padding: '1px' }}>
                <div style={{
                  width: `${Math.min(100, Math.round(((currentUser.loyaltyPoints || 50) / 350) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00B4D8 0%, var(--accent-cyan) 100%)',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#8A99AD', marginTop: '6px' }}>
                <span>{Math.min(100, Math.round(((currentUser.loyaltyPoints || 50) / 350) * 100))}% unlocked</span>
                <span>{Math.max(0, 350 - (currentUser.loyaltyPoints || 50))} PTS needed for free wash</span>
              </div>
            </div>
          </div>

          <SectionDivider variant="gold" icon="star" badge="MY VEHICLES" spacing="tight" />

          {/* MY GARAGE: SAVED VEHICLES LIST & ADD VEHICLE FORM */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 195, 0, 0.25)',
            background: 'linear-gradient(135deg, rgba(6, 26, 36, 0.95) 0%, rgba(3, 16, 23, 0.98) 100%)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#FFFFFF' }}>
                  <Car size={20} color="var(--accent-gold)" /> My Garage (Saved Vehicles)
                </h3>
              </div>
            </div>

            {vehMsg && (
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>
                {vehMsg}
              </div>
            )}

            {/* Saved Vehicles Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {(currentUser.vehicles && currentUser.vehicles.length > 0 ? currentUser.vehicles : [
                { regNumber: 'WB-74-AX2026', brand: 'Hyundai', model: 'BMW', type: 'Sedan', totalVisits: 1 }
              ]).map((v, i) => (
                <div key={i} style={{
                  background: 'rgba(0, 31, 35, 0.6)',
                  border: '1px solid rgba(255, 195, 0, 0.25)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>
                      {v.regNumber}
                    </span>
                    <span className="badge badge-aqua" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {v.type || 'Sedan'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 600 }}>
                    {v.brand || 'Vehicle'} {v.model}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ice-tint)', borderTop: '1px solid rgba(74, 92, 106, 0.2)', paddingTop: '6px', marginTop: '4px' }}>
                    {v.totalVisits || 1} Wash Visits
                  </div>
                </div>
              ))}
            </div>

            {/* ADD VEHICLE FORM */}
            <form onSubmit={handleAddVehicle} style={{
              background: 'rgba(0, 20, 27, 0.6)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(74, 92, 106, 0.3)'
            }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 800, marginBottom: '10px' }}>
                + Add New Vehicle to My Garage
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                gap: '10px',
                alignItems: 'center'
              }}>
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
                <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '10px', width: '100%', height: '42px' }}>
                  <Plus size={16} /> Save to Garage
                </button>
              </div>
            </form>
          </div>

          <SectionDivider variant="cyan" icon="sparkle" badge="REFERRAL & REWARDS" spacing="default" />

          {/* REFERRAL SYSTEM & TRACKING */}
          <div className="glass-panel" style={{
            padding: 'clamp(16px, 3.5vw, 36px)',
            marginTop: '8px',
            marginBottom: '44px',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            background: 'linear-gradient(135deg, rgba(6, 26, 36, 0.95) 0%, rgba(3, 16, 23, 0.98) 100%)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '24px',
              alignItems: 'stretch'
            }}>
              {/* Left: Referral Code & Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0', lineHeight: 1.25 }}>
                    Refer Friends & Earn Free Washes!
                  </h3>

                  {/* 2 Benefit Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'rgba(0, 31, 35, 0.6)', padding: '12px 14px',
                      borderRadius: '10px', border: '1px solid rgba(0, 229, 255, 0.2)',
                      fontSize: '0.86rem'
                    }}>
                      <span style={{
                        background: 'var(--accent-cyan)', color: '#06141B',
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.8rem', flexShrink: 0
                      }}>1</span>
                      <span style={{ color: '#E2E8F0', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>Friend Gets:</strong> ₹100 Flat Discount on 1st Wash.
                      </span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'rgba(0, 31, 35, 0.6)', padding: '12px 14px',
                      borderRadius: '10px', border: '1px solid rgba(255, 195, 0, 0.2)',
                      fontSize: '0.86rem'
                    }}>
                      <span style={{
                        background: 'var(--accent-gold)', color: '#06141B',
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '0.8rem', flexShrink: 0
                      }}>2</span>
                      <span style={{ color: '#E2E8F0', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--accent-gold)' }}>You Earn:</strong> 50 Loyalty Points + ₹50 Wash Credit.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Referral Link Box & Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '6px 8px 6px 12px',
                    gap: '8px',
                    minWidth: 0
                  }}>
                    <span style={{
                      fontSize: '0.82rem',
                      color: 'var(--accent-cyan)',
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      minWidth: 0
                    }}>
                      {referralLink}
                    </span>
                    <button
                      onClick={copyReferral}
                      className="btn-primary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: '8px',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Copy size={13} /> {copiedCode ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <button
                    onClick={shareOnWhatsApp}
                    style={{
                      background: '#25D366',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                  >
                    <MessageCircle size={18} /> Share on WhatsApp
                  </button>
                </div>
              </div>

              {/* Right: Referral Live Tracking Table */}
              <div style={{
                background: 'rgba(0, 31, 35, 0.5)',
                padding: '20px 22px',
                borderRadius: '14px',
                border: '1px solid rgba(74, 92, 106, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid rgba(74, 92, 106, 0.25)'
                  }}>
                    <h4 style={{
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Users size={16} color="var(--accent-cyan)" /> My Referral Tracking
                    </h4>
                    <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                      {referralsList.length} Referred
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {referralsList.map((ref, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 14px',
                        background: 'rgba(6, 20, 27, 0.7)',
                        borderRadius: '10px',
                        border: '1px solid rgba(74, 92, 106, 0.25)'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.88rem' }}>{ref.friendName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8A99AD', marginTop: '2px' }}>{ref.date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${ref.status.includes('Completed') ? 'badge-aqua' : 'badge-terracotta'}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                            {ref.status}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 700 }}>{ref.rewardEarned}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SectionDivider variant="gold" icon="award" badge="VIP MEMBERSHIPS" spacing="default" />

          {/* TOAST ALERT */}
          {membershipToast && (
            <div style={{
              background: 'rgba(0, 210, 180, 0.2)',
              border: '1px solid var(--accent-aqua)',
              padding: '14px 20px',
              borderRadius: '12px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              fontSize: '0.92rem',
              boxShadow: '0 8px 30px rgba(0, 210, 180, 0.3)'
            }}>
              <Sparkles size={22} color="var(--accent-aqua)" />
              <strong>{membershipToast}</strong>
            </div>
          )}

          {/* MEMBERSHIP PLANS */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Monthly VIP Membership Passes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              Subscribe to unlimited car washes, exclusive detailing discounts & priority bay queue access.
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: '60px' }}>
            {(memberships.length > 0 ? memberships : defaultMemberships).map((m, i) => {
              const currentPrice = m.priceMonthly ?? (i === 0 ? 199 : i === 1 ? 299 : 449);
              const cutPrice = m.originalPrice ?? (i === 0 ? 249 : i === 1 ? 399 : 599);
              const isCurrentActivePlan = currentUser?.membershipStatus === m.name;

              return (
                <div key={i} className="glass-panel" style={{
                  padding: '28px 24px',
                  position: 'relative',
                  border: isCurrentActivePlan
                    ? '2px solid #25D366'
                    : m.isPopular
                      ? '2px solid var(--accent-cyan)'
                      : '1px solid rgba(74, 92, 106, 0.3)',
                  background: isCurrentActivePlan
                    ? 'rgba(0, 49, 53, 0.9)'
                    : m.isPopular
                      ? 'rgba(0, 49, 53, 0.85)'
                      : 'rgba(6, 26, 36, 0.7)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {isCurrentActivePlan ? (
                    <div style={{
                      position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                      background: '#25D366', color: '#06141B', padding: '3px 14px', borderRadius: '20px',
                      fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.04em'
                    }}>
                      ✓ YOUR ACTIVE PLAN
                    </div>
                  ) : m.isPopular ? (
                    <div style={{
                      position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--accent-cyan)', color: '#06141B', padding: '3px 14px', borderRadius: '20px',
                      fontWeight: 900, fontSize: '0.72rem', letterSpacing: '0.04em'
                    }}>
                      MOST POPULAR VIP
                    </div>
                  ) : null}

                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: '#FFFFFF' }}>{m.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.1rem', color: '#8A99AD', textDecoration: 'line-through', fontWeight: 600 }}>
                        ₹{cutPrice}
                      </span>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                        ₹{currentPrice}<span style={{ fontSize: '0.85rem', color: '#8A99AD', fontWeight: 500 }}>/mo</span>
                      </span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#CCD0CF' }}>
                      {(m.perks || m.features || []).map((f, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBuyMembershipModal({ ...m, priceMonthly: currentPrice, originalPrice: cutPrice })}
                    className={isCurrentActivePlan ? 'btn-secondary' : 'btn-primary'}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px',
                      fontWeight: 800,
                      borderRadius: '10px',
                      background: isCurrentActivePlan ? 'rgba(37, 211, 102, 0.2)' : 'var(--accent-aqua)',
                      color: isCurrentActivePlan ? '#25D366' : '#003135',
                      border: isCurrentActivePlan ? '1px solid #25D366' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {isCurrentActivePlan ? 'Renew / Extend Pass' : `Select ${m.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* BUY VIP MEMBERSHIP PASS MODAL */}
      {selectedPlanForBuy && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(6, 20, 27, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #003135 0%, #06212b 100%)',
            border: '1px solid var(--accent-aqua)',
            borderRadius: '18px',
            maxWidth: 'min(95vw, 460px)',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 'clamp(18px, 4vw, 28px)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 210, 180, 0.2)',
            color: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-aqua" style={{ fontSize: '0.7rem' }}>VIP MEMBERSHIP PASS</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 0 0' }}>{selectedPlanForBuy.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForBuy(null)}
                style={{ background: 'transparent', border: 'none', color: '#CCD0CF', fontSize: '22px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: 'rgba(0, 49, 53, 0.6)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ice-tint)', fontSize: '0.85rem' }}>Monthly Subscription:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-aqua)' }}>
                  ₹{selectedPlanForBuy.priceMonthly}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#CCD0CF' }}>
                Valid for 30 days &bull; Includes 150 VIP Bonus Loyalty Points
              </div>
            </div>

            <form onSubmit={handleConfirmBuyMembership} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={buyName}
                  onChange={(e) => setBuyName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                  Mobile Number (for VIP identification) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={buyPhone}
                  onChange={(e) => setBuyPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={buyEmail}
                  onChange={(e) => setBuyEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              {buyError && (
                <div style={{
                  background: 'rgba(224, 114, 90, 0.15)',
                  border: '1px solid #e0725a',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#e0725a',
                  fontSize: '0.78rem'
                }}>
                  {buyError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPlanForBuy(null)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={buyLoading}
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: 'var(--accent-aqua)',
                    color: '#003135',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: buyLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {buyLoading ? 'Processing...' : `Pay ₹${selectedPlanForBuy.priceMonthly} Online`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
