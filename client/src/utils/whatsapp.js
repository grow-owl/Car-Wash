/**
 * WhatsApp message templates and deep-link generators
 */
import { formatWaPhone } from './formatters';

/**
 * Generate official tax invoice WhatsApp link
 */
export const generateInvoiceWhatsAppUrl = ({ booking, siteBaseUrl, helpline = '+91 86095 04186' }) => {
  if (!booking) return '';
  const siteBase = siteBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://car-wash-grow-owl.vercel.app');
  const siteDisplay = siteBase.replace(/^https?:\/\//, '');
  const code = booking.trackingCode || booking.bookingCode || ('CW-' + (booking._id ? booking._id.slice(-4).toUpperCase() : '1001'));
  const invoiceNo = booking.invoiceNumber || 'CW2026-0001';
  const trackLink = `${siteBase}/?track=${code}`;
  const invoiceLink = `${siteBase}/?track=${code}&invoice=1`;
  const waPhone = formatWaPhone(booking.phone);

  const cleanInvoiceMsg = 
    `*CAR WASH AUTO SPA*\n` +
    `_Official Tax Invoice_\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Dear *${booking.customerName || 'Customer'}*,\n` +
    `Your official tax invoice for vehicle *${booking.vehicleNumber || ''}* is ready.\n\n` +
    `*INVOICE & SERVICE DETAILS*\n` +
    `• Invoice No: *${invoiceNo}*\n` +
    `• Tracking ID: ${code}\n` +
    `• Vehicle: ${booking.vehicleNumber || ''} (${booking.vehicleModel || booking.vehicleType || 'Car'})\n` +
    `• Service: ${booking.serviceName || booking.packageName || 'Pro Wash'}\n` +
    `• Total Amount: Rs. ${booking.totalAmount || 0} (${booking.paymentStatus || 'Pending'})\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `*LIVE STATUS TRACKING*\n` +
    `${trackLink}\n\n` +
    `*DIGITAL TAX INVOICE*\n` +
    `${invoiceLink}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*CAR WASH AUTO SPA*\n` +
    `• Helpline: ${helpline}\n` +
    `• Website: ${siteDisplay}\n` +
    `_Drive Clean. Go Further._`;

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(cleanInvoiceMsg)}`;
};
