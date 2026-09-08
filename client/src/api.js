import axiosLib from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axiosLib.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic JWT Authorization Header Attachment
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('carwash_admin_token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Owner & Admin Authentication
export const loginAdmin = (username, password) => api.post('/admin/auth/login', { username, password });
export const verifyAdminToken = () => api.get('/admin/auth/verify');
export const changeAdminPassword = (currentPassword, newPassword) => api.post('/admin/auth/change-password', { currentPassword, newPassword });

// Services & Packages Management
export const getServices = (vehicleType) => api.get('/services', { params: { vehicleType } });
export const getPackages = (vehicleType) => api.get('/services/packages', { params: { vehicleType } });
export const getAddons = () => api.get('/services/addons');
export const createService = (serviceData) => api.post('/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/services/${id}`);
export const uploadServiceImage = (imageData) => api.post('/services/upload', { image: imageData });

export const createPackage = (pkgData) => api.post('/services/packages', pkgData);
export const updatePackage = (id, pkgData) => api.put(`/services/packages/${id}`, pkgData);
export const deletePackage = (id) => api.delete(`/services/packages/${id}`);

// Bookings & Live Bays
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const createWalkInBooking = (walkInData) => api.post('/bookings/walkin', walkInData);
export const getBookings = (params) => api.get('/bookings', { params });
export const trackBooking = (code) => api.get(`/bookings/track/${code}`);
export const getCustomerTimeline = (phone) => api.get(`/bookings/customer-timeline/${phone}`);
export const updateBookingStatus = (id, data) => api.patch(`/bookings/${id}/status`, data);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);
export const getSlotsAvailability = (date) => api.get('/bookings/slots', { params: { date } });

export const getBays = () => api.get('/bookings/bays');
export const updateBayStatus = (id, data) => api.put(`/bookings/bays/${id}`, data);
export const payBooking = (id, data) => api.patch(`/bookings/${id}/pay`, data);
export const payBookingByCode = (code, data) => api.patch(`/bookings/track/${code}/pay`, data);

// Razorpay Payment Gateway Endpoints
export const getRazorpayConfig = () => api.get('/payment/config');
export const createRazorpayOrder = (data) => api.post('/payment/create-order', data);
export const verifyRazorpayPayment = (data) => api.post('/payment/verify', data);
export const reportPaymentFailure = (data) => api.post('/payment/failure', data);

// Customer Authentication & PIN Reset
export const checkPhoneExists = (identifier) => api.post('/crm/auth/check-phone', { identifier, phone: identifier });
export const loginCustomer = (identifier, pin) => api.post('/crm/auth/login', { identifier, phone: identifier, pin, password: pin });
export const signupCustomer = (data) => api.post('/crm/auth/signup', data);
export const resetCustomerPin = (phone, newPin) => api.post(`/crm/customers/${phone}/reset-pin`, { newPin });

// Abandoned Booking Recovery API
export const captureAbandonedBooking = (data) => api.post('/bookings/abandoned', data);
export const getAbandonedBookings = () => api.get('/bookings/abandoned');
export const sendAbandonedRecoveryOffer = (id) => api.post(`/bookings/abandoned/${id}/send-offer`);

// Automated Repeat Wash Reminders Engine
export const getDueWashCustomers = () => api.get('/crm/due-reminders');
export const sendDueWashReminder = (data) => api.post('/crm/send-due-reminder', data);

// CRM & Vehicle History
export const getCustomers = (search) => api.get('/crm/customers', { params: { search } });
export const getCustomerDetails = (phone) => api.get(`/crm/customers/${phone}`);
export const addCustomerVehicle = (phone, vehicleData) => api.post(`/crm/customers/${phone}/vehicles`, vehicleData);
export const updateCustomerProfile = (id, data) => api.put(`/crm/customers/${id}`, data);

export const getVehicleHistory = (number) => api.get(`/crm/vehicle/${number}`);
export const getBeforeAfterGallery = () => api.get('/crm/before-after');
export const uploadBeforeAfter = (data) => api.post('/crm/before-after', data);

// Marketing & Loyalty
export const validateCoupon = (code, amount) => api.post('/marketing/coupons/validate', { code, amount });
export const getCoupons = () => api.get('/marketing/coupons');
export const createCoupon = (data) => api.post('/marketing/coupons', data);
export const toggleCouponStatus = (id) => api.patch(`/marketing/coupons/${id}/toggle`);
export const deleteCoupon = (id) => api.delete(`/marketing/coupons/${id}`);
export const getMemberships = () => api.get('/marketing/memberships');
export const subscribeMembership = (data) => api.post('/marketing/memberships/subscribe', data);
export const getMembershipSubscriptions = () => api.get('/marketing/memberships/subscriptions');
export const getGiftCards = () => api.get('/marketing/giftcards');
export const buyGiftCard = (data) => api.post('/marketing/giftcards/buy', data);

// Financials & Analytics & Expenses
export const getAnalytics = () => api.get('/analytics/dashboard');
export const getExpenses = () => api.get('/analytics/expenses');
export const addExpense = (data) => api.post('/analytics/expenses', data);
export const deleteExpense = (id) => api.delete(`/analytics/expenses/${id}`);

// Staff Management
export const getStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

export const getAbandonedLeads = () => api.get('/marketing/abandoned');
export const sendRecoveryOffer = (id) => api.post(`/marketing/abandoned/${id}/recover`);

// Smart Leads Engine (Popup, Exit Intent, Booking Drops)
export const createLead = (data) => api.post('/marketing/leads', data);
export const getLeads = (params) => api.get('/marketing/leads', { params });
export const updateLeadStatus = (id, data) => api.patch(`/marketing/leads/${id}/status`, data);
export const deleteLead = (id) => api.delete(`/marketing/leads/${id}`);
export const sendLeadOffer = (id) => api.post(`/marketing/leads/${id}/send-offer`);

export default api;
