import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { loginAdmin } from '../api';

export default function AdminLoginGate({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await loginAdmin(username, password);
      if (response.data?.success && response.data?.token) {
        localStorage.setItem('carwash_admin_token', response.data.token);
        localStorage.setItem('carwash_admin_user', JSON.stringify(response.data.user));
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      } else {
        setErrorMessage(response.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '32px 28px',
        borderRadius: '18px',
        background: 'rgba(6, 20, 27, 0.85)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid var(--accent-cyan)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)'
          }}>
            <Lock size={26} color="var(--accent-cyan)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0' }}>
            Owner Portal Login
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--ice-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-gold)" />
            <span>Encrypted Authentication Gateway</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            background: 'rgba(255, 89, 100, 0.15)',
            border: '1px solid var(--accent-coral)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#FF5964',
            fontSize: '0.82rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CCD0CF', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              required
              autoFocus
              autoComplete="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              style={{ minHeight: '44px', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#CCD0CF', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ minHeight: '44px', fontSize: '0.9rem', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ice-tint)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: '100%',
              minHeight: '46px',
              marginTop: '8px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <KeyRound size={18} /> Secure Login
              </>
            )}
          </button>
        </form>

        {/* Back to Home Action */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(74, 92, 106, 0.25)' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ice-tint)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s ease'
            }}
          >
            <ArrowLeft size={14} /> Back to Customer Website
          </button>
        </div>
      </div>
    </div>
  );
}
