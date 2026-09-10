import api from './client';

// Analytics, Expenses & Financials
export const getAnalytics = () => api.get('/analytics/dashboard');
export const getExpenses = () => api.get('/analytics/expenses');
export const addExpense = (data) => api.post('/analytics/expenses', data);
export const deleteExpense = (id) => api.delete(`/analytics/expenses/${id}`);
