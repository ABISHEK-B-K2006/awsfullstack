import React from 'react';
import {
  Activity,
  Lock,
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function MobileShowcaseSection({ onNavigate }) {
  return (
    <div style={{
      width: '100%',
      backgroundImage: `url('/insurance scroll 2.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'right center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#fdf6f0',
      borderBottom: '1px solid #fed7aa',
      padding: '60px 24px 70px',
      position: 'relative',
      minHeight: '580px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '1240px',
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Left Column: Enterprise Platform Capabilities */}
        <div style={{
          maxWidth: '600px'
        }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(234, 88, 12, 0.12)',
          color: '#ea580c',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '14px'
        }}>
          <ShieldCheck size={16} />
          <span>ENTERPRISE ARCHITECTURE</span>
        </div>

        <h2 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.18,
          color: '#1e1b18',
          marginBottom: '16px'
        }}>
          Unified Real-Time Insurance &amp; <span style={{ color: '#ea580c' }}>Settlement Engine</span>
        </h2>

        <p style={{
          fontSize: '1.02rem',
          color: '#4a4036',
          lineHeight: 1.6,
          marginBottom: '26px'
        }}>
          Issue dynamic enterprise policies, compute risk profiles with quantitative scoring, and execute <strong style={{ color: '#ea580c' }}>zero-overdraw claim settlements</strong> with automated audit trails.
        </p>

        {/* Core Platform Capabilities */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#1e1b18',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Core Platform Capabilities
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            {/* Capability 1: Actuarial Scoring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(234, 88, 12, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}>
                <Activity size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#292524', lineHeight: 1.2 }}>
                  Actuarial Risk Scoring
                </div>
                <div style={{ fontSize: '0.72rem', color: '#78716c' }}>
                  0-100 quantitative risk model
                </div>
              </div>
            </div>

            <div style={{ width: '1px', height: '32px', background: '#fed7aa' }} />

            {/* Capability 2: Pessimistic Locking */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7'
              }}>
                <Lock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#292524', lineHeight: 1.2 }}>
                  Pessimistic Row Lock
                </div>
                <div style={{ fontSize: '0.72rem', color: '#78716c' }}>
                  100% zero-overdraw guarantee
                </div>
              </div>
            </div>

            <div style={{ width: '1px', height: '32px', background: '#fed7aa' }} />

            {/* Capability 3: Instant ACH Settlement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#292524', lineHeight: 1.2 }}>
                  Direct ACH Clearance
                </div>
                <div style={{ fontSize: '0.72rem', color: '#78716c' }}>
                  24x7 automated wire settlement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 30px',
              fontSize: '0.96rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(234, 88, 12, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(234, 88, 12, 0.35)';
            }}
          >
            <span>Explore Platform Solutions</span>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
