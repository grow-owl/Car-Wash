import api from './client';

// Marketing, Coupons & Loyalty Programs
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

// Smart Leads Engine & Abandoned Leads
export const getAbandonedLeads = () => api.get('/marketing/abandoned');
export const sendRecoveryOffer = (id) => api.post(`/marketing/abandoned/${id}/recover`);
export const createLead = (data) => api.post('/marketing/leads', data);
export const getLeads = (params) => api.get('/marketing/leads', { params });
export const updateLeadStatus = (id, data) => api.patch(`/marketing/leads/${id}/status`, data);
export const deleteLead = (id) => api.delete(`/marketing/leads/${id}`);
export const sendLeadOffer = (id) => api.post(`/marketing/leads/${id}/send-offer`);
