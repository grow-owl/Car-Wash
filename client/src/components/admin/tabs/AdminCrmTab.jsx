import React from 'react';
import { Crown, Sparkles, ShieldCheck, MessageSquare, History } from 'lucide-react';

export default function AdminCrmTab({
  crmSubTab,
  setCrmSubTab,
  customers = [],
  membershipSubscriptions = [],
  leads = [],
  coupons = [],
  handleOpenCustomerTimeline
}) {
  return (
    <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
      
      {/* Subtabs Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setCrmSubTab('customers')}
          style={{
            background: crmSubTab === 'customers' ? 'var(--accent-cyan)' : 'transparent',
            color: crmSubTab === 'customers' ? '#06141B' : '#CCD0CF',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setCrmSubTab('memberships')}
          style={{
            background: crmSubTab === 'memberships' ? 'var(--accent-gold)' : 'rgba(255, 195, 0, 0.08)',
            color: crmSubTab === 'memberships' ? '#06141B' : 'var(--accent-gold)',
            fontWeight: 800,
            fontSize: '0.82rem',
            border: crmSubTab === 'memberships' ? 'none' : '1px solid rgba(255, 195, 0, 0.3)',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Crown size={14} /> VIP Members ({membershipSubscriptions.length})
        </button>
        <button
          onClick={() => setCrmSubTab('leads')}
          style={{
            background: crmSubTab === 'leads' ? 'var(--accent-cyan)' : 'transparent',
            color: crmSubTab === 'leads' ? '#06141B' : '#CCD0CF',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Enquiries ({leads.length})
        </button>
      </div>

      {/* 1. CUSTOMERS SUB-TAB */}
      {crmSubTab === 'customers' && (
        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                <th style={{ padding: '10px 8px' }}>Name</th>
                <th style={{ padding: '10px 8px' }}>Phone</th>
                <th style={{ padding: '10px 8px' }}>Membership</th>
                <th style={{ padding: '10px 8px' }}>Visits</th>
                <th style={{ padding: '10px 8px' }}>Points</th>
                <th style={{ padding: '10px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const isVip = c.membershipTier && c.membershipTier.toLowerCase() !== 'regular' && c.membershipTier.toLowerCase() !== 'bronze';
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ice-tint)' }}>{c.phone}</td>
                    <td style={{ padding: '10px 8px' }}>
                      {isVip ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 195, 0, 0.15)',
                          color: 'var(--accent-gold)',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          border: '1px solid rgba(255, 195, 0, 0.3)'
                        }}>
                          <Crown size={12} /> {c.membershipTier}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--ice-tint)', fontSize: '0.75rem' }}>
                          Regular
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 8px' }}>{c.totalVisits || c.totalBookings || 1}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--accent-gold)' }}>{c.loyaltyPoints || 0} pts</td>
                    <td style={{ padding: '10px 8px' }}>
                      <button
                        onClick={() => handleOpenCustomerTimeline(c.phone, c.name)}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(0, 229, 255, 0.12)',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <History size={12} /> Wash History
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. VIP MEMBERSHIPS SUB-TAB */}
      {crmSubTab === 'memberships' && (
        <div>
          {/* VIP Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '12px',
            marginBottom: '18px'
          }}>
            <div style={{ background: 'rgba(255, 195, 0, 0.08)', border: '1px solid rgba(255, 195, 0, 0.3)', padding: '14px 16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={14} /> ACTIVE VIP MEMBERS
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
                {membershipSubscriptions.filter(s => s.status === 'active').length}
              </div>
            </div>

            <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '14px 16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> TOTAL VIP PASS REVENUE
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00E5FF', marginTop: '4px' }}>
                ₹{membershipSubscriptions.reduce((acc, s) => acc + (Number(s.price) || 0), 0)}
              </div>
            </div>

            <div style={{ background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '14px 16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#25D366', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> ALL-TIME PASS PURCHASES
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
                {membershipSubscriptions.length} Passes
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          {membershipSubscriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ice-tint)' }}>
              <Crown size={36} color="var(--accent-gold)" style={{ opacity: 0.6, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 700, color: '#FFFFFF' }}>No VIP Membership purchases yet.</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>When customers buy Silver, Gold, or Platinum passes from Customer Portal, they will show up here.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                    <th style={{ padding: '10px 8px' }}>Customer</th>
                    <th style={{ padding: '10px 8px' }}>Phone</th>
                    <th style={{ padding: '10px 8px' }}>Plan</th>
                    <th style={{ padding: '10px 8px' }}>Amount</th>
                    <th style={{ padding: '10px 8px' }}>Validity</th>
                    <th style={{ padding: '10px 8px' }}>Payment Mode</th>
                    <th style={{ padding: '10px 8px' }}>Payment ID</th>
                    <th style={{ padding: '10px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {membershipSubscriptions.map((sub) => {
                    const isExpired = sub.expiryDate && new Date(sub.expiryDate) < new Date();
                    const startDateStr = sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A';
                    const expiryDateStr = sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A';
                    
                    return (
                      <tr key={sub._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: '#FFFFFF' }}>
                          {sub.customerName}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--ice-tint)' }}>
                          <a
                            href={`https://wa.me/${(sub.phone || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                          >
                            <MessageSquare size={12} /> {sub.phone}
                          </a>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 195, 0, 0.12)',
                            border: '1px solid var(--accent-gold)',
                            color: 'var(--accent-gold)',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Crown size={12} /> {sub.membershipPlan}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 800, color: '#00E5FF' }}>
                          ₹{sub.price}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '0.78rem', color: 'var(--ice-tint)' }}>
                          <div>{startDateStr} - {expiryDateStr}</div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: sub.paymentMode === 'Online' ? 'var(--accent-cyan)' : '#FFFFFF' }}>
                            {sub.paymentMode || 'Online'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '0.72rem', color: 'var(--ice-tint)', fontFamily: 'monospace' }}>
                          {sub.razorpayPaymentId || sub.paymentStatus || 'Paid'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: !isExpired && sub.status === 'active' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(255, 89, 100, 0.15)',
                            color: !isExpired && sub.status === 'active' ? '#25D366' : '#FF5964',
                            border: !isExpired && sub.status === 'active' ? '1px solid #25D366' : '1px solid #FF5964'
                          }}>
                            {!isExpired && sub.status === 'active' ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. ENQUIRIES / LEADS SUB-TAB */}
      {crmSubTab === 'leads' && (
        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                <th style={{ padding: '8px' }}>Name</th>
                <th style={{ padding: '8px' }}>Phone</th>
                <th style={{ padding: '8px' }}>Service</th>
                <th style={{ padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((ld) => {
                const cleanPhone = ld.phone?.replace(/[^0-9]/g, '') || '';
                const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const promoCoupon = coupons.length > 0 ? coupons[0].code : 'FLAT100';
                const promoDiscount = coupons.length > 0 ? (coupons[0].discountValue || 100) : 100;
                const leadName = ld.name || ld.customerName || 'Valued Customer';
                const leadSvc = ld.service || ld.serviceName || 'Car Wash & Detailing Service';

                const promoMessage = `Dear ${leadName},\n\nThank you for reaching out to CAR WASH regarding ${leadSvc}.\n\nAs a welcome offer, you can use Coupon Code: ${promoCoupon} to avail flat Rs. ${promoDiscount} discount on your booking.\n\nPlease let us know your preferred date and time or reply to this message to reserve your slot.\n\nBest regards,\nCAR WASH Team`;
                const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(promoMessage)}`;
                const smsBody = `Dear ${leadName}, thank you for contacting CAR WASH for ${leadSvc}. Use coupon code ${promoCoupon} to get flat Rs. ${promoDiscount} OFF on your booking. Reply to confirm your slot. - CAR WASH Team`;
                const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(smsBody)}`;

                return (
                  <tr key={ld._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{leadName}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ice-tint)' }}>{ld.phone}</td>
                    <td style={{ padding: '10px 8px' }}>{leadSvc}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '5px 10px',
                            background: '#25D366',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>

                        <a
                          href={smsUrl}
                          style={{
                            padding: '5px 10px',
                            background: 'rgba(0, 229, 255, 0.15)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid var(--accent-cyan)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MessageSquare size={13} /> SMS / Msg
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
