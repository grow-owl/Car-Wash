import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Layers, X, CheckCircle2 } from 'lucide-react';
import { formatServiceSummary } from '../../utils';

export default function ServiceDropdownPill({
  serviceStr,
  addons = [],
  services = [],
  compact = false
}) {
  const [showModal, setShowModal] = useState(false);

  const summary = formatServiceSummary(serviceStr, addons, services);

  // Lock body scroll and listen for Escape key when modal is active
  useEffect(() => {
    if (!showModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  // If there's only 1 service, display it cleanly with no button needed
  if (summary.extraCount === 0) {
    return (
      <div
        style={{
          fontWeight: 700,
          color: '#FFFFFF',
          fontSize: compact ? '0.80rem' : '0.84rem',
          maxWidth: compact ? '220px' : '280px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title={summary.fullText}
      >
        {summary.primary}
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-block', maxWidth: '100%' }}>
      {/* Primary service name on top + sleek clickable badge to view all services */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
        <div
          style={{
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: compact ? '0.80rem' : '0.84rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: compact ? '210px' : '260px'
          }}
          title={summary.fullText}
        >
          {summary.primary}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 9px',
            borderRadius: '12px',
            background: 'rgba(0, 229, 255, 0.12)',
            color: 'var(--accent-cyan)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          title="Click to view all included services"
        >
          <Layers size={11} strokeWidth={2.5} />
          <span>+{summary.extraCount} Services</span>
        </button>
      </div>

      {/* PORTAL MODAL (Mounted directly to document.body so it is never trapped by cards or tables) */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(3, 10, 15, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: '85vh',
              background: '#0B1E28',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              borderRadius: '14px',
              padding: '18px 20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 229, 255, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'scaleUp 0.18s ease'
            }}
          >
            {/* Modal Header: Clean without any star icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(74, 92, 106, 0.3)', paddingBottom: '12px' }}>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '0.01em'
                  }}
                >
                  Included Services & Packages
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--ice-tint)' }}>
                  Total {summary.allList.length} services selected for this vehicle
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Service Cards List (Scrollable) */}
            <div
              style={{
                maxHeight: '52vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--accent-cyan) rgba(0,0,0,0.3)'
              }}
            >
              {summary.allList.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: index === 0 ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: index === 0 ? '1px solid rgba(0, 229, 255, 0.35)' : '1px solid rgba(74, 92, 106, 0.25)'
                  }}
                >
                  <CheckCircle2
                    size={16}
                    color={index === 0 ? 'var(--accent-cyan)' : '#25D366'}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: index === 0 ? 700 : 600, color: '#FFFFFF', wordBreak: 'break-word' }}>
                      {item}
                    </div>
                  </div>
                  {index === 0 ? (
                    <span
                      style={{
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(0, 229, 255, 0.2)',
                        color: 'var(--accent-cyan)',
                        flexShrink: 0
                      }}
                    >
                      PRIMARY
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.60rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 195, 0, 0.12)',
                        color: 'var(--accent-gold)',
                        flexShrink: 0
                      }}
                    >
                      ADD-ON / PKG
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                style={{
                  padding: '7px 20px',
                  fontSize: '0.82rem',
                  borderRadius: '8px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
