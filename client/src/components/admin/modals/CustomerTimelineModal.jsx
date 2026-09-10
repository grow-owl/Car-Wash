import React from 'react';
import { History, X, Loader2, FileText } from 'lucide-react';

export default function CustomerTimelineModal({
  isOpen,
  onClose,
  loadingTimeline,
  timelineData,
  onViewInvoice
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10500,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--accent-cyan)',
        boxShadow: '0 12px 40px rgba(0, 229, 255, 0.15)',
        background: 'linear-gradient(135deg, rgba(6, 20, 27, 0.96) 0%, rgba(0, 49, 53, 0.94) 100%)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                Customer Lifetime History & Wash Archive
              </h3>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                2-Year Log
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ice-tint)', marginTop: '4px' }}>
              Complete historical record & booking timeline stored in database
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {loadingTimeline ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: '12px' }}>
            <Loader2 size={32} className="spinner" color="var(--accent-cyan)" />
            <div style={{ fontSize: '0.9rem', color: 'var(--ice-tint)' }}>Fetching customer 2-year wash archive...</div>
          </div>
        ) : !timelineData || !timelineData.bookings || timelineData.bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No past wash records found for this customer or vehicle.
          </div>
        ) : (
          <div>
            {/* Customer Info Card & Stats Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginBottom: '22px'
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>CUSTOMER</div>
                <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem', marginTop: '2px' }}>{timelineData.customerName || 'Valued Customer'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>{timelineData.phone || '-'}</div>
              </div>

              <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>TOTAL WASHES</div>
                <div style={{ fontWeight: 900, color: 'var(--accent-cyan)', fontSize: '1.4rem', marginTop: '2px' }}>
                  {timelineData.totalVisits || timelineData.bookings.length}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 195, 0, 0.08)', border: '1px solid rgba(255, 195, 0, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>LIFETIME SPENT</div>
                <div style={{ fontWeight: 900, color: 'var(--accent-gold)', fontSize: '1.4rem', marginTop: '2px' }}>
                  ₹{timelineData.totalSpent || timelineData.bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0)}
                </div>
              </div>

              <div style={{ background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 600 }}>FIRST & LATEST VISIT</div>
                <div style={{ fontWeight: 700, color: '#25D366', fontSize: '0.82rem', marginTop: '4px' }}>
                  First: {timelineData.firstVisit || timelineData.bookings[timelineData.bookings.length - 1]?.date || '-'}
                </div>
                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.82rem', marginTop: '2px' }}>
                  Latest: {timelineData.latestVisit || timelineData.bookings[0]?.date || '-'}
                </div>
              </div>
            </div>

            {/* Vehicles seen */}
            {timelineData.vehicles && timelineData.vehicles.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', fontWeight: 600 }}>Associated Vehicles:</span>
                {timelineData.vehicles.map((v, idx) => (
                  <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                    🚗 {v}
                  </span>
                ))}
              </div>
            )}

            {/* Wash History Table */}
            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid var(--border-light)', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.25)' }}>
              <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 49, 53, 0.6)', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--ice-tint)' }}>
                    <th style={{ padding: '10px' }}>Code</th>
                    <th style={{ padding: '10px' }}>Date & Slot</th>
                    <th style={{ padding: '10px' }}>Vehicle</th>
                    <th style={{ padding: '10px' }}>Service Performed</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.bookings.map((b) => {
                    const code = b.trackingCode || b.bookingCode || ('CW-' + (b._id ? b._id.slice(-4).toUpperCase() : '1001'));
                    return (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(74, 92, 106, 0.2)' }}>
                        <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {code}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.date}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>{b.slotTime || '10:00 AM'}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{b.vehicleNumber}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)' }}>{b.vehicleType} {b.vehicleModel ? `• ${b.vehicleModel}` : ''}</div>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{b.serviceName || b.packageName}</div>
                          {b.addons && b.addons.length > 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                              +{b.addons.length} Add-ons
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: b.status === 'completed' || b.status === 'Completed' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(0, 229, 255, 0.15)',
                            color: b.status === 'completed' || b.status === 'Completed' ? '#25D366' : 'var(--accent-cyan)',
                            border: b.status === 'completed' || b.status === 'Completed' ? '1px solid #25D366' : '1px solid var(--accent-cyan)'
                          }}>
                            {b.status || 'Completed'}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          ₹{b.totalAmount}
                          <div style={{ fontSize: '0.7rem', color: b.paymentStatus === 'Paid' ? '#25D366' : '#FF5964', fontWeight: 700 }}>
                            {b.paymentStatus || 'Paid'}
                          </div>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onViewInvoice) onViewInvoice(b);
                            }}
                            style={{
                              height: '28px',
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
                              gap: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <FileText size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
