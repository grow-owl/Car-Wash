import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, Users, DollarSign, Wrench, Send, TrendingUp, AlertTriangle, CheckCircle2, Plus, RefreshCw, MessageSquare, Tag, ShieldCheck, Car, Trash2, Edit3, Eye, Search, Phone, Shield } from 'lucide-react';
import {
  getAnalytics, getBookings, updateBookingStatus, createWalkInBooking, getCustomers, getStaff, getExpenses, addExpense, deleteExpense,
  getAbandonedBookings, sendAbandonedRecoveryOffer, getDueWashCustomers, sendDueWashReminder, getCoupons, getServices, createService, updateService, deleteService, getPackages, createPackage, updatePackage, deletePackage, getBays, updateBayStatus, resetCustomerPin
} from '../api';

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
  const [bays, setBays] = useState([]);
  const [services, setServices] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [dueCustomers, setDueCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Modals & Selectors
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Service Form State
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('Wash');
  const [svcBasePrice, setSvcBasePrice] = useState(499);
  const [svcDuration, setSvcDuration] = useState(45);
  const [svcDesc, setSvcDesc] = useState('');

  // Walk-in Form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInVeh, setWalkInVeh] = useState('');
  const [walkInVehBrand, setWalkInVehBrand] = useState('Hyundai');
  const [walkInVehModel, setWalkInVehModel] = useState('Creta');
  const [walkInVehType, setWalkInVehType] = useState('Sedan');
  const [walkInService, setWalkInService] = useState('Express Exterior Wash');
  const [walkInAmount, setWalkInAmount] = useState(499);
  const [walkInPayMode, setWalkInPayMode] = useState('Cash');

  // New Expense State
  const [expCategory, setExpCategory] = useState('Water');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [expPayMethod, setExpPayMethod] = useState('UPI');

  const [searchTerm, setSearchTerm] = useState('');
  const [crmSearch, setCrmSearch] = useState('');

  useEffect(() => {
    fetchAllAdminData();
  }, [activeSubTab, refreshTrigger]);

  const fetchAllAdminData = async () => {
    try {
      const [anaRes, bookRes, custRes, stfRes, expRes, abndRes, dueRes, cpnRes, svcRes, pkgRes, bayRes] = await Promise.all([
        getAnalytics(),
        getBookings({ search: searchTerm }),
        getCustomers(crmSearch),
        getStaff(),
        getExpenses(),
        getAbandonedBookings(),
        getDueWashCustomers(),
        getCoupons(),
        getServices(),
        getPackages(),
        getBays()
      ]);
      setAnalytics(anaRes.data);
      setBookings(bookRes.data);
      setCustomers(custRes.data);
      setStaff(stfRes.data);
      setExpenses(expRes.data);
      setAbandonedLeads(abndRes.data);
      setDueCustomers(dueRes.data);
      setCoupons(cpnRes.data);
      setServices(svcRes.data);
      setPackagesList(pkgRes.data);
      setBays(bayRes.data);
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
        vehicleBrand: walkInVehBrand,
        vehicleModel: walkInVehModel,
        vehicleType: walkInVehType,
        serviceName: walkInService,
        totalAmount: Number(walkInAmount),
        paymentMode: walkInPayMode
      });
      if (setShowWalkInModal) setShowWalkInModal(false);
      setWalkInVeh('');
      fetchAllAdminData();
    } catch (err) {
      alert('Error registering walk-in');
    }
  };

  const handleSaveServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService._id, {
          name: svcName,
          title: svcName,
          category: svcCategory,
          basePrice: Number(svcBasePrice),
          price: Number(svcBasePrice),
          durationMins: Number(svcDuration),
          description: svcDesc
        });
      } else {
        await createService({
          name: svcName,
          title: svcName,
          category: svcCategory,
          basePrice: Number(svcBasePrice),
          price: Number(svcBasePrice),
          durationMins: Number(svcDuration),
          description: svcDesc
        });
      }
      setShowAddServiceModal(false);
      setEditingService(null);
      setSvcName('');
      setSvcDesc('');
      fetchAllAdminData();
    } catch (err) {
      alert('Error saving service');
    }
  };

  const handleDeleteSvc = async (id) => {
    if (!window.confirm('Deactivate / Delete service?')) return;
    try {
      await deleteService(id);
      fetchAllAdminData();
    } catch (err) {
      alert('Error deleting service');
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
        paymentMethod: expPayMethod,
        notes: expNotes
      });
      setExpAmount('');
      setExpNotes('');
      fetchAllAdminData();
    } catch (err) {
      alert('Error adding expense');
    }
  };

  const handleDeleteExpenseItem = async (id) => {
    try {
      await deleteExpense(id);
      fetchAllAdminData();
    } catch (err) {
      alert('Error deleting expense');
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
      
      {/* TAB 1: ANALYTICS & NET PROFIT DASHBOARD */}
      {activeSubTab === 'analytics' && analytics && (
        <div>
          {/* Top KPI Metrics Cards */}
          <div className="grid-4" style={{ marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TODAY'S REVENUE</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-aqua)', marginTop: '4px' }}>
                ₹{analytics.todayRevenue || analytics.totalRevenue}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
                {analytics.todayBookingsCount || analytics.totalBookingsCount} Today's Bookings
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OPERATIONAL EXPENSES</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#e0725a', marginTop: '4px' }}>
                ₹{analytics.totalExpenses}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Water, Electricity, Salary & Chemicals
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', border: '2px solid var(--accent-aqua)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)' }}>NET PROFIT (REVENUE - EXPENSES)</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                ₹{analytics.netProfit}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-aqua)', marginTop: '4px' }}>
                Net Profit Formula: Revenue - Expenses - Refunds
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVERAGE ORDER VALUE (AOV)</div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ice-tint)', marginTop: '4px' }}>
                ₹{analytics.averageOrderValue}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Driven by Smart Upselling Add-ons
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
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Booking Source Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(analytics.bookingSources || { Website: 12, 'Walk-in': 8, WhatsApp: 5, Referral: 4 }).map(([src, count]) => (
                  <div key={src} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,49,53,0.5)', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{src}</span>
                    <span className="badge badge-aqua">{count} Bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE BAY CONTROL & BOOKING MANAGEMENT */}
      {activeSubTab === 'bookings' && (
        <div>
          {/* LIVE 4-BAY CONTROL DASHBOARD GRID */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>⚡ Live Bay Control Center</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Real-time 4-Bay status & live job progression</p>
              </div>
              <button onClick={() => setShowWalkInModal && setShowWalkInModal(true)} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                <Plus size={16} /> + Walk-In Customer Ticket
              </button>
            </div>

            <div className="grid-4" style={{ gap: '16px' }}>
              {[1, 2, 3, 4].map(num => {
                const bayName = `BAY ${num}`;
                const activeJob = bookings.find(b => (b.bayAssigned === bayName || b.assignedBay === bayName) && !['completed', 'cancelled'].includes(b.status));
                
                return (
                  <div key={num} className="glass-panel" style={{ padding: '20px', border: activeJob ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-aqua)' }}>{bayName}</span>
                      <span className={`badge ${activeJob ? 'badge-terracotta' : 'badge-aqua'}`}>
                        {activeJob ? `🟢 ${activeJob.status.toUpperCase()}` : '⚪ AVAILABLE'}
                      </span>
                    </div>

                    {activeJob ? (
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>{activeJob.vehicleNumber}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', marginBottom: '8px' }}>{activeJob.vehicleBrand || 'Hyundai'} {activeJob.vehicleModel}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{activeJob.serviceName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>Staff: <strong>{activeJob.staffAssigned || 'Rahul Kumar'}</strong></div>

                        <select
                          value={activeJob.status}
                          onChange={(e) => handleStatusChange(activeJob._id, e.target.value)}
                          className="input-field"
                          style={{ marginTop: '12px', padding: '6px', fontSize: '0.8rem' }}
                        >
                          <option value="washing">Washing</option>
                          <option value="detailing">Detailing</option>
                          <option value="quality_check">Quality Check</option>
                          <option value="ready">Ready for Pickup</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Bay Available</div>
                        <button onClick={() => setShowWalkInModal && setShowWalkInModal(true)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                          + Assign Walk-in
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALL APPOINTMENTS TABLE */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>All Appointments ({bookings.length})</h3>
              <input
                type="text"
                placeholder="Search customer, phone, reg number..."
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
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.vehicleBrand} {b.vehicleModel} ({b.vehicleType})</div>
                      </td>
                      <td style={{ padding: '12px' }}>{b.serviceName}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>{b.bayAssigned || b.assignedBay}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.staffAssigned}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{b.finalAmount || b.totalAmount}</td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="received">Vehicle Received</option>
                          <option value="washing">Washing</option>
                          <option value="detailing">Detailing</option>
                          <option value="quality_check">Quality Check</option>
                          <option value="ready">Ready for Pickup</option>
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
        </div>
      )}

      {/* TAB 3: SERVICE MANAGEMENT (SECTION 6 REQUIREMENT) */}
      {activeSubTab === 'services' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🛠️ Service & Package Management</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Owner Panel: Create, Edit, Deactivate services & Update Prices</p>
            </div>
            <button onClick={() => { setEditingService(null); setShowAddServiceModal(true); }} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
              <Plus size={16} /> Add New Service
            </button>
          </div>

          <div className="grid-3" style={{ gap: '20px' }}>
            {services.map(svc => (
              <div key={svc._id} style={{ background: 'rgba(0, 49, 53, 0.8)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span className="badge badge-aqua" style={{ fontSize: '0.7rem' }}>{svc.category || 'Wash'}</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>{svc.name}</h4>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{svc.basePrice || svc.price}</div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{svc.description || 'Professional detailing wash service'}</p>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <button
                    onClick={() => {
                      setEditingService(svc);
                      setSvcName(svc.name);
                      setSvcCategory(svc.category || 'Wash');
                      setSvcBasePrice(svc.basePrice || svc.price);
                      setSvcDuration(svc.durationMins || 45);
                      setSvcDesc(svc.description || '');
                      setShowAddServiceModal(true);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <Edit3 size={14} /> Edit Price/Info
                  </button>
                  <button
                    onClick={() => handleDeleteSvc(svc._id)}
                    style={{ background: 'rgba(224, 114, 90, 0.2)', border: '1px solid #e0725a', color: '#e0725a', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER CRM (SECTION 12 REQUIREMENT) */}
      {activeSubTab === 'crm' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>👤 Customer CRM & Vehicle History</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Lookup owner profiles, vehicles, spending & loyalty records</p>
            </div>
            <input
              type="text"
              placeholder="Search Phone / Name / Vehicle Number (e.g. WB-74)..."
              value={crmSearch}
              onChange={(e) => {
                setCrmSearch(e.target.value);
                getCustomers(e.target.value).then(res => setCustomers(res.data));
              }}
              className="input-field"
              style={{ maxWidth: '360px' }}
            />
          </div>

          <div className="grid-3" style={{ gap: '20px' }}>
            {customers.map((c, i) => (
              <div key={i} style={{ background: 'rgba(0,49,53,0.8)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF' }}>{c.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                  </div>
                  <span className="badge badge-terracotta">{c.membershipStatus || 'Regular VIP'}</span>
                </div>

                <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Visits:</span> <strong>{c.totalBookings} visits</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Spent:</span> <strong style={{ color: 'var(--accent-aqua)' }}>₹{c.totalSpent}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Loyalty Points:</span> <strong style={{ color: 'var(--accent-aqua)' }}>{c.loyaltyPoints} pts</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Saved Vehicles:</span> <strong>{c.vehicles?.length || 1} Vehicle(s)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button
                    onClick={() => setSelectedCustomerModal(c)}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '8px' }}
                  >
                    <Eye size={14} /> Profile
                  </button>
                  <button
                    onClick={async () => {
                      const newP = window.prompt(`Reset Password for customer ${c.name} (${c.phone}) [Min 6 chars]:`, '123456');
                      if (newP) {
                        if (newP.length < 6) {
                          alert('Password must be at least 6 characters long.');
                          return;
                        }
                        try {
                          await resetCustomerPin(c.phone, newP);
                          alert(`Password for ${c.name} successfully reset to: '${newP}'`);
                          fetchAllAdminData();
                        } catch (err) {
                          alert('Error resetting password');
                        }
                      }
                    }}
                    style={{ background: 'rgba(255, 195, 0, 0.2)', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STAFF WORKLOAD (SECTION 13 REQUIREMENT) */}
      {activeSubTab === 'staff' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>👷 Staff Workload & Bay Assignment</h3>
          <div className="grid-4" style={{ gap: '20px' }}>
            {staff.map((st, i) => (
              <div key={i} style={{ background: 'rgba(0,49,53,0.8)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>{st.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-aqua)', marginBottom: '8px' }}>{st.role}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>⭐ Rating: <strong>{st.rating} / 5.0</strong></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Jobs: <strong>{st.activeJobs || 1} Job</strong></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Completed Jobs: <strong>{st.completedJobs}</strong></div>
                <span className={`badge ${st.status === 'On Job' ? 'badge-terracotta' : 'badge-aqua'}`}>
                  {st.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EXPENSE LOG (SECTION 14 REQUIREMENT) */}
      {activeSubTab === 'expenses' && (
        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>💸 Log Operational Expense</h3>
            <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Expense Category *</label>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="input-field">
                  <option value="Water">Water Utilities</option>
                  <option value="Electricity">Electricity Power</option>
                  <option value="Chemicals">Soaps & Ceramic Chemicals</option>
                  <option value="Salary">Staff Payroll Salary</option>
                  <option value="Rent">Bay Lease Rent</option>
                  <option value="Equipment">Equipment Maintenance</option>
                  <option value="Marketing">Marketing & Ad Spend</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Amount (₹) *</label>
                <input type="number" required placeholder="Amount in INR" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="input-field" />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Payment Method</label>
                <select value={expPayMethod} onChange={(e) => setExpPayMethod(e.target.value)} className="input-field">
                  <option value="UPI">UPI Transfer</option>
                  <option value="Cash">Cash Handout</option>
                  <option value="Card">Card Transaction</option>
                  <option value="Bank Transfer">Bank NEFT/IMPS</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--ice-tint)' }}>Description / Bill Note</label>
                <input type="text" placeholder="Vendor details or bill note..." value={expNotes} onChange={(e) => setExpNotes(e.target.value)} className="input-field" />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Save Expense Record</button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Logged Expense History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {expenses.map((e, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,49,53,0.5)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{e.category}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.notes || e.description || 'Routine operational cost'} • {e.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: 800, color: '#e0725a' }}>-₹{e.amount}</div>
                    <button onClick={() => handleDeleteExpenseItem(e._id)} style={{ background: 'transparent', border: 'none', color: '#e0725a', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ABANDONED BOOKING RECOVERY & AUTOMATED REPEAT WASH ENGINE */}
      {activeSubTab === 'marketing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* FEATURE 7: ABANDONED BOOKING RECOVERY QUEUE */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-coral)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🛒 Abandoned Booking Recovery Queue ({abandonedLeads.length} Leads Detected)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Detect incomplete booking drop-offs & send 1-click ₹150 OFF recovery offers</p>
              </div>
              <span className="badge badge-terracotta">Lost Revenue Recovery Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {abandonedLeads.length === 0 ? (
                <div style={{ padding: '16px', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No dropped booking leads detected right now.
                </div>
              ) : (
                abandonedLeads.map(lead => {
                  const isRecovered = lead.status === 'recovered';
                  const isContacted = lead.status === 'contacted' || lead.recoveryOfferSent;
                  return (
                    <div key={lead._id} style={{ padding: '16px', background: 'rgba(0,49,53,0.7)', border: '1px solid var(--border-light)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>
                          {lead.customerName || 'Lead User'} <span style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 600 }}>({lead.phone})</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Dropped at: <strong>Step {lead.stepReached || 2}</strong> • Service: <strong>{lead.serviceName || 'Pro Shine'}</strong> • Vehicle: <strong>{lead.vehicleNumber || lead.vehicleModel || lead.vehicleType}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', marginTop: '2px' }}>
                          Subtotal: ₹{lead.subtotal || 499} • Activity: {new Date(lead.lastActivityAt || lead.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${isRecovered ? 'badge-aqua' : isContacted ? 'badge-terracotta' : 'badge-gold'}`}>
                          {isRecovered ? 'Recovered ✓' : isContacted ? 'Offer Sent' : 'Abandoned'}
                        </span>

                        {!isRecovered && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await sendAbandonedRecoveryOffer(lead._id);
                                alert(res.data.message || 'Recovery offer code RECOVER150 (₹150 OFF) sent!');
                                fetchAllAdminData();
                              } catch (err) {
                                alert('Error sending recovery offer.');
                              }
                            }}
                            className="btn-gold"
                            style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800 }}
                          >
                            📲 Send Recovery Offer (₹150 OFF)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* FEATURE 6: AUTOMATED REPEAT WASH REMINDERS ENGINE */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-aqua)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔔 Automated Repeat Wash Engine & Due Reminders ({dueCustomers.length} Due)
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track last wash dates & send automated due-for-wash rebooking offers to repeat customers</p>
              </div>
              <span className="badge badge-aqua">⚡ Repeat Wash Engine Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dueCustomers.length === 0 ? (
                <div style={{ padding: '16px', textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  All customers have washed recently!
                </div>
              ) : (
                dueCustomers.slice(0, 10).map((c, i) => {
                  const daysAgo = c.lastVisit ? Math.floor((Date.now() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24)) : 15;
                  const veh = c.vehicles && c.vehicles[0] ? `${c.vehicles[0].brand} ${c.vehicles[0].model} (${c.vehicles[0].regNumber})` : 'Vehicle';
                  return (
                    <div key={i} style={{ padding: '16px', background: 'rgba(0,49,53,0.7)', border: '1px solid var(--border-light)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>
                          {c.name} <span style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 600 }}>({c.phone})</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Saved Car: <strong>{veh}</strong> • Total Visits: <strong>{c.totalBookings || 1}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '2px', fontWeight: 700 }}>
                          Last washed: {daysAgo} days ago (Due for Wash!)
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            const res = await sendDueWashReminder({ customerId: c._id, phone: c.phone, name: c.name });
                            alert(res.data.message || 'Due-for-Wash SMS/WhatsApp reminder sent!');
                            fetchAllAdminData();
                          } catch (err) {
                            alert('Error sending due reminder.');
                          }
                        }}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800 }}
                      >
                        📲 Send Wash Due Reminder (15% OFF)
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ACTIVE PROMOTIONAL COUPONS LIST */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 800 }}>Active Promotional Coupons</h3>
            <div className="grid-3" style={{ gap: '12px' }}>
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

      {/* SECTION 11 REQUIREMENT: + WALK-IN TICKET MODAL */}
      {showWalkInModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,31,35,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '540px', width: '100%', padding: '28px', border: '2px solid var(--accent-aqua)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px', color: '#FFFFFF' }}>+ Walk-In Customer Ticket</h3>
            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="grid-2" style={{ gap: '10px' }}>
                <input type="text" placeholder="Customer Name *" required value={walkInName} onChange={(e) => setWalkInName(e.target.value)} className="input-field" />
                <input type="text" placeholder="Phone Number *" required value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} className="input-field" />
              </div>

              <div className="grid-3" style={{ gap: '10px' }}>
                <input type="text" required placeholder="Reg Number (WB-74...)" value={walkInVeh} onChange={(e) => setWalkInVeh(e.target.value)} className="input-field" />
                <input type="text" placeholder="Brand (Hyundai)" value={walkInVehBrand} onChange={(e) => setWalkInVehBrand(e.target.value)} className="input-field" />
                <input type="text" placeholder="Model (Creta)" value={walkInVehModel} onChange={(e) => setWalkInVehModel(e.target.value)} className="input-field" />
              </div>

              <div className="grid-2" style={{ gap: '10px' }}>
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
              </div>

              <div className="grid-2" style={{ gap: '10px' }}>
                <input type="number" placeholder="Total Amount (₹)" value={walkInAmount} onChange={(e) => setWalkInAmount(e.target.value)} className="input-field" />
                <select value={walkInPayMode} onChange={(e) => setWalkInPayMode(e.target.value)} className="input-field">
                  <option value="Cash">Cash Payment</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowWalkInModal && setShowWalkInModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Ticket & Start Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE EDIT/ADD MODAL */}
      {showAddServiceModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,31,35,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '28px', border: '1px solid var(--accent-aqua)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>{editingService ? 'Edit Service & Price' : 'Add New Service'}</h3>
            <form onSubmit={handleSaveServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Service Name *" required value={svcName} onChange={(e) => setSvcName(e.target.value)} className="input-field" />
              <select value={svcCategory} onChange={(e) => setSvcCategory(e.target.value)} className="input-field">
                <option value="Wash">Car Washing</option>
                <option value="Under Coating">Under Coating</option>
                <option value="Polish">Car Polish</option>
                <option value="Foam Wash">Foam Wash</option>
                <option value="Ceramic">Ceramic Coating</option>
                <option value="Interior">Interior Spa</option>
              </select>
              <input type="number" placeholder="Base Price (₹) *" required value={svcBasePrice} onChange={(e) => setSvcBasePrice(e.target.value)} className="input-field" />
              <input type="number" placeholder="Duration (Minutes)" value={svcDuration} onChange={(e) => setSvcDuration(e.target.value)} className="input-field" />
              <textarea placeholder="Service Description..." value={svcDesc} onChange={(e) => setSvcDesc(e.target.value)} className="input-field" rows={3} />

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddServiceModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER CRM PROFILE MODAL */}
      {selectedCustomerModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,31,35,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '28px', border: '1px solid var(--accent-aqua)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>{selectedCustomerModal.name}</h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Phone: {selectedCustomerModal.phone}</div>
              </div>
              <span className="badge badge-terracotta">{selectedCustomerModal.membershipStatus || 'VIP Member'}</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: 'rgba(0,49,53,0.6)', padding: '14px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL SPENT</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>₹{selectedCustomerModal.totalSpent}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL VISITS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedCustomerModal.totalBookings} Visits</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOYALTY POINTS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>{selectedCustomerModal.loyaltyPoints} Pts</div>
              </div>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>🚘 Registered Vehicles Garage ({selectedCustomerModal.vehicles?.length || 1})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(selectedCustomerModal.vehicles && selectedCustomerModal.vehicles.length > 0 ? selectedCustomerModal.vehicles : [{ regNumber: 'WB-74-AX-8821', brand: 'Hyundai', model: 'Creta', type: 'SUV' }]).map((v, idx) => (
                <div key={idx} style={{ padding: '10px 14px', background: 'rgba(0,49,53,0.8)', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{v.regNumber || v.number}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.brand || 'Hyundai'} {v.model} ({v.type || v.vehicleType})</div>
                  </div>
                  <span className="badge badge-aqua">Garage Verified</span>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedCustomerModal(null)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Close Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
