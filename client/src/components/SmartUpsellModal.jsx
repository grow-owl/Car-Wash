import React from 'react';
import { Sparkles, CheckCircle2, Plus, ArrowRight, ShieldCheck, Droplets, Cpu, Disc } from 'lucide-react';

const iconMap = {
  Droplets: Droplets,
  Sparkles: Sparkles,
  Cpu: Cpu,
  Disc: Disc
};

export default function SmartUpsellModal({ isOpen, onClose, addons, selectedAddons, onToggleAddon, onProceed }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(0, 31, 35, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '32px',
        border: '1px solid var(--accent-aqua)',
        boxShadow: '0 20px 50px rgba(15, 164, 175, 0.3)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-terracotta" style={{ marginBottom: '8px' }}>
            <Sparkles size={14} style={{ marginRight: '4px' }} /> Smart Upgrade Recommendation
          </span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '6px' }}>Enhance Your Car Wash Experience</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Customers who added these detailing upgrades reported 98% higher satisfaction & 3x paint durability.
          </p>
        </div>

        {/* Addons Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
          {addons.map(addon => {
            const isSelected = selectedAddons.some(a => a.name === addon.name);
            const IconComp = iconMap[addon.icon] || Sparkles;

            return (
              <div
                key={addon._id || addon.name}
                onClick={() => onToggleAddon(addon)}
                style={{
                  background: isSelected ? 'rgba(15, 164, 175, 0.15)' : 'var(--bg-glass-card)',
                  border: isSelected ? '2px solid var(--accent-aqua)' : '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--accent-aqua)' : 'rgba(2, 73, 80, 0.8)',
                    color: isSelected ? '#003135' : 'var(--accent-aqua)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComp size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {addon.name}
                      {addon.highConverting && (
                        <span className="badge badge-terracotta" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          Popular
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{addon.description}</div>
                    {addon.recommendationReason && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--ice-tint)', fontStyle: 'italic', marginTop: '2px' }}>
                        💡 {addon.recommendationReason}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-aqua)' }}>
                    +₹{addon.price}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--accent-aqua)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginTop: '4px'
                  }}>
                    {isSelected ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                    {isSelected ? 'Added' : 'Add'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ fontSize: '0.88rem' }}
          >
            No thanks, keep base service
          </button>
          
          <button
            onClick={onProceed}
            className="btn-aqua"
          >
            Continue to Checkout ({selectedAddons.length} selected) <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
