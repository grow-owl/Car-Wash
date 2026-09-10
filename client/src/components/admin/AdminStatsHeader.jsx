import React from 'react';
import { getLocalDateString } from '../../utils';

export default function AdminStatsHeader({
  bookings = [],
  bays = []
}) {
  const todayStr = getLocalDateString(new Date());
  const todayBookingsCount = bookings.filter(b => b.date === todayStr).length;
  const activeQueueCount = bookings.filter(b => 
    b.status === 'In-Progress' || 
    b.status === 'Confirmed' || 
    b.status === 'Pending' || 
    b.status === 'washing' || 
    b.status === 'detailing'
  ).length;
  const occupiedBaysCount = bays.filter(b => b.status === 'Occupied').length;
  const totalBays = bays.length || 2;

  return (
    <div className="admin-stats-grid">
      <div className="glass-panel admin-stat-card" style={{ padding: '16px', borderRadius: '12px' }}>
        <div className="stat-title" style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>TODAY'S JOBS</div>
        <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
          {todayBookingsCount} Bookings
        </div>
      </div>

      <div className="glass-panel admin-stat-card" style={{ padding: '16px', borderRadius: '12px' }}>
        <div className="stat-title" style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>ACTIVE QUEUE</div>
        <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
          {activeQueueCount} Cars
        </div>
      </div>

      <div className="glass-panel admin-stat-card" style={{ padding: '16px', borderRadius: '12px' }}>
        <div className="stat-title" style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>LIVE BAYS IN USE</div>
        <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00E5FF', marginTop: '4px' }}>
          {occupiedBaysCount} / {totalBays} Active
        </div>
      </div>

      <div className="glass-panel admin-stat-card" style={{ padding: '16px', borderRadius: '12px' }}>
        <div className="stat-title" style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontWeight: 600 }}>TOTAL WASH ARCHIVE</div>
        <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#25D366', marginTop: '4px' }}>
          {bookings.length} Records
        </div>
      </div>
    </div>
  );
}
