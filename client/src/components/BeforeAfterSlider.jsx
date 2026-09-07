import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function BeforeAfterSlider({ 
  beforeImage = "/before-wash.webp",
  afterImage = "/after-wash.webp"
}) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="glass-panel" style={{ padding: '24px 16px', overflow: 'hidden' }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Before & After Results
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#CCD0CF', margin: '6px 0 0 0' }}>
          Drag the slider to see the difference
        </p>
      </div>

      {/* SLIDER CONTAINER */}
      <div className="before-after-container" style={{
        position: 'relative',
        maxWidth: '860px',
        margin: '0 auto',
        height: '380px',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        userSelect: 'none'
      }}>
        
        {/* AFTER IMAGE (BACKGROUND LAYER) */}
        <img 
          src={afterImage} 
          alt="After Detailing Result"
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        
        {/* AFTER BADGE */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(0, 49, 53, 0.85)',
          backdropFilter: 'blur(8px)',
          color: '#00E5FF',
          fontWeight: 700,
          fontSize: '0.72rem',
          padding: '4px 10px',
          borderRadius: '12px',
          zIndex: 1,
          border: '1px solid rgba(0, 229, 255, 0.3)',
          opacity: sliderPos > 92 ? 0 : 1,
          transition: 'opacity 0.15s ease'
        }}>
          After Wash
        </div>

        {/* BEFORE LAYER (IMAGE + BADGE CLIPPED TOGETHER) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          pointerEvents: 'none'
        }}>
          <img 
            src={beforeImage} 
            alt="Before Wash State"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* BEFORE BADGE */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#CCD0CF',
            fontWeight: 700,
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            opacity: sliderPos < 8 ? 0 : 1,
            transition: 'opacity 0.15s ease'
          }}>
            Before Wash
          </div>
        </div>

        {/* CENTER DIVIDER HANDLE */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          width: '2px',
          background: '#00E5FF',
          transform: 'translateX(-50%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#00E5FF',
            color: '#003135',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.6)',
            border: '2px solid #FFFFFF'
          }}>
            <ArrowLeftRight size={14} />
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
