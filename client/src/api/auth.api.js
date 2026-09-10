import api from './client';

// Owner & Admin Authentication
export const loginAdmin = (username, password) => api.post('/admin/auth/login', { username, password });
export const verifyAdminToken = () => api.get('/admin/auth/verify');
export const changeAdminPassword = (currentPassword, newPassword) => api.post('/admin/auth/change-password', { currentPassword, newPassword });

// Customer Authentication & PIN Reset
export const checkPhoneExists = (identifier) => api.post('/crm/auth/check-phone', { identifier, phone: identifier });
export const loginCustomer = (identifier, pin) => api.post('/crm/auth/login', { identifier, phone: identifier, pin, password: pin });
export const signupCustomer = (data) => api.post('/crm/auth/signup', data);
export const resetCustomerPin = (phone, newPin) => api.post(`/crm/customers/${phone}/reset-pin`, { newPin });
