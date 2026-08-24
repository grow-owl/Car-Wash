import React from 'react';
import { CheckCircle2, Printer, ExternalLink, Calendar, Clock, Car, Phone, Shield, MessageSquare } from 'lucide-react';

export default function DigitalInvoiceModal({ booking, isOpen, onClose, onTrackLive }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 250,
      background: 'rgba(0, 31, 35, 0.9)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '600px',
        width: '100%',
        padding: '32px',
        border: '1px solid var(--accent-aqua)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* Header Status */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(15, 164, 175, 0.2)',
            color: 'var(--accent-aqua)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            border: '2px solid var(--accent-aqua)'
          }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.7rem', color: '#FFFFFF' }}>Booking Confirmed!</h2>
          <div style={{ fontSize: '0.88rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
            Official Digital Receipt & Bay Ticket
          </div>
        </div>

        {/* Invoice Ticket Body */}
        <div style={{
          background: 'rgba(0, 49, 53, 0.95)',
          border: '1px dashed var(--accent-aqua)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TRACKING CODE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
                {booking.trackingCode}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYMENT MODE</div>
              <div className="badge badge-aqua">{booking.paymentMode || 'Online'} ({booking.paymentStatus || 'Paid'})</div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '12px', marginBottom: '16px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Customer:</span> <strong>{booking.customerName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong>{booking.phone}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span> <strong>{booking.vehicleNumber} ({booking.vehicleType})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Slot:</span> <strong>{booking.date} at {booking.slotTime}</strong>
            </div>
          </div>

          {/* Items breakdown */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '6px' }}>
              SERVICES & ADDONS
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
              <span>{booking.serviceName}</span>
              <span>₹{booking.totalAmount + (booking.discountAmount || 0)}</span>
            </div>
            {booking.addons && booking.addons.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>+ {a.name}</span>
                <span>+₹{a.price}</span>
              </div>
            ))}
            {booking.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#e0725a', fontWeight: 700, marginTop: '4px' }}>
                <span>Coupon ({booking.couponApplied})</span>
                <span>-₹{booking.discountAmount}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--accent-aqua)', paddingTop: '10px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>Total Paid:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
              ₹{booking.totalAmount}
            </div>
          </div>
        </div>

        {/* WhatsApp Notification Simulation Notice */}
        <div style={{
          background: 'rgba(15, 164, 175, 0.12)',
          border: '1px solid var(--accent-aqua)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.82rem',
          color: 'var(--ice-tint)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <MessageSquare size={20} color="var(--accent-aqua)" />
          <div>
            <strong>Automated Notification Sent:</strong> A WhatsApp receipt with tracking link was dispatched to <strong>{booking.phone}</strong>.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Printer size={18} /> Print Invoice
          </button>
          
          <button
            onClick={() => {
              onClose();
              onTrackLive(booking.trackingCode);
            }}
            className="btn-aqua"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <ExternalLink size={18} /> Track Job Live
          </button>
        </div>

      </div>
    </div>
  );
}
