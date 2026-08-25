import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, Calendar, Users, Wrench, DollarSign, Send, Plus, RefreshCw, LogOut, Car, Menu, X } from 'lucide-react';

export default function AdminSidebar({ activeSubTab, setActiveSubTab, onRefresh, onRegisterWalkIn, onExitToCustomerSite }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const menuItems = [
    { id: 'analytics', label: 'Analytics & Net Profit', icon: TrendingUp },
    { id: 'bookings', label: 'Live Bay Control', icon: Calendar },
    { id: 'services', label: 'Service Management', icon: Car },
    { id: 'crm', label: 'Customer CRM', icon: Users },
    { id: 'staff', label: 'Staff Workload', icon: Wrench },
    { id: 'expenses', label: 'Expense Log', icon: DollarSign },
    { id: 'marketing', label: 'Abandoned Recovery', icon: Send }
  ];

  const handleSelectModule = (id) => {
    setActiveSubTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP HEADER BAR (< 900px) */}
      <div className="mobile-admin-header" style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9000,
        background: 'rgba(0, 25, 28, 0.98)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(15, 164, 175, 0.2)',
        padding: '12px 18px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            style={{
              background: 'rgba(0, 49, 53, 0.8)',
              border: '1px solid var(--accent-aqua)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: 'var(--accent-aqua)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            <Menu size={20} /> Menu
          </button>

          <img src="/logo.png" alt="CAR WASH Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </div>

        <button
          onClick={onRegisterWalkIn}
          style={{
            background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
            color: '#003135',
            fontWeight: 800,
            fontSize: '0.78rem',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Plus size={14} /> Ticket
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY FOR LEFT OFF-CANVAS DRAWER */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="mobile-admin-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* SIDEBAR CONTAINER (DESKTOP STICKY SIDEBAR + MOBILE SLIDE-OUT LEFT DRAWER) */}
      <aside className={`admin-sidebar ${mobileDrawerOpen ? 'mobile-drawer-open' : ''}`} style={{
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingLeft: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="CAR WASH Logo" style={{ height: '38px', objectFit: 'contain' }} />
              <span className="badge badge-terracotta" style={{ fontSize: '0.58rem', padding: '2px 6px' }}>
                OWNER PANEL
              </span>
            </div>

            {/* DRAWER CLOSE BUTTON (MOBILE ONLY) */}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="drawer-close-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'none'
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS */}
          <div style={{ fontSize: '0.7rem', color: 'var(--ice-tint)', fontWeight: 800, letterSpacing: '0.1em', paddingLeft: '8px', marginBottom: '10px' }}>
            ENTERPRISE MODULES
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isActive ? '1px solid var(--accent-aqua)' : '1px solid transparent',
                    background: isActive ? 'linear-gradient(135deg, rgba(15, 164, 175, 0.25) 0%, rgba(2, 73, 80, 0.4) 100%)' : 'transparent',
                    color: isActive ? 'var(--accent-aqua)' : 'var(--text-muted)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--accent-aqua)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* QUICK ACTIONS & EXIT TO CUSTOMER SITE */}
        <div style={{ borderTop: '1px solid rgba(175, 221, 229, 0.15)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              onRegisterWalkIn();
              setMobileDrawerOpen(false);
            }}
            className="btn-slot-hover"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--accent-aqua) 0%, #14c7d4 100%)',
              color: '#003135',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> + Walk-In Ticket
          </button>

          <button
            onClick={() => {
              onRefresh();
              setMobileDrawerOpen(false);
            }}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px 14px',
              fontSize: '0.82rem',
              borderRadius: '10px'
            }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>

          <button
            onClick={() => {
              onExitToCustomerSite();
              setMobileDrawerOpen(false);
            }}
            style={{
              width: '100%',
              background: 'rgba(150, 71, 52, 0.2)',
              border: '1px solid var(--accent-terracotta)',
              color: '#e0725a',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '10px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px'
            }}
          >
            <LogOut size={14} /> Exit Owner Panel
          </button>
        </div>

      </aside>
    </>
  );
}
