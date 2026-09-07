import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Users, Wrench, DollarSign, Plus, RefreshCw, LogOut, Menu, X, AlertTriangle } from 'lucide-react';

export default function AdminSidebar({ activeSubTab, setActiveSubTab, onRefresh, onRegisterWalkIn, onExitToCustomerSite }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const menuItems = [
    { id: 'analytics', label: 'Overview & Bays', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings & Queue', icon: Calendar },
    { id: 'crm', label: 'Customers & Leads', icon: Users },
    { id: 'services', label: 'Services & Pricing', icon: Wrench },
    { id: 'expenses', label: 'Staff & Expenses', icon: DollarSign }
  ];

  const handleSelectModule = (id) => {
    setActiveSubTab(id);
    setMobileDrawerOpen(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (onExitToCustomerSite) {
      onExitToCustomerSite();
    }
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
        background: 'rgba(6, 20, 27, 0.98)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(74, 92, 106, 0.3)',
        padding: '12px 18px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open Menu"
            style={{
              background: 'rgba(0, 49, 53, 0.8)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: 'var(--accent-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <Menu size={18} /> Menu
          </button>

          <img src="/logo.webp" alt="CAR WASH Logo" width="36" height="36" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onRegisterWalkIn}
            className="btn-gold"
            style={{
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '7px 12px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} /> + Walk-In
          </button>

          <button
            onClick={() => setShowExitModal(true)}
            style={{
              background: 'rgba(255, 89, 100, 0.15)',
              border: '1px solid var(--accent-coral)',
              color: 'var(--accent-coral)',
              fontWeight: 700,
              fontSize: '0.78rem',
              padding: '7px 12px',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="mobile-admin-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside className={`admin-sidebar ${mobileDrawerOpen ? 'mobile-drawer-open' : ''}`} style={{
        padding: '20px 14px'
      }}>

        {/* TOP SECTION */}
        <div>
          {/* LOGO & BRAND */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '0 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.webp" alt="Logo" width="32" height="32" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                  CAR<span style={{ color: 'var(--accent-cyan)' }}>WASH</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  OWNER PANEL
                </div>
              </div>
            </div>

            {/* Mobile Close */}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="drawer-close-btn"
              aria-label="Close Menu"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#CCD0CF',
                cursor: 'pointer',
                display: 'none'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* QUICK ACTION: WALK-IN BUTTON */}
          <button
            onClick={onRegisterWalkIn}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '20px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(255, 195, 0, 0.25)'
            }}
          >
            <Plus size={16} /> New Walk-In Ticket
          </button>

          {/* NAVIGATION LINKS */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id ||
                (item.id === 'crm' && (activeSubTab === 'leads' || activeSubTab === 'vehicles' || activeSubTab === 'memberships')) ||
                (item.id === 'services' && activeSubTab === 'coupons') ||
                (item.id === 'expenses' && (activeSubTab === 'staff' || activeSubTab === 'marketing'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#06141B' : '#CCD0CF',
                    background: isActive ? 'var(--accent-cyan)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent-cyan)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#CCD0CF';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} color={isActive ? '#06141B' : 'var(--accent-cyan)'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM CONTROLS */}
        <div style={{ borderTop: '1px solid rgba(74, 92, 106, 0.3)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: isRefreshing ? 'var(--accent-cyan)' : '#CCD0CF',
              background: isRefreshing ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: isRefreshing ? '1px solid var(--accent-cyan)' : '1px solid rgba(74, 92, 106, 0.4)',
              cursor: isRefreshing ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)';
                e.currentTarget.style.color = 'var(--accent-cyan)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = '#CCD0CF';
                e.currentTarget.style.borderColor = 'rgba(74, 92, 106, 0.4)';
              }
            }}
          >
            <RefreshCw
              size={14}
              color="var(--accent-cyan)"
              style={{
                animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none'
              }}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>

          {/* PROMINENT EXIT BUTTON */}
          <button
            onClick={() => setShowExitModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--accent-coral)',
              background: 'rgba(255, 89, 100, 0.12)',
              border: '1px solid rgba(255, 89, 100, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 89, 100, 0.25)';
              e.currentTarget.style.borderColor = 'var(--accent-coral)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 89, 100, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 89, 100, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 89, 100, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <LogOut size={15} /> Exit Owner Portal
          </button>
        </div>

      </aside>

      {/* EXIT CONFIRMATION WARNING MODAL */}
      {showExitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div
            className="glass-panel"
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '28px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 89, 100, 0.4)',
              background: 'rgba(17, 33, 45, 0.96)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 89, 100, 0.15)',
              border: '1px solid var(--accent-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--accent-coral)'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
              Exit Owner Dashboard?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to exit the management portal?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '11px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                style={{
                  background: 'linear-gradient(135deg, #FF5964 0%, #D8313C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '11px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 89, 100, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 89, 100, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 89, 100, 0.35)';
                }}
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

