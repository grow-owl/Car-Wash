import api from './client';

// Bookings & Live Bays Management
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
