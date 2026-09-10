import React from 'react';
import { Download, Plus, Calendar, Search, MessageSquare, History, FileText, Trash2 } from 'lucide-react';
import { generateInvoiceWhatsAppUrl } from '../../../utils';
import ServiceDropdownPill from '../ServiceDropdownPill';

export default function AdminBookingsTab({
  timeFilter,
  setTimeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  searchTerm,
  setSearchTerm,
  bookingFilter,
  setBookingFilter,
  paymentFilter,
  setPaymentFilter,
  sortOption,
  setSortOption,
  filteredBookings = [],
  handleExportCSV,
  setShowWalkInModal,
  handleOpenCustomerTimeline,
  handleBayChange,
  handleStatusChange,
  handleDeleteBooking,
  setInvoiceBooking
}) {
  const getWhatsAppInvoiceLink = (b) => {
    return generateInvoiceWhatsAppUrl({ booking: b });
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Bookings & Queue
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Export CSV / Excel
          </button>
          <button
            onClick={() => setShowWalkInModal(true)}
            className="btn-gold"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            <Plus size={14} /> New Appointment
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR: SEARCH, STATUS, PAYMENT & SORTING */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
        gap: '10px',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-tint)', pointerEvents: 'none', zIndex: 1 }} />
          <input
            type="text"
            placeholder="Search Name, Phone, Car No, Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div style={{ width: '100%' }}>
          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="admin-select"
            style={{ width: '100%' }}
          >
            <option value="all">All Booking Statuses</option>
            <option value="confirmed">1. Confirmed</option>
            <option value="vehicle_received">2. Received</option>
            <option value="in_progress">3. In Progress</option>
            <option value="quality_check">4. Quality Check</option>
            <option value="ready_for_pickup">5. Ready</option>
            <option value="completed">6. Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Filter Dropdown */}
        <div style={{ width: '100%' }}>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="admin-select"
            style={{ width: '100%' }}
          >
            <option value="all">All Payments (Paid & Pending)</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div style={{ width: '100%' }}>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="admin-select"
            style={{ width: '100%', color: 'var(--accent-gold)' }}
          >
            <option value="date_desc">Sort: Date (Newest First)</option>
            <option value="date_asc">Sort: Date (Oldest First)</option>
            <option value="amount_desc">Sort: Amount (High to Low)</option>
            <option value="amount_asc">Sort: Amount (Low to High)</option>
            <option value="name_asc">Sort: Customer Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="bookings-desktop-table">
        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                <th style={{ padding: '10px' }}>Code</th>
                <th style={{ padding: '10px' }}>Date & Slot Time</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Vehicle Info</th>
                <th style={{ padding: '10px' }}>Service / Package</th>
                <th style={{ padding: '10px' }}>Bay</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No wash bookings found matching your selected filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                  const waLink = getWhatsAppInvoiceLink(b, code);

                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {code}
                      </td>
                      <td style={{ padding: '10px', color: '#CCD0CF' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>{b.slotTime || '10:00 AM'}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div
                          onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                          style={{ fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                          title="Click to view 2-Year Lifetime History"
                        >
                          {b.customerName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{b.phone}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>{b.vehicleType} {b.vehicleModel ? `• ${b.vehicleModel}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <ServiceDropdownPill serviceStr={b.serviceName || b.packageName} addons={b.addons} compact={true} />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={b.bayAssigned || 'BAY 1'}
                          onChange={(e) => handleBayChange(b._id, e.target.value)}
                          className="admin-select-table"
                        >
                          <option value="BAY 1">BAY 1</option>
                          <option value="BAY 2">BAY 2</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="admin-select-table"
                          style={{
                            color: b.status === 'completed' || b.status === 'ready' ? '#25D366' : 'var(--accent-cyan)'
                          }}
                        >
                          <option value="confirmed">1. Confirmed</option>
                          <option value="vehicle_received">2. Received</option>
                          <option value="in_progress">3. In Progress</option>
                          <option value="quality_check">4. Quality Check</option>
                          <option value="ready_for_pickup">5. Ready</option>
                          <option value="completed">6. Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        ₹{b.totalAmount}
                        <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span>{b.paymentStatus || 'Pending'}</span>
                          {b.paymentMode && (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(0, 210, 180, 0.15)', color: 'var(--accent-aqua)', padding: '1px 4px', borderRadius: '4px' }}>
                              {b.paymentMode}
                            </span>
                          )}
                        </div>
                        {b.razorpayPaymentId && (
                          <div style={{ fontSize: '0.6rem', color: 'var(--ice-tint)', fontFamily: 'monospace' }}>
                            {b.razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap' }}>
                          {/* WhatsApp Direct Tax Invoice Link */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              height: '26px',
                              padding: '0 7px',
                              fontSize: '0.68rem',
                              borderRadius: '5px',
                              background: '#25D366',
                              color: '#06141B',
                              border: '1px solid #25D366',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Send Original Tax Invoice via WhatsApp"
                          >
                            <MessageSquare size={11} /> WhatsApp
                          </a>

                          {/* History Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                            style={{
                              height: '26px',
                              padding: '0 7px',
                              fontSize: '0.68rem',
                              borderRadius: '5px',
                              background: 'rgba(0, 229, 255, 0.12)',
                              border: '1px solid rgba(0, 229, 255, 0.35)',
                              color: 'var(--accent-cyan)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="View Customer Lifetime Timeline"
                          >
                            <History size={11} /> History
                          </button>

                          {/* Invoice Button */}
                          <button
                            type="button"
                            onClick={() => setInvoiceBooking(b)}
                            style={{
                              height: '26px',
                              padding: '0 7px',
                              fontSize: '0.68rem',
                              borderRadius: '5px',
                              background: 'rgba(255, 195, 0, 0.12)',
                              border: '1px solid rgba(255, 195, 0, 0.35)',
                              color: 'var(--accent-gold)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="View and Print Invoice"
                          >
                            <FileText size={11} /> Invoice
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b._id, code)}
                            style={{
                              height: '26px',
                              width: '26px',
                              padding: '0',
                              borderRadius: '5px',
                              background: 'rgba(255, 89, 100, 0.12)',
                              border: '1px solid rgba(255, 89, 100, 0.35)',
                              color: '#FF5964',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxSizing: 'border-box',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Delete Booking"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE BOOKINGS CARDS VIEW (< 768px) */}
      <div className="bookings-mobile-cards">
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            No wash bookings found matching your selected filters.
          </div>
        ) : (
          filteredBookings.map((b) => {
            const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
            const waLink = getWhatsAppInvoiceLink(b, code);
            const isDone = b.status === 'completed' || b.status === 'ready';

            return (
              <div
                key={b._id}
                className="glass-card"
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(0, 31, 35, 0.45)',
                  border: '1px solid rgba(74, 92, 106, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Top Row: Code + Bay Tag + Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 900, color: 'var(--accent-cyan)', fontSize: '0.92rem' }}>
                      {code}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(0, 229, 255, 0.12)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(0, 229, 255, 0.3)'
                    }}>
                      {b.bayAssigned || 'BAY 1'}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: isDone ? 'rgba(37, 211, 102, 0.15)' : 'rgba(255, 195, 0, 0.15)',
                    color: isDone ? '#25D366' : 'var(--accent-gold)',
                    border: isDone ? '1px solid #25D366' : '1px solid rgba(255, 195, 0, 0.4)'
                  }}>
                    {(b.status || 'Pending').toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                {/* Customer & Vehicle Info Box */}
                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(74, 92, 106, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span
                      onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                      style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                    >
                      {b.customerName}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ice-tint)' }}>
                      {b.phone}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--ice-tint)' }}>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      🚗 {b.vehicleNumber} {b.vehicleModel ? `• ${b.vehicleModel}` : `• ${b.vehicleType}`}
                    </span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.75rem' }}>
                      {b.date} • {b.slotTime || '10:00 AM'}
                    </span>
                  </div>

                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(74, 92, 106, 0.25)' }}>
                    <ServiceDropdownPill serviceStr={b.serviceName || b.packageName} addons={b.addons} />
                  </div>
                </div>

                {/* Controls: Stage Selector + Bay Selector + Amount Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={b.status}
                    onChange={(e) => handleStatusChange(b._id, e.target.value)}
                    className="admin-select"
                    style={{
                      height: '34px',
                      minHeight: '34px',
                      fontSize: '0.75rem',
                      color: isDone ? '#25D366' : 'var(--accent-cyan)',
                      width: '100%'
                    }}
                  >
                    <option value="confirmed">1. Confirmed</option>
                    <option value="vehicle_received">2. Received</option>
                    <option value="in_progress">3. In Progress</option>
                    <option value="quality_check">4. Quality Check</option>
                    <option value="ready_for_pickup">5. Ready</option>
                    <option value="completed">6. Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={b.bayAssigned || 'BAY 1'}
                    onChange={(e) => handleBayChange(b._id, e.target.value)}
                    className="admin-select"
                    style={{
                      height: '34px',
                      minHeight: '34px',
                      fontSize: '0.75rem',
                      width: '100%'
                    }}
                  >
                    <option value="BAY 1">BAY 1</option>
                    <option value="BAY 2">BAY 2</option>
                  </select>

                  <div style={{
                    height: '34px',
                    minHeight: '34px',
                    padding: '0 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 195, 0, 0.12)',
                    border: '1px solid rgba(255, 195, 0, 0.35)',
                    color: 'var(--accent-gold)',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}>
                    ₹{b.totalAmount}
                  </div>
                </div>

                {/* Action Bar: WhatsApp, History, Invoice, Delete */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 36px', gap: '6px', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '8px', alignItems: 'center' }}>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: '32px',
                      minHeight: '32px',
                      maxHeight: '32px',
                      boxSizing: 'border-box',
                      padding: '0 6px',
                      fontSize: '0.74rem',
                      borderRadius: '6px',
                      background: '#25D366',
                      color: '#06141B',
                      border: 'none',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                    style={{
                      height: '32px',
                      minHeight: '32px',
                      maxHeight: '32px',
                      boxSizing: 'border-box',
                      padding: '0 6px',
                      fontSize: '0.74rem',
                      borderRadius: '6px',
                      background: 'rgba(74, 92, 106, 0.35)',
                      border: '1px solid rgba(74, 92, 106, 0.55)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <History size={13} /> History
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceBooking(b)}
                    style={{
                      height: '32px',
                      minHeight: '32px',
                      maxHeight: '32px',
                      boxSizing: 'border-box',
                      padding: '0 6px',
                      fontSize: '0.74rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 195, 0, 0.12)',
                      border: '1px solid rgba(255, 195, 0, 0.35)',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FileText size={13} /> Invoice
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(b._id, code)}
                    style={{
                      height: '32px',
                      minHeight: '32px',
                      maxHeight: '32px',
                      boxSizing: 'border-box',
                      padding: '0',
                      borderRadius: '6px',
                      background: 'rgba(255, 89, 100, 0.12)',
                      border: '1px solid rgba(255, 89, 100, 0.35)',
                      color: '#FF5964',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
