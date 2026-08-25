import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';
import Footer from './components/Footer';
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

  // Check URL hash for secret coded owner route or public customer routes (#login, #booking, #track, #services, #pricing, #contact)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash;
      const cleanHash = hash.replace('#', '');
      const secretClean = OWNER_SECRET_PATH.replace('#', '');

      if (hash === OWNER_SECRET_PATH || cleanHash === secretClean) {
        setActiveTab('admin');
      } else if (hash === '#login' || hash === '#portal' || hash === '#garage' || hash === '#vip') {
        setActiveTab('crm');
      } else if (hash === '#booking') {
        setActiveTab('booking');
      } else if (hash === '#track') {
        setActiveTab('track');
      } else if (hash === '#services' || hash === '#pricing' || hash === '#contact') {
        setActiveTab('home');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  const handleStartBooking = (vehType) => {
    if (vehType) setSelectedVehicle(vehType);
    setActiveTab('booking');
  };

  const handleBookingComplete = (code) => {
    setActiveBookingCode(code);
  };

  const handleTrackLive = (code) => {
    setActiveBookingCode(code);
    setActiveTab('track');
  };

  // OWNER DASHBOARD LAYOUT (Dedicated Sidebar)
  if (activeTab === 'admin') {
    return (
      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#0a1b27' }}>
        {/* Left Owner Sidebar (Kept as requested) */}
        <AdminSidebar
          activeSubTab={adminSubTab}
          setActiveSubTab={setAdminSubTab}
          onRefresh={() => setAdminRefreshTrigger(prev => prev + 1)}
          onRegisterWalkIn={() => setShowWalkInModal(true)}
          onExitToCustomerSite={() => {
            window.location.hash = '';
            setActiveTab('home');
          }}
        />

        {/* Right Owner Content Dashboard Area with Lighter Slate Navy Background */}
        <main style={{
          flex: 1,
          padding: '24px 36px',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, #18384d 0%, #112a3b 100%)'
        }}>
          <AdminDashboard
            activeSubTab={adminSubTab}
            setActiveSubTab={setAdminSubTab}
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
        {activeTab === 'home' && (
          <CustomerHome
            onStartBooking={handleStartBooking}
            onSelectVehicle={(veh) => setSelectedVehicle(veh)}
            onSelectService={(svc) => {
              setPreselectedItem(svc);
              setActiveTab('booking');
            }}
            onSelectPackage={(pkg) => {
              setPreselectedItem(pkg);
              setActiveTab('booking');
            }}
          />
        )}

        {activeTab === 'booking' && (
          <BookingFlow
            initialVehicle={selectedVehicle}
            preselectedItem={preselectedItem}
            onBookingComplete={handleBookingComplete}
            onTrackLive={handleTrackLive}
          />
        )}

        {activeTab === 'track' && (
          <TrackBooking activeCode={activeBookingCode} />
        )}

        {activeTab === 'crm' && (
          <CustomerPortal
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      <Footer onOpenOwnerPortal={() => setActiveTab('admin')} />
    </div>
  );
}
