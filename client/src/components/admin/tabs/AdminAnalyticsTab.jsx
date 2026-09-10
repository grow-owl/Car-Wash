import React from 'react';
import { Car, Plus, Sparkles, CheckCircle2, ChevronRight, Clock, ShieldCheck, User } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import ServiceDropdownPill from '../ServiceDropdownPill';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. LIVE BAY MANAGEMENT SECTION */}
      <div className="glass-panel" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '14px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: 0,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Car size={22} color="var(--accent-cyan)" /> Live Bay Management
          </h3>
        </div>

        {/* BAYS GRID */}
        <div className="admin-bays-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}>
          {[
            { bayNumber: 1, name: 'BAY 1' },
            { bayNumber: 2, name: 'BAY 2' }
          ].map((bayDef) => {
            const bayName = bayDef.name;
            const activeCar = getActiveBookingForBay(bayDef.bayNumber);
            const isOccupied = !!activeCar;
            const waitingCars = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'vehicle_received');

            const getStatusLabel = (status) => {
              const s = String(status || '').toLowerCase().trim();
              if (s === 'confirmed') return 'CONFIRMED';
              if (s === 'vehicle_received' || s === 'received') return 'RECEIVED';
              if (s === 'in_progress' || s === 'washing') return 'IN PROGRESS';
              if (s === 'quality_check') return 'QUALITY CHECK';
              if (s === 'ready_for_pickup' || s === 'ready') return 'READY';
              if (s === 'completed') return 'COMPLETED';
              return (status || 'Active').toUpperCase().replace('_', ' ');
            };

            return (
              <div
                key={bayDef.bayNumber}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: isOccupied ? 'rgba(0, 31, 35, 0.65)' : 'rgba(0, 31, 35, 0.35)',
                  border: isOccupied ? '1.5px solid rgba(0, 229, 255, 0.5)' : '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  minHeight: '210px',
                  boxSizing: 'border-box',
                  width: '100%',
                  gap: '14px',
                  boxShadow: isOccupied ? '0 6px 22px rgba(0, 229, 255, 0.09)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Bay Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{bayName}</span>
                    {isOccupied && (
                      <span style={{
                        fontSize: '0.72rem',
                        color: 'var(--accent-gold)',
                        background: 'rgba(255, 195, 0, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 195, 0, 0.35)',
                        fontWeight: 800
                      }}>
                        {activeCar.trackingCode || `CW-${activeCar._id?.slice(-4).toUpperCase() || '1001'}`}
                      </span>
                    )}
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
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
                    {isOccupied ? getStatusLabel(activeCar.status) : 'AVAILABLE'}
                  </span>
                </div>

                {/* Active Car Info */}
                {isOccupied ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(74, 92, 106, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px'
                    }}>
                      {/* Top Row: Vehicle Number & Type */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.02rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                          🚗 {activeCar.vehicleNumber}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          color: 'var(--ice-tint)',
                          background: 'rgba(255,255,255,0.08)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          {activeCar.vehicleModel || activeCar.vehicleType || 'Sedan'}
                        </span>
                      </div>
                      
                      {/* Middle: Customer Name & Phone */}
                      <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          onClick={() => handleOpenCustomerTimeline(activeCar.phone || activeCar.vehicleNumber, activeCar.customerName)}
                          style={{ fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                          title="Click to view Customer History"
                        >
                          {activeCar.customerName}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{activeCar.phone}</span>
                      </div>

                      {/* Service list: Directly visible and scrollable in fixed container */}
                      <div style={{ paddingTop: '6px', borderTop: '1px dashed rgba(74, 92, 106, 0.3)', marginTop: '2px' }}>
                        <ServiceDropdownPill serviceStr={activeCar.serviceName || activeCar.packageName} addons={activeCar.addons} alwaysOpen={true} />
                      </div>
                    </div>

                    {/* Quick Stage Controls (Desktop & Mobile Unified Grid) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <select
                        value={activeCar.status}
                        onChange={(e) => handleStatusChange(activeCar._id, e.target.value)}
                        className="admin-select"
                        style={{
                          height: '36px',
                          minHeight: '36px',
                          maxHeight: '36px',
                          borderRadius: '8px',
                          boxSizing: 'border-box',
                          width: '100%'
                        }}
                      >
                        <option value="confirmed">1. Confirmed</option>
                        <option value="vehicle_received">2. Received</option>
                        <option value="in_progress">3. In Progress</option>
                        <option value="quality_check">4. Quality Check</option>
                        <option value="ready_for_pickup">5. Ready</option>
                        <option value="completed">6. Completed</option>
                      </select>

                      <button
                        onClick={() => handleStatusChange(activeCar._id, 'completed')}
                        className="admin-btn-match-select"
                        style={{
                          height: '36px',
                          minHeight: '36px',
                          maxHeight: '36px',
                          lineHeight: '36px',
                          borderRadius: '8px',
                          boxSizing: 'border-box',
                          background: '#25D366',
                          color: '#06141B',
                          border: 'none',
                          padding: '0 14px'
                        }}
                      >
                        ✓ Finish & Free
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Bay Available State */
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '22px 10px',
                    gap: '14px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(37, 211, 102, 0.1)',
                      border: '1px solid rgba(37, 211, 102, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles size={20} color="#25D366" />
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', lineHeight: 1.4 }}>
                      {bayName} is currently clean and ready for next car
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                      <button
                        onClick={() => setAllotModalBay(bayName)}
                        className="btn-primary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          flex: '1 1 auto',
                          justifyContent: 'center'
                        }}
                      >
                        Allot Waiting Car ({waitingCars.length})
                      </button>

                      <button
                        onClick={() => {
                          setWalkInVeh('');
                          setShowWalkInModal(true);
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          flex: '1 1 auto',
                          justifyContent: 'center'
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

      {/* 2. RECENT QUEUE SECTION */}
      <div className="glass-panel" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '14px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>Recent Queue</h3>
            <span className="badge badge-aqua" style={{ fontSize: '0.68rem', padding: '2px 8px', letterSpacing: '0.04em' }}>LIVE</span>
          </div>

          <button
            onClick={() => setActiveSubTab('bookings')}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px', minHeight: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            All Bookings ({bookings.length}) <ChevronRight size={14} />
          </button>
        </div>

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        <div className="queue-desktop-table">
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                  <th style={{ padding: '12px 10px', width: '90px' }}>Code</th>
                  <th style={{ padding: '12px 10px', width: '130px' }}>Date & Slot</th>
                  <th style={{ padding: '12px 10px', width: '160px' }}>Customer</th>
                  <th style={{ padding: '12px 10px', width: '150px' }}>Vehicle</th>
                  <th style={{ padding: '12px 10px' }}>Service</th>
                  <th style={{ padding: '12px 10px', width: '95px' }}>Bay</th>
                  <th style={{ padding: '12px 10px', width: '160px' }}>Status</th>
                  <th style={{ padding: '12px 10px', width: '100px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 6).map((b) => {
                  const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                      {/* Tracking Code */}
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>
                        {code}
                      </td>

                      {/* Date & Slot */}
                      <td style={{ padding: '12px 10px', color: '#CCD0CF', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date || 'Today'}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--accent-gold)' }}>{b.slotTime || '10:00 AM'}</div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                        <div
                          onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                          style={{ fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                          title="Click to view 2-Year Lifetime History"
                        >
                          {b.customerName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--ice-tint)', fontFamily: 'monospace' }}>{b.phone}</div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '12px 10px', color: 'var(--ice-tint)', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                        {b.vehicleModel && <div style={{ fontSize: '0.74rem' }}>{b.vehicleModel}</div>}
                      </td>

                      {/* Service with clean interactive dropdown formatting */}
                      <td style={{ padding: '12px 10px' }}>
                        <ServiceDropdownPill serviceStr={b.serviceName || b.packageName} addons={b.addons} compact={true} />
                      </td>

                      {/* Bay Selector */}
                      <td style={{ padding: '12px 10px' }}>
                        <select
                          value={b.bayAssigned || 'BAY 1'}
                          onChange={(e) => handleBayChange(b._id, e.target.value)}
                          className="admin-select-table"
                        >
                          <option value="BAY 1">BAY 1</option>
                          <option value="BAY 2">BAY 2</option>
                        </select>
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '12px 10px' }}>
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

                      {/* Amount */}
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--accent-gold)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        ₹{b.totalAmount}
                        <div style={{ fontSize: '0.68rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700 }}>
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
                  borderRadius: '10px',
                  background: 'rgba(0, 31, 35, 0.45)',
                  border: '1px solid rgba(74, 92, 106, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '10px'
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
                    fontSize: '0.68rem',
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
                      style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.88rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                    >
                      {b.customerName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontFamily: 'monospace' }}>
                      {b.phone}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--ice-tint)' }}>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      🚗 {b.vehicleNumber} {b.vehicleModel ? `• ${b.vehicleModel}` : `• ${b.vehicleType}`}
                    </span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.74rem' }}>
                      {b.slotTime || '10:00 AM'}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
