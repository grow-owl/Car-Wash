import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, MessageSquare, Trash2, X, Eye, EyeOff, Lock, TrendingUp, DollarSign,
  Upload, Image, Loader2, Calendar, Clock, Download, History, User, Car, Filter,
  ArrowUpDown, CheckCircle2, ShieldCheck, Tag, Info, Phone, ExternalLink, RefreshCw
} from 'lucide-react';
import {
  getAnalytics, getBookings, updateBookingStatus, createWalkInBooking, deleteBooking,
  getCustomers, getStaff, createStaff, updateStaff, deleteStaff, getExpenses, addExpense, deleteExpense,
  getCoupons, createCoupon, deleteCoupon, 
  getServices, createService, updateService, deleteService, uploadServiceImage,
  getBays, updateBayStatus, getLeads, getCustomerTimeline
} from '../api';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';

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
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [leads, setLeads] = useState([]);

  // Internal Sub-tabs
  const [crmSubTab, setCrmSubTab] = useState('customers');
  const [serviceSubTab, setServiceSubTab] = useState('services');
  const [expenseSubTab, setExpenseSubTab] = useState('expenses');
  const [showFinancialFigures, setShowFinancialFigures] = useState(false);

  // Advanced Filters, Date Ranges & Sorting
  const [bookingFilter, setBookingFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | 'month' | '6months' | '1year' | '2years' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOption, setSortOption] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'name_asc'
  const [searchTerm, setSearchTerm] = useState('');

  // Customer Lifetime History Modal (2-Year Wash Explorer)
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Modals
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // MINIMAL DELETE CONFIRMATION POPUP STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Delete Item?',
    itemName: '',
    onConfirm: null
  });

  const openDeleteConfirm = (title, itemName, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      title,
      itemName,
      onConfirm
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmModal({
      isOpen: false,
      title: 'Delete Item?',
      itemName: '',
      onConfirm: null
    });
  };

  const executeDelete = async () => {
    if (confirmModal.onConfirm) {
      await confirmModal.onConfirm();
    }
    closeDeleteConfirm();
  };

  // Forms
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInVeh, setWalkInVeh] = useState('');
  const [walkInVehType, setWalkInVehType] = useState('Sedan');
  const [walkInService, setWalkInService] = useState('Express Foam Wash');
  const [walkInAmount, setWalkInAmount] = useState(299);
  const [walkInPayMode, setWalkInPayMode] = useState('Cash');

  // Expense form
  const [expCategory, setExpCategory] = useState('Supplies');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Service form
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('Wash');
  const [svcBasePrice, setSvcBasePrice] = useState(499);
  const [svcImage, setSvcImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Coupon form
  const [cpnCode, setCpnCode] = useState('');
  const [cpnValue, setCpnValue] = useState(100);
  const [cpnMinOrder, setCpnMinOrder] = useState(499);

  // Staff Form State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [stfName, setStfName] = useState('');
  const [stfRole, setStfRole] = useState('Head Detailer');
  const [stfPhone, setStfPhone] = useState('');
  const [stfHours, setStfHours] = useState('08:00 AM - 05:00 PM');
  const [stfStatus, setStfStatus] = useState('Available');

  // Refresh & Sync status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    fetchAllAdminData();
  }, [activeSubTab, refreshTrigger]);

  const fetchAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [anaRes, bookRes, custRes, stfRes, expRes, cpnRes, svcRes, bayRes, leadRes] = await Promise.all([
        getAnalytics(),
        getBookings(),
        getCustomers(),
        getStaff(),
        getExpenses(),
        getCoupons(),
        getServices(),
        getBays(),
        getLeads()
      ]);
      setAnalytics(anaRes.data);
      setBookings(bookRes.data || []);
      setCustomers(custRes.data || []);
      setStaff(stfRes.data || []);
      setExpenses(expRes.data || []);
      setCoupons(cpnRes.data || []);
      setServices(svcRes.data || []);
      setBays(bayRes.data || []);
      if (leadRes && leadRes.data) setLeads(leadRes.data);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, { status: newStatus });
      fetchAllAdminData();
    } catch {
      alert('Error');
    }
  };

  const handleBayToggle = async (bayId, currentStatus) => {
    const nextStatus = currentStatus === 'Occupied' ? 'Available' : 'Occupied';
    try {
      await updateBayStatus(bayId, { status: nextStatus });
      fetchAllAdminData();
    } catch {
      alert('Error');
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWalkInBooking({
        customerName: walkInName || 'Walk-in',
        phone: walkInPhone || '+91 8609504186',
        vehicleNumber: walkInVeh,
        vehicleType: walkInVehType,
        serviceName: walkInService,
        totalAmount: Number(walkInAmount),
        paymentMode: walkInPayMode
      });
      if (setShowWalkInModal) setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInVeh('');
      fetchAllAdminData();
    } catch {
      alert('Error');
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
        paymentMethod: 'UPI',
        notes: expNotes
      });
      setExpAmount('');
      setExpNotes('');
      fetchAllAdminData();
    } catch {
      alert('Error');
    }
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await uploadServiceImage(base64Data);
        if (res.data && res.data.url) {
          setSvcImage(res.data.url);
        } else {
          setSvcImage(base64Data);
        }
      } catch (err) {
        console.warn('Cloudinary upload warning, using local preview data:', err);
        setSvcImage(reader.result);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateService(editingService._id, {
          name: svcName,
          title: svcName,
          category: svcCategory,
          image: svcImage || '',
          basePrice: Number(svcBasePrice)
        });
      } else {
        await createService({
          name: svcName,
          title: svcName,
          category: svcCategory,
          image: svcImage || '',
          basePrice: Number(svcBasePrice)
        });
      }
      setShowAddServiceModal(false);
      setEditingService(null);
      setSvcName('');
      setSvcImage('');
      fetchAllAdminData();
    } catch {
      alert('Error saving service');
    }
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!cpnCode) return;
    try {
      await createCoupon({
        code: cpnCode.toUpperCase().trim(),
        discountType: 'fixed',
        value: Number(cpnValue),
        discountValue: Number(cpnValue),
        minOrder: Number(cpnMinOrder || 0),
        minOrderAmount: Number(cpnMinOrder || 0),
        active: true
      });
      setShowAddCouponModal(false);
      setCpnCode('');
      fetchAllAdminData();
    } catch {
      alert('Error creating coupon');
    }
  };

  // Staff Management Handlers
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStfName('');
    setStfRole('Detailer');
    setStfPhone('+91 ');
    setStfStatus('Available');
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (stf) => {
    setEditingStaff(stf);
    setStfName(stf.name || '');
    setStfRole(stf.role || 'Detailer');
    setStfPhone(stf.phone || '');
    setStfStatus(stf.status || 'Available');
    setShowStaffModal(true);
  };

  const handleSaveStaffSubmit = async (e) => {
    e.preventDefault();
    if (!stfName.trim()) return;
    try {
      if (editingStaff) {
        await updateStaff(editingStaff._id, {
          name: stfName.trim(),
          role: stfRole,
          phone: stfPhone.trim(),
          status: stfStatus
        });
      } else {
        await createStaff({
          name: stfName.trim(),
          role: stfRole,
          phone: stfPhone.trim(),
          status: stfStatus
        });
      }
      setShowStaffModal(false);
      setEditingStaff(null);
      fetchAllAdminData();
    } catch (err) {
      console.error('Error saving staff member:', err);
      alert('Error saving staff member');
    }
  };

  const handleStaffQuickStatusChange = async (id, newStatus) => {
    try {
      await updateStaff(id, { status: newStatus });
      fetchAllAdminData();
    } catch (err) {
      console.error('Error updating staff status:', err);
    }
  };

  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to check multi-year date ranges
  const matchesDateRange = (bookingDateStr) => {
    if (timeFilter === 'all') return true;
    if (!bookingDateStr) return false;

    const bDateStr = bookingDateStr.includes('T') ? bookingDateStr.split('T')[0] : bookingDateStr;
    const todayStr = getLocalDateString(new Date());

    if (timeFilter === 'today') {
      return bDateStr === todayStr;
    }
    if (timeFilter === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return bDateStr === getLocalDateString(y);
    }
    if (timeFilter === '7days') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      return bDateStr >= getLocalDateString(past7);
    }
    if (timeFilter === 'month') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      return bDateStr >= getLocalDateString(past30);
    }
    if (timeFilter === '6months') {
      const past6m = new Date();
      past6m.setMonth(past6m.getMonth() - 6);
      return bDateStr >= getLocalDateString(past6m);
    }
    if (timeFilter === '1year') {
      const past1y = new Date();
      past1y.setFullYear(past1y.getFullYear() - 1);
      return bDateStr >= getLocalDateString(past1y);
    }
    if (timeFilter === '2years') {
      const past2y = new Date();
      past2y.setFullYear(past2y.getFullYear() - 2);
      return bDateStr >= getLocalDateString(past2y);
    }
    if (timeFilter === 'custom') {
      if (customStartDate && bDateStr < customStartDate) return false;
      if (customEndDate && bDateStr > customEndDate) return false;
      return true;
    }
    return true;
  };

  // Open Lifetime Customer Wash History Modal (Multi-Year)
  const handleOpenCustomerTimeline = async (phoneOrVehicle, customerName) => {
    if (!phoneOrVehicle) return;
    setLoadingTimeline(true);
    setShowTimelineModal(true);
    try {
      const res = await getCustomerTimeline(phoneOrVehicle);
      setTimelineData({ ...res.data, customerName: customerName || 'Valued Customer' });
    } catch (err) {
      console.error('Error fetching timeline:', err);
      alert('Could not load customer history.');
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Export Filtered Bookings to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No bookings found for the selected filter.');
      return;
    }
    const headers = ['Code', 'Date', 'Slot Time', 'Customer Name', 'Phone', 'Vehicle Type', 'Vehicle Number', 'Vehicle Model', 'Service / Package', 'Total Amount', 'Payment Status', 'Booking Status'];
    const rows = filteredBookings.map(b => [
      b.trackingCode || b.bookingCode || '',
      b.date || '',
      b.slotTime || '',
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.phone || ''}"`,
      b.vehicleType || '',
      b.vehicleNumber || '',
      `"${(b.vehicleModel || '').replace(/"/g, '""')}"`,
      `"${(b.serviceName || b.packageName || '').replace(/"/g, '""')}"`,
      b.totalAmount || 0,
      b.paymentStatus || 'Pending',
      b.status || 'Pending'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carwash_bookings_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Bookings
  const filteredBookings = bookings
    .filter((b) => {
      const matchesStatus = bookingFilter === 'all' || b.status?.toLowerCase() === bookingFilter.toLowerCase();
      const matchesPayment = paymentFilter === 'all' || b.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase();
      const matchesDate = matchesDateRange(b.date);
      const matchesSearch = !searchTerm || 
        (b.trackingCode && b.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.bookingCode && b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.customerName && b.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.vehicleNumber && b.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.vehicleModel && b.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.serviceName && b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.packageName && b.packageName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.phone && b.phone.includes(searchTerm));
      
      return matchesStatus && matchesPayment && matchesDate && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'date_desc') {
        const da = (a.date || '') + ' ' + (a.slotTime || '');
        const db = (b.date || '') + ' ' + (b.slotTime || '');
        return db.localeCompare(da);
      }
      if (sortOption === 'date_asc') {
        const da = (a.date || '') + ' ' + (a.slotTime || '');
        const db = (b.date || '') + ' ' + (b.slotTime || '');
        return da.localeCompare(db);
      }
      if (sortOption === 'amount_desc') {
        return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
      }
      if (sortOption === 'amount_asc') {
        return (Number(a.totalAmount) || 0) - (Number(b.totalAmount) || 0);
      }
      if (sortOption === 'name_asc') {
        return (a.customerName || '').localeCompare(b.customerName || '');
      }
      return 0;
    });

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* OWNER LIVE SYSTEM SYNC BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'rgba(0, 31, 35, 0.45)',
        border: '1px solid var(--border-light)',
        padding: '10px 16px',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#25D366',
            background: 'rgba(37, 211, 102, 0.12)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#25D366', boxShadow: '0 0 8px #25D366' }} />
            LIVE SYSTEM
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--ice-tint)' }}>
            Last updated: <strong style={{ color: '#FFFFFF' }}>{lastSyncTime}</strong>
          </span>
        </div>

        <button
          onClick={fetchAllAdminData}
          disabled={isRefreshing}
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: isRefreshing ? 'wait' : 'pointer',
            background: isRefreshing ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: isRefreshing ? 'var(--accent-cyan)' : 'var(--border-light)',
            color: isRefreshing ? 'var(--accent-cyan)' : '#FFFFFF',
            transition: 'all 0.2s ease'
          }}
          title="Sync & reload all real-time bookings, queue, bays, and financials from database"
        >
          <RefreshCw
            size={14}
            color="var(--accent-cyan)"
            style={{
              animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none'
            }}
          />
          {isRefreshing ? 'Refreshing Database...' : 'Refresh Data'}
        </button>
      </div>

      {/* 1. TOP STATS BAR (OPERATIONAL / STAFF-SAFE METRICS) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>TODAY'S JOBS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
            {bookings.filter(b => b.date === getLocalDateString()).length} Bookings
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>ACTIVE QUEUE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {bookings.filter(b => b.status === 'In-Progress' || b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'washing' || b.status === 'detailing').length} Cars
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>LIVE BAYS IN USE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00E5FF', marginTop: '4px' }}>
            {bays.filter(b => b.status === 'Occupied').length} / {bays.length || 2} Active
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>TOTAL WASH ARCHIVE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#25D366', marginTop: '4px' }}>
            {bookings.length} Records
          </div>
        </div>
      </div>

      {/* 2. TAB: OVERVIEW & BAYS */}
      {activeSubTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* LIVE BAYS */}
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Live Bays</h3>
              <button onClick={() => setShowWalkInModal(true)} className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}>
                <Plus size={14} /> Walk-In Ticket
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {(bays.length ? bays : [
                { _id: '1', bayNumber: 1, name: 'BAY 1', status: 'Available' },
                { _id: '2', bayNumber: 2, name: 'BAY 2', status: 'Available' }
              ]).map((bay) => {
                const isOccupied = bay.status === 'Occupied';
                return (
                  <div
                    key={bay._id || bay.bayNumber}
                    onClick={() => handleBayToggle(bay._id, bay.status)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: isOccupied ? 'rgba(255, 89, 100, 0.12)' : 'rgba(0, 229, 255, 0.08)',
                      border: isOccupied ? '1px solid #FF5964' : '1px solid var(--accent-cyan)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{bay.name || `Bay ${bay.bayNumber}`}</div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: isOccupied ? '#FF5964' : 'var(--accent-cyan)',
                        color: '#06141B'
                      }}>
                        {isOccupied ? 'OCCUPIED' : 'FREE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT QUEUE (WITH DATE & TIME SLOTS) */}
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Recent Queue & Appointments</h3>
                <span className="badge badge-aqua" style={{ fontSize: '0.7rem' }}>Live Queue</span>
              </div>
              <button onClick={() => setActiveSubTab('bookings')} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '6px' }}>
                All Bookings & History ({bookings.length}) →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                    <th style={{ padding: '10px' }}>Code</th>
                    <th style={{ padding: '10px' }}>Date & Slot Time</th>
                    <th style={{ padding: '10px' }}>Customer</th>
                    <th style={{ padding: '10px' }}>Vehicle</th>
                    <th style={{ padding: '10px' }}>Service</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 6).map((b) => {
                    const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                    return (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                        <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {code}
                        </td>
                        <td style={{ padding: '10px', color: '#CCD0CF' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date || 'Today'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>{b.slotTime || '10:00 AM'}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div
                            onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                            style={{ fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                            title="Click to view 2-Year Lifetime History"
                          >
                            {b.customerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{b.phone}</div>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--ice-tint)' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                          {b.vehicleModel && <div style={{ fontSize: '0.75rem' }}>{b.vehicleModel}</div>}
                        </td>
                        <td style={{ padding: '10px', color: '#CCD0CF' }}>
                          <div style={{ fontWeight: 600 }}>{b.serviceName || b.packageName}</div>
                          {b.addons && b.addons.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                              +{b.addons.length} Add-ons
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: '#06141B',
                              color: b.status === 'completed' || b.status === 'Completed' ? '#25D366' : 'var(--accent-cyan)',
                              border: '1px solid var(--border-light)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="washing">Washing</option>
                            <option value="detailing">Detailing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          ₹{b.totalAmount}
                          <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700 }}>
                            {b.paymentStatus || 'Pending'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. TAB: BOOKINGS & MULTI-YEAR ARCHIVE EXPLORER */}
      {activeSubTab === 'bookings' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Bookings & Queue
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportCSV}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Export CSV / Excel
              </button>
              <button
                onClick={() => setShowWalkInModal(true)}
                className="btn-gold"
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                <Plus size={14} /> New Appointment
              </button>
            </div>
          </div>

          {/* QUICK MULTI-YEAR DATE RANGE SELECTOR */}
          <div style={{ marginBottom: '16px', background: 'rgba(0, 31, 35, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} /> Timeframe Filter (Past History & Archive):
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'month', label: 'This Month' },
                { id: '6months', label: 'Past 6 Months' },
                { id: '1year', label: 'Past 1 Year' },
                { id: '2years', label: 'Past 2 Years' },
                { id: 'custom', label: 'Custom Range...' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeFilter(tf.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: timeFilter === tf.id ? 'var(--accent-aqua)' : 'rgba(255, 255, 255, 0.06)',
                    color: timeFilter === tf.id ? '#003135' : '#CCD0CF',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers when 'custom' is selected */}
            {timeFilter === 'custom' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="input-field"
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>To:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="input-field"
                    style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* FILTER CONTROLS BAR: SEARCH, STATUS, PAYMENT & SORTING */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            marginBottom: '16px'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-tint)' }} />
              <input
                type="text"
                placeholder="Search Name, Phone, Car No, Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div>
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="input-field"
                style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
              >
                <option value="all">All Booking Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="washing">Washing</option>
                <option value="detailing">Detailing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter Dropdown */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="input-field"
                style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
              >
                <option value="all">All Payments (Paid & Pending)</option>
                <option value="Paid">Paid Only</option>
                <option value="Pending">Pending Only</option>
              </select>
            </div>

            {/* Sorting Dropdown */}
            <div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="input-field"
                style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%', color: 'var(--accent-gold)' }}
              >
                <option value="date_desc">Sort: Date (Newest First)</option>
                <option value="date_asc">Sort: Date (Oldest First)</option>
                <option value="amount_desc">Sort: Amount (High to Low)</option>
                <option value="amount_asc">Sort: Amount (Low to High)</option>
                <option value="name_asc">Sort: Customer Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* BOOKINGS TABLE */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                  <th style={{ padding: '10px' }}>Code</th>
                  <th style={{ padding: '10px' }}>Date & Slot Time</th>
                  <th style={{ padding: '10px' }}>Customer</th>
                  <th style={{ padding: '10px' }}>Vehicle Info</th>
                  <th style={{ padding: '10px' }}>Service / Package</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No wash bookings found matching your selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                    return (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                        <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {code}
                        </td>
                        <td style={{ padding: '10px', color: '#CCD0CF' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>{b.slotTime || '10:00 AM'}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div
                            onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                            style={{ fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                            title="Click to view 2-Year Lifetime History"
                          >
                            {b.customerName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{b.phone}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{b.vehicleType} {b.vehicleModel ? `• ${b.vehicleModel}` : ''}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{b.serviceName || b.packageName}</div>
                          {b.addons && b.addons.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                              +{b.addons.length} Add-ons
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b._id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: '#06141B',
                              color: b.status === 'completed' || b.status === 'Completed' ? '#25D366' : 'var(--accent-cyan)',
                              border: '1px solid var(--border-light)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="washing">Washing</option>
                            <option value="detailing">Detailing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          ₹{b.totalAmount}
                          <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700 }}>
                            {b.paymentStatus || 'Pending'}
                          </div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}
                              title="View Customer Lifetime Timeline"
                            >
                              <History size={12} /> History
                            </button>
                            <button
                              onClick={() => setInvoiceBooking(b)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px' }}
                            >
                              Invoice
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(
                                'Delete Booking?',
                                `${code} - ${b.customerName}`,
                                () => deleteBooking(b._id).then(fetchAllAdminData)
                              )}
                              style={{ background: 'transparent', border: 'none', color: '#FF5964', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: CUSTOMERS & LEADS */}
      {activeSubTab === 'crm' && (
        <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
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

          {crmSubTab === 'customers' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                    <th style={{ padding: '8px' }}>Name</th>
                    <th style={{ padding: '8px' }}>Phone</th>
                    <th style={{ padding: '8px' }}>Visits</th>
                    <th style={{ padding: '8px' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '8px', color: 'var(--ice-tint)' }}>{c.phone}</td>
                      <td style={{ padding: '8px' }}>{c.totalVisits || c.totalBookings || 1}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: 'var(--accent-gold)' }}>{c.loyaltyPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
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
      )}

      {/* 5. TAB: SERVICES & PRICING */}
      {activeSubTab === 'services' && (
        <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setServiceSubTab('services')}
                style={{
                  background: serviceSubTab === 'services' ? 'var(--accent-cyan)' : 'transparent',
                  color: serviceSubTab === 'services' ? '#06141B' : '#CCD0CF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Services ({services.length})
              </button>
              <button
                onClick={() => setServiceSubTab('coupons')}
                style={{
                  background: serviceSubTab === 'coupons' ? 'var(--accent-cyan)' : 'transparent',
                  color: serviceSubTab === 'coupons' ? '#06141B' : '#CCD0CF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Coupons ({coupons.length})
              </button>
            </div>

            {serviceSubTab === 'services' ? (
              <button
                onClick={() => {
                  setEditingService(null);
                  setSvcName('');
                  setSvcCategory('Wash');
                  setSvcBasePrice(499);
                  setSvcImage('');
                  setShowAddServiceModal(true);
                }}
                className="btn-gold"
                style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '6px' }}
              >
                + Add Service
              </button>
            ) : (
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="btn-gold"
                style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '6px' }}
              >
                + Add Coupon
              </button>
            )}
          </div>

          {serviceSubTab === 'services' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {services.map((svc) => (
                <div key={svc._id} className="glass-card" style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(0, 49, 53, 0.4)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {svc.image ? (
                      <img
                        src={svc.image}
                        alt={svc.name || svc.title}
                        style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(74, 92, 106, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ice-tint)', flexShrink: 0 }}>
                        <Image size={22} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {svc.name || svc.title}
                      </div>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px', marginTop: '4px' }}>
                        {svc.category || 'Wash'}
                      </span>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--accent-gold)', flexShrink: 0 }}>
                      ₹{svc.basePrice || svc.price}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '10px' }}>
                    <button
                      onClick={() => {
                        setEditingService(svc);
                        setSvcName(svc.name || svc.title);
                        setSvcCategory(svc.category || 'Wash');
                        setSvcBasePrice(svc.basePrice || svc.price);
                        setSvcImage(svc.image || '');
                        setShowAddServiceModal(true);
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(
                        'Delete Service?',
                        `${svc.name || svc.title} (₹${svc.basePrice || svc.price})`,
                        () => deleteService(svc._id).then(fetchAllAdminData)
                      )}
                      style={{ padding: '6px 12px', background: 'rgba(255, 89, 100, 0.12)', border: '1px solid #FF5964', color: '#FF5964', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
              {coupons.map((cpn) => {
                const disc = cpn.value !== undefined ? cpn.value : (cpn.discountValue || 0);
                const isPct = cpn.discountType === 'percent';
                return (
                  <div key={cpn._id} className="glass-card" style={{ padding: '20px 22px', borderRadius: '14px', background: 'rgba(0, 49, 53, 0.5)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Ticket Header Voucher Box */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 195, 0, 0.08)',
                      border: '1.5px dashed var(--accent-gold)',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      gap: '12px'
                    }}>
                      <span style={{ fontWeight: 900, color: 'var(--accent-gold)', fontSize: '1.15rem', letterSpacing: '0.04em' }}>
                        {cpn.code}
                      </span>
                      <span style={{ background: 'var(--accent-gold)', color: '#06141B', fontWeight: 900, fontSize: '0.88rem', padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(255, 195, 0, 0.25)' }}>
                        {isPct ? `${disc}% OFF` : `₹${disc} OFF`}
                      </span>
                    </div>

                    {/* Card Footer: Min Order & Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--ice-tint)' }}>
                        Min Order: <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>₹{cpn.minOrder || 0}</strong>
                      </div>
                      <button
                        onClick={() => openDeleteConfirm(
                          'Delete Coupon?',
                          `Coupon: ${cpn.code}`,
                          () => deleteCoupon(cpn._id).then(fetchAllAdminData)
                        )}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 16px',
                          background: 'rgba(255, 89, 100, 0.12)',
                          border: '1px solid #FF5964',
                          color: '#FF5964',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 6. TAB: STAFF & EXPENSES & OWNER FINANCIALS */}
      {activeSubTab === 'expenses' && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setExpenseSubTab('expenses')}
              style={{
                background: expenseSubTab === 'expenses' ? 'var(--accent-cyan)' : 'transparent',
                color: expenseSubTab === 'expenses' ? '#06141B' : '#CCD0CF',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Expenses & Bills ({expenses.length})
            </button>
            <button
              onClick={() => setExpenseSubTab('staff')}
              style={{
                background: expenseSubTab === 'staff' ? 'var(--accent-cyan)' : 'transparent',
                color: expenseSubTab === 'staff' ? '#06141B' : '#CCD0CF',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Staff Members ({staff.length})
            </button>
            <button
              onClick={() => setExpenseSubTab('financials')}
              style={{
                background: expenseSubTab === 'financials' ? 'var(--accent-gold)' : 'rgba(255, 195, 0, 0.1)',
                color: expenseSubTab === 'financials' ? '#06141B' : 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: '1px solid var(--accent-gold)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Lock size={14} /> Private Financials & Profit
            </button>
          </div>

          {expenseSubTab === 'expenses' && (
            <div>
              <form onSubmit={handleAddExpenseSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="input-field" style={{ flex: '1 1 140px', minHeight: '42px', fontSize: '0.88rem' }}>
                  <option value="Supplies">Chemicals & Shampoos</option>
                  <option value="Electricity">Electricity & Utilities</option>
                  <option value="Salary">Staff Payroll</option>
                  <option value="Maintenance">Equipment Maintenance</option>
                  <option value="Misc">Misc Overheads</option>
                </select>

                <input
                  type="number"
                  required
                  placeholder="Amount (₹)"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="input-field"
                  style={{ flex: '1 1 110px', minHeight: '42px', fontSize: '0.88rem' }}
                />

                <input
                  type="text"
                  placeholder="Expense description or note..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="input-field"
                  style={{ flex: '2 1 180px', minHeight: '42px', fontSize: '0.88rem' }}
                />

                <button type="submit" className="btn-gold" style={{ minHeight: '42px', padding: '0 18px', fontSize: '0.85rem', borderRadius: '8px', fontWeight: 700 }}>
                  + Add Expense
                </button>
              </form>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px' }}>Notes</th>
                      <th style={{ padding: '10px' }}>Amount</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{exp.category}</td>
                        <td style={{ padding: '10px', color: 'var(--ice-tint)' }}>{exp.notes || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 700, color: '#FF5964' }}>₹{exp.amount}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            onClick={() => openDeleteConfirm(
                              'Delete Expense?',
                              `₹${exp.amount} (${exp.category})`,
                              () => deleteExpense(exp._id).then(fetchAllAdminData)
                            )}
                            style={{ background: 'transparent', border: 'none', color: '#FF5964', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expenseSubTab === 'staff' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Staff Members ({staff.length})
                </h4>

                <button
                  type="button"
                  onClick={handleOpenAddStaff}
                  className="btn-gold"
                  style={{ padding: '7px 16px', fontSize: '0.82rem', borderRadius: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> Add Staff Member
                </button>
              </div>

              {staff.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No staff members found. Click "+ Add Staff Member" to add your first technician.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {staff.map((stf) => {
                    const isAvail = stf.status === 'Available';
                    const isOnJob = stf.status === 'On Job';
                    const statusColor = isAvail ? '#25D366' : isOnJob ? 'var(--accent-cyan)' : 'var(--ice-tint)';
                    const statusBorder = isAvail ? 'rgba(37, 211, 102, 0.4)' : isOnJob ? 'rgba(0, 229, 255, 0.4)' : 'rgba(74, 92, 106, 0.4)';

                    return (
                      <div
                        key={stf._id}
                        className="glass-card"
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'rgba(0, 49, 53, 0.45)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>{stf.name}</div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '2px' }}>{stf.role}</div>
                            </div>

                            <select
                              value={stf.status || 'Available'}
                              onChange={(e) => handleStaffQuickStatusChange(stf._id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#06141B',
                                color: statusColor,
                                border: `1px solid ${statusBorder}`,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="Available">Available</option>
                              <option value="On Job">On Job</option>
                              <option value="Off Duty">Off Duty</option>
                            </select>
                          </div>

                          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--ice-tint)' }}>
                            <Phone size={13} color="var(--accent-cyan)" /> {stf.phone || '-'}
                          </div>
                        </div>

                        {/* Action Buttons: Edit & Delete */}
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(stf)}
                            className="btn-secondary"
                            style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem', borderRadius: '6px', justifyContent: 'center' }}
                          >
                            Edit Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteConfirm(
                              'Remove Staff Member?',
                              `${stf.name} (${stf.role})`,
                              () => deleteStaff(stf._id).then(fetchAllAdminData)
                            )}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(255, 89, 100, 0.12)',
                              border: '1px solid #FF5964',
                              color: '#FF5964',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {expenseSubTab === 'financials' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
                background: 'rgba(0, 49, 53, 0.4)',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>Private Financials</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Confidential</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFinancialFigures(!showFinancialFigures)}
                  className="btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {showFinancialFigures ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showFinancialFigures ? 'Mask Numbers' : 'Reveal Numbers'}
                </button>
              </div>

              {/* PRIVATE METRIC CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginBottom: '24px'
              }}>
                <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>NET PROFIT</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#25D366', marginTop: '6px' }}>
                    {showFinancialFigures ? `₹${analytics?.netProfit || (analytics?.monthlyRevenue ? Math.round(analytics.monthlyRevenue * 0.72) : 0)}` : '₹ ••••••'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 195, 0, 0.08)', border: '1px solid rgba(255, 195, 0, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>MONTHLY REVENUE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-gold)', marginTop: '6px' }}>
                    {showFinancialFigures ? `₹${analytics?.monthlyRevenue || 0}` : '₹ ••••••'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255, 89, 100, 0.08)', border: '1px solid rgba(255, 89, 100, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL EXPENSES</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FF5964', marginTop: '6px' }}>
                    {showFinancialFigures ? `₹${expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)}` : '₹ ••••••'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 700, letterSpacing: '0.05em' }}>TODAY'S TURNOVER</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '6px' }}>
                    {showFinancialFigures ? `₹${analytics?.dailyRevenue || 0}` : '₹ ••••••'}
                  </div>
                </div>
              </div>

              {/* EXPENSE CATEGORY BREAKDOWN */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Expense Allocation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {['Supplies', 'Electricity', 'Salary', 'Maintenance', 'Misc'].map((cat) => {
                    const totalForCat = expenses
                      .filter(e => e.category?.toLowerCase() === cat.toLowerCase())
                      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                    return (
                      <div key={cat} style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(74, 92, 106, 0.25)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{cat}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                          {showFinancialFigures ? `₹${totalForCat}` : '₹ ••••'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ULTRA-MINIMAL DELETE CONFIRMATION POPUP */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 11000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '340px',
            padding: '20px',
            borderRadius: '12px',
            background: '#0a1a24'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px 0', color: '#FFFFFF' }}>
              {confirmModal.title}
            </h3>

            {confirmModal.itemName && (
              <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginBottom: '16px' }}>
                {confirmModal.itemName}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeDelete}
                style={{
                  background: '#FF5964',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: WALK-IN BOOKING TICKET */}
      {showWalkInModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Walk-In Ticket</h3>
              <button onClick={() => setShowWalkInModal(false)} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Customer Name"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                className="input-field"
                style={{ minHeight: '42px', fontSize: '0.88rem' }}
              />

              <input
                type="text"
                placeholder="Phone"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                className="input-field"
                style={{ minHeight: '42px', fontSize: '0.88rem' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Vehicle Number *"
                  value={walkInVeh}
                  onChange={(e) => setWalkInVeh(e.target.value.toUpperCase())}
                  className="input-field"
                  style={{ flex: 1, minHeight: '42px', fontSize: '0.88rem' }}
                />

                <select
                  value={walkInVehType}
                  onChange={(e) => setWalkInVehType(e.target.value)}
                  className="input-field"
                  style={{ width: '135px', minHeight: '42px', fontSize: '0.88rem' }}
                >
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>

              <select
                value={walkInService}
                onChange={(e) => setWalkInService(e.target.value)}
                className="input-field"
                style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
              >
                <option value="Express Foam Wash">Express Foam Wash</option>
                <option value="Interior + Exterior Wash">Interior + Exterior Wash</option>
                <option value="Premium Deep Wash">Premium Deep Wash</option>
                <option value="Interior Steam Spa">Interior Steam Spa</option>
                <option value="9H Ceramic Coating">9H Ceramic Coating</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  required
                  placeholder="Amount (₹)"
                  value={walkInAmount}
                  onChange={(e) => setWalkInAmount(e.target.value)}
                  className="input-field"
                  style={{ flex: 1, minHeight: '42px', fontSize: '0.88rem' }}
                />

                <select
                  value={walkInPayMode}
                  onChange={(e) => setWalkInPayMode(e.target.value)}
                  className="input-field"
                  style={{ width: '125px', minHeight: '42px', fontSize: '0.88rem' }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: '8px', minHeight: '42px', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 800 }}>
                Add to Bay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: ADD SERVICE */}
      {showAddServiceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '14px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{editingService ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setShowAddServiceModal(false)} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9H Ceramic Shield"
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  className="input-field"
                  style={{ minHeight: '42px', fontSize: '0.88rem', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select value={svcCategory} onChange={(e) => setSvcCategory(e.target.value)} className="input-field" style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}>
                    <option value="Wash">Wash</option>
                    <option value="Interior">Interior</option>
                    <option value="Detailing">Detailing</option>
                    <option value="Ceramic">Ceramic</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="499"
                    value={svcBasePrice}
                    onChange={(e) => setSvcBasePrice(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* SERVICE IMAGE UPLOAD (OPTIONAL) */}
              <div style={{ background: 'rgba(0, 49, 53, 0.45)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Image size={15} color="var(--accent-cyan)" /> Service Photo (Optional)
                  </label>
                  {svcImage && (
                    <button
                      type="button"
                      onClick={() => setSvcImage('')}
                      style={{ background: 'transparent', border: 'none', color: '#FF5964', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {svcImage ? (
                  <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '110px', border: '1px solid var(--border-light)', marginBottom: '8px' }}>
                    <img src={svcImage} alt="Service preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    id="admin-svc-file-upload"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="admin-svc-file-upload"
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      cursor: uploadingImage ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(0, 229, 255, 0.12)',
                      border: '1px solid var(--accent-cyan)',
                      color: 'var(--accent-cyan)'
                    }}
                  >
                    {uploadingImage ? (
                      <>Uploading to Cloudinary...</>
                    ) : (
                      <><Upload size={14} /> Upload from PC</>
                    )}
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Or paste Cloudinary / image URL"
                  value={svcImage}
                  onChange={(e) => setSvcImage(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: '34px', fontSize: '0.78rem', marginTop: '8px', padding: '6px 10px' }}
                />

                {/* Quick Presets */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', marginBottom: '4px' }}>Quick Photo Presets:</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Exterior Wash', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764056/car-wash/services/Exterior_Car_Wash_Foam_wash_pressure_wash_hand_drying.jpg' },
                      { label: 'Full Wash', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764057/car-wash/services/Full_Car_Wash_Complete_interior_exterior_cleaning.jpg' },
                      { label: 'Interior Spa', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764060/car-wash/services/Car_Interior_Detailing_Deep_cleaning_of_complete_cabin.jpg' },
                      { label: 'Waxing', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764062/car-wash/services/Car_Waxing_Shine_basic_paint_protection.jpg' },
                      { label: 'Polishing', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764063/car-wash/services/Car_Polishing_Restore_gloss_remove_minor_dullness.jpg' },
                      { label: 'Engine Bay', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764064/car-wash/services/Engine_Bay_Cleaning_Safe_cleaning_of_engine_compartment.jpg' },
                      { label: 'Wheel & Tyre', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764061/car-wash/services/Wheel_Tyre_Cleaning_Wheel_cleaning_tyre_dressing.jpg' },
                      { label: 'Showroom Spa', url: 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764066/car-wash/services/Car_Spa_Premium_Detailing_Comprehensive_exterior_interior_treatment.jpg' }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSvcImage(p.url)}
                        style={{
                          background: svcImage === p.url ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                          color: svcImage === p.url ? '#003135' : 'var(--ice-tint)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-gold" style={{ minHeight: '42px', fontSize: '0.88rem', borderRadius: '8px', fontWeight: 800, width: '100%', justifyContent: 'center' }}>
                {editingService ? 'Update Service' : 'Save Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: ADD COUPON */}
      {showAddCouponModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '22px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Add Coupon</h3>
              <button onClick={() => setShowAddCouponModal(false)} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                required
                placeholder="Code (e.g. FLAT100)"
                value={cpnCode}
                onChange={(e) => setCpnCode(e.target.value.toUpperCase())}
                className="input-field"
                style={{ minHeight: '42px', fontSize: '0.88rem' }}
              />

              <input
                type="number"
                required
                placeholder="Discount (₹)"
                value={cpnValue}
                onChange={(e) => setCpnValue(e.target.value)}
                className="input-field"
                style={{ minHeight: '42px', fontSize: '0.88rem' }}
              />

              <input
                type="number"
                placeholder="Min Order (₹)"
                value={cpnMinOrder}
                onChange={(e) => setCpnMinOrder(e.target.value)}
                className="input-field"
                style={{ minHeight: '42px', fontSize: '0.88rem' }}
              />

              <button type="submit" className="btn-gold" style={{ minHeight: '42px', fontSize: '0.88rem', borderRadius: '8px', fontWeight: 700 }}>
                Save Coupon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL INVOICE MODAL */}
      {invoiceBooking && (
        <DigitalInvoiceModal
          booking={invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      )}

      {/* CUSTOMER 2-YEAR LIFETIME WASH TIMELINE MODAL */}
      {showTimelineModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10500,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 12px 40px rgba(0, 229, 255, 0.15)',
            background: 'linear-gradient(135deg, rgba(6, 20, 27, 0.96) 0%, rgba(0, 49, 53, 0.94) 100%)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                    Customer Lifetime History & Wash Archive
                  </h3>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    2-Year Log
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
                  Complete historical record & booking timeline stored in database
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTimelineModal(false);
                  setTimelineData(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingTimeline ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: '12px' }}>
                <Loader2 size={32} className="spinner" color="var(--accent-cyan)" />
                <div style={{ fontSize: '0.9rem', color: 'var(--ice-tint)' }}>Fetching customer 2-year wash archive...</div>
              </div>
            ) : !timelineData || !timelineData.bookings || timelineData.bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No past wash records found for this customer or vehicle.
              </div>
            ) : (
              <div>
                {/* Customer Info Card & Stats Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '12px',
                  marginBottom: '22px'
                }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>CUSTOMER</div>
                    <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem', marginTop: '2px' }}>{timelineData.customerName || 'Valued Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>{timelineData.phone || '-'}</div>
                  </div>

                  <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>TOTAL WASHES</div>
                    <div style={{ fontWeight: 900, color: 'var(--accent-cyan)', fontSize: '1.4rem', marginTop: '2px' }}>
                      {timelineData.totalVisits || timelineData.bookings.length}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 195, 0, 0.08)', border: '1px solid rgba(255, 195, 0, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>LIFETIME SPENT</div>
                    <div style={{ fontWeight: 900, color: 'var(--accent-gold)', fontSize: '1.4rem', marginTop: '2px' }}>
                      ₹{timelineData.totalSpent || timelineData.bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>FIRST & LATEST VISIT</div>
                    <div style={{ fontWeight: 700, color: '#25D366', fontSize: '0.82rem', marginTop: '4px' }}>
                      First: {timelineData.firstVisit || timelineData.bookings[timelineData.bookings.length - 1]?.date || '-'}
                    </div>
                    <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.82rem', marginTop: '2px' }}>
                      Latest: {timelineData.latestVisit || timelineData.bookings[0]?.date || '-'}
                    </div>
                  </div>
                </div>

                {/* Vehicles seen */}
                {timelineData.vehicles && timelineData.vehicles.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Associated Vehicles:</span>
                    {timelineData.vehicles.map((v, idx) => (
                      <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                        🚗 {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Wash History Table */}
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.25)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0, 49, 53, 0.6)', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                        <th style={{ padding: '10px' }}>Code</th>
                        <th style={{ padding: '10px' }}>Date & Slot</th>
                        <th style={{ padding: '10px' }}>Vehicle</th>
                        <th style={{ padding: '10px' }}>Service Performed</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineData.bookings.map((b) => {
                        const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                        return (
                          <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                            <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                              {code}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>{b.slotTime || '10:00 AM'}</div>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)' }}>{b.vehicleType} {b.vehicleModel ? `• ${b.vehicleModel}` : ''}</div>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{b.serviceName || b.packageName}</div>
                              {b.addons && b.addons.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                                  +{b.addons.length} Add-ons
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: b.status === 'completed' || b.status === 'Completed' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                                color: b.status === 'completed' || b.status === 'Completed' ? '#25D366' : 'var(--accent-cyan)',
                                border: b.status === 'completed' || b.status === 'Completed' ? '1px solid #25D366' : '1px solid var(--accent-cyan)'
                              }}>
                                {b.status || 'Completed'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                              ₹{b.totalAmount}
                              <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700 }}>
                                {b.paymentStatus || 'Paid'}
                              </div>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  setShowTimelineModal(false);
                                  setInvoiceBooking(b);
                                }}
                                className="btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '4px' }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP: ADD / EDIT STAFF MEMBER */}
      {showStaffModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '14px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h3>
              </div>
              <button onClick={() => setShowStaffModal(false)} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={stfName}
                  onChange={(e) => setStfName(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                    Role / Designation *
                  </label>
                  <select
                    value={stfRole}
                    onChange={(e) => setStfRole(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', minHeight: '42px', fontSize: '0.85rem' }}
                  >
                    <option value="Wash Technician">Wash Technician</option>
                    <option value="Detailer">Detailer</option>
                    <option value="Helper">Helper</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                    Duty Status
                  </label>
                  <select
                    value={stfStatus}
                    onChange={(e) => setStfStatus(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', minHeight: '42px', fontSize: '0.85rem' }}
                  >
                    <option value="Available">Available</option>
                    <option value="On Job">On Job</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 11223"
                  value={stfPhone}
                  onChange={(e) => setStfPhone(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn-gold"
                style={{ marginTop: '6px', minHeight: '42px', fontSize: '0.9rem', borderRadius: '8px', fontWeight: 800, width: '100%', justifyContent: 'center' }}
              >
                {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
