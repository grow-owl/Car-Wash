import React from 'react';
import { Printer, MessageSquare, ExternalLink, X } from 'lucide-react';

export default function DigitalInvoiceModal({ booking, isOpen = true, onClose, onTrackLive }) {
  if (!booking || isOpen === false) return null;

  const handlePrint = () => {
    window.print();
  };

  // Extract / Calculate dynamic sequential invoice number
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
  
  const servicePrice = booking.servicePrice !== undefined 
    ? Number(booking.servicePrice) 
    : Math.max(0, totalAmount + discount - addonsTotal);

  const subtotal = totalAmount + discount;

  // Split multiple booked services cleanly into individual line items
  const rawServices = (booking.serviceName || booking.packageName || 'Full Car Wash & Detailing Service')
    .split('+')
    .map(s => s.trim())
    .filter(Boolean);

  let lineItems = [];
  if (rawServices.length > 1) {
    const perServicePrice = Math.round(servicePrice / rawServices.length);
    lineItems = rawServices.map((svc, i) => {
      const itemPrice = (i === rawServices.length - 1)
        ? Math.max(0, servicePrice - (perServicePrice * (rawServices.length - 1)))
        : perServicePrice;
      return {
        description: svc,
        qty: 1,
        unitPrice: itemPrice,
        amount: itemPrice
      };
    });
  } else {
    lineItems = [
      {
        description: rawServices[0] || 'Full Car Wash & Detailing Service',
        qty: 1,
        unitPrice: servicePrice,
        amount: servicePrice
      }
    ];
  }

  // Append any addons
  if (addons && addons.length > 0) {
    addons.forEach((addon) => {
      lineItems.push({
        description: `Add-on: ${addon.name}`,
        qty: 1,
        unitPrice: Number(addon.price) || 0,
        amount: Number(addon.price) || 0
      });
    });
  }

  const siteBase = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://car-wash-grow-owl.vercel.app');
  const invoiceLink = `${siteBase}/?track=${trackingCode}&invoice=1`;
  const siteDisplay = siteBase.replace(/^https?:\/\//, '');

  const cleanInvoiceMessage = 
    `*CAR WASH AUTO SPA*\n` +
    `_Official Tax Invoice_\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Dear *${customerName}*,\n` +
    `Your tax invoice for vehicle *${vehicleNumber}* is ready.\n\n` +
    `*INVOICE & SERVICE DETAILS*\n` +
    `• Invoice No: *${invoiceNumber}*\n` +
    `• Tracking ID: ${trackingCode}\n` +
    `• Vehicle: ${vehicleNumber} (${vehicleModel})\n` +
    `• Service: ${booking.serviceName || booking.packageName}\n` +
    `• Total Amount: Rs. ${totalAmount} (${paymentStatus})\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `*DIGITAL TAX INVOICE*\n` +
    `View and download your official tax invoice:\n` +
    `${invoiceLink}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `*CAR WASH AUTO SPA*\n` +
    `• Helpline: +91 86095 04186\n` +
    `• Website: ${siteDisplay}\n` +
    `_Drive Clean. Go Further._`;

  const cleanCustPhone = phone.replace(/[^0-9]/g, '');
  const waPhone = cleanCustPhone.startsWith('91') ? cleanCustPhone : `91${cleanCustPhone.slice(-10)}`;
  const waShareUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(cleanInvoiceMessage)}`;

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
      padding: '10px',
      overflowY: 'auto'
    }}>
      {/* 100% 1-PAGE A4 PRINT OPTIMIZATION & RESPONSIVE CSS */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 5mm 6mm;
        }

        .invoice-sheet-container {
          padding: 14px 18px;
        }

        .invoice-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1.5px solid #E2E8F0;
          padding-bottom: 6px;
          margin-bottom: 6px;
          gap: 10px;
        }

        .invoice-meta-wrapper {
          text-align: right;
        }

        .invoice-meta-table {
          margin-left: auto;
          border-collapse: collapse;
          font-size: 0.7rem;
          color: #334155;
        }

        .invoice-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1.5px solid #BAE6FD;
          border-radius: 6px;
          margin-bottom: 6px;
          background: rgba(240, 249, 255, 0.88);
          overflow: hidden;
        }

        .invoice-customer-box {
          padding: 5px 8px;
          border-right: 1.5px solid #BAE6FD;
        }

        .invoice-service-box {
          padding: 5px 8px;
        }

        .invoice-bottom-layout {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          margin-bottom: 6px;
        }

        .invoice-financials-card {
          width: 250px;
          flex-shrink: 0;
        }

        .invoice-thankyou-card {
          flex: 1;
        }

        @media screen and (max-width: 640px) {
          .invoice-modal-overlay {
            padding: 4px !important;
            align-items: flex-start !important;
          }

          .invoice-modal-controls {
            padding: 6px 8px !important;
            gap: 5px !important;
          }

          .invoice-sheet-container {
            padding: 8px 8px !important;
            border-radius: 6px !important;
          }

          .invoice-header-flex {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 4px !important;
            padding-bottom: 4px !important;
            margin-bottom: 4px !important;
          }

          .invoice-meta-wrapper {
            text-align: left !important;
            background: #F8FAFC;
            padding: 4px 6px;
            border-radius: 6px;
            border: 1px solid #E2E8F0;
          }

          .invoice-meta-wrapper h1 {
            font-size: 1.05rem !important;
            margin-bottom: 2px !important;
          }

          .invoice-meta-table {
            margin-left: 0 !important;
            width: 100% !important;
            font-size: 0.66rem !important;
          }

          .invoice-details-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
            margin-bottom: 6px !important;
          }

          .invoice-customer-box {
            padding: 4px 6px !important;
            border-right: none !important;
            border-bottom: 1.5px solid #BAE6FD !important;
          }

          .invoice-service-box {
            padding: 4px 6px !important;
          }

          .invoice-bottom-layout {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 6px !important;
          }

          .invoice-financials-card {
            width: 100% !important;
            order: 1 !important;
          }

          .invoice-thankyou-card {
            width: 100% !important;
            order: 2 !important;
          }

          .invoice-watermark {
            width: 180px !important;
          }
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
            overflow: visible !important;
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
            padding: 4mm 6mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-modal-controls {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '720px', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', margin: 'auto' }}>
        
        {/* TOP ACTION CONTROLS BAR (HIDDEN IN PRINT) */}
        <div className="invoice-modal-controls" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 49, 53, 0.95)',
          border: '1px solid var(--border-light)',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '14px',
          gap: '10px'
        }}>
          {/* Top Left: "Invoice" on top, Invoice Number below it */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 'fit-content' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Invoice
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '2px', letterSpacing: '0.02em' }}>
              {invoiceNumber}
            </span>
          </div>

          {/* Top Right: Print Button + WhatsApp Button + Red Cross Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-gold"
              style={{
                height: '32px',
                minHeight: '32px',
                padding: '0 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <Printer size={14} /> Print
            </button>

            <a
              href={waShareUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                height: '32px',
                minHeight: '32px',
                padding: '0 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
              title="Send Tax Invoice via WhatsApp"
            >
              <MessageSquare size={14} /> WhatsApp
            </a>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#E63946',
                  border: '1.5px solid #D90429',
                  color: '#FFFFFF',
                  height: '32px',
                  minHeight: '32px',
                  width: '32px',
                  minWidth: '32px',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 6px rgba(230, 57, 70, 0.4)'
                }}
                aria-label="Close Modal"
              >
                <X size={20} strokeWidth={2.8} style={{ width: '20px', height: '20px', display: 'block' }} />
              </button>
            )}
          </div>
        </div>

        {/* 100% 1-PAGE PRINTABLE INVOICE SHEET */}
        <div
          className="invoice-printable-sheet invoice-sheet-container"
          style={{
            position: 'relative',
            background: '#FFFFFF',
            color: '#1A2930',
            borderRadius: '8px',
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
        >
          {/* WATERMARK */}
          <div
            className="invoice-watermark"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-25deg)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
              opacity: 0.04,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '280px'
            }}
            aria-hidden="true"
          >
            <img
              src="/logo.webp"
              alt=""
              style={{
                width: '160px',
                height: 'auto',
                filter: 'grayscale(100%)',
                marginBottom: '4px'
              }}
            />
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#003135',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              CAR WASH
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.3em',
              color: '#64748B',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              AUTO SPA
            </div>
          </div>

          {/* HEADER SECTION */}
          <div className="invoice-header-flex" style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo & Business Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/logo.webp"
                  alt="CARWASH Logo"
                  style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#003135', letterSpacing: '0.02em', lineHeight: 1.1 }}>
                    CAR<span style={{ color: '#0FA4AF' }}>WASH</span>
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', marginTop: '1px' }}>
                    AUTO SPA & MANAGEMENT
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
                Sevoke Road, Siliguri, WB 734001
              </div>
            </div>

            {/* INVOICE TITLE & METADATA */}
            <div className="invoice-meta-wrapper">
              <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F2C3F', margin: '0 0 2px 0', letterSpacing: '0.05em' }}>
                INVOICE
              </h1>

              <table className="invoice-meta-table">
                <tbody>
                  <tr>
                    <td style={{ padding: '0 4px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Invoice No.</td>
                    <td style={{ padding: '0 2px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '0 4px', textAlign: 'left', fontWeight: 800, color: '#0FA4AF' }}>{invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0 4px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Date</td>
                    <td style={{ padding: '0 2px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '0 4px', textAlign: 'left', fontWeight: 600 }}>{dateStr} {booking.slotTime ? `(${booking.slotTime})` : ''}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0 4px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Payment Mode</td>
                    <td style={{ padding: '0 2px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '0 4px', textAlign: 'left', fontWeight: 600 }}>{paymentMode}</td>
                  </tr>
                  {booking.razorpayPaymentId && (
                    <tr>
                      <td style={{ padding: '0 4px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Razorpay Txn</td>
                      <td style={{ padding: '0 2px', fontWeight: 700 }}>:</td>
                      <td style={{ padding: '0 4px', textAlign: 'left', fontWeight: 700, color: '#0284C7', fontFamily: 'monospace', fontSize: '0.62rem' }}>
                        {booking.razorpayPaymentId}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '0 4px', fontWeight: 700, textAlign: 'left', color: '#0F2C3F' }}>Status</td>
                    <td style={{ padding: '0 2px', fontWeight: 700 }}>:</td>
                    <td style={{ padding: '0 4px', textAlign: 'left', fontWeight: 800, color: paymentStatus === 'Paid' ? '#16A34A' : '#E11D48' }}>
                      {paymentStatus} ({bookingStatus})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TWO-COLUMN DETAILS CONTAINER */}
          <div className="invoice-details-grid" style={{ position: 'relative', zIndex: 1 }}>
            {/* Customer Details Box */}
            <div className="invoice-customer-box">
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284C7', marginBottom: '2px', letterSpacing: '0.02em' }}>
                Customer Details
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.66rem', color: '#334155' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '80px', padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Name</td>
                    <td style={{ width: '6px', padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>{customerName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Phone</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>{phone}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Vehicle No.</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0', fontWeight: 800, color: '#0284C7' }}>{vehicleNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Vehicle Model</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>{vehicleModel}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Vehicle Type</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>{vehicleType}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Service Center Details Box */}
            <div className="invoice-service-box">
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284C7', marginBottom: '2px', letterSpacing: '0.02em' }}>
                Service Center Details
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.66rem', color: '#334155' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '85px', padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Business Name</td>
                    <td style={{ width: '6px', padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0', fontWeight: 700 }}>CAR WASH AUTO SPA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Address</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>Sevoke Road, Siliguri, WB 734001</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Phone</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>+91 86095 04186</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>Email</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>info@carwash.in</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1px 0', fontWeight: 700, color: '#0F172A' }}>GST No.</td>
                    <td style={{ padding: '1px 0' }}>:</td>
                    <td style={{ padding: '1px 0' }}>19AAACC1234M1Z5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* NUMBERED LINE ITEMS TABLE (ALL SERVICES NUMBERED ONE BELOW ANOTHER) */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '6px', width: '100%', overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: lineItems.length > 5 ? '0.68rem' : '0.72rem',
              border: '1.5px solid #BAE6FD'
            }}>
              <thead>
                <tr style={{ background: '#E0F2FE', color: '#0369A1', textAlign: 'left', borderBottom: '1.5px solid #BAE6FD' }}>
                  <th style={{ width: '28px', padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #BAE6FD' }}>#</th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #BAE6FD' }}>Service Description</th>
                  <th style={{ width: '38px', padding: '3px 4px', textAlign: 'center', borderRight: '1px solid #BAE6FD' }}>Qty</th>
                  <th style={{ width: '80px', padding: '3px 6px', textAlign: 'right', borderRight: '1px solid #BAE6FD' }}>Unit Price (₹)</th>
                  <th style={{ width: '85px', padding: '3px 6px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #E2E8F0', background: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                    <td style={{ padding: '2.5px 4px', textAlign: 'center', fontWeight: 700, color: '#0369A1', borderRight: '1px solid #BAE6FD' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '2.5px 6px', fontWeight: 600, color: '#0F172A', borderRight: '1px solid #BAE6FD' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '2.5px 4px', textAlign: 'center', color: '#334155', borderRight: '1px solid #BAE6FD' }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: '2.5px 6px', textAlign: 'right', color: '#334155', borderRight: '1px solid #BAE6FD' }}>
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '2.5px 6px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTTOM SUMMARY & NOTES SECTION (FINANCIALS FIRST ON MOBILE, SUB-TOTAL DIRECTLY UNDER TABLE) */}
          <div className="invoice-bottom-layout" style={{ position: 'relative', zIndex: 1 }}>
            
            {/* Thank You / Notes Card */}
            <div className="invoice-thankyou-card" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F2C3F' }}>
                Thank You For Your Business!
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748B', lineHeight: 1.3 }}>
                This is an official computer-generated tax invoice. For warranty or service support, contact our customer desk.
              </div>
            </div>

            {/* Financials Summary Box (Clean Right-Aligned on Desktop, Directly Under Table on Mobile) */}
            <div className="invoice-financials-card" style={{
              background: '#F0F9FF',
              border: '1.5px solid #BAE6FD',
              borderRadius: '6px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                <span style={{ fontWeight: 600 }}>Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#E11D48' }}>
                  <span style={{ fontWeight: 600 }}>Discount {booking.couponApplied ? `(${booking.couponApplied})` : ''}</span>
                  <span style={{ fontWeight: 700 }}>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                <span style={{ fontWeight: 600 }}>GST (18% Incl.)</span>
                <span style={{ fontWeight: 600, color: '#64748B' }}>₹0.00</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.88rem',
                fontWeight: 900,
                color: '#0369A1',
                borderTop: '1.5px solid #BAE6FD',
                paddingTop: '3px',
                marginTop: '1px'
              }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* INVOICE FOOTER WITH BRAND TAGLINE & CONTACT */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 900,
              color: '#0F2C3F',
              letterSpacing: '0.04em'
            }}>
              Drive Clean. <span style={{ color: '#0284C7' }}>Go Further.</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '0.64rem',
              color: '#475569',
              fontWeight: 600
            }}>
              <span><strong style={{ color: '#0F2C3F' }}>Ph:</strong> +91 86095 04186</span>
              <span>•</span>
              <span><strong style={{ color: '#0F2C3F' }}>Web:</strong> www.carwash.in</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
