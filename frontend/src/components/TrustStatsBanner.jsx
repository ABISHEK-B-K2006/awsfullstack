import React from 'react';
import { Shield, Smile, FileCheck, Car } from 'lucide-react';

export default function TrustStatsBanner({ onNavigate }) {
  return (
    <div style={{
      width: '100%',
      backgroundColor: '#ffffff',
      backgroundImage: "url('/insurance main bg.png')",
      backgroundPosition: 'center bottom',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      borderBottom: '1px solid #e2e8f0',
      padding: '48px 24px 280px',
      textAlign: 'center',
      position: 'relative',
      minHeight: '620px'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Catchy Subheader tailored to InsureFlow */}
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#1e3a8a',
          letterSpacing: '-0.025em',
          marginBottom: '36px'
        }}>
          Believe it or Not! Real-Time Policy Tracking &amp; Instant Claim Settlements
        </h1>

        {/* 4 Feature Columns with Minimalist Icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          maxWidth: '1060px',
          margin: '0 auto'
        }}>
          {/* Metric 1 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(29, 78, 216, 0.1)'
            }}>
              <Shield size={26} />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
              10k+ Policies Issued
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              across verified enterprise clients
            </div>
          </div>

          {/* Metric 2 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.1)'
            }}>
              <Smile size={26} />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
              100% Zero-Overdraws
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              ACID pessimistic row locking
            </div>
          </div>

          {/* Metric 3 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#faf5ff',
              border: '1.5px solid #ddd6fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)'
            }}>
              <FileCheck size={26} />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
              Instant Policy Provisioning
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              quantitative actuarial scoring
            </div>
          </div>

          {/* Metric 4 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fff7ed',
              border: '1.5px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              marginBottom: '12px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.1)'
            }}>
              <Car size={26} />
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
              24x7 Direct Wire Settlement
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              automated ACH clearance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
