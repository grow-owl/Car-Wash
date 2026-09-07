import React, { useState } from 'react';
import { Star, Send, X, Camera, CheckCircle2 } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, onSubmitReview }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRev = {
      name: name || 'Verified Customer',
      vehicle: vehicle || 'Sedan / SUV',
      rating,
      comment: reviewText,
      date: 'Just Now',
      photo: photoUrl || 'https://res.cloudinary.com/xa8njngd/image/upload/v1788764066/car-wash/services/Car_Spa_Premium_Detailing_Comprehensive_exterior_interior_treatment.jpg'
    };
    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitReview) onSubmitReview(newRev);
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      background: 'rgba(0, 31, 35, 0.9)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '32px',
        border: '1px solid var(--accent-aqua)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        position: 'relative'
      }}>
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="badge badge-aqua">VERIFIED CUSTOMER FEEDBACK</span>
              <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginTop: '6px' }}>Rate Your Detailing Experience</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Share your honest review & car photos</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* STAR RATING PICKER */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--ice-tint)', fontWeight: 700, marginBottom: '8px' }}>
                  SELECT STAR RATING:
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={32}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      color={(hoverRating || rating) >= star ? '#FFD700' : 'rgba(255,255,255,0.2)'}
                      fill={(hoverRating || rating) >= star ? '#FFD700' : 'transparent'}
                      style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <input
                  type="text"
                  required
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />

                <input
                  type="text"
                  required
                  placeholder="Vehicle Model & No *"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="input-field"
                />
              </div>

              <textarea
                required
                rows={3}
                placeholder="Share details about the wash quality, foam shine, or staff behavior..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="input-field"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="var(--accent-aqua)" />
                <input
                  type="text"
                  placeholder="Car Photo Image URL (Optional)..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
              </div>

              <button type="submit" className="btn-aqua" style={{ justifyContent: 'center', padding: '14px', marginTop: '10px' }}>
                <Send size={18} /> Submit Verified Review
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <CheckCircle2 size={54} color="var(--accent-aqua)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.6rem', color: '#FFFFFF' }}>Thank You for Your Feedback!</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Your review has been published successfully.</p>
          </div>
        )}

      </div>
    </div>
  );
}
