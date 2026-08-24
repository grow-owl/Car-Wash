import React from 'react';
import { LayoutDashboard, TrendingUp, Calendar, Users, Wrench, DollarSign, Send, Plus, RefreshCw, LogOut, Car } from 'lucide-react';

export default function AdminNavbar({ activeSubTab, setActiveSubTab, onRefresh, onRegisterWalkIn, onExitToCustomerSite }) {
  const tabs = [
    { id: 'analytics', label: 'Analytics & Net Profit', icon: TrendingUp },
    { id: 'bookings', label: 'Live Bay Control', icon: Calendar },
    { id: 'crm', label: 'Customer CRM', icon: Users },
    { id: 'staff', label: 'Staff Workload', icon: Wrench },
    { id: 'expenses', label: 'Expense Log', icon: DollarSign },
    { id: 'marketing', label: 'Abandoned Recovery', icon: Send }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      background: 'rgba(0, 25, 28, 0.96)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '2px solid var(--accent-terracotta)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      padding: '12px 48px'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        
        {/* TOP LEFT: Owner Enterprise Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #964734 0%, #b8543f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(150, 71, 52, 0.5)',
            border: '1px solid var(--accent-terracotta)'
          }}>
            <LayoutDashboard size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.1 }}>
              CAR<span style={{ color: 'var(--accent-aqua)' }}>WASH</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="badge badge-terracotta" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                OWNER CONTROL PANEL
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Owner Dedicated Module Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {tabs.map(t => {
            const IconComp = t.icon;
            const isActive = activeSubTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                style={{
                  background: isActive ? 'var(--accent-terracotta)' : 'rgba(0, 49, 53, 0.7)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--accent-terracotta)' : '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <IconComp size={15} color={isActive ? '#FFFFFF' : 'var(--accent-aqua)'} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* TOP RIGHT: Owner Actions (Walk-In, Refresh, Exit) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={onRegisterWalkIn}
            className="btn-primary"
            style={{ padding: '9px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Fast Walk-In
          </button>

          <button
            onClick={onRefresh}
            className="btn-secondary"
            style={{ padding: '9px 14px', fontSize: '0.85rem' }}
            title="Refresh Real-time Data"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={onExitToCustomerSite}
            style={{
              background: 'rgba(175, 221, 229, 0.1)',
              border: '1px solid var(--border-light)',
              color: 'var(--ice-tint)',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Exit to Customer Site"
          >
            <LogOut size={15} /> Exit
          </button>
        </div>

      </div>
    </header>
  );
}
