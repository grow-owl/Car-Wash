import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomerHome from './pages/CustomerHome';
import { verifyAdminToken } from './api';
import './theme.css';

// Code Splitting - Lazy Load Secondary & Heavy Routes for Instant Initial Load
const AdminSidebar = lazy(() => import('./components/AdminSidebar'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLoginGate = lazy(() => import('./components/AdminLoginGate'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const TrackBooking = lazy(() => import('./pages/TrackBooking'));
const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));
const SmartLeadPopup = lazy(() => import('./components/SmartLeadPopup'));

function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      color: 'var(--accent-cyan)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(0, 229, 255, 0.2)',
        borderTopColor: 'var(--accent-cyan)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: '0.9rem', letterSpacing: '0.05em', color: 'var(--ice-tint)' }}>Loading CAR WASH...</div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');
  const [preselectedItem, setPreselectedItem] = useState(null);
  const [activeBookingCode, setActiveBookingCode] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('analytics');

  // Authenticated Owner / Admin State
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const token = localStorage.getItem('carwash_admin_token');
      const user = localStorage.getItem('carwash_admin_user');
      return token && user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });

  // Verify Admin JWT token with backend on mount
  useEffect(() => {
    const token = localStorage.getItem('carwash_admin_token');
    if (token) {
      verifyAdminToken()
        .then((res) => {
          if (res.data?.user) {
            setCurrentAdmin(res.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('carwash_admin_token');
          localStorage.removeItem('carwash_admin_user');
          setCurrentAdmin(null);
        });
    }
  }, []);

  // Dynamic Browser Tab SEO Title
  useEffect(() => {
    const titles = {
      home: 'CAR WASH | Premium Auto Detailing, Foam Wash & Ceramic Coating in Siliguri',
      booking: 'Book Car Wash Online | Instant Slot Booking - CAR WASH',
      track: 'Live Wash Queue Tracking | CAR WASH',
      crm: 'Customer Portal & Garage History | CAR WASH',
      admin: 'Live Bay Management & Dashboard | CAR WASH'
    };
    document.title = titles[activeTab] || titles.home;
  }, [activeTab]);

  const handleAdminSignOut = () => {
    localStorage.removeItem('carwash_admin_token');
    localStorage.removeItem('carwash_admin_user');
    setCurrentAdmin(null);
    window.location.hash = '#home';
    setActiveTab('home');
  };

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

  // Read secret Admin Portal path from .env
  const ADMIN_SECRET_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH || import.meta.env.VITE_OWNER_PORTAL_SECRET_PATH || '#admin-login-x97k';

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
      // Check query params for instant WhatsApp Invoice & Tracking Links
      const searchParams = new URLSearchParams(window.location.search);
      const trackParam = searchParams.get('track') || searchParams.get('code') || searchParams.get('booking');
      const invoiceParam = searchParams.get('invoice');
      
      if (invoiceParam && invoiceParam !== '1' && invoiceParam !== 'true') {
        setActiveBookingCode(invoiceParam.toUpperCase().trim());
        setActiveTab('track');
        return;
      } else if (trackParam) {
        setActiveBookingCode(trackParam.toUpperCase().trim());
        setActiveTab('track');
        return;
      }

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
      const secretClean = ADMIN_SECRET_PATH.replace('#', '');

      if (
        hash.startsWith('#admin') ||
        hash === ADMIN_SECRET_PATH ||
        cleanHash === secretClean ||
        cleanHash.startsWith('admin-login') ||
        hash === '#owner'
      ) {
        setActiveTab('admin');
        const parts = hash.split('/');
        if (parts.length > 1 && parts[1]) {
          setAdminSubTab(parts[1]);
        }
      } else if (hash.startsWith('#track') || hash.startsWith('#invoice')) {
        const parts = hash.split('/');
        if (parts.length > 1 && parts[1]) {
          const codePart = parts[1].split('?')[0];
          if (codePart) setActiveBookingCode(codePart.toUpperCase().trim());
        }
        setActiveTab('track');
      } else if (hash === '#login' || hash === '#portal' || hash === '#garage' || hash === '#vip' || hash === '#crm') {
        setActiveTab('crm');
      } else if (hash === '#booking') {
        setActiveTab('booking');
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
  }, [ADMIN_SECRET_PATH]);

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

  // OWNER / ADMIN DASHBOARD OR AUTH GATE
  if (activeTab === 'admin') {
    // If NOT authenticated, show the secure Admin Login Gate
    if (!currentAdmin) {
      return (
        <Suspense fallback={<PageLoader />}>
          <div style={{ minHeight: '100vh', background: '#06141b' }}>
            <AdminLoginGate
              onLoginSuccess={(user) => {
                setCurrentAdmin(user);
              }}
              onCancel={() => {
                window.location.hash = '#home';
                setActiveTab('home');
              }}
            />
          </div>
        </Suspense>
      );
    }

    // If Authenticated with JWT, show full Owner Management Portal
    return (
      <Suspense fallback={<PageLoader />}>
        <div className="admin-layout">
          {/* Left Owner Sidebar */}
          <AdminSidebar
            activeSubTab={adminSubTab}
            setActiveSubTab={changeAdminSubTab}
            onRefresh={() => setAdminRefreshTrigger(prev => prev + 1)}
            onRegisterWalkIn={() => setShowWalkInModal(true)}
            onExitToCustomerSite={handleAdminSignOut}
          />

          {/* Right Owner Content Dashboard Area with Responsive Scrollable Layout */}
          <main className="admin-main-area" style={{ padding: '20px 24px' }}>
            <AdminDashboard
              activeSubTab={adminSubTab}
              setActiveSubTab={changeAdminSubTab}
              refreshTrigger={adminRefreshTrigger}
              showWalkInModal={showWalkInModal}
              setShowWalkInModal={setShowWalkInModal}
            />
          </main>
        </div>
      </Suspense>
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
          <Suspense fallback={<PageLoader />}>
            <BookingFlow
              initialVehicle={selectedVehicle}
              preselectedItem={preselectedItem}
              currentUser={currentUser}
              onBookingComplete={handleBookingComplete}
              onTrackLive={handleTrackLive}
              onBackToHome={() => changeTab('home')}
            />
          </Suspense>
        )}

        {activeTab === 'track' && (
          <Suspense fallback={<PageLoader />}>
            <TrackBooking
              activeCode={activeBookingCode}
              onBackToHome={() => changeTab('home')}
            />
          </Suspense>
        )}

        {activeTab === 'crm' && (
          <Suspense fallback={<PageLoader />}>
            <CustomerPortal
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onSignOut={handleSignOut}
              onBackToHome={() => changeTab('home')}
            />
          </Suspense>
        )}
      </main>

      <Suspense fallback={null}>
        <SmartLeadPopup onStartBookingWithOffer={(offerCode) => {
          setPreselectedItem({ name: `Offer (${offerCode})`, price: 0 });
          changeTab('booking');
        }} />
      </Suspense>

      <Footer />
    </div>
  );
}
