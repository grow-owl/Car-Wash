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
  const [activeBookingCode, setActiveBookingCode] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('analytics');

  // Shared Admin Action Triggers
  const [adminRefreshTrigger, setAdminRefreshTrigger] = useState(0);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Check URL hash/query parameter for private owner route (#admin or ?owner=true)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#admin' || hash === '#owner' || search.includes('owner=true') || search.includes('admin=true')) {
        setActiveTab('admin');
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
      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Left Owner Sidebar */}
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

        {/* Right Owner Content Dashboard Area */}
        <main style={{ flex: 1, padding: '24px 36px', overflowY: 'auto' }}>
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
      />

      <main style={{ flex: 1, paddingTop: '76px' }}>
        {activeTab === 'home' && (
          <CustomerHome
            onStartBooking={handleStartBooking}
            onSelectVehicle={(veh) => setSelectedVehicle(veh)}
            onSelectService={() => setActiveTab('booking')}
          />
        )}

        {activeTab === 'booking' && (
          <BookingFlow
            initialVehicle={selectedVehicle}
            onBookingComplete={handleBookingComplete}
            onTrackLive={handleTrackLive}
          />
        )}

        {activeTab === 'track' && (
          <TrackBooking activeCode={activeBookingCode} />
        )}

        {activeTab === 'crm' && (
          <CustomerPortal />
        )}
      </main>

      <Footer onOpenOwnerPortal={() => setActiveTab('admin')} />
    </div>
  );
}
