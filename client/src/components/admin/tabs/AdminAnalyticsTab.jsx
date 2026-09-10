import React from 'react';
import { Car, Plus } from 'lucide-react';

export default function AdminAnalyticsTab({
  bookings = [],
  bays = [],
  getActiveBookingForBay,
  handleStatusChange,
  handleBayChange,
  setAllotModalBay,
  setWalkInVeh,
  setShowWalkInModal,
  handleOpenCustomerTimeline,
  setActiveSubTab
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* LIVE BAYS (ACTIVE VEHICLE DETECTION & 1-CLICK ALLOTMENT) */}
      <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={18} color="var(--accent-cyan)" /> Live Bay Management
            </h3>
          </div>
          <button onClick={() => setShowWalkInModal(true)} className="btn-gold" style={{ padding: '7px 16px', fontSize: '0.82rem', borderRadius: '8px', fontWeight: 800 }}>
            <Plus size={15} /> New Walk-In Car
          </button>
        </div>

        <div className="admin-bays-grid">
          {[
            { bayNumber: 1, name: 'BAY 1' },
            { bayNumber: 2, name: 'BAY 2' }
          ].map((bayDef) => {
            const bayName = bayDef.name;
            const activeCar = getActiveBookingForBay(bayDef.bayNumber);
            const isOccupied = !!activeCar;
            const waitingCars = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'vehicle_received');

            return (
              <div
                key={bayDef.bayNumber}
                style={{
                  padding: 'clamp(14px, 2.5vw, 20px)',
                  borderRadius: '12px',
                  background: 'rgba(0, 31, 35, 0.45)',
                  border: isOccupied ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {/* Bay Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF', letterSpacing: '0.04em' }}>
                    {bayName}
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isOccupied ? 'rgba(0, 229, 255, 0.15)' : 'rgba(37, 211, 102, 0.15)',
                    color: isOccupied ? 'var(--accent-cyan)' : '#25D366',
                    border: isOccupied ? '1px solid var(--accent-cyan)' : '1px solid #25D366'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOccupied ? 'var(--accent-cyan)' : '#25D366' }} />
                    {isOccupied ? (activeCar.status || 'Washing').toUpperCase().replace('_', ' ') : 'AVAILABLE'}
                  </span>
                </div>

                {/* Active Car Info */}
                {isOccupied ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(74, 92, 106, 0.25)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {activeCar.vehicleNumber}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                          {activeCar.trackingCode}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)' }}>
                        {activeCar.customerName} • {activeCar.vehicleModel || activeCar.vehicleType}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '4px' }}>
                        {activeCar.serviceName || activeCar.packageName}
                      </div>
                    </div>

                    {/* Quick Stage Controls */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={activeCar.status}
                        onChange={(e) => handleStatusChange(activeCar._id, e.target.value)}
                        style={{
                          flex: '1 1 140px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: '#06141B',
                          color: 'var(--accent-cyan)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                          minWidth: 0
                        }}
                      >
                        <option value="vehicle_received">Stage: Vehicle Received</option>
                        <option value="washing">Stage: High Pressure Wash</option>
                        <option value="detailing">Stage: Interior & Polish</option>
                        <option value="quality_check">Stage: Quality Inspection</option>
                        <option value="ready">Stage: Ready for Pickup</option>
                        <option value="completed">Stage: Completed & Free Bay</option>
                      </select>

                      <button
                        onClick={() => handleStatusChange(activeCar._id, 'completed')}
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          borderRadius: '6px',
                          background: '#25D366',
                          color: '#06141B',
                          border: 'none',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ✓ Finish & Free
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Bay Available State */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        onClick={() => setAllotModalBay(bayName)}
                        className="btn-primary"
                        style={{
                          padding: '9px 18px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        ⚡ Allot Waiting Car ({waitingCars.length} in Queue)
                      </button>

                      <button
                        onClick={() => {
                          setWalkInVeh('');
                          setShowWalkInModal(true);
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '9px 16px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: '8px'
                        }}
                      >
                        + Walk-In
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT QUEUE (WITH DATE, TIME & BAY ALLOTMENT) */}
      <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>Recent Queue</h3>
            <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Live</span>
          </div>
          <button
            onClick={() => setActiveSubTab('bookings')}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px', minHeight: '32px' }}
          >
            All Bookings ({bookings.length}) →
          </button>
        </div>

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        <div className="queue-desktop-table">
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                  <th style={{ padding: '10px' }}>Code</th>
                  <th style={{ padding: '10px' }}>Date & Slot Time</th>
                  <th style={{ padding: '10px' }}>Customer</th>
                  <th style={{ padding: '10px' }}>Vehicle</th>
                  <th style={{ padding: '10px' }}>Service</th>
                  <th style={{ padding: '10px' }}>Bay</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map((b) => {
                  const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {code}
                      </td>
                      <td style={{ padding: '10px', color: '#CCD0CF' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date || 'Today'}</div>
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
                      <td style={{ padding: '10px', color: 'var(--ice-tint)' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                        {b.vehicleModel && <div style={{ fontSize: '0.75rem' }}>{b.vehicleModel}</div>}
                      </td>
                      <td style={{ padding: '10px', color: '#CCD0CF' }}>
                        <div style={{ fontWeight: 600 }}>{b.serviceName || b.packageName}</div>
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
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="vehicle_received">Vehicle Received</option>
                          <option value="washing">High Pressure Wash</option>
                          <option value="detailing">Interior & Polish</option>
                          <option value="quality_check">Quality Check</option>
                          <option value="ready">Ready for Pickup</option>
                          <option value="completed">Completed / Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        ₹{b.totalAmount}
                        <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700 }}>
                          {b.paymentStatus || 'Pending'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE QUEUE CARDS VIEW (< 768px) */}
        <div className="queue-mobile-cards">
          {bookings.slice(0, 6).map((b) => {
            const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
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
                      {b.slotTime || '10:00 AM'}
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="vehicle_received">Vehicle Received</option>
                    <option value="washing">High Pressure Wash</option>
                    <option value="detailing">Interior & Polish</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="completed">Completed / Delivered</option>
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
