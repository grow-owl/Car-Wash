import axios from 'react';
import axiosLib from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axiosLib.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Services & Packages
export const getServices = (vehicleType) => api.get('/services', { params: { vehicleType } });
export const getPackages = (vehicleType) => api.get('/services/packages', { params: { vehicleType } });
export const getAddons = () => api.get('/services/addons');
export const createService = (serviceData) => api.post('/services', serviceData);

// Bookings
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const createWalkInBooking = (walkInData) => api.post('/bookings/walkin', walkInData);
export const getBookings = (params) => api.get('/bookings', { params });
export const trackBooking = (code) => api.get(`/bookings/track/${code}`);
export const updateBookingStatus = (id, data) => api.patch(`/bookings/${id}/status`, data);
export const getSlotsAvailability = (date) => api.get('/bookings/slots', { params: { date } });

// CRM & Vehicle History
export const getCustomers = (search) => api.get('/crm/customers', { params: { search } });
export const getCustomerDetails = (phone) => api.get(`/crm/customers/${phone}`);
export const getVehicleHistory = (number) => api.get(`/crm/vehicle/${number}`);
export const getBeforeAfterGallery = () => api.get('/crm/before-after');
export const uploadBeforeAfter = (data) => api.post('/crm/before-after', data);

// Marketing & Loyalty
export const validateCoupon = (code, amount) => api.post('/marketing/coupons/validate', { code, amount });
export const getCoupons = () => api.get('/marketing/coupons');
export const createCoupon = (data) => api.post('/marketing/coupons', data);
export const getMemberships = () => api.get('/marketing/memberships');
export const subscribeMembership = (data) => api.post('/marketing/memberships/subscribe', data);
export const getGiftCards = () => api.get('/marketing/giftcards');
export const buyGiftCard = (data) => api.post('/marketing/giftcards/buy', data);

// Financials & Analytics
export const getAnalytics = () => api.get('/analytics/dashboard');
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const getStaff = () => api.get('/expenses/staff');
export const getAbandonedLeads = () => api.get('/expenses/abandoned');
export const sendRecoveryOffer = (id) => api.post(`/expenses/abandoned/${id}/recover`);

export default api;
