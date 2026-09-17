import React, { useMemo } from 'react';
import { Plus, Sparkles, CheckCircle2, ChevronRight, Clock, ShieldCheck, User } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import { getVehicleIcon } from '../../../utils/constants';
import ServiceDropdownPill from '../ServiceDropdownPill';

export default function AdminAnalyticsTab({
  bookings = [],
  bays = [],
  getActiveBookingForBay,
  handleStatusChange,
  handleBayChange,
  setAllotModalBay,
  setShowWalkInModal,
  handleOpenCustomerTimeline,
  setActiveSubTab
}) {

// Active statuses where a car is occupying a bay and work is ongoing/waiting in bay
const isBookingOccupyingBay = (booking) => {
  if (!booking) return false;
  const s = String(booking.status || '').toLowerCase().trim();
  if (s === 'completed' || s === 'cancelled') return false;
  const activeStatuses = ['washing', 'in_progress', 'detailing', 'vehicle_received', 'quality_check', 'ready_for_pickup', 'confirmed', 'pending', 'in_bay'];
  return activeStatuses.includes(s);
};

// Check if a specific bay is occupied by another car
const getOccupyingCar = (bayNumOrName, currentBookingId, allBookings = []) => {
  const bayStr = typeof bayNumOrName === 'number' ? `BAY ${bayNumOrName}` : String(bayNumOrName || '').toUpperCase();
  return allBookings.find(item => {
    if (item._id === currentBookingId) return false;
    if (!isBookingOccupyingBay(item)) return false;
    const assigned = String(item.bayAssigned || item.assignedBay || '').toUpperCase();
    return assigned.includes(bayStr);
  });
};

// Helper to convert booking date and slotTime to comparable timestamp for sorting
const getBookingDateTimeValue = (b) => {
  if (!b) return 0;
  const dateStr = b.date || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '');
  let timeStr = String(b.slotTime || '').trim().toUpperCase();

  let hours = 10;
  let minutes = 0;

  if (timeStr.includes('NOW')) {
    if (b.createdAt) {
      const d = new Date(b.createdAt);
      hours = d.getHours();
      minutes = d.getMinutes();
    } else {
      hours = 23;
      minutes = 59;
    }
  } else {
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const meridiem = match[3];
      if (meridiem) {
        if (meridiem === 'PM' && h < 12) h += 12;
        if (meridiem === 'AM' && h === 12) h = 0;
      }
      hours = h;
      minutes = m;
    }
  }

  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day, hours, minutes, 0).getTime();
    }
  }

  if (b.createdAt) {
    return new Date(b.createdAt).getTime();
  }

  return 0;
};

  // Sort Recent Queue by Date and Time (newest / most recent first) exclusively for overview page
  const sortedRecentBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const timeA = getBookingDateTimeValue(a);
      const timeB = getBookingDateTimeValue(b);
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
    });
  }, [bookings]);

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
            <img
              src={getVehicleIcon('Sedan')}
              alt=""
              style={{
                height: '22px',
                maxWidth: '34px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.8))'
              }}
            />
            Live Bay Management
          </h3>
        </div>

        {/* BAYS GRID */}
        <div className="admin-bays-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '16px',
          alignItems: 'stretch'
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
              if (s === 'in_progress' || s === 'washing' || s === 'quality_check' || s === 'detailing') return 'IN PROGRESS';
              if (s === 'completed' || s === 'ready' || s === 'ready_for_pickup') return 'COMPLETE';
              if (s === 'cancelled') return 'CANCELLED';
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
                  justifyContent: 'space-between',
                  height: '100%',
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
                        <span style={{ fontSize: '1.02rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <img src={getVehicleIcon(activeCar.vehicleType || activeCar.vehicleModel)} alt="" style={{ height: '16px', maxWidth: '28px', objectFit: 'contain' }} />
                          {activeCar.vehicleNumber}
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
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
                        <option value="completed">4. Complete</option>
                        <option value="cancelled">Cancelled</option>
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
                    justifyContent: 'space-between',
                    flex: 1,
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(74, 92, 106, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      gap: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'rgba(37, 211, 102, 0.12)',
                        border: '1px solid rgba(37, 211, 102, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Sparkles size={18} color="#25D366" />
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--ice-tint)', lineHeight: 1.4 }}>
                        {bayName} is currently clean and ready for next car
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      alignItems: 'center',
                      marginTop: 'auto',
                      width: '100%'
                    }}>
                      <button
                        onClick={() => setAllotModalBay(bayName)}
                        className="btn-primary"
                        style={{
                          height: '36px',
                          minHeight: '36px',
                          maxHeight: '36px',
                          padding: '0 12px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: 'center',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        Allot Waiting Car ({waitingCars.length})
                      </button>

                      <button
                        onClick={() => {
                          setShowWalkInModal(true);
                        }}
                        className="btn-secondary"
                        style={{
                          height: '36px',
                          minHeight: '36px',
                          maxHeight: '36px',
                          padding: '0 14px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          boxSizing: 'border-box'
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
                  <th style={{ padding: '14px 12px', width: '135px' }}>Date & Slot</th>
                  <th style={{ padding: '14px 12px', width: '175px' }}>Customer</th>
                  <th style={{ padding: '14px 12px', width: '165px' }}>Vehicle</th>
                  <th style={{ padding: '14px 12px' }}>Service / Package</th>
                  <th style={{ padding: '14px 12px', width: '110px' }}>Bay</th>
                  <th style={{ padding: '14px 12px', width: '165px' }}>Status</th>
                  <th style={{ padding: '14px 12px', width: '110px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecentBookings.slice(0, 6).map((b) => {
                  const isDone = b.status === 'completed' || b.status === 'cancelled';
                  const bay1Car = getOccupyingCar(1, b._id, bookings);
                  const bay2Car = getOccupyingCar(2, b._id, bookings);

                  const isBay1Busy = !!bay1Car;
                  const isBay2Busy = !!bay2Car;

                  const currentAssigned = String(b.bayAssigned || b.assignedBay || '').toUpperCase();
                  const isCurrentInBay1 = currentAssigned.includes('BAY 1');
                  const isCurrentInBay2 = currentAssigned.includes('BAY 2');

                  const areBothBaysBusy = isBay1Busy && isBay2Busy;
                  const isSelectDisabled = isDone || (areBothBaysBusy && !isCurrentInBay1 && !isCurrentInBay2);

                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                      {/* Date & Slot */}
                      <td style={{ padding: '14px 12px', color: '#CCD0CF', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date || 'Today'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '2px' }}>{b.slotTime || '10:00 AM'}</div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                        <div
                          onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                          style={{ fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                          title="Click to view Customer Lifetime History"
                        >
                          {b.customerName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontFamily: 'monospace', marginTop: '2px' }}>{b.phone}</div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '14px 12px', color: 'var(--ice-tint)', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={getVehicleIcon(b.vehicleType || b.vehicleModel)} alt="" style={{ height: '14px', maxWidth: '24px', objectFit: 'contain' }} />
                          <span>{b.vehicleNumber}</span>
                        </div>
                        {b.vehicleModel && <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>{b.vehicleModel}</div>}
                      </td>

                      {/* Service with clean interactive dropdown formatting */}
                      <td style={{ padding: '14px 12px' }}>
                        <ServiceDropdownPill serviceStr={b.serviceName || b.packageName} addons={b.addons} compact={true} />
                      </td>

                      {/* Bay Selector with Occupancy Check */}
                      <td style={{ padding: '14px 12px' }}>
                        <select
                          value={b.bayAssigned || (isBay1Busy && !isBay2Busy ? 'BAY 2' : 'BAY 1')}
                          onChange={(e) => handleBayChange(b._id, e.target.value)}
                          disabled={isSelectDisabled}
                          className="admin-select-table"
                          title={
                            isDone
                              ? 'Service finished. Bay assignment closed.'
                              : areBothBaysBusy && !isCurrentInBay1 && !isCurrentInBay2
                              ? 'Both Bay 1 and Bay 2 are currently busy with ongoing work'
                              : 'Select Bay'
                          }
                        >
                          {areBothBaysBusy && !isCurrentInBay1 && !isCurrentInBay2 && (
                            <option value="" disabled>Both Bays Busy</option>
                          )}
                          <option
                            value="BAY 1"
                            disabled={isBay1Busy}
                          >
                            BAY 1 {isBay1Busy ? `(Busy - ${bay1Car.vehicleNumber || 'Occupied'})` : ''}
                          </option>
                          <option
                            value="BAY 2"
                            disabled={isBay2Busy}
                          >
                            BAY 2 {isBay2Busy ? `(Busy - ${bay2Car.vehicleNumber || 'Occupied'})` : ''}
                          </option>
                        </select>
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '14px 12px' }}>
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
                          <option value="completed">4. Complete</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 12px', fontWeight: 800, color: 'var(--accent-gold)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                        ₹{b.totalAmount}
                        <div style={{ fontSize: '0.68rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700, marginTop: '2px' }}>
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
          {sortedRecentBookings.slice(0, 6).map((b) => {
            const isDone = b.status === 'completed' || b.status === 'cancelled';
            const bay1Car = getOccupyingCar(1, b._id, bookings);
            const bay2Car = getOccupyingCar(2, b._id, bookings);

            const isBay1Busy = !!bay1Car;
            const isBay2Busy = !!bay2Car;

            const currentAssigned = String(b.bayAssigned || b.assignedBay || '').toUpperCase();
            const isCurrentInBay1 = currentAssigned.includes('BAY 1');
            const isCurrentInBay2 = currentAssigned.includes('BAY 2');

            const areBothBaysBusy = isBay1Busy && isBay2Busy;
            const isSelectDisabled = isDone || (areBothBaysBusy && !isCurrentInBay1 && !isCurrentInBay2);

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
                {/* Top Row: Vehicle Number + Bay Tag + Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 900, color: '#FFFFFF', fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <img src={getVehicleIcon(b.vehicleType || b.vehicleModel)} alt="" style={{ height: '14px', maxWidth: '24px', objectFit: 'contain' }} />
                      {b.vehicleNumber}
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
                <div style={{ background: 'rgba(0, 0, 0, 0.28)', padding: '11px 14px', borderRadius: '8px', border: '1px solid rgba(74, 92, 106, 0.25)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span
                      onClick={() => handleOpenCustomerTimeline(b.phone || b.vehicleNumber, b.customerName)}
                      style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(0, 229, 255, 0.4)' }}
                      title="Click to view Customer Lifetime History"
                    >
                      {b.customerName}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', fontFamily: 'monospace' }}>
                      {b.phone}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--ice-tint)' }}>
                    <span style={{ color: 'var(--ice-tint)', fontWeight: 600 }}>
                      {b.vehicleModel && b.vehicleModel !== b.vehicleType ? `${b.vehicleModel} • ` : ''}{b.vehicleType || 'Sedan'}
                    </span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.75rem' }}>
                      {b.date ? `${b.date} • ` : ''}{b.slotTime || '10:00 AM'}
                    </span>
                  </div>

                  <div style={{ marginTop: '3px', paddingTop: '6px', borderTop: '1px dashed rgba(74, 92, 106, 0.25)' }}>
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
                    <option value="completed">4. Complete</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={b.bayAssigned || (isBay1Busy && !isBay2Busy ? 'BAY 2' : 'BAY 1')}
                    onChange={(e) => handleBayChange(b._id, e.target.value)}
                    disabled={isSelectDisabled}
                    className="admin-select"
                    style={{
                      height: '34px',
                      minHeight: '34px',
                      fontSize: '0.75rem',
                      width: '100%'
                    }}
                    title={
                      isDone
                        ? 'Service finished. Bay assignment closed.'
                        : areBothBaysBusy && !isCurrentInBay1 && !isCurrentInBay2
                        ? 'Both Bay 1 and Bay 2 are currently busy with ongoing work'
                        : 'Select Bay'
                    }
                  >
                    {areBothBaysBusy && !isCurrentInBay1 && !isCurrentInBay2 && (
                      <option value="" disabled>Both Bays Busy</option>
                    )}
                    <option
                      value="BAY 1"
                      disabled={isBay1Busy}
                    >
                      BAY 1 {isBay1Busy ? `(Busy - ${bay1Car.vehicleNumber || 'Occupied'})` : ''}
                    </option>
                    <option
                      value="BAY 2"
                      disabled={isBay2Busy}
                    >
                      BAY 2 {isBay2Busy ? `(Busy - ${bay2Car.vehicleNumber || 'Occupied'})` : ''}
                    </option>
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
