import React, { useState } from 'react';
import {
  Shield,
  Search,
  ArrowRight,
  RefreshCw,
  Car,
  CheckCircle2,
  Clock,
  Lock,
  Zap,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { publicAPI } from '../services/api';

export default function HeroTrackerSection({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const sampleCodes = ['POL-100200', 'POL-200450', 'CLM-8492', 'CLM-2104'];

  const handleTrack = async (codeToSearch) => {
    const code = (codeToSearch || query).trim();
    if (!code) return;
    setSearching(true);
    setNotFound(false);
    setSearchResult(null);

    try {
      const res = await publicAPI.track(code);
      if (res.data && res.data.type && res.data.data) {
        setSearchResult(res.data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      backgroundImage: "url('/insurance bg(scroll).png')",
      backgroundPosition: 'right center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      borderBottom: '1px solid #e2e8f0',
      position: 'relative',
      overflow: 'hidden',
      padding: '50px 24px 60px'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Left Column: Simple Clean Card matching screenshot */}
        <div style={{
          maxWidth: '520px',
          width: '100%'
        }}>
          {/* Header */}
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#1d4ed8',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: '8px'
          }}>
            Track Your Insurance in Real-Time!
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#475569',
            fontWeight: 600,
            marginBottom: '28px'
          }}>
            Instant lookup for policy limits, dynamic capacity &amp; claim settlement status
          </p>

          {/* Main Card Box */}
          <div style={{
            background: '#f1f5f9',
            borderRadius: '24px',
            border: '1.5px solid #e2e8f0',
            padding: '28px 24px 26px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '16px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '0.94rem',
              fontWeight: 600,
              color: '#475569',
              marginBottom: '12px'
            }}>
              Enter Policy Number or Claim Tracking ID
            </label>

            <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }}>
              {/* Inset Pill Input */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="E.g. POL-100200, POL-200450, CLM-8492"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '9999px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    padding: '0 24px',
                    fontSize: '1rem',
                    color: '#1e293b',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                />
              </div>

              {/* Centered Blue Pill Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="submit"
                  disabled={searching}
                  style={{
                    background: 'linear-gradient(180deg, #2272eb 0%, #1652b0 100%)',
                    borderRadius: '9999px',
                    padding: '13px 56px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    boxShadow: '0 6px 18px rgba(22, 82, 176, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 22px rgba(22, 82, 176, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(22, 82, 176, 0.3)';
                  }}
                >
                  {searching ? 'Locating...' : 'Track Insurance'}
                </button>
              </div>
            </form>

            {/* Sample IDs Pill Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Sample IDs:</span>
              {sampleCodes.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => { setQuery(code); handleTrack(code); }}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    color: '#1e40af',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Not Found Alert */}
          {notFound && (
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '16px',
              padding: '14px 18px',
              marginBottom: '16px',
              color: '#be123c',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <AlertCircle size={18} />
              <span>No policy or claim record found matching <strong>{query}</strong>. Try one of the sample IDs above.</span>
            </div>
          )}

          {/* Search Result Card */}
          {searchResult && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '16px',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <strong style={{ fontSize: '0.95rem', color: '#065f46' }}>
                    {searchResult.type === 'POLICY'
                      ? `Policy Found: ${searchResult.data.policyNumber}`
                      : `Claim Record Found: ${searchResult.data.claimNumber}`}
                  </strong>
                </div>
                <span className={`badge badge-${(searchResult.data.policyStatus || searchResult.data.claimStatus || 'active').toLowerCase()}`}>
                  {searchResult.data.policyStatus || searchResult.data.claimStatus}
                </span>
              </div>

              {searchResult.type === 'POLICY' ? (
                <div style={{ fontSize: '0.84rem', color: '#064e3b' }}>
                  <div>Coverage: <strong>{searchResult.data.coverageType}</strong></div>
                  <div style={{ marginTop: '4px' }}>
                    Dynamic Buffer: <strong>₹{parseFloat(searchResult.data.remainingLimit || 0).toLocaleString()}</strong> / ₹{parseFloat(searchResult.data.maxCoverageLimit || 0).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigate('login')}
                    >
                      File Claim on this Policy &gt;
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.84rem', color: '#064e3b' }}>
                  <div>Requested Payout: <strong>₹{parseFloat(searchResult.data.requestedPayout || 0).toLocaleString()}</strong></div>
                  <div>Settlement: <strong>{searchResult.data.approvedPayout ? `₹${parseFloat(searchResult.data.approvedPayout).toLocaleString()}` : 'Adjuster Review'}</strong></div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '8px' }}
                    onClick={() => onNavigate('login')}
                  >
                    View Settlement Audit Log &gt;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Two Quick Action Capsule Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Pill 1: Renew / Manage policy */}
            <div
              onClick={() => onNavigate('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px 8px 10px',
                background: '#eef2f6',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#eef2f6';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e40af',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  <RefreshCw size={20} />
                </div>
                <div style={{ fontSize: '0.94rem', color: '#1e293b' }}>
                  <strong>Renew or Manage</strong> your active InsureFlow policy
                </div>
              </div>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e40af',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}>
                <ArrowRight size={18} />
              </div>
            </div>

            {/* Pill 2: File a claim */}
            <div
              onClick={() => onNavigate('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px 8px 10px',
                background: '#eef2f6',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#eef2f6';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e40af',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  <Shield size={20} />
                </div>
                <div style={{ fontSize: '0.94rem', color: '#1e293b' }}>
                  <strong>File a Claim</strong> on your insured asset or fleet
                </div>
              </div>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e40af',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}>
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
