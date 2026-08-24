import React from 'react';
import { LayoutDashboard, TrendingUp, Calendar, Users, Wrench, DollarSign, Send, Plus, RefreshCw, LogOut, Car } from 'lucide-react';

export default function AdminSidebar({ activeSubTab, setActiveSubTab, onRefresh, onRegisterWalkIn, onExitToCustomerSite }) {
  const menuItems = [
    { id: 'analytics', label: 'Analytics & Net Profit', icon: TrendingUp },
    { id: 'bookings', label: 'Live Bay Control', icon: Calendar },
    { id: 'crm', label: 'Customer CRM', icon: Users },
    { id: 'staff', label: 'Staff Workload', icon: Wrench },
    { id: 'expenses', label: 'Expense Log', icon: DollarSign },
    { id: 'marketing', label: 'Abandoned Recovery', icon: Send }
  ];

  return (
    <aside style={{
      width: '270px',
      minHeight: '100vh',
      background: 'rgba(0, 25, 28, 0.98)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(15, 164, 175, 0.2)',
      boxShadow: '4px 0 25px rgba(0, 0, 0, 0.4)',
      padding: '24px 18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0
    }}>
      <div>
        {/* SIDEBAR LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
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
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.1 }}>
              CAR<span style={{ color: 'var(--accent-aqua)' }}>WASH</span>
            </div>
            <span className="badge badge-terracotta" style={{ fontSize: '0.6rem', padding: '1px 6px', marginTop: '3px', display: 'inline-block' }}>
              OWNER PANEL
            </span>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', fontWeight: 800, letterSpacing: '0.12em', paddingLeft: '10px', marginBottom: '12px' }}>
          ENTERPRISE MODULES
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(item => {
            const IconComp = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                style={{
                  background: isActive ? 'linear-gradient(90deg, rgba(15, 164, 175, 0.25) 0%, rgba(0, 49, 53, 0.8) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent-aqua)' : 'var(--text-main)',
                  borderLeft: isActive ? '4px solid var(--accent-aqua)' : '4px solid transparent',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderRadius: '0 10px 10px 0',
                  padding: '12px 14px',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <IconComp size={18} color={isActive ? 'var(--accent-aqua)' : 'var(--ice-tint)'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SIDEBAR BOTTOM ACTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '20px', borderTop: '1px solid rgba(175, 221, 229, 0.15)' }}>
        <button
          onClick={onRegisterWalkIn}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
        >
          <Plus size={16} /> Fast Walk-In
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onRefresh}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '0.82rem' }}
            title="Refresh Data"
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            onClick={onExitToCustomerSite}
            style={{
              background: 'rgba(175, 221, 229, 0.1)',
              border: '1px solid var(--border-light)',
              color: 'var(--ice-tint)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Exit to Site"
          >
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>
    </aside>
  );
}
