import api from './client';

// CRM & Vehicle History
export const getCustomers = (search) => api.get('/crm/customers', { params: { search } });
export const getCustomerDetails = (phone) => api.get(`/crm/customers/${phone}`);
export const addCustomerVehicle = (phone, vehicleData) => api.post(`/crm/customers/${phone}/vehicles`, vehicleData);
export const updateCustomerProfile = (id, data) => api.put(`/crm/customers/${id}`, data);

export const getVehicleHistory = (number) => api.get(`/crm/vehicle/${number}`);
export const getBeforeAfterGallery = () => api.get('/crm/before-after');
export const uploadBeforeAfter = (data) => api.post('/crm/before-after', data);

// Abandoned Booking Recovery
export const captureAbandonedBooking = (data) => api.post('/bookings/abandoned', data);
export const getAbandonedBookings = () => api.get('/bookings/abandoned');
export const sendAbandonedRecoveryOffer = (id) => api.post(`/bookings/abandoned/${id}/send-offer`);

// Automated Repeat Wash Reminders Engine
export const getDueWashCustomers = () => api.get('/crm/due-reminders');
export const sendDueWashReminder = (data) => api.post('/crm/send-due-reminder', data);
