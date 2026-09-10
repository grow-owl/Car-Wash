import api from './client';

// Razorpay Payment Gateway Endpoints
export const getRazorpayConfig = () => api.get('/payment/config');
export const createRazorpayOrder = (data) => api.post('/payment/create-order', data);
export const verifyRazorpayPayment = (data) => api.post('/payment/verify', data);
export const reportPaymentFailure = (data) => api.post('/payment/failure', data);
