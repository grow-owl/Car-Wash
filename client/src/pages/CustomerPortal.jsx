import React, { useState, useEffect } from 'react';
import { Award, Gift, Share2, Shield, Star, Check, Copy, Sparkles, CreditCard, MessageCircle, Users, CheckCircle, Clock } from 'lucide-react';
import { getMemberships, getCustomerDetails, buyGiftCard } from '../api';

export default function CustomerPortal() {
  const [memberships, setMemberships] = useState([]);
  const [phoneInput, setPhoneInput] = useState('+91 8609504186');
  const [customerData, setCustomerData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Gift card state
  const [giftVal, setGiftVal] = useState(1000);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftSender, setGiftSender] = useState('');
  const [giftMsg, setGiftMsg] = useState('');

  // Sample referral list state
  const [referralsList, setReferralsList] = useState([
    { friendName: 'Rahul Sharma', phone: '+91 9800112211', date: '2026-08-20', status: 'Completed Wash', rewardEarned: '100 Pts + ₹150 Credit' },
    { friendName: 'Priya Mukherjee', phone: '+91 9831004455', date: '2026-08-22', status: 'Completed Wash', rewardEarned: '100 Pts + ₹150 Credit' },
    { friendName: 'Amit Verma', phone: '+91 9874558899', date: '2026-08-23', status: 'Joined (Pending 1st Wash)', rewardEarned: 'Pending' }
  ]);

  useEffect(() => {
    fetchMemberships();
    handleFetchCustomer();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await getMemberships();
      setMemberships(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchCustomer = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await getCustomerDetails(phoneInput);
      setCustomerData(res.data);
    } catch (err) {
      console.error('Customer CRM lookup error:', err);
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
      setGiftMsg(`Success! Digital Gift Card ${res.data.giftCard.code} (₹${giftVal}) sent to ${giftRecipient}`);
      setGiftRecipient('');
    } catch (err) {
      setGiftMsg('Failed to issue gift card.');
    }
  };

  const referralCode = "CARWASH-MARCUS88";
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

  const customer = customerData?.customer || {
    name: 'Marcus Vance',
    phone: '+91 8609504186',
    loyaltyPoints: 320,
    membershipStatus: 'Gold Detailer',
    totalBookings: 6,
    totalSpent: 12400
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge badge-aqua">CAR WASH VIP CLUB</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '6px' }}>Memberships, Loyalty & Referral Rewards</h1>
        <p style={{ color: 'var(--text-muted)' }}>Earn points on every wash, refer friends for ₹200 OFF & unlock VIP perks in Siliguri</p>
      </div>

      {/* CUSTOMER LOYALTY SUMMARY HEADER CARD */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', border: '1px solid var(--accent-aqua)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 800 }}>VIP CLUB MEMBER</div>
            <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginTop: '2px' }}>{customer.name}</h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Phone: {customer.phone}</div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', background: 'rgba(0, 49, 53, 0.8)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MY LOYALTY POINTS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{customer.loyaltyPoints} PTS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>Earn 10 pts per ₹100 spent</div>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(0, 49, 53, 0.8)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE MEMBERSHIP</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>{customer.membershipStatus}</div>
              <span className="badge badge-terracotta" style={{ marginTop: '4px' }}>Priority Bay Access</span>
            </div>
          </div>
        </div>

        {/* FREE WASH MILESTONE PROGRESS TRACKER */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px' }}>
            <span>Free Express Wash Milestone Tracker</span>
            <span style={{ color: 'var(--accent-aqua)' }}>320 / 350 PTS (Only 30 pts away from 1 Free Wash!)</span>
          </div>
          <div style={{ height: '12px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: '91%', height: '100%', background: 'linear-gradient(90deg, var(--accent-terracotta) 0%, var(--accent-aqua) 100%)' }} />
          </div>
        </div>
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
                background: 'var(--accent-aqua)', color: '#003135', padding: '4px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.75rem'
              }}>
                MOST POPULAR PERK
              </div>
            )}

            <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{m.name}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-aqua)', marginBottom: '18px' }}>
              ₹{m.priceMonthly} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ month</span>
            </div>

            <ul style={{ listStyle: 'none', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {m.perks.map((p, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} color="var(--accent-aqua)" /> {p}
                </li>
              ))}
            </ul>

            <button className={m.isPopular ? "btn-aqua" : "btn-secondary"} style={{ width: '100%', justifyContent: 'center' }}>
              Subscribe Pass
            </button>
          </div>
        ))}
      </div>

      {/* DIGITAL GIFT CARDS */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gift color="var(--accent-terracotta)" /> Purchase Digital Car Wash Gift Cards
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Gift your friends & family a premium car wash detailing experience in Siliguri. Delivered instantly via email.
        </p>

        <form onSubmit={handleBuyGiftCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[500, 1000, 2500, 5000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setGiftVal(val)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: giftVal === val ? 'var(--accent-aqua)' : 'rgba(0,49,53,0.8)',
                  color: giftVal === val ? '#003135' : 'var(--text-main)',
                  fontWeight: 800,
                  border: giftVal === val ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                  cursor: 'pointer'
                }}
              >
                ₹{val}
              </button>
            ))}
          </div>

          <input
            type="email"
            required
            placeholder="Recipient's Email Address *"
            value={giftRecipient}
            onChange={(e) => setGiftRecipient(e.target.value)}
            className="input-field"
          />

          <input
            type="text"
            required
            placeholder="Your Name (Sender) *"
            value={giftSender}
            onChange={(e) => setGiftSender(e.target.value)}
            className="input-field"
          />

          <button type="submit" className="btn-primary" style={{ padding: '14px', justifyContent: 'center' }}>
            <CreditCard size={18} /> Purchase ₹{giftVal} Gift Card
          </button>

          {giftMsg && (
            <div style={{ color: 'var(--accent-aqua)', fontWeight: 700, marginTop: '8px', fontSize: '0.9rem' }}>
              {giftMsg}
            </div>
          )}
        </form>
      </div>

    </div>
  );
}
