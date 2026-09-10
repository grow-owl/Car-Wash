import React, { useState, useMemo } from 'react';
import { X, Download, Calendar, CalendarDays, Clock, FileSpreadsheet, Check } from 'lucide-react';
import { getLocalDateString } from '../../../utils';

export default function ExportCsvModal({
  isOpen,
  onClose,
  bookings = []
}) {
  const [rangeType, setRangeType] = useState('all'); // 'all' | 'today' | 'month' | 'custom'
  
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const currentMonthPrefix = useMemo(() => todayStr.substring(0, 7), [todayStr]); // 'YYYY-MM'
  
  const [customStart, setCustomStart] = useState(todayStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  const filteredData = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    return bookings.filter((b) => {
      const bDate = b.date ? b.date.split('T')[0] : '';
      if (rangeType === 'all') {
        return true;
      }
      if (rangeType === 'today') {
        return bDate === todayStr;
      }
      if (rangeType === 'month') {
        return bDate.startsWith(currentMonthPrefix);
      }
      if (rangeType === 'custom') {
        if (!bDate) return false;
        if (customStart && bDate < customStart) return false;
        if (customEnd && bDate > customEnd) return false;
        return true;
      }
      return true;
    });
  }, [bookings, rangeType, todayStr, currentMonthPrefix, customStart, customEnd]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert('No bookings found for the selected date range.');
      return;
    }

    const headers = [
      'Booking ID',
      'Date',
      'Slot Time',
      'Customer Name',
      'Phone',
      'Vehicle Type',
      'Vehicle Number',
      'Vehicle Model',
      'Service / Package',
      'Assigned Bay',
      'Total Amount (INR)',
      'Payment Status',
      'Payment Mode',
      'Booking Status',
      'Created At'
    ];

    const rows = filteredData.map((b) => [
      `"${(b.trackingCode || b.bookingCode || '').replace(/"/g, '""')}"`,
      `"${b.date || ''}"`,
      `"${b.slotTime || ''}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.phone || ''}"`,
      `"${b.vehicleType || ''}"`,
      `"${(b.vehicleNumber || '').replace(/"/g, '""')}"`,
      `"${(b.vehicleModel || '').replace(/"/g, '""')}"`,
      `"${(b.serviceName || b.packageName || '').replace(/"/g, '""')}"`,
      `"${b.bayAssigned || 'None'}"`,
      b.totalAmount || 0,
      `"${b.paymentStatus || 'Pending'}"`,
      `"${b.paymentMode || 'Online'}"`,
      `"${b.status || 'Pending'}"`,
      `"${b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    let fileName = `carwash_bookings_all_${todayStr}.csv`;
    if (rangeType === 'today') {
      fileName = `carwash_bookings_today_${todayStr}.csv`;
    } else if (rangeType === 'month') {
      fileName = `carwash_bookings_month_${currentMonthPrefix}.csv`;
    } else if (rangeType === 'custom') {
      fileName = `carwash_bookings_${customStart}_to_${customEnd}.csv`;
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onClose();
  };

  const options = [
    { id: 'all', title: 'All Time', icon: Calendar },
    { id: 'today', title: 'Today', icon: Clock },
    { id: 'month', title: 'This Month', icon: CalendarDays },
    { id: 'custom', title: 'Custom Date Range', icon: FileSpreadsheet }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.78)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '22px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 195, 0, 0.25)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
            <FileSpreadsheet size={20} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>Export Bookings CSV</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#CCD0CF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = rangeType === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setRangeType(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid var(--accent-gold)' : '1px solid rgba(74, 92, 106, 0.3)',
                  background: isSelected ? 'rgba(255, 195, 0, 0.1)' : 'rgba(10, 25, 47, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255, 195, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--accent-gold)' : '#9FB3C8'
                  }}>
                    <Icon size={15} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                    {opt.title}
                  </div>
                </div>

                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid var(--accent-gold)' : '2px solid #4A5C6A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? 'var(--accent-gold)' : 'transparent'
                }}>
                  {isSelected && <Check size={12} color="#06141B" strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Range Inputs (if selected) */}
        {rangeType === 'custom' && (
          <div style={{
            background: 'rgba(6, 20, 27, 0.6)',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(74, 92, 106, 0.3)',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FB3C8', marginBottom: '4px', fontWeight: 600 }}>
                From Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-field"
                style={{
                  height: '36px',
                  minHeight: '36px',
                  fontSize: '0.8rem',
                  padding: '0 8px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FB3C8', marginBottom: '4px', fontWeight: 600 }}>
                To Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-field"
                style={{
                  height: '36px',
                  minHeight: '36px',
                  fontSize: '0.8rem',
                  padding: '0 8px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        )}

        {/* Preview Count */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          marginBottom: '18px',
          fontSize: '0.8rem',
          color: '#CCD0CF'
        }}>
          <span>Matching Bookings to Export:</span>
          <span style={{
            fontWeight: 800,
            color: filteredData.length > 0 ? 'var(--accent-gold)' : '#FF5964',
            background: 'rgba(0,0,0,0.3)',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            {filteredData.length} records
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{
              flex: '1',
              height: '40px',
              minHeight: '40px',
              fontSize: '0.84rem',
              justifyContent: 'center',
              borderRadius: '8px'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={filteredData.length === 0}
            className="btn-gold"
            style={{
              flex: '1.5',
              height: '40px',
              minHeight: '40px',
              fontSize: '0.84rem',
              fontWeight: 800,
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              opacity: filteredData.length === 0 ? 0.5 : 1,
              cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={16} /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
