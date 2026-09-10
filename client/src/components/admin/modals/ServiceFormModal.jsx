import React from 'react';
import { X, Image, Upload } from 'lucide-react';

export default function ServiceFormModal({
  isOpen,
  onClose,
  editingService,
  svcName,
  setSvcName,
  svcCategory,
  setSvcCategory,
  svcBasePrice,
  setSvcBasePrice,
  svcImage,
  setSvcImage,
  uploadingImage,
  handleImageFileUpload,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '14px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{editingService ? 'Edit Service' : 'Add Service'}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#CCD0CF', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
              Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 9H Ceramic Shield"
              value={svcName}
              onChange={(e) => setSvcName(e.target.value)}
              className="input-field"
              style={{ minHeight: '42px', fontSize: '0.88rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                Category
              </label>
              <select value={svcCategory} onChange={(e) => setSvcCategory(e.target.value)} className="input-field" style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}>
                <option value="Wash">Wash</option>
                <option value="Interior">Interior</option>
                <option value="Detailing">Detailing</option>
                <option value="Ceramic">Ceramic</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'block', marginBottom: '4px' }}>
                Base Price (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="499"
                value={svcBasePrice}
                onChange={(e) => setSvcBasePrice(e.target.value)}
                className="input-field"
                style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* SERVICE IMAGE UPLOAD (OPTIONAL) */}
          <div style={{ background: 'rgba(0, 49, 53, 0.45)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={15} color="var(--accent-cyan)" /> Service Photo (Optional)
              </label>
              {svcImage && (
                <button
                  type="button"
                  onClick={() => setSvcImage('')}
                  style={{ background: 'transparent', border: 'none', color: '#FF5964', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Remove
                </button>
              )}
            </div>

            {svcImage ? (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '110px', border: '1px solid var(--border-light)', marginBottom: '8px' }}>
                <img src={svcImage} alt="Service preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="file"
                id="admin-svc-file-upload-modal"
                accept="image/*"
                onChange={handleImageFileUpload}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="admin-svc-file-upload-modal"
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  cursor: uploadingImage ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)'
                }}
              >
                {uploadingImage ? (
                  <>Uploading to Cloudinary...</>
                ) : (
                  <><Upload size={14} /> Upload from PC</>
                )}
              </label>
            </div>

            <input
              type="text"
              placeholder="Or paste Cloudinary / image URL"
              value={svcImage}
              onChange={(e) => setSvcImage(e.target.value)}
              className="input-field"
              style={{ width: '100%', minHeight: '34px', fontSize: '0.78rem', marginTop: '8px', padding: '6px 10px' }}
            />

            {/* Quick Presets */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--ice-tint)', marginBottom: '4px' }}>Quick Photo Presets:</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Exterior Wash', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764056/car-wash/services/Exterior_Car_Wash_Foam_wash_pressure_wash_hand_drying.jpg' },
                  { label: 'Full Wash', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764057/car-wash/services/Full_Car_Wash_Complete_interior_exterior_cleaning.jpg' },
                  { label: 'Interior Spa', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764060/car-wash/services/Car_Interior_Detailing_Deep_cleaning_of_complete_cabin.jpg' },
                  { label: 'Waxing', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764062/car-wash/services/Car_Waxing_Shine_basic_paint_protection.jpg' },
                  { label: 'Polishing', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764063/car-wash/services/Car_Polishing_Restore_gloss_remove_minor_dullness.jpg' },
                  { label: 'Engine Bay', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764064/car-wash/services/Engine_Bay_Cleaning_Safe_cleaning_of_engine_compartment.jpg' },
                  { label: 'Wheel & Tyre', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764061/car-wash/services/Wheel_Tyre_Cleaning_Wheel_cleaning_tyre_dressing.jpg' },
                  { label: 'Showroom Spa', url: 'https://res.cloudinary.com/xa8njngd/image/upload/f_auto,q_auto/v1788764066/car-wash/services/Car_Spa_Premium_Detailing_Comprehensive_exterior_interior_treatment.jpg' }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSvcImage(p.url)}
                    style={{
                      background: svcImage === p.url ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                      color: svcImage === p.url ? '#003135' : 'var(--ice-tint)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-gold" style={{ minHeight: '42px', fontSize: '0.88rem', borderRadius: '8px', fontWeight: 800, width: '100%', justifyContent: 'center' }}>
            {editingService ? 'Update Service' : 'Save Service'}
          </button>
        </form>
      </div>
    </div>
  );
}
