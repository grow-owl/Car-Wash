import React from 'react';
import { Download, Plus, Calendar, Search, MessageSquare, History, FileText, Trash2 } from 'lucide-react';
import { generateInvoiceWhatsAppUrl } from '../../../utils';

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

      {/* QUICK MULTI-YEAR DATE RANGE SELECTOR */}
      <div style={{ marginBottom: '16px', background: 'rgba(0, 31, 35, 0.6)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={13} /> Timeframe Filter (Past History & Archive):
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: '6months', label: 'Past 6 Months' },
            { id: '1year', label: 'Past 1 Year' },
            { id: '2years', label: 'Past 2 Years' },
            { id: 'custom', label: 'Custom Range...' }
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeFilter(tf.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: timeFilter === tf.id ? 'var(--accent-aqua)' : 'rgba(255, 255, 255, 0.06)',
                color: timeFilter === tf.id ? '#003135' : '#CCD0CF',
                transition: 'all 0.15s ease'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers when 'custom' is selected */}
        {timeFilter === 'custom' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ice-tint)' }}>To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* FILTER CONTROLS BAR: SEARCH, STATUS, PAYMENT & SORTING */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-tint)' }} />
          <input
            type="text"
            placeholder="Search Name, Phone, Car No, Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
          />
        </div>

        {/* Status Filter Dropdown */}
        <div>
          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="input-field"
            style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
          >
            <option value="all">All Booking Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="washing">Washing</option>
            <option value="detailing">Detailing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Filter Dropdown */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-field"
            style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%' }}
          >
            <option value="all">All Payments (Paid & Pending)</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="input-field"
            style={{ height: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '100%', color: 'var(--accent-gold)' }}
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
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{b.serviceName || b.packageName}</div>
                        {b.addons && b.addons.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                            +{b.addons.length} Add-ons
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={b.bayAssigned || 'BAY 1'}
                          onChange={(e) => handleBayChange(b._id, e.target.value)}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '6px',
                            background: '#06141B',
                            color: 'var(--accent-cyan)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="BAY 1">BAY 1</option>
                          <option value="BAY 2">BAY 2</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: '#06141B',
                            color: b.status === 'completed' || b.status === 'ready' ? '#25D366' : 'var(--accent-cyan)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="confirmed">1. Booking Confirmed</option>
                          <option value="vehicle_received">2. Vehicle Received</option>
                          <option value="in_progress">3. Service In Progress</option>
                          <option value="quality_check">4. Quality Check</option>
                          <option value="ready_for_pickup">5. Ready for Pickup</option>
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
                      <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                          {/* WhatsApp Direct Tax Invoice Link */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              height: '30px',
                              padding: '0 10px',
                              fontSize: '0.74rem',
                              borderRadius: '6px',
                              background: '#25D366',
                              color: '#06141B',
                              border: '1px solid #25D366',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Send Original Tax Invoice via WhatsApp"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>

                          {/* History Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                            style={{
                              height: '30px',
                              padding: '0 10px',
                              fontSize: '0.74rem',
                              borderRadius: '6px',
                              background: 'rgba(0, 229, 255, 0.12)',
                              border: '1px solid rgba(0, 229, 255, 0.35)',
                              color: 'var(--accent-cyan)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="View Customer Lifetime Timeline"
                          >
                            <History size={13} /> History
                          </button>

                          {/* Invoice Button */}
                          <button
                            type="button"
                            onClick={() => setInvoiceBooking(b)}
                            style={{
                              height: '30px',
                              padding: '0 10px',
                              fontSize: '0.74rem',
                              borderRadius: '6px',
                              background: 'rgba(255, 195, 0, 0.12)',
                              border: '1px solid rgba(255, 195, 0, 0.35)',
                              color: 'var(--accent-gold)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              boxSizing: 'border-box',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="View and Print Invoice"
                          >
                            <FileText size={13} /> Invoice
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b._id, code)}
                            style={{
                              height: '30px',
                              width: '32px',
                              padding: '0',
                              borderRadius: '6px',
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
                            <Trash2 size={14} />
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed rgba(74, 92, 106, 0.25)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {b.serviceName || b.packageName}
                    </span>
                    <span style={{ fontWeight: 900, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                      ₹{b.totalAmount} <span style={{ fontSize: '0.68rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964' }}>({b.paymentStatus || 'Pending'})</span>
                    </span>
                  </div>
                </div>

                {/* Controls: Stage Selector + Bay Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                  <select
                    value={b.status}
                    onChange={(e) => handleStatusChange(b._id, e.target.value)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      background: '#06141B',
                      color: isDone ? '#25D366' : 'var(--accent-cyan)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%'
                    }}
                  >
                    <option value="confirmed">1. Confirmed</option>
                    <option value="vehicle_received">2. Received</option>
                    <option value="washing">3. Washing</option>
                    <option value="detailing">4. Detailing</option>
                    <option value="quality_check">5. Quality Check</option>
                    <option value="ready">6. Ready</option>
                    <option value="completed">7. Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={b.bayAssigned || 'BAY 1'}
                    onChange={(e) => handleBayChange(b._id, e.target.value)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      background: '#06141B',
                      color: 'var(--accent-cyan)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%'
                    }}
                  >
                    <option value="BAY 1">BAY 1</option>
                    <option value="BAY 2">BAY 2</option>
                  </select>
                </div>

                {/* Action Bar: WhatsApp, History, Invoice, Delete */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 38px', gap: '6px', borderTop: '1px solid rgba(74, 92, 106, 0.25)', paddingTop: '8px' }}>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: '30px',
                      padding: '0 8px',
                      fontSize: '0.72rem',
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
                    <MessageSquare size={12} /> WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                    className="btn-secondary"
                    style={{ height: '30px', padding: '0 6px', fontSize: '0.72rem', borderRadius: '6px', gap: '4px' }}
                  >
                    <History size={12} /> History
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceBooking(b)}
                    style={{
                      height: '30px',
                      padding: '0 6px',
                      fontSize: '0.72rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 195, 0, 0.12)',
                      border: '1px solid rgba(255, 195, 0, 0.35)',
                      color: 'var(--accent-gold)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <FileText size={12} /> Invoice
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(b._id, code)}
                    style={{
                      height: '30px',
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
                    <Trash2 size={13} />
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
