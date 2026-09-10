import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatServiceSummary } from '../../utils';

export default function ServiceDropdownPill({ serviceStr, addons = [], compact = false, alwaysOpen = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const summary = formatServiceSummary(serviceStr, addons);

  if (summary.extraCount === 0) {
    return (
      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: compact ? '0.78rem' : '0.82rem' }}>
        {summary.primary}
      </div>
    );
  }

  // When alwaysOpen is true (e.g. Live Bay cards on desktop) - no toggle button needed
  if (alwaysOpen) {
    return (
      <div style={{ width: '100%' }}>
        <div
          style={{
            background: 'rgba(6, 20, 27, 0.95)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            borderRadius: '8px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '120px',
            overflowY: 'auto',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--accent-cyan) rgba(0,0,0,0.3)'
          }}
        >
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid rgba(74, 92, 106, 0.25)',
            paddingBottom: '4px',
            marginBottom: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Included Services ({summary.allList.length})</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--accent-gold)', textTransform: 'none', fontWeight: 600 }}>All active</span>
          </div>

          {summary.allList.map((svc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: idx === 0 ? '#FFFFFF' : '#CCD0CF',
                fontWeight: idx === 0 ? 700 : 500,
                background: idx === 0 ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                padding: '3px 6px',
                borderRadius: '4px'
              }}
            >
              <div style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: idx === 0 ? 'var(--accent-cyan)' : 'var(--accent-gold)',
                flexShrink: 0
              }} />
              <span style={{ flex: 1, wordBreak: 'break-word' }}>
                {svc}
              </span>
              {idx === 0 && (
                <span style={{
                  fontSize: '0.58rem',
                  background: 'rgba(0, 229, 255, 0.18)',
                  color: 'var(--accent-cyan)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 800
                }}>
                  PRIMARY
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minWidth: compact ? '150px' : 'auto' }}>
      {/* Header: Primary Service on top, Expand Toggle Button underneath */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <span
          style={{
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: compact ? '0.78rem' : '0.82rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%'
          }}
          title={summary.fullText}
        >
          {summary.primary}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: compact ? '0.65rem' : '0.68rem',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            background: isOpen ? 'var(--accent-cyan)' : 'rgba(0, 229, 255, 0.15)',
            border: '1px solid rgba(0, 229, 255, 0.45)',
            color: isOpen ? '#06141B' : 'var(--accent-cyan)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          title={isOpen ? 'Click to collapse services list' : 'Click to view all included services and add-ons'}
        >
          <span>{isOpen ? 'HIDE' : `+${summary.extraCount} MORE`}</span>
          {isOpen ? <ChevronUp size={12} strokeWidth={2.5} /> : <ChevronDown size={12} strokeWidth={2.5} />}
        </button>
      </div>

      {/* INLINE EXPANDED SERVICES LIST (Fixed to 3-4 items with internal scroll) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: '8px',
            background: 'rgba(6, 20, 27, 0.95)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            borderRadius: '8px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '120px',
            overflowY: 'auto',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--accent-cyan) rgba(0,0,0,0.3)'
          }}
        >
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid rgba(74, 92, 106, 0.25)',
            paddingBottom: '4px',
            marginBottom: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Included Services ({summary.allList.length})</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--accent-gold)', textTransform: 'none', fontWeight: 600 }}>All active</span>
          </div>

          {summary.allList.map((svc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: compact ? '0.74rem' : '0.78rem',
                color: idx === 0 ? '#FFFFFF' : '#CCD0CF',
                fontWeight: idx === 0 ? 700 : 500,
                background: idx === 0 ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                padding: '3px 6px',
                borderRadius: '4px'
              }}
            >
              <div style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: idx === 0 ? 'var(--accent-cyan)' : 'var(--accent-gold)',
                flexShrink: 0
              }} />
              <span style={{ flex: 1, wordBreak: 'break-word' }}>
                {svc}
              </span>
              {idx === 0 && (
                <span style={{
                  fontSize: '0.58rem',
                  background: 'rgba(0, 229, 255, 0.18)',
                  color: 'var(--accent-cyan)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 800
                }}>
                  PRIMARY
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
