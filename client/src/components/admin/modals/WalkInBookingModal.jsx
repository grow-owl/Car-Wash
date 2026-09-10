import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { getSlotsAvailability } from '../../../api';

const MULTIPLIERS = {
  'Hatchback': 0.85,
  'Sedan': 1.0,
  'SUV': 1.35
};

const TIME_SLOTS = [
  'NOW (Immediate)',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM'
];

const isSlotPast = (slotStr) => {
  if (!slotStr || slotStr.startsWith('NOW')) return false;
  const match = slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const now = new Date();
  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() < (now.getTime() - 15 * 60 * 1000);
};

const DEFAULT_PACKAGES = [
  { name: 'Basic Refresh', basePrice: 499 },
  { name: 'Premium Shine', basePrice: 799 },
  { name: 'Ultimate Detail', basePrice: 1499 }
];

const DEFAULT_SERVICES = [
  { name: 'Express Foam Wash', basePrice: 299 },
  { name: 'Interior + Exterior Wash', basePrice: 499 },
  { name: 'Premium Deep Wash', basePrice: 799 },
  { name: 'Interior Steam Spa', basePrice: 899 },
  { name: 'Leather Seat Conditioning', basePrice: 599 },
  { name: 'Paint Correction & Rubbing', basePrice: 1299 },
  { name: 'Ceramic Booster & Polish', basePrice: 1499 },
  { name: '9H Ceramic Coating', basePrice: 4999 },
  { name: 'Underbody Anti-Rust Coating', basePrice: 999 }
];

export default function WalkInBookingModal({
  isOpen,
  onClose,
  services = [],
  packages = [],
  onSubmit
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [selectedPackage, setSelectedPackage] = useState('Premium Shine');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTime, setSelectedTime] = useState('NOW (Immediate)');
  const [amount, setAmount] = useState(799);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [slotsData, setSlotsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Custom Dropdown Open States (Guaranteed to open downward)
  const [isPkgOpen, setIsPkgOpen] = useState(false);
  const [isSvcOpen, setIsSvcOpen] = useState(false);

  const pkgRef = useRef(null);
  const svcRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pkgRef.current && !pkgRef.current.contains(e.target)) {
        setIsPkgOpen(false);
      }
      if (svcRef.current && !svcRef.current.contains(e.target)) {
        setIsSvcOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Combined packages list
  const packageList = useMemo(() => {
    const list = [...DEFAULT_PACKAGES];
    if (packages && packages.length > 0) {
      packages.forEach(p => {
        const pName = p.name || p.title;
        if (pName && !list.some(item => item.name.toLowerCase() === pName.toLowerCase())) {
          list.push({ name: pName, basePrice: p.price || p.basePrice || 799 });
        }
      });
    }
    return list;
  }, [packages]);

  // Combined services list
  const serviceList = useMemo(() => {
    const list = [...DEFAULT_SERVICES];
    if (services && services.length > 0) {
      services.forEach(s => {
        const sName = s.name || s.title;
        if (sName && !list.some(item => item.name.toLowerCase() === sName.toLowerCase())) {
          list.push({ name: sName, basePrice: s.basePrice || s.price || 499 });
        }
      });
    }
    return list;
  }, [services]);

  const scalePrice = (basePrice, vehType) => {
    const mult = MULTIPLIERS[vehType] || 1.0;
    return Math.round(Number(basePrice || 0) * mult);
  };

  // Recalculate amount whenever selections change
  const computeTotal = (pkgName, svcNames, vehType) => {
    let total = 0;
    if (pkgName) {
      const pkg = packageList.find(p => p.name === pkgName);
      if (pkg) total += scalePrice(pkg.basePrice, vehType);
    }
    if (svcNames && svcNames.length > 0) {
      svcNames.forEach(name => {
        const svc = serviceList.find(s => s.name === name);
        if (svc) total += scalePrice(svc.basePrice, vehType);
      });
    }
    return total;
  };

  // Reset form and fetch live slots availability on open
  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setPhone('');
      setVehicleNumber('');
      setVehicleType('Sedan');
      setSelectedPackage('Premium Shine');
      setSelectedServices([]);
      setSelectedTime('NOW (Immediate)');
      setPaymentMode('Cash');
      setAmount(799);
      setIsPkgOpen(false);
      setIsSvcOpen(false);

      const today = new Date().toISOString().split('T')[0];
      setLoadingSlots(true);
      getSlotsAvailability(today)
        .then(res => {
          setSlotsData(res.data || []);
        })
        .catch(err => {
          console.error('Error fetching slots availability:', err);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [isOpen]);

  const handleSelectPackage = (pkgName) => {
    setSelectedPackage(pkgName);
    setIsPkgOpen(false);
    const newTotal = computeTotal(pkgName, selectedServices, vehicleType);
    setAmount(newTotal);
  };

  const handleToggleService = (svcName) => {
    let updated;
    if (selectedServices.includes(svcName)) {
      updated = selectedServices.filter(s => s !== svcName);
    } else {
      updated = [...selectedServices, svcName];
    }
    setSelectedServices(updated);
    const newTotal = computeTotal(selectedPackage, updated, vehicleType);
    setAmount(newTotal);
  };

  const handleVehTypeChange = (e) => {
    const newType = e.target.value;
    setVehicleType(newType);
    const newTotal = computeTotal(selectedPackage, selectedServices, newType);
    setAmount(newTotal);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Phone number is required');
      return;
    }

    const items = [
      ...(selectedPackage ? [selectedPackage] : []),
      ...selectedServices
    ];

    if (items.length === 0) {
      alert('Please select at least one package or service');
      return;
    }

    onSubmit({
      customerName: customerName.trim() || 'Walk-in Customer',
      phone: phone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase() || 'N/A',
      vehicleType,
      vehicleModel: vehicleType,
      serviceName: items.join(', '),
      packageName: selectedPackage || '',
      services: items,
      addons: [],
      slotTime: selectedTime,
      timeSlot: selectedTime,
      bayAssigned: 'BAY 1',
      status: 'washing',
      totalAmount: Number(amount) || 499,
      paymentMode,
      paymentStatus: paymentMode === 'Pay After Service' ? 'Pending' : 'Paid'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '22px 24px',
        borderRadius: '14px',
        background: '#061820',
        border: '1px solid rgba(74, 92, 106, 0.35)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Register Walk-in Ticket
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input-field"
            style={{ minHeight: '40px', fontSize: '0.88rem' }}
          />

          <input
            type="tel"
            required
            placeholder="Phone Number * (e.g. +91 8609504186)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            style={{ minHeight: '40px', fontSize: '0.88rem' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="input-field"
              style={{
                width: '100%',
                height: '42px',
                minHeight: '42px',
                maxHeight: '42px',
                boxSizing: 'border-box',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '0 12px'
              }}
            />

            <select
              value={vehicleType}
              onChange={handleVehTypeChange}
              className="admin-select"
              style={{
                width: '100%',
                height: '42px',
                minHeight: '42px',
                maxHeight: '42px',
                boxSizing: 'border-box',
                fontSize: '0.88rem',
                padding: '0 12px',
                color: 'var(--accent-cyan)'
              }}
            >
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          {/* Box 1: Packages Section */}
          <div style={{
            border: '1px solid rgba(74, 92, 106, 0.35)',
            borderRadius: '10px',
            padding: '10px 12px',
            background: 'rgba(0, 0, 0, 0.22)'
          }}>
            <label style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
              Packages
            </label>
            <div ref={pkgRef} style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setIsPkgOpen(!isPkgOpen);
                  setIsSvcOpen(false);
                }}
                className="admin-select"
                style={{
                  width: '100%',
                  height: '40px',
                  minHeight: '40px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: selectedPackage ? 'var(--accent-gold)' : '#CCD0CF',
                  padding: '0 12px',
                  boxSizing: 'border-box',
                  userSelect: 'none'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedPackage ? `${selectedPackage} (₹${scalePrice(packageList.find(p => p.name === selectedPackage)?.basePrice || 0, vehicleType)})` : '-- None --'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', marginLeft: '8px' }}>
                  {isPkgOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Downward Dropdown Menu */}
              {isPkgOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#071d27',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '8px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.7)',
                  zIndex: 100,
                  maxHeight: '190px',
                  overflowY: 'auto'
                }}>
                  <div
                    onClick={() => handleSelectPackage('')}
                    style={{
                      padding: '9px 12px',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      color: !selectedPackage ? 'var(--accent-cyan)' : '#CCD0CF',
                      background: !selectedPackage ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                      borderBottom: '1px solid rgba(74, 92, 106, 0.2)'
                    }}
                  >
                    -- None --
                  </div>
                  {packageList.map(pkg => {
                    const isSel = selectedPackage === pkg.name;
                    const price = scalePrice(pkg.basePrice, vehicleType);
                    return (
                      <div
                        key={pkg.name}
                        onClick={() => handleSelectPackage(pkg.name)}
                        style={{
                          padding: '9px 12px',
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: isSel ? 'var(--accent-gold)' : '#FFFFFF',
                          background: isSel ? 'rgba(255, 195, 0, 0.12)' : 'transparent',
                          borderBottom: '1px solid rgba(74, 92, 106, 0.15)'
                        }}
                      >
                        <span style={{ fontWeight: isSel ? 700 : 400 }}>{pkg.name}</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '0.82rem' }}>₹{price}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Individual Services Section */}
          <div style={{
            border: '1px solid rgba(74, 92, 106, 0.35)',
            borderRadius: '10px',
            padding: '10px 12px',
            background: 'rgba(0, 0, 0, 0.22)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.76rem', color: 'var(--ice-tint)', fontWeight: 700 }}>
                Individual Services
              </label>
              {selectedServices.length > 0 && (
                <span
                  onClick={() => {
                    setSelectedServices([]);
                    const newTotal = computeTotal(selectedPackage, [], vehicleType);
                    setAmount(newTotal);
                  }}
                  style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear ({selectedServices.length})
                </span>
              )}
            </div>

            <div ref={svcRef} style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setIsSvcOpen(!isSvcOpen);
                  setIsPkgOpen(false);
                }}
                className="admin-select"
                style={{
                  width: '100%',
                  height: '40px',
                  minHeight: '40px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: selectedServices.length > 0 ? 'var(--accent-cyan)' : '#CCD0CF',
                  padding: '0 12px',
                  boxSizing: 'border-box',
                  userSelect: 'none'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedServices.length === 0
                    ? '-- Select Services --'
                    : `${selectedServices.length} Selected (${selectedServices.join(', ')})`}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', marginLeft: '8px' }}>
                  {isSvcOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Downward Dropdown Menu with Multi-Select Checkboxes */}
              {isSvcOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#071d27',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '8px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.7)',
                  zIndex: 100,
                  maxHeight: '210px',
                  overflowY: 'auto'
                }}>
                  {serviceList.map(svc => {
                    const isChecked = selectedServices.includes(svc.name);
                    const price = scalePrice(svc.basePrice, vehicleType);
                    return (
                      <div
                        key={svc.name}
                        onClick={() => handleToggleService(svc.name)}
                        style={{
                          padding: '9px 12px',
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: isChecked ? 'var(--accent-cyan)' : '#FFFFFF',
                          background: isChecked ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                          borderBottom: '1px solid rgba(74, 92, 106, 0.15)',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
                          />
                          <span style={{ fontWeight: isChecked ? 700 : 400 }}>{svc.name}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '0.82rem' }}>
                          ₹{price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Time Slot Selector & Payment Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="admin-select"
              style={{
                width: '100%',
                height: '42px',
                minHeight: '42px',
                maxHeight: '42px',
                boxSizing: 'border-box',
                fontSize: '0.88rem',
                padding: '0 12px',
                color: 'var(--accent-cyan)'
              }}
            >
              <option value="NOW (Immediate)">NOW (Immediate)</option>
              {slotsData && slotsData.length > 0 ? (
                slotsData.map(s => {
                  const past = isSlotPast(s.slotTime);
                  const isAvailable = s.available !== false && s.remainingCapacity > 0 && !past;

                  // Only show available slots
                  if (!isAvailable) return null;

                  return (
                    <option key={s.slotTime} value={s.slotTime}>
                      {s.slotTime} ({s.remainingCapacity} bay{s.remainingCapacity > 1 ? 's' : ''} free)
                    </option>
                  );
                })
              ) : (
                TIME_SLOTS.filter(t => !isSlotPast(t) && t !== 'NOW (Immediate)').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))
              )}
            </select>

            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="admin-select"
              style={{
                width: '100%',
                height: '42px',
                minHeight: '42px',
                maxHeight: '42px',
                boxSizing: 'border-box',
                fontSize: '0.88rem',
                padding: '0 12px'
              }}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / QR</option>
              <option value="Card">Card</option>
              <option value="Pay After Service">Pay After Wash</option>
            </select>
          </div>

          <input
            type="number"
            required
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            style={{ minHeight: '40px', fontSize: '0.92rem', fontWeight: 800, color: 'var(--accent-gold)' }}
          />

          <button
            type="submit"
            className="btn-gold"
            style={{
              marginTop: '6px',
              minHeight: '42px',
              fontSize: '0.92rem',
              borderRadius: '8px',
              fontWeight: 800
            }}
          >
            Register Ticket
          </button>
        </form>
      </div>
    </div>
  );
}
