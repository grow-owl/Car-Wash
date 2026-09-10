import React, { useState, useEffect } from 'react';
import {
  getAnalytics, getBookings, updateBookingStatus, createWalkInBooking, deleteBooking,
  getCustomers, getStaff, createStaff, updateStaff, deleteStaff, getExpenses, addExpense, deleteExpense,
  getCoupons, createCoupon, deleteCoupon, 
  getServices, getPackages, getAddons, createService, updateService, deleteService, uploadServiceImage,
  getBays, updateBayStatus, getLeads, getCustomerTimeline, getMembershipSubscriptions
} from '../api';
import DigitalInvoiceModal from '../components/DigitalInvoiceModal';
import AdminStatsHeader from '../components/admin/AdminStatsHeader';
import WhatsappNotificationToast from '../components/admin/WhatsappNotificationToast';
import {
  DeleteConfirmModal,
  WalkInBookingModal,
  ServiceFormModal,
  CouponFormModal,
  StaffFormModal,
  CustomerTimelineModal,
  BayAllotmentModal,
  ExportCsvModal
} from '../components/admin/modals';
import {
  AdminAnalyticsTab,
  AdminBookingsTab,
  AdminCrmTab,
  AdminServicesTab,
  AdminExpensesStaffTab,
  AdminFinancialsTab
} from '../components/admin/tabs';
import { getLocalDateString } from '../utils';

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
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [leads, setLeads] = useState([]);
  const [membershipSubscriptions, setMembershipSubscriptions] = useState([]);

  // Internal Sub-tabs
  const [crmSubTab, setCrmSubTab] = useState('customers');
  const [serviceSubTab, setServiceSubTab] = useState('services');
  const [expenseSubTab, setExpenseSubTab] = useState('expenses');
  const [showFinancialFigures, setShowFinancialFigures] = useState(false);

  // Services Sorting & Filtering
  const [svcSearchQuery, setSvcSearchQuery] = useState('');
  const [svcCategoryFilter, setSvcCategoryFilter] = useState('all');
  const [svcSortOption, setSvcSortOption] = useState('default');
  const [showSvcSortDropdown, setShowSvcSortDropdown] = useState(false);
  const [showSvcViewDropdown, setShowSvcViewDropdown] = useState(false);

  // Advanced Filters, Date Ranges & Sorting for Bookings
  const [bookingFilter, setBookingFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Customer Lifetime History Modal (2-Year Wash Explorer)
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Modals & Invoices
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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

  // Walk-In Form
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
  const [cpnValue, setCpnValue] = useState(50);
  const [cpnMinOrder, setCpnMinOrder] = useState(499);

  // Staff Form State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [stfName, setStfName] = useState('');
  const [stfPhone, setStfPhone] = useState('+91 ');
  const [stfSalary, setStfSalary] = useState('');

  // Refresh & Sync status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [whatsappToast, setWhatsappToast] = useState(null);
  const [allotModalBay, setAllotModalBay] = useState(null);

  useEffect(() => {
    fetchAllAdminData();
  }, [activeSubTab, refreshTrigger]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowSvcSortDropdown(false);
      setShowSvcViewDropdown(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const fetchAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [anaRes, bookRes, custRes, stfRes, expRes, cpnRes, svcRes, bayRes, leadRes, memSubRes, pkgRes, addRes] = await Promise.all([
        getAnalytics(),
        getBookings(),
        getCustomers(),
        getStaff(),
        getExpenses(),
        getCoupons(),
        getServices(),
        getBays(),
        getLeads(),
        getMembershipSubscriptions().catch(() => ({ data: [] })),
        getPackages().catch(() => ({ data: [] })),
        getAddons().catch(() => ({ data: [] }))
      ]);
      setAnalytics(anaRes.data);
      setBookings(bookRes.data || []);
      setCustomers(custRes.data || []);
      setStaff(stfRes.data || []);
      setExpenses(expRes.data || []);
      setCoupons(cpnRes.data || []);
      setServices(svcRes.data || []);
      setPackages(pkgRes?.data || []);
      setAddons(addRes?.data || []);
      setBays(bayRes.data || []);
      if (leadRes && leadRes.data) setLeads(leadRes.data);
      if (memSubRes && memSubRes.data) setMembershipSubscriptions(memSubRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateBookingStatus(id, { status: newStatus });
      fetchAllAdminData();
      if (res.data?.whatsappNotification) {
        const waNotif = res.data.whatsappNotification;
        const targetLink = waNotif.waLinkCustomer || waNotif.waLink;

        if (targetLink) {
          try {
            window.open(targetLink, '_blank');
          } catch (e) {
            console.warn('Auto WhatsApp popup blocked:', e);
          }
        }

        setWhatsappToast({
          customerName: waNotif.customerName,
          phone: waNotif.phone,
          status: newStatus,
          waLink: targetLink,
          waLinkCustomer: targetLink,
          waLinkOwner: waNotif.waLinkOwner,
          invoiceUrl: waNotif.invoiceUrl,
          trackUrl: waNotif.trackUrl
        });
        setTimeout(() => setWhatsappToast(null), 30000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating status');
    }
  };

  const handleBayChange = async (id, newBay) => {
    try {
      await updateBookingStatus(id, { bayAssigned: newBay, assignedBay: newBay });
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update bay');
    }
  };

  const handleAllotCarToBay = async (bookingId, bayName) => {
    try {
      const res = await updateBookingStatus(bookingId, { 
        bayAssigned: bayName,
        assignedBay: bayName,
        status: 'washing'
      });
      setAllotModalBay(null);
      fetchAllAdminData();
      if (res.data?.whatsappNotification) {
        const waNotif = res.data.whatsappNotification;
        const targetLink = waNotif.waLinkCustomer || waNotif.waLink;
        if (targetLink) {
          try {
            window.open(targetLink, '_blank');
          } catch (e) {}
        }
        setWhatsappToast({
          customerName: waNotif.customerName,
          phone: waNotif.phone,
          status: 'washing',
          waLink: targetLink,
          waLinkCustomer: targetLink,
          waLinkOwner: waNotif.waLinkOwner,
          invoiceUrl: waNotif.invoiceUrl,
          trackUrl: waNotif.trackUrl
        });
        setTimeout(() => setWhatsappToast(null), 30000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to allot car to bay');
    }
  };

  const getActiveBookingForBay = (bayNumOrName) => {
    const bayStr = typeof bayNumOrName === 'number' ? `BAY ${bayNumOrName}` : String(bayNumOrName || '').toUpperCase();
    const activeStatuses = ['washing', 'detailing', 'vehicle_received', 'quality_check', 'in_bay'];
    
    const active = bookings.find(b => {
      const assigned = String(b.bayAssigned || b.assignedBay || '').toUpperCase();
      return assigned.includes(bayStr) && activeStatuses.includes(b.status?.toLowerCase());
    });
    if (active) return active;

    return bookings.find(b => {
      const assigned = String(b.bayAssigned || b.assignedBay || '').toUpperCase();
      return assigned.includes(bayStr) && (b.status === 'confirmed' || b.status === 'pending');
    });
  };

  const handleWalkInSubmit = async (walkInData) => {
    try {
      const res = await createWalkInBooking(walkInData);
      if (setShowWalkInModal) setShowWalkInModal(false);
      fetchAllAdminData();

      if (res.data?.whatsappNotification?.waLinkCustomer) {
        try {
          window.open(res.data.whatsappNotification.waLinkCustomer, '_blank');
        } catch (e) {}
      }
    } catch (err) {
      console.error('Walk-in booking error:', err);
      alert(err.response?.data?.error || 'Error creating walk-in booking');
    }
  };

  const handleDeleteBooking = async (bookingId, code) => {
    openDeleteConfirm(
      'Delete Booking?',
      `Booking ${code || ''}`,
      async () => {
        try {
          await deleteBooking(bookingId);
          fetchAllAdminData();
        } catch (err) {
          alert(err.response?.data?.error || 'Failed to delete booking');
        }
      }
    );
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }
    try {
      await addExpense({
        category: expCategory || 'Supplies',
        amount: Number(expAmount),
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        description: expNotes || '',
        notes: expNotes || ''
      });
      setExpAmount('');
      setExpNotes('');
      fetchAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      fetchAllAdminData();
    } catch {
      alert('Error deleting expense');
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
        console.warn('Cloudinary upload fallback to data URI:', err);
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

  const handleDeleteService = async (id) => {
    try {
      await deleteService(id);
      fetchAllAdminData();
    } catch {
      alert('Error deleting service');
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

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteCoupon(id);
      fetchAllAdminData();
    } catch {
      alert('Error deleting coupon');
    }
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStfName('');
    setStfPhone('+91 ');
    setStfSalary('');
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (stf) => {
    setEditingStaff(stf);
    setStfName(stf.name || '');
    setStfPhone(stf.phone || '');
    setStfSalary(stf.salary || '');
    setShowStaffModal(true);
  };

  const handleSaveStaffSubmit = async (e) => {
    e.preventDefault();
    if (!stfName.trim()) return;
    try {
      if (editingStaff) {
        await updateStaff(editingStaff._id, {
          name: stfName.trim(),
          phone: stfPhone.trim(),
          salary: Number(stfSalary) || 0
        });
      } else {
        await createStaff({
          name: stfName.trim(),
          phone: stfPhone.trim(),
          salary: Number(stfSalary) || 0
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

  const handleDeleteStaff = async (id) => {
    try {
      await deleteStaff(id);
      fetchAllAdminData();
    } catch {
      alert('Error deleting staff');
    }
  };

  const matchesDateRange = (bookingDateStr) => {
    if (timeFilter === 'all') return true;
    if (!bookingDateStr) return false;

    const bDateStr = bookingDateStr.includes('T') ? bookingDateStr.split('T')[0] : bookingDateStr;
    const todayStr = getLocalDateString(new Date());

    if (timeFilter === 'today') return bDateStr === todayStr;
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

  const handleExportCSV = () => {
    setShowExportModal(true);
  };


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

      {/* 1. TOP STATS BAR */}
      <AdminStatsHeader
        bookings={bookings}
        bays={bays}
        getActiveBookingForBay={getActiveBookingForBay}
      />

      {/* 2. TAB: OVERVIEW & BAYS */}
      {activeSubTab === 'analytics' && (
        <AdminAnalyticsTab
          bookings={bookings}
          bays={bays}
          getActiveBookingForBay={getActiveBookingForBay}
          handleStatusChange={handleStatusChange}
          handleBayChange={handleBayChange}
          setAllotModalBay={setAllotModalBay}
          setWalkInVeh={setWalkInVeh}
          setShowWalkInModal={setShowWalkInModal}
          handleOpenCustomerTimeline={handleOpenCustomerTimeline}
          setActiveSubTab={setActiveSubTab}
        />
      )}

      {/* 3. TAB: BOOKINGS & ARCHIVE */}
      {activeSubTab === 'bookings' && (
        <AdminBookingsTab
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          bookingFilter={bookingFilter}
          setBookingFilter={setBookingFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          filteredBookings={filteredBookings}
          handleExportCSV={handleExportCSV}
          setShowWalkInModal={setShowWalkInModal}
          handleOpenCustomerTimeline={handleOpenCustomerTimeline}
          handleBayChange={handleBayChange}
          handleStatusChange={handleStatusChange}
          handleDeleteBooking={handleDeleteBooking}
          setInvoiceBooking={setInvoiceBooking}
        />
      )}

      {/* 4. TAB: CUSTOMERS & LEADS */}
      {activeSubTab === 'crm' && (
        <AdminCrmTab
          crmSubTab={crmSubTab}
          setCrmSubTab={setCrmSubTab}
          customers={customers}
          membershipSubscriptions={membershipSubscriptions}
          leads={leads}
          coupons={coupons}
          handleOpenCustomerTimeline={handleOpenCustomerTimeline}
        />
      )}

      {/* 5. TAB: SERVICES & PRICING */}
      {activeSubTab === 'services' && (
        <AdminServicesTab
          serviceSubTab={serviceSubTab}
          setServiceSubTab={setServiceSubTab}
          services={services}
          coupons={coupons}
          svcSearchQuery={svcSearchQuery}
          setSvcSearchQuery={setSvcSearchQuery}
          svcCategoryFilter={svcCategoryFilter}
          setSvcCategoryFilter={setSvcCategoryFilter}
          svcSortOption={svcSortOption}
          setSvcSortOption={setSvcSortOption}
          showSvcSortDropdown={showSvcSortDropdown}
          setShowSvcSortDropdown={setShowSvcSortDropdown}
          showSvcViewDropdown={showSvcViewDropdown}
          setShowSvcViewDropdown={setShowSvcViewDropdown}
          setEditingService={setEditingService}
          setSvcName={setSvcName}
          setSvcCategory={setSvcCategory}
          setSvcBasePrice={setSvcBasePrice}
          setSvcImage={setSvcImage}
          setShowAddServiceModal={setShowAddServiceModal}
          setShowAddCouponModal={setShowAddCouponModal}
          openDeleteConfirm={openDeleteConfirm}
          handleDeleteService={handleDeleteService}
          handleDeleteCoupon={handleDeleteCoupon}
        />
      )}

      {/* 6. TAB: STAFF & EXPENSES */}
      {activeSubTab === 'expenses' && (
        <AdminExpensesStaffTab
          expenseSubTab={expenseSubTab}
          setExpenseSubTab={setExpenseSubTab}
          expenses={expenses}
          staff={staff}
          analytics={analytics}
          showFinancialFigures={showFinancialFigures}
          setShowFinancialFigures={setShowFinancialFigures}
          expCategory={expCategory}
          setExpCategory={setExpCategory}
          expAmount={expAmount}
          setExpAmount={setExpAmount}
          expNotes={expNotes}
          setExpNotes={setExpNotes}
          handleAddExpenseSubmit={handleAddExpenseSubmit}
          handleOpenAddStaff={handleOpenAddStaff}
          handleOpenEditStaff={handleOpenEditStaff}
          handleStaffQuickStatusChange={handleStaffQuickStatusChange}
          openDeleteConfirm={openDeleteConfirm}
          handleDeleteExpense={handleDeleteExpense}
          handleDeleteStaff={handleDeleteStaff}
        />
      )}

      {/* 7. TAB: FINANCIALS & PROFIT */}
      {activeSubTab === 'financials' && (
        <AdminFinancialsTab
          analytics={analytics}
          expenses={expenses}
          showFinancialFigures={showFinancialFigures}
          setShowFinancialFigures={setShowFinancialFigures}
        />
      )}

      {/* MODALS */}
      <DeleteConfirmModal
        confirmModal={confirmModal}
        onClose={closeDeleteConfirm}
        onConfirm={executeDelete}
        closeDeleteConfirm={closeDeleteConfirm}
        executeDelete={executeDelete}
      />

      <WalkInBookingModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        services={services}
        packages={packages}
        addons={addons}
        bays={bays && bays.length > 0 ? bays.map(b => b.name || `BAY ${b.bayNumber}`) : ['BAY 1', 'BAY 2']}
        onSubmit={handleWalkInSubmit}
      />

      <ServiceFormModal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        editingService={editingService}
        svcName={svcName}
        setSvcName={setSvcName}
        svcCategory={svcCategory}
        setSvcCategory={setSvcCategory}
        svcBasePrice={svcBasePrice}
        setSvcBasePrice={setSvcBasePrice}
        svcImage={svcImage}
        setSvcImage={setSvcImage}
        uploadingImage={uploadingImage}
        handleImageFileUpload={handleImageFileUpload}
        onSubmit={handleSaveServiceSubmit}
      />

      <CouponFormModal
        isOpen={showAddCouponModal}
        onClose={() => setShowAddCouponModal(false)}
        cpnCode={cpnCode}
        setCpnCode={setCpnCode}
        cpnValue={cpnValue}
        setCpnValue={setCpnValue}
        cpnMinOrder={cpnMinOrder}
        setCpnMinOrder={setCpnMinOrder}
        onSubmit={handleCreateCouponSubmit}
      />

      <StaffFormModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        editingStaff={editingStaff}
        stfName={stfName}
        setStfName={setStfName}
        stfPhone={stfPhone}
        setStfPhone={setStfPhone}
        stfSalary={stfSalary}
        setStfSalary={setStfSalary}
        onSubmit={handleSaveStaffSubmit}
      />

      <CustomerTimelineModal
        isOpen={showTimelineModal}
        onClose={() => {
          setShowTimelineModal(false);
          setTimelineData(null);
        }}
        loadingTimeline={loadingTimeline}
        timelineData={timelineData}
        onViewInvoice={(b) => setInvoiceBooking(b)}
      />

      <BayAllotmentModal
        allotModalBay={allotModalBay}
        onClose={() => setAllotModalBay(null)}
        bookings={bookings}
        onAllotCarToBay={handleAllotCarToBay}
      />

      <ExportCsvModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        bookings={bookings}
      />

      {invoiceBooking && (
        <DigitalInvoiceModal
          booking={invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      )}

      <WhatsappNotificationToast
        toast={whatsappToast}
        onClose={() => setWhatsappToast(null)}
      />

    </div>
  );
}
