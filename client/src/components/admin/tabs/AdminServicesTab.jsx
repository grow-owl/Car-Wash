import React from 'react';
import { Search, ChevronDown, Check, RefreshCw, X, Image, Edit3, Trash2 } from 'lucide-react';

export default function AdminServicesTab({
  serviceSubTab,
  setServiceSubTab,
  services = [],
  coupons = [],
  svcSearchQuery,
  setSvcSearchQuery,
  svcCategoryFilter,
  setSvcCategoryFilter,
  svcSortOption,
  setSvcSortOption,
  showSvcSortDropdown,
  setShowSvcSortDropdown,
  showSvcViewDropdown,
  setShowSvcViewDropdown,
  setEditingService,
  setSvcName,
  setSvcCategory,
  setSvcBasePrice,
  setSvcImage,
  setShowAddServiceModal,
  setShowAddCouponModal,
  openDeleteConfirm,
  handleDeleteService,
  handleDeleteCoupon
}) {
  return (
    <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px' }}>
      
      {/* Tab Switcher & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setServiceSubTab('services')}
            style={{
              background: serviceSubTab === 'services' ? 'var(--accent-cyan)' : 'transparent',
              color: serviceSubTab === 'services' ? '#06141B' : '#CCD0CF',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setServiceSubTab('coupons')}
            style={{
              background: serviceSubTab === 'coupons' ? 'var(--accent-cyan)' : 'transparent',
              color: serviceSubTab === 'coupons' ? '#06141B' : '#CCD0CF',
              fontWeight: 700,
              fontSize: '0.82rem',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Coupons ({coupons.length})
          </button>
        </div>

        {serviceSubTab === 'services' ? (
          <button
            onClick={() => {
              setEditingService(null);
              setSvcName('');
              setSvcCategory('Wash');
              setSvcBasePrice(499);
              setSvcImage('');
              setShowAddServiceModal(true);
            }}
            className="btn-gold"
            style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '6px' }}
          >
            + Add Service
          </button>
        ) : (
          <button
            onClick={() => setShowAddCouponModal(true)}
            className="btn-gold"
            style={{ padding: '4px 12px', fontSize: '0.78rem', borderRadius: '6px' }}
          >
            + Add Coupon
          </button>
        )}
      </div>

      {serviceSubTab === 'services' ? (
        <div>
          {/* FILTER & SORT TOOLBAR (Single Line on Mobile & Desktop) */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: '6px',
            alignItems: 'center',
            marginBottom: '14px',
            padding: '6px 8px',
            background: '#07161F',
            borderRadius: '8px',
            border: '1px solid rgba(74, 92, 106, 0.25)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* 1. SORT DROPDOWN TRIGGER */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSvcSortDropdown(!showSvcSortDropdown);
                  setShowSvcViewDropdown(false);
                }}
                style={{
                  background: showSvcSortDropdown ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: '#CCD0CF',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = showSvcSortDropdown ? 'rgba(255, 255, 255, 0.08)' : 'transparent'}
              >
                {/* Up/Down Arrow Icon (Up=Grey, Down=Cyan) */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M7 20V4M7 4L3 8M7 4L11 8" stroke="#94A3B8" />
                  <path d="M17 4v16m0 0l4-4m-4 4l-4-4" stroke="var(--accent-cyan)" />
                </svg>
                <span>Sort</span>
                <ChevronDown size={12} color="#94A3B8" style={{ transform: showSvcSortDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {/* Sort Dropdown Menu */}
              {showSvcSortDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    zIndex: 1000,
                    minWidth: '190px',
                    background: '#0B1E28',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {[
                    { id: 'default', label: 'Default Order' },
                    { id: 'price_asc', label: 'Price: Low to High (₹ ↑)' },
                    { id: 'price_desc', label: 'Price: High to Low (₹ ↓)' },
                    { id: 'name_asc', label: 'Name: A to Z' },
                    { id: 'name_desc', label: 'Name: Z to A' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSvcSortOption(opt.id);
                        setShowSvcSortDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 10px',
                        fontSize: '0.78rem',
                        fontWeight: svcSortOption === opt.id ? 700 : 500,
                        color: svcSortOption === opt.id ? 'var(--accent-cyan)' : '#CCD0CF',
                        background: svcSortOption === opt.id ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{opt.label}</span>
                      {svcSortOption === opt.id && <Check size={13} color="var(--accent-cyan)" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. VIEW / FILTER DROPDOWN TRIGGER */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSvcViewDropdown(!showSvcViewDropdown);
                  setShowSvcSortDropdown(false);
                }}
                style={{
                  background: showSvcViewDropdown ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: '#CCD0CF',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = showSvcViewDropdown ? 'rgba(255, 255, 255, 0.08)' : 'transparent'}
              >
                {/* Horizontal Stack Lines Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <line x1="3" y1="5" x2="21" y2="5" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="3" y1="20" x2="21" y2="20" />
                </svg>
                <span>View {svcCategoryFilter !== 'all' ? `(${svcCategoryFilter})` : ''}</span>
                <ChevronDown size={12} color="#94A3B8" style={{ transform: showSvcViewDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {/* View Dropdown Menu */}
              {showSvcViewDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    zIndex: 1000,
                    minWidth: '180px',
                    background: '#0B1E28',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--ice-tint)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Filter by Category
                  </div>
                  {['all', 'Wash', 'Interior', 'Detailing', 'Ceramic', 'Exterior'].map((cat) => {
                    const count = cat === 'all'
                      ? services.length
                      : services.filter(s => (s.category || '').toLowerCase() === cat.toLowerCase()).length;
                    if (cat !== 'all' && count === 0) return null;
                    const isSelected = svcCategoryFilter.toLowerCase() === cat.toLowerCase();

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSvcCategoryFilter(cat);
                          setShowSvcViewDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '7px 10px',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--accent-cyan)' : '#CCD0CF',
                          background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{cat === 'all' ? 'All Services' : cat}</span>
                        <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--ice-tint)' }}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. SEARCH INPUT (Fills Remaining Width in Same Line) */}
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 0 }}>
              <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ice-tint)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={svcSearchQuery}
                onChange={(e) => setSvcSearchQuery(e.target.value)}
                className="input-field"
                style={{
                  paddingLeft: '24px',
                  paddingRight: svcSearchQuery ? '22px' : '6px',
                  height: '28px',
                  fontSize: '0.75rem',
                  borderRadius: '5px',
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  boxSizing: 'border-box'
                }}
              />
              {svcSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSvcSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ice-tint)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex'
                  }}
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* 4. RESET BUTTON (If active) */}
            {(svcSearchQuery || svcCategoryFilter !== 'all' || svcSortOption !== 'default') && (
              <button
                type="button"
                onClick={() => {
                  setSvcSearchQuery('');
                  setSvcCategoryFilter('all');
                  setSvcSortOption('default');
                }}
                style={{
                  flexShrink: 0,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(74, 92, 106, 0.4)',
                  color: 'var(--accent-cyan)',
                  borderRadius: '5px',
                  padding: '4px 6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  height: '28px'
                }}
                title="Reset filters & sort"
              >
                <RefreshCw size={11} />
              </button>
            )}
          </div>

          {/* SERVICE CARDS GRID (COMPACT SLEEK DESIGN WITH EQUAL SIZE ACTION BUTTONS) */}
          {(() => {
            const filteredServices = services
              .filter((svc) => {
                const name = (svc.name || svc.title || '').toLowerCase();
                const cat = (svc.category || 'Wash').toLowerCase();
                const query = svcSearchQuery.trim().toLowerCase();
                const matchesSearch = !query || name.includes(query) || cat.includes(query);
                const matchesCategory = svcCategoryFilter === 'all' || cat === svcCategoryFilter.toLowerCase();
                return matchesSearch && matchesCategory;
              })
              .sort((a, b) => {
                const priceA = Number(a.basePrice ?? a.price ?? 0);
                const priceB = Number(b.basePrice ?? b.price ?? 0);
                const nameA = (a.name || a.title || '').toLowerCase();
                const nameB = (b.name || b.title || '').toLowerCase();

                if (svcSortOption === 'price_asc') return priceA - priceB;
                if (svcSortOption === 'price_desc') return priceB - priceA;
                if (svcSortOption === 'name_asc') return nameA.localeCompare(nameB);
                if (svcSortOption === 'name_desc') return nameB.localeCompare(nameA);
                return 0;
              });

            if (filteredServices.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: 'var(--ice-tint)',
                  background: 'rgba(0, 49, 53, 0.2)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(74, 92, 106, 0.3)'
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>🔍</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>No matching services found</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Try adjusting your search query or filter criteria.</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSvcSearchQuery('');
                      setSvcCategoryFilter('all');
                      setSvcSortOption('default');
                    }}
                    className="btn-secondary"
                    style={{ marginTop: '12px', padding: '5px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    Clear Filters
                  </button>
                </div>
              );
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {filteredServices.map((svc) => (
                  <div
                    key={svc._id}
                    className="glass-card"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(0, 49, 53, 0.42)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Header Details */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {svc.image ? (
                        <img
                          src={svc.image}
                          alt={svc.name || svc.title}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-light)',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          background: 'rgba(0, 229, 255, 0.08)',
                          border: '1px solid rgba(74, 92, 106, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--ice-tint)',
                          flexShrink: 0
                        }}>
                          <Image size={18} />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          title={svc.name || svc.title}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {svc.name || svc.title}
                        </div>
                        <span
                          className="badge badge-cyan"
                          style={{
                            fontSize: '0.62rem',
                            padding: '1px 6px',
                            marginTop: '3px',
                            display: 'inline-block',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase'
                          }}
                        >
                          {svc.category || 'Wash'}
                        </span>
                      </div>

                      <div style={{
                        fontWeight: 900,
                        fontSize: '0.98rem',
                        color: 'var(--accent-gold)',
                        flexShrink: 0,
                        letterSpacing: '-0.02em'
                      }}>
                        ₹{svc.basePrice || svc.price}
                      </div>
                    </div>

                    {/* Action Buttons (100% Equal Size Grid: 50% / 50% Exact Symmetry) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(74, 92, 106, 0.2)', paddingTop: '8px', width: '100%' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(svc);
                          setSvcName(svc.name || svc.title);
                          setSvcCategory(svc.category || 'Wash');
                          setSvcBasePrice(svc.basePrice || svc.price);
                          setSvcImage(svc.image || '');
                          setShowAddServiceModal(true);
                        }}
                        style={{
                          height: '30px',
                          width: '100%',
                          padding: '0 6px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(74, 92, 106, 0.45)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Edit3 size={13} color="var(--accent-cyan)" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(
                          'Delete Service?',
                          `${svc.name || svc.title} (₹${svc.basePrice || svc.price})`,
                          () => handleDeleteService(svc._id)
                        )}
                        style={{
                          height: '30px',
                          width: '100%',
                          padding: '0 6px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          background: 'rgba(255, 89, 100, 0.12)',
                          border: '1px solid rgba(255, 89, 100, 0.45)',
                          color: '#FF5964',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Trash2 size={13} color="#FF5964" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {coupons.map((cpn) => {
            const disc = cpn.value !== undefined ? cpn.value : (cpn.discountValue || 0);
            const isPct = cpn.discountType === 'percent';
            return (
              <div key={cpn._id} className="glass-card" style={{ padding: '20px 22px', borderRadius: '14px', background: 'rgba(0, 49, 53, 0.5)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Ticket Header Voucher Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 195, 0, 0.08)',
                  border: '1.5px dashed var(--accent-gold)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  gap: '12px'
                }}>
                  <span style={{ fontWeight: 900, color: 'var(--accent-gold)', fontSize: '1.15rem', letterSpacing: '0.04em' }}>
                    {cpn.code}
                  </span>
                  <span style={{ background: 'var(--accent-gold)', color: '#06141B', fontWeight: 900, fontSize: '0.88rem', padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(255, 195, 0, 0.25)' }}>
                    {isPct ? `${disc}% OFF` : `₹${disc} OFF`}
                  </span>
                </div>

                {/* Card Footer: Min Order & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ice-tint)' }}>
                    Min Order: <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>₹{cpn.minOrder || 0}</strong>
                  </div>
                  <button
                    onClick={() => openDeleteConfirm(
                      'Delete Coupon?',
                      `Coupon: ${cpn.code}`,
                      () => handleDeleteCoupon(cpn._id)
                    )}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      background: 'rgba(255, 89, 100, 0.12)',
                      border: '1px solid #FF5964',
                      color: '#FF5964',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
