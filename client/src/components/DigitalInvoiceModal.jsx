import React from 'react';
import { Printer, MessageSquare, ExternalLink, X } from 'lucide-react';

export default function DigitalInvoiceModal({ booking, isOpen = true, onClose, onTrackLive }) {
  if (!booking) return null;
  if (isOpen === false) return null;

  const handlePrint = () => {
    window.print();
  };

  // Extract / Calculate dynamic sequential invoice number (e.g. CW2026-0001, CW2027-0001)
  const dateStr = booking.date || new Date().toISOString().split('T')[0];
  const yearStr = (dateStr.includes('-') ? dateStr.split('-')[0] : '2026') || '2026';
  
  let invoiceNumber = booking.invoiceNumber;
  if (!invoiceNumber) {
    const rawSeq = booking.trackingCode 
      ? booking.trackingCode.replace(/[^0-9]/g, '') 
      : (booking._id ? parseInt(booking._id.slice(-4), 16) : 1);
    const paddedSeq = String(rawSeq || '1').slice(-4).padStart(4, '0');
    invoiceNumber = `CW${yearStr}-${paddedSeq}`;
  }
  
  const trackingCode = booking.trackingCode || booking.bookingCode || invoiceNumber;
  
  const customerName = booking.customerName || 'Valued Customer';
  const phone = booking.phone || '+91 86095 04186';
  const vehicleNumber = booking.vehicleNumber || 'WB-74-AX-8821';
  const vehicleModel = booking.vehicleModel || (booking.vehicleBrand ? `${booking.vehicleBrand} ${booking.vehicleType || ''}` : booking.vehicleType || 'Sedan');
  const vehicleType = booking.vehicleType || 'Sedan';

  const paymentMode = booking.paymentMode || 'Online (UPI/Card)';
  const paymentStatus = booking.paymentStatus || 'Paid';
  const bookingStatus = booking.status || 'Confirmed';

  const addons = booking.addons || [];
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const discount = Number(booking.discountAmount) || 0;
  const totalAmount = Number(booking.totalAmount) || 0;
  
  // Calculate base service price if not explicitly stored
  const servicePrice = booking.servicePrice !== undefined 
    ? Number(booking.servicePrice) 
    : Math.max(0, totalAmount + discount - addonsTotal);

  const subtotal = totalAmount + discount;

  // Build Line Items
  const lineItems = [
    {
      description: booking.serviceName || booking.packageName || 'Full Car Wash & Detailing Service',
      qty: 1,
      unitPrice: servicePrice,
      amount: servicePrice
    },
    ...addons.map((addon) => ({
      description: `Add-on: ${addon.name}`,
      qty: 1,
      unitPrice: Number(addon.price) || 0,
      amount: Number(addon.price) || 0
    }))
  ];

  // 10 Service Item Rows for 100% 1-Page A4 fit
  const totalTableRows = 10;
  const emptyRowsCount = Math.max(0, totalTableRows - lineItems.length);

  const whatsappMessage = `CAR WASH AUTO SPA - TAX INVOICE\n\n` +
    `Dear ${customerName},\n\n` +
    `Invoice No: ${invoiceNumber}\n` +
    `Date: ${dateStr}\n` +
    `Vehicle: ${vehicleNumber} (${vehicleModel})\n` +
    `Service: ${booking.serviceName || booking.packageName}\n` +
    `Total Amount: Rs. ${totalAmount} (${paymentStatus})\n` +
    `Tracking Code: ${trackingCode}\n\n` +
    `Thank you for choosing Car Wash Auto Spa.`;

  const waShareUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="invoice-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 12000,
      background: 'rgba(6, 20, 27, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflowY: 'auto'
    }}>
      {/* 1-PAGE A4 PRINT CSS OPTIMIZATION */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            height: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .invoice-printable-sheet, .invoice-printable-sheet * {
            visibility: visible;
          }
          .invoice-watermark {
            opacity: 0.055 !important;
            display: flex !important;
            visibility: visible !important;
          }
          .invoice-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #FFFFFF !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          .invoice-printable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 8px 12px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-modal-controls {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '780px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '96vh' }}>
        
        {/* TOP ACTION CONTROLS BAR (HIDDEN IN PRINT) */}
        <div className="invoice-modal-controls" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 49, 53, 0.85)',
          border: '1px solid var(--border-light)',
          borderRadius: '10px',
          padding: '8px 14px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
              Official Tax Invoice
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
              {invoiceNumber}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-gold"
              style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} /> Print / Save PDF (1-Page)
            </button>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={14} /> WhatsApp Receipt
            </a>

            {onTrackLive && (
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onTrackLive(trackingCode);
                }}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={14} /> Track Job
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(74, 92, 106, 0.4)',
                  color: '#CCD0CF',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET (EXACT 1-PAGE A4 FORMAT) */}
        <div
          className="invoice-printable-sheet"
          style={{
            position: 'relative',
            background: '#FFFFFF',
            color: '#1A2930',
            borderRadius: '10px',
            padding: '24px 30px',
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
        >
          {/* ELEGANT CARWASH LOGO WATERMARK */}
          <div
            className="invoice-watermark"
            style={{
              position: 'absolute',
              top: '52%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-25deg)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
              opacity: 0.05,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '440px'
            }}
            aria-hidden="true"
          >
            <img
              src="/logo.webp"
              alt=""
              style={{
                width: '260px',
                height: 'auto',
                filter: 'grayscale(100%)',
                marginBottom: '10px'
              }}
            />
            <div style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#003135',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              CAR WASH
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '0.3em',
              color: '#64748B',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>
              AUTO SPA
            </div>
          </div>

          {/* HEADER SECTION */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px', marginBottom: '12px' }}>
            {/* Logo & Business Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/logo.webp"
                  alt="CARWASH Logo"
                  style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#003135', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                    CAR<span style={{ color: '#0FA4AF' }}>WASH</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', marginTop: '1px' }}>
                    AUTO SPA & MANAGEMENT
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                AUTO SPA & MANAGEMENT
              </div>
            </div>

            {/* INVOICE TITLE & METADATA */}
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F2C3F', margin: '0 0 4px 0', letterSpacing: '0.05em' }}>
                INVOICE
              </h1>

              <table style={{ marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '0.76rem', color: '#334155' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '1px 6px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Invoice No.</td>
                    <td style={{ padding: '1px 3px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '1px 6px', textAlign: 'left', fontWeight: 800, color: '#0FA4AF' }}>{invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 6px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Date</td>
                    <td style={{ padding: '1px 3px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '1px 6px', textAlign: 'left', fontWeight: 600 }}>{dateStr} {booking.slotTime ? `(${booking.slotTime})` : ''}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 6px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Payment Mode</td>
                    <td style={{ padding: '1px 3px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '1px 6px', textAlign: 'left', fontWeight: 600 }}>{paymentMode}</td>
                  </tr>
                  {booking.razorpayPaymentId && (
                    <tr>
                      <td style={{ padding: '1px 6px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Razorpay Txn</td>
                      <td style={{ padding: '1px 3px', fontWeight: 700 }}>:</td>
                      <td style={{ padding: '1px 6px', textAlign: 'left', fontWeight: 700, color: '#0284C7', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        {booking.razorpayPaymentId}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '1px 6px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Status</td>
                    <td style={{ padding: '1px 3px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '1px 6px', textAlign: 'left', fontWeight: 800, color: paymentStatus === 'Paid' ? '#16A34A' : '#E11D48' }}>
                      {paymentStatus} ({bookingStatus})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS CONTAINER */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1.5px solid #BAE6FD',
            borderRadius: '6px',
            marginBottom: '12px',
            background: 'rgba(240, 249, 255, 0.88)',
            overflow: 'hidden'
          }}>
            {/* Customer Details Box */}
            <div style={{ padding: '10px 14px', borderRight: '1.5px solid #BAE6FD' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284C7', marginBottom: '6px', letterSpacing: '0.02em' }}>
                Customer Details
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', color: '#334155' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '95px', padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Name</td>
                    <td style={{ width: '10px', padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>{customerName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Phone</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>{phone}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Vehicle No.</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0', fontWeight: 800, color: '#0284C7' }}>{vehicleNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Vehicle Model</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>{vehicleModel}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Vehicle Type</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>{vehicleType}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Service Center Details Box */}
            <div style={{ padding: '10px 14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284C7', marginBottom: '6px', letterSpacing: '0.02em' }}>
                Service Center Details
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', color: '#334155' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '105px', padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Business Name</td>
                    <td style={{ width: '10px', padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0', fontWeight: 700 }}>CAR WASH AUTO SPA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Address</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>Sevoke Road, Siliguri, WB 734001</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Phone</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>+91 86095 04186</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>Email</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>info@carwash.in</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', fontWeight: 700, color: '#0F172A' }}>GST No.</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>19AAACC1234M1Z5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '12px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.78rem',
              border: '1.5px solid #BAE6FD'
            }}>
              <thead>
                <tr style={{ background: '#E0F2FE', color: '#0369A1', textAlign: 'left', borderBottom: '1.5px solid #BAE6FD' }}>
                  <th style={{ width: '38px', padding: '5px 8px', textAlign: 'center', borderRight: '1px solid #BAE6FD' }}>#</th>
                  <th style={{ padding: '5px 8px', borderRight: '1px solid #BAE6FD' }}>Service Description</th>
                  <th style={{ width: '50px', padding: '5px 8px', textAlign: 'center', borderRight: '1px solid #BAE6FD' }}>Qty</th>
                  <th style={{ width: '100px', padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #BAE6FD' }}>Unit Price (₹)</th>
                  <th style={{ width: '110px', padding: '5px 8px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {/* Populated Service Items */}
                {lineItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #E2E8F0', background: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700, color: '#64748B', borderRight: '1px solid #BAE6FD', fontSize: '0.74rem' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '4px 8px', fontWeight: 600, color: '#0F172A', borderRight: '1px solid #BAE6FD', fontSize: '0.76rem' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'center', color: '#334155', borderRight: '1px solid #BAE6FD', fontSize: '0.74rem' }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', color: '#334155', borderRight: '1px solid #BAE6FD', fontSize: '0.76rem' }}>
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: '#0F172A', fontSize: '0.76rem' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}

                {/* Compact Filler Rows (Up to 10 total) */}
                {Array.from({ length: emptyRowsCount }).map((_, i) => (
                  <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #E2E8F0', height: '21px' }}>
                    <td style={{ padding: '2px 8px', textAlign: 'center', color: '#CBD5E1', borderRight: '1px solid #BAE6FD', fontSize: '0.7rem' }}>
                      {lineItems.length + i + 1}
                    </td>
                    <td style={{ borderRight: '1px solid #BAE6FD' }}></td>
                    <td style={{ borderRight: '1px solid #BAE6FD' }}></td>
                    <td style={{ borderRight: '1px solid #BAE6FD' }}></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTTOM SUMMARY & BRANDING SECTION */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '16px',
            alignItems: 'stretch',
            marginBottom: '12px'
          }}>
            {/* Left Slogan & Contact Details Aligned */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F2C3F', lineHeight: 1.15 }}>
                  Drive Clean.
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284C7', lineHeight: 1.15 }}>
                  Go Further.
                </div>
              </div>

              {/* Clean Vertical Contact Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px', fontSize: '0.74rem', color: '#475569' }}>
                <div><span style={{ fontWeight: 700, color: '#0F2C3F' }}>Phone:</span> +91 86095 04186</div>
                <div><span style={{ fontWeight: 700, color: '#0F2C3F' }}>Email:</span> info@carwash.in</div>
                <div><span style={{ fontWeight: 700, color: '#0F2C3F' }}>Web:</span> www.carwash.in</div>
              </div>
            </div>

            {/* Right Financials Summary Box */}
            <div style={{
              background: '#F0F9FF',
              border: '1.5px solid #BAE6FD',
              borderRadius: '6px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569' }}>
                <span style={{ fontWeight: 600 }}>Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#E11D48' }}>
                  <span style={{ fontWeight: 600 }}>Discount {booking.couponApplied ? `(${booking.couponApplied})` : ''}</span>
                  <span style={{ fontWeight: 700 }}>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569' }}>
                <span style={{ fontWeight: 600 }}>GST (18% Incl.)</span>
                <span style={{ fontWeight: 600, color: '#64748B' }}>₹0.00</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.02rem',
                fontWeight: 900,
                color: '#0369A1',
                borderTop: '1.5px solid #BAE6FD',
                paddingTop: '6px',
                marginTop: '3px'
              }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* MOTTO FOOTER */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#0284C7',
            letterSpacing: '0.1em',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '8px'
          }}>
            CLEAN TODAY &nbsp;•&nbsp; BETTER TOMORROW
          </div>

        </div>

      </div>
    </div>
  );
}
