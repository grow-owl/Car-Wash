import React, { useState } from 'react';
import { Sparkles, ArrowLeftRight, Shield } from 'lucide-react';

export default function BeforeAfterSlider({ 
  comparisonImage = "/before-after-car.png",
  title = "The Difference You Can See & Feel • 9H Ceramic Coating Protection" 
}) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="glass-panel" style={{ padding: '28px', border: '2px solid var(--accent-aqua)', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(0,49,53,0.95) 0%, rgba(2,73,80,0.9) 100%)' }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 164, 175, 0.2)',
          border: '1px solid var(--accent-aqua)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          color: 'var(--accent-aqua)',
          fontWeight: 800,
          marginBottom: '8px'
        }}>
          <Sparkles size={14} /> REAL SILIGURI BAY DETAILING RESULT
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>The Difference You Can See & Feel</h2>
        <div style={{ fontSize: '1rem', color: 'var(--accent-aqua)', fontWeight: 700, marginTop: '2px' }}>
          9H CERAMIC COATING & HYDROPHOBIC SHIELD PROTECTION
        </div>
      </div>

      {/* COMPARISON DISPLAY CARD */}
      <div style={{
        position: 'relative',
        maxWidth: '820px',
        margin: '0 auto',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--border-light)'
      }}>
        {/* Full Image */}
        <img 
          src={comparisonImage} 
          alt="9H Ceramic Coating Before vs After"
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '520px', objectFit: 'contain', background: '#000000' }}
        />

        {/* Floating Badges */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 31, 35, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-light)',
          color: 'var(--ice-tint)',
          fontWeight: 800,
          fontSize: '0.85rem',
          padding: '8px 18px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={16} color="var(--accent-aqua)" /> Guaranteed Mirror Finish
        </div>
      </div>

    </div>
  );
}
