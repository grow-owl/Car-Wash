import React, { useState } from 'react';
import { Sparkles, ArrowLeftRight, Shield } from 'lucide-react';

export default function BeforeAfterSlider({ 
  beforeImage = "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=900&q=80",
  afterImage = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  title = "Hydrophobic Foam & 9H Ceramic Shield" 
}) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="glass-panel" style={{ padding: '24px 16px', border: '2px solid var(--accent-aqua)', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(0,49,53,0.95) 0%, rgba(2,73,80,0.9) 100%)' }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 164, 175, 0.2)',
          border: '1px solid var(--accent-aqua)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          color: 'var(--accent-aqua)',
          fontWeight: 800,
          marginBottom: '8px'
        }}>
          <Sparkles size={14} /> INTERACTIVE BEFORE / AFTER SLIDER
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>The Difference You Can See & Feel</h2>
        <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
          <ArrowLeftRight size={14} color="var(--accent-aqua)" /> Drag handle left & right to see hydrophobic shine!
        </div>
      </div>

      {/* SLIDER CONTAINER WITH RESPONSIVE MOBILE HEIGHT */}
      <div className="before-after-container" style={{
        position: 'relative',
        maxWidth: '860px',
        margin: '0 auto',
        height: '380px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--border-light)',
        userSelect: 'none'
      }}>
        
        {/* AFTER IMAGE (BACKGROUND LAYER) */}
        <img 
          src={afterImage} 
          alt="After Ceramic Shine"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        
        {/* AFTER BADGE - POSITIONED BOTTOM RIGHT FOR NO OVERLAP */}
        <div className="slider-badge-after" style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(15, 164, 175, 0.95)',
          color: '#003135',
          fontWeight: 800,
          fontSize: '0.75rem',
          padding: '4px 12px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 5
        }}>
          ✨ AFTER: CERAMIC SHINE
        </div>

        {/* BEFORE IMAGE (CLIPPED SLIDER TOP LAYER) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${sliderPos}%`,
          overflow: 'hidden',
          borderRight: '3px solid var(--accent-aqua)',
          boxShadow: '6px 0 20px rgba(0,0,0,0.6)',
          zIndex: 2
        }}>
          <img 
            src={beforeImage} 
            alt="Before Muddy State"
            style={{ 
              width: '860px', 
              height: '100%', 
              objectFit: 'cover',
              maxWidth: 'none'
            }}
          />

          {/* BEFORE BADGE - POSITIONED TOP LEFT FOR NO OVERLAP */}
          <div className="slider-badge-before" style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(150, 71, 52, 0.95)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '4px 12px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            🚗 BEFORE: DUST & MUD
          </div>
        </div>

        {/* CENTER DIVIDER HANDLE */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: '3px',
          background: 'var(--accent-aqua)',
          transform: 'translateX(-50%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--accent-aqua)',
            color: '#003135',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(15, 164, 175, 0.9)',
            border: '2px solid #FFFFFF'
          }}>
            <ArrowLeftRight size={18} />
          </div>
        </div>

        {/* INVISIBLE DRAG RANGE INPUT */}
        <input 
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(e.target.value)}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'ew-resize',
            zIndex: 20,
            width: '100%',
            height: '100%'
          }}
        />

      </div>
    </div>
  );
}
