import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';
import Footer from './components/Footer';
import SmartLeadPopup from './components/SmartLeadPopup';
import CustomerHome from './pages/CustomerHome';
import BookingFlow from './pages/BookingFlow';
import TrackBooking from './pages/TrackBooking';
import CustomerPortal from './pages/CustomerPortal';
import AdminDashboard from './pages/AdminDashboard';
import './theme.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');
  const [preselectedItem, setPreselectedItem] = useState(null);
  const [activeBookingCode, setActiveBookingCode] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('analytics');

  // Change Admin Sub-Tab with History pushState for Mobile Phone Edge Swipe Back Gesture
  const changeAdminSubTab = (newSubTab) => {
    if (newSubTab === adminSubTab) return;
    const targetHash = `#admin/${newSubTab}`;
    window.history.pushState({ tab: 'admin', subTab: newSubTab }, '', targetHash);
    setAdminSubTab(newSubTab);
  };

  // Logged-In Customer State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('carwash_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleSignOut = () => {
    localStorage.removeItem('carwash_customer');
    setCurrentUser(null);
    window.location.hash = '#home';
    setActiveTab('home');
  };

  // Shared Admin Action Triggers
  const [adminRefreshTrigger, setAdminRefreshTrigger] = useState(0);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Read secret Owner Portal path from .env
  const OWNER_SECRET_PATH = import.meta.env.VITE_OWNER_PORTAL_SECRET_PATH || '#owner-sec89k7-wash-portal';

  // Tab navigator that pushes to Browser History for Mobile Native Back Gesture/Button
  const changeTab = (tabName, hashValue = null) => {
    const targetHash = hashValue || `#${tabName}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ tab: tabName }, '', targetHash);
    }
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check URL hash & history state for mobile gesture swipe back & navigation
  useEffect(() => {
    const handleUrlRoute = (event) => {
      // Check event state from popstate if present
      if (event && event.state) {
        if (event.state.tab === 'admin') {
          setActiveTab('admin');
          if (event.state.subTab) {
            setAdminSubTab(event.state.subTab);
          }
          return;
        } else if (event.state.tab) {
          setActiveTab(event.state.tab);
          return;
        }
      }

      const hash = window.location.hash;
      const cleanHash = hash.replace('#', '');
      const secretClean = OWNER_SECRET_PATH.replace('#', '');

      if (hash.startsWith('#admin') || hash === OWNER_SECRET_PATH || cleanHash === secretClean || hash === '#owner') {
        setActiveTab('admin');
        const parts = hash.split('/');
        if (parts.length > 1 && parts[1]) {
          setAdminSubTab(parts[1]);
        }
      } else if (hash === '#login' || hash === '#portal' || hash === '#garage' || hash === '#vip' || hash === '#crm') {
        setActiveTab('crm');
      } else if (hash === '#booking') {
        setActiveTab('booking');
      } else if (hash === '#track') {
        setActiveTab('track');
      } else {
        setActiveTab('home');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  const handleStartBooking = (vehType) => {
    if (vehType) setSelectedVehicle(vehType);
    changeTab('booking');
  };

  const handleBookingComplete = (code) => {
    setActiveBookingCode(code);
  };

  const handleTrackLive = (code) => {
    setActiveBookingCode(code);
    changeTab('track');
  };

  // OWNER DASHBOARD LAYOUT (Dedicated Sidebar)
  if (activeTab === 'admin') {
    return (
      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#0a1b27' }}>
        {/* Left Owner Sidebar */}
        <AdminSidebar
          activeSubTab={adminSubTab}
          setActiveSubTab={changeAdminSubTab}
          onRefresh={() => setAdminRefreshTrigger(prev => prev + 1)}
          onRegisterWalkIn={() => setShowWalkInModal(true)}
          onExitToCustomerSite={() => {
            window.location.hash = '#home';
            setActiveTab('home');
          }}
        />

        {/* Right Owner Content Dashboard Area with Responsive Scrollable Layout */}
        <main className="admin-main-area" style={{
          flex: 1,
          minWidth: 0,
          padding: '20px 24px',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: 'linear-gradient(145deg, #18384d 0%, #112a3b 100%)'
        }}>
          <AdminDashboard
            activeSubTab={adminSubTab}
            setActiveSubTab={changeAdminSubTab}
            refreshTrigger={adminRefreshTrigger}
            showWalkInModal={showWalkInModal}
            setShowWalkInModal={setShowWalkInModal}
          />
        </main>
      </div>
    );
  }

  // PUBLIC CUSTOMER LAYOUT (Sticky Top Navbar + Page Content + Footer)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBookingCode={activeBookingCode}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      <main className="public-main-content" style={{ flex: 1, paddingTop: '72px' }}>
        {activeTab !== 'home' && (
          <div className="container" style={{ paddingTop: '20px', paddingBottom: '10px' }}>
            <button
              onClick={() => changeTab('home')}
              style={{
                background: 'rgba(0, 49, 53, 0.85)',
                border: '1.5px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                fontWeight: 800,
                fontSize: '0.88rem',
                padding: '8px 20px',
                borderRadius: '22px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 229, 255, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back to Home & Services
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <CustomerHome
            onStartBooking={handleStartBooking}
            onSelectVehicle={(veh) => setSelectedVehicle(veh)}
            onSelectService={(svc) => {
              setPreselectedItem(svc);
              changeTab('booking');
            }}
            onSelectPackage={(pkg) => {
              setPreselectedItem(pkg);
              changeTab('booking');
            }}
          />
        )}

        {activeTab === 'booking' && (
          <BookingFlow
            initialVehicle={selectedVehicle}
            preselectedItem={preselectedItem}
            onBookingComplete={handleBookingComplete}
            onTrackLive={handleTrackLive}
            onBackToHome={() => changeTab('home')}
          />
        )}

        {activeTab === 'track' && (
          <TrackBooking
            activeCode={activeBookingCode}
            onBackToHome={() => changeTab('home')}
          />
        )}

        {activeTab === 'crm' && (
          <CustomerPortal
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onSignOut={handleSignOut}
            onBackToHome={() => changeTab('home')}
          />
        )}
      </main>

      <SmartLeadPopup onStartBookingWithOffer={(offerCode) => {
        setPreselectedItem({ name: `Offer (${offerCode})`, price: 0 });
        changeTab('booking');
      }} />

      <Footer onOpenOwnerPortal={() => setActiveTab('admin')} />
    </div>
  );
}
