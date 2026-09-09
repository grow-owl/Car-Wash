import React from 'react';
import { Sparkles, Shield, Star, Award, Droplets } from 'lucide-react';

export default function SectionDivider({ 
  variant = 'cyan', // 'cyan' | 'gold' | 'subtle' | 'dual' | 'minimal'
  icon = null,      // 'sparkle' | 'shield' | 'star' | 'droplet' | 'award' | null
  badge = '',       // optional text in the center
  spacing = 'default' // 'tight' (30px), 'default' (50px), 'wide' (70px)
}) {
  const spacingMargin = spacing === 'tight' ? '32px 0 24px 0' : spacing === 'wide' ? '72px 0 54px 0' : '52px 0 38px 0';

  const getGlowGradient = () => {
    switch (variant) {
      case 'gold':
        return 'linear-gradient(90deg, transparent 0%, rgba(255, 195, 0, 0.05) 20%, rgba(255, 195, 0, 0.65) 50%, rgba(255, 195, 0, 0.05) 80%, transparent 100%)';
      case 'dual':
        return 'linear-gradient(90deg, transparent 0%, rgba(0, 229, 255, 0.5) 35%, rgba(255, 195, 0, 0.6) 50%, rgba(0, 229, 255, 0.5) 65%, transparent 100%)';
      case 'subtle':
        return 'linear-gradient(90deg, transparent 0%, rgba(74, 92, 106, 0.4) 30%, rgba(204, 208, 207, 0.3) 50%, rgba(74, 92, 106, 0.4) 70%, transparent 100%)';
      case 'minimal':
        return 'linear-gradient(90deg, transparent 0%, rgba(0, 229, 255, 0.25) 50%, transparent 100%)';
      case 'cyan':
      default:
        return 'linear-gradient(90deg, transparent 0%, rgba(0, 229, 255, 0.05) 20%, rgba(0, 229, 255, 0.65) 50%, rgba(0, 229, 255, 0.05) 80%, transparent 100%)';
    }
  };

  const getIcon = () => {
    const iconColor = variant === 'gold' ? '#FFC300' : 'var(--accent-cyan)';
    const iconSize = 13;
    switch (icon) {
      case 'sparkle':
        return <Sparkles size={iconSize} color={iconColor} />;
      case 'shield':
        return <Shield size={iconSize} color={iconColor} />;
      case 'star':
        return <Star size={iconSize} color={iconColor} />;
      case 'award':
        return <Award size={iconSize} color={iconColor} />;
      case 'droplet':
        return <Droplets size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const centerIcon = getIcon();
  const showCenterPill = badge || centerIcon || variant !== 'minimal';

  return (
    <div 
      className="section-divider-wrapper"
      style={{
        width: '100%',
        margin: spacingMargin,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
      aria-hidden="true"
    >
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '280px',
        height: '18px',
        background: variant === 'gold' ? 'radial-gradient(circle, rgba(255, 195, 0, 0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0, 229, 255, 0.18) 0%, transparent 70%)',
        filter: 'blur(8px)',
        zIndex: 0
      }} />

      {/* Main Gradient Divider Line */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        height: '1.5px',
        background: getGlowGradient(),
        position: 'relative',
        zIndex: 1
      }} />

      {/* Center Emblem / Diamond Badge */}
      {showCenterPill && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          background: 'linear-gradient(135deg, rgba(6, 26, 36, 0.95) 0%, rgba(17, 33, 45, 0.95) 100%)',
          border: variant === 'gold' ? '1px solid rgba(255, 195, 0, 0.45)' : '1px solid rgba(0, 229, 255, 0.45)',
          boxShadow: variant === 'gold' ? '0 0 14px rgba(255, 195, 0, 0.3)' : '0 0 14px rgba(0, 229, 255, 0.3)',
          borderRadius: badge ? '16px' : '50%',
          padding: badge ? '4px 12px' : '5px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          backdropFilter: 'blur(6px)',
          whiteSpace: 'nowrap',
          maxWidth: '92vw'
        }}>
          {centerIcon ? centerIcon : (
            <div style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: variant === 'gold' ? '#FFC300' : 'var(--accent-cyan)',
              boxShadow: variant === 'gold' ? '0 0 6px #FFC300' : '0 0 6px var(--accent-cyan)',
              flexShrink: 0
            }} />
          )}

          {badge && (
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: variant === 'gold' ? '#FFC300' : 'var(--accent-cyan)',
              whiteSpace: 'nowrap',
              lineHeight: 1
            }}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
