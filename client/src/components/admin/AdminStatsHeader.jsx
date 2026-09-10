import React from 'react';
import { Calendar, Users, Car, Archive } from 'lucide-react';
import { getLocalDateString } from '../../utils';

export default function AdminStatsHeader({
  bookings = [],
  bays = [],
  getActiveBookingForBay
}) {
  const todayStr = getLocalDateString(new Date());
  const todayBookingsCount = bookings.filter(b => b.date === todayStr).length;
  const activeQueueCount = bookings.filter(b => 
    b.status === 'In-Progress' || 
    b.status === 'Confirmed' || 
    b.status === 'Pending' || 
    b.status === 'washing' || 
    b.status === 'detailing' ||
    b.status === 'vehicle_received' ||
    b.status === 'quality_check'
  ).length;

  const totalBays = bays.length || 2;
  const occupiedBaysCount = (typeof getActiveBookingForBay === 'function'
    ? [1, 2].filter(bayNum => !!getActiveBookingForBay(bayNum)).length
    : [1, 2].filter(bayNum => {
        const bayStr = `BAY ${bayNum}`;
        const activeStatuses = ['washing', 'detailing', 'vehicle_received', 'quality_check', 'in_bay'];
        return bookings.some(b => {
          const assigned = String(b.bayAssigned || b.assignedBay || '').toUpperCase();
          return assigned.includes(bayStr) && activeStatuses.includes(b.status?.toLowerCase());
        });
      }).length
  );

  const stats = [
    {
      title: "Today's Jobs",
      number: todayBookingsCount,
      unit: 'Bookings',
      icon: Calendar,
      color: 'var(--accent-gold)',
      glow: 'rgba(255, 195, 0, 0.12)',
      border: 'rgba(255, 195, 0, 0.28)'
    },
    {
      title: "Active Queue",
      number: activeQueueCount,
      unit: 'Cars',
      icon: Users,
      color: 'var(--accent-cyan)',
      glow: 'rgba(0, 229, 255, 0.12)',
      border: 'rgba(0, 229, 255, 0.28)'
    },
    {
      title: "Live Bays In Use",
      number: `${occupiedBaysCount} / ${totalBays}`,
      unit: 'Active',
      icon: Car,
      color: '#00E5FF',
      glow: 'rgba(0, 229, 255, 0.15)',
      border: 'rgba(0, 229, 255, 0.35)'
    },
    {
      title: "Total Wash Archive",
      number: bookings.length,
      unit: 'Records',
      icon: Archive,
      color: '#25D366',
      glow: 'rgba(37, 211, 102, 0.12)',
      border: 'rgba(37, 211, 102, 0.28)'
    }
  ];

  return (
    <div className="admin-stats-grid">
      {stats.map((st, idx) => {
        const IconComponent = st.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: 'clamp(12px, 2.5vw, 16px)',
              borderRadius: '12px',
              background: 'rgba(0, 31, 35, 0.55)',
              border: `1px solid ${st.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              boxShadow: `0 4px 18px ${st.glow}`,
              boxSizing: 'border-box'
            }}
          >
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div style={{
                fontSize: 'clamp(0.68rem, 1.8vw, 0.74rem)',
                color: 'var(--ice-tint)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {st.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginTop: '3px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 'clamp(1.2rem, 3.2vw, 1.55rem)',
                  fontWeight: 900,
                  color: st.color,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1
                }}>
                  {st.number}
                </span>
                <span style={{
                  fontSize: 'clamp(0.68rem, 1.8vw, 0.75rem)',
                  fontWeight: 700,
                  color: 'var(--ice-tint)',
                  opacity: 0.85,
                  whiteSpace: 'nowrap'
                }}>
                  {st.unit}
                </span>
              </div>
            </div>

            <div style={{
              width: 'clamp(34px, 5vw, 42px)',
              height: 'clamp(34px, 5vw, 42px)',
              borderRadius: '10px',
              background: st.glow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${st.border}`
            }}>
              <IconComponent size={18} color={st.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

