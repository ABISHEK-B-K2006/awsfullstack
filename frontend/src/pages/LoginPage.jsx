import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData?.role === 'ROLE_POLICYHOLDER') {
        onNavigate('policyholder');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (roleKey) => {
    setError(null);
    setLoading(true);
    try {
      const userData = await switchDemoRole(roleKey);
      if (userData?.role === 'ROLE_POLICYHOLDER') {
        onNavigate('policyholder');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#f8fafc'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '36px', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <Shield size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Sign In</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Access the InsureFlow platform
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="name@insureflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Quick Demo Sign In */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Sparkles size={14} color="#2563eb" />
            <span>1-Click Demo Persona Access:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleDemoFill('POLICYHOLDER')}
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              👤 Policyholder
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleDemoFill('UNDERWRITER')}
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              📋 Underwriter
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleDemoFill('CLAIMS_ADJUSTER')}
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              🔍 Adjuster
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handleDemoFill('INSURANCE_MANAGER')}
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              👑 Manager
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <span
            onClick={() => onNavigate('register')}
            style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
          >
            Create one here
          </span>
        </div>
      </div>
    </div>
  );
}
