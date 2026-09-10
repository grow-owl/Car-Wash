/**
 * Centralized formatting utilities for Car Wash Application
 */

/**
 * Format currency amount with Rupee symbol
 * @param {number|string} amount 
 * @returns {string} e.g. "₹499"
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Sanitize and clean 10-digit Indian phone numbers
 * @param {string} phone 
 * @returns {string} 10-digit clean phone or empty
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
};

/**
 * Format phone with +91 country code for WhatsApp/SMS
 * @param {string} phone 
 * @returns {string} e.g. "919876543210"
 */
export const formatWaPhone = (phone) => {
  const clean = (phone || '').replace(/\D/g, '');
  if (!clean) return '';
  return clean.startsWith('91') ? clean : `91${clean.slice(-10)}`;
};

/**
 * Format ISO date string to readable Indian date
 * @param {string|Date} dateStr 
 * @returns {string} e.g. "10 Sep 2026"
 */
export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

/**
 * Get YYYY-MM-DD string in local timezone
 * @param {Date} [d=new Date()]
 * @returns {string} e.g. "2026-09-10"
 */
export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
