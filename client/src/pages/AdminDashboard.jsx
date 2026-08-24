import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, DollarSign, Wrench, Send, TrendingUp, AlertTriangle, CheckCircle2, Plus, RefreshCw, MessageSquare, Tag, ShieldCheck } from 'lucide-react';
import { getAnalytics, getBookings, updateBookingStatus, createWalkInBooking, getCustomers, getStaff, getExpenses, addExpense, getAbandonedLeads, sendRecoveryOffer, getCoupons } from '../api';

export default function AdminDashboard({
  activeSubTab = 'analytics',
  setActiveSubTab,
  refreshTrigger = 0,
  showWalkInModal = false,
  setShowWalkInModal
}) {
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInVeh, setWalkInVeh] = useState('');
  const [walkInVehType, setWalkInVehType] = useState('Sedan');
  const [walkInService, setWalkInService] = useState('Express Exterior Wash');
  const [walkInAmount, setWalkInAmount] = useState(499);

  // New Expense State
  const [expCategory, setExpCategory] = useState('Water');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllAdminData();
  }, [activeSubTab, refreshTrigger]);

  const fetchAllAdminData = async () => {
    try {
      const [anaRes, bookRes, custRes, stfRes, expRes, abndRes, cpnRes] = await Promise.all([
        getAnalytics(),
        getBookings({ search: searchTerm }),
        getCustomers(),
        getStaff(),
        getExpenses(),
        getAbandonedLeads(),
        getCoupons()
      ]);
      setAnalytics(anaRes.data);
      setBookings(bookRes.data);
      setCustomers(custRes.data);
      setStaff(stfRes.data);
      setExpenses(expRes.data);
      setAbandonedLeads(abndRes.data);
      setCoupons(cpnRes.data);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, { status: newStatus });
      fetchAllAdminData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWalkInBooking({
        customerName: walkInName || 'Walk-in Customer',
        phone: walkInPhone || '+91 8609504186',
        vehicleNumber: walkInVeh,
        vehicleType: walkInVehType,
        serviceName: walkInService,
        totalAmount: Number(walkInAmount)
      });
      if (setShowWalkInModal) setShowWalkInModal(false);
      setWalkInVeh('');
      fetchAllAdminData();
    } catch (err) {
      alert('Error registering walk-in');
    }
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expAmount) return;
    try {
      await addExpense({
        category: expCategory,
        amount: Number(expAmount),
        date: new Date().toISOString().split('T')[0],
        notes: expNotes
      });
      setExpAmount('');
      setExpNotes('');
      fetchAllAdminData();
    } catch (err) {
      alert('Error adding expense');
    }
  };

  const handleTriggerRecovery = async (id) => {
    try {
      const res = await sendRecoveryOffer(id);
      alert(res.data.message);
      fetchAllAdminData();
    } catch (err) {
      alert('Error sending recovery offer');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '80px' }}>
      
      {/* TAB 1: ANALYTICS & PROFIT CENTER */}
      {activeSubTab === 'analytics' && analytics && (
        <div>
          {/* Top KPI Metrics Cards */}
          <div className="grid-4" style={{ marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL GROSS REVENUE</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-aqua)', marginTop: '4px' }}>
                ₹{analytics.totalRevenue}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
                {analytics.totalBookingsCount} Total Bookings
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL OPERATIONAL EXPENSES</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#e0725a', marginTop: '4px' }}>
                ₹{analytics.totalExpenses}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Water, Rent, Chemicals & Salary
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', border: '2px solid var(--accent-aqua)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)' }}>NET PROFIT (REVENUE - EXPENSES)</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                ₹{analytics.netProfit}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-aqua)', marginTop: '4px' }}>
                Margin: {analytics.totalRevenue > 0 ? ((analytics.netProfit / analytics.totalRevenue) * 100).toFixed(1) : 0}% Profit Rate
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVERAGE ORDER VALUE (AOV)</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ice-tint)', marginTop: '4px' }}>
                ₹{analytics.averageOrderValue}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Driven by Smart Upselling
              </div>
            </div>
          </div>

          {/* Analytics Charts & Summaries */}
          <div className="grid-2" style={{ gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Expense Breakdown by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(analytics.expenseBreakdown || {}).map(([cat, amt]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,49,53,0.5)', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: '#e0725a', fontWeight: 700 }}>₹{amt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Most Profitable Services</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(analytics.servicePopularity || {}).map(([svc, count]) => (
                  <div key={svc} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,49,53,0.5)', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{svc}</span>
                    <span className="badge badge-aqua">{count} Bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKING & BAY MANAGEMENT */}
      {activeSubTab === 'bookings' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem' }}>All Live Bay Appointments ({bookings.length})</h3>
            <input
              type="text"
              placeholder="Search by customer, phone, code or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ maxWidth: '340px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--ice-tint)' }}>
                  <th style={{ padding: '12px' }}>Code</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Vehicle</th>
                  <th style={{ padding: '12px' }}>Service</th>
                  <th style={{ padding: '12px' }}>Bay / Staff</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status Control</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(175, 221, 229, 0.1)' }}>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent-aqua)' }}>{b.trackingCode}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.phone}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{b.vehicleNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.vehicleType}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{b.serviceName}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>{b.bayAssigned}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.staffAssigned}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{b.totalAmount}</td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className="input-field"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="received">Vehicle Received</option>
                        <option value="washing">High Pressure Wash</option>
                        <option value="detailing">Interior & Detailing</option>
                        <option value="quality_check">Quality Check</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER CRM */}
      {activeSubTab === 'crm' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Customer CRM & Vehicle Lifetime Spent</h3>
          <div className="grid-3">
            {customers.map((c, i) => (
              <div key={i} style={{ background: 'rgba(0,49,53,0.8)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF' }}>{c.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{c.phone}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <span>Total Spent:</span> <strong style={{ color: 'var(--accent-aqua)' }}>₹{c.totalSpent}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginTop: '4px' }}>
                  <span>Total Visits:</span> <strong>{c.totalBookings}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginTop: '4px' }}>
                  <span>Membership:</span> <span className="badge badge-terracotta">{c.membershipStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF MANAGEMENT */}
      {activeSubTab === 'staff' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Detailing Staff Profiles & Workload</h3>
          <div className="grid-4">
            {staff.map((st, i) => (
              <div key={i} style={{ background: 'rgba(0,49,53,0.8)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{st.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-aqua)', marginBottom: '8px' }}>{st.role}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⭐ Rating: <strong>{st.rating} / 5.0</strong></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Jobs: <strong>{st.completedJobs}</strong></div>
                <span className={`badge ${st.status === 'On Job' ? 'badge-terracotta' : 'badge-aqua'}`} style={{ marginTop: '10px' }}>
                  {st.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPENSE TRACKER */}
      {activeSubTab === 'expenses' && (
        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Add New Operational Expense</h3>
            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Expense Category</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="input-field">
                  <option value="Water">Water Utilities</option>
                  <option value="Electricity">Electricity Power</option>
                  <option value="Chemicals">Soaps & Ceramic Chemicals</option>
                  <option value="Salary">Staff Payroll Salary</option>
                  <option value="Rent">Bay Lease Rent</option>
                  <option value="Equipment">Equipment Maintenance</option>
                  <option value="Marketing">Marketing & Ad Spend</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Amount (₹)</label>
                <input type="number" required placeholder="Amount in INR" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="input-field" />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Notes</label>
                <input type="text" placeholder="Details/Invoice note..." value={expNotes} onChange={(e) => setExpNotes(e.target.value)} className="input-field" />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Log Expense</button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Recent Logged Expenses</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {expenses.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,49,53,0.5)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{e.category}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.notes || 'Routine cost'}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#e0725a' }}>-₹{e.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MARKETING & ABANDONED RECOVERY */}
      {activeSubTab === 'marketing' && (
        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Abandoned Booking Recovery Leads ({abandonedLeads.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {abandonedLeads.map(lead => (
                <div key={lead._id} style={{ padding: '14px', background: 'rgba(0,49,53,0.6)', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{lead.customerName} ({lead.phone})</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vehicle: {lead.vehicleType} • {lead.selectedService}</div>
                  </div>
                  <button onClick={() => handleTriggerRecovery(lead._id)} className="btn-aqua" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Send SMS 15% Off
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Active Promotional Coupons</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coupons.map(cpn => (
                <div key={cpn._id} style={{ padding: '14px', background: 'rgba(0,49,53,0.6)', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-aqua)', fontSize: '1.1rem' }}>{cpn.code}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cpn.description}</div>
                  </div>
                  <span className="badge badge-terracotta">{cpn.discountType === 'percent' ? `${cpn.value}% OFF` : `₹${cpn.value} OFF`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAST WALK-IN MODAL */}
      {showWalkInModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,31,35,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '28px', border: '1px solid var(--accent-aqua)' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Register Walk-in Customer</h3>
            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Customer Name" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="input-field" />
              <input type="text" placeholder="Phone Number" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} className="input-field" />
              <input type="text" required placeholder="Vehicle Reg. Number *" value={walkInVeh} onChange={(e) => setWalkInVeh(e.target.value)} className="input-field" />
              <select value={walkInVehType} onChange={(e) => setWalkInVehType(e.target.value)} className="input-field">
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Luxury">Luxury</option>
              </select>
              <select value={walkInService} onChange={(e) => setWalkInService(e.target.value)} className="input-field">
                <option value="Express Exterior Wash">Express Exterior Wash (₹499)</option>
                <option value="Ultimate Hydro-Polishing">Ultimate Hydro-Polishing (₹1,299)</option>
                <option value="Deep Interior Spa">Deep Interior Spa (₹2,499)</option>
              </select>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowWalkInModal && setShowWalkInModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Register Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
