import React from 'react';
import TrustStatsBanner from '../components/TrustStatsBanner';
import HeroTrackerSection from '../components/HeroTrackerSection';
import MobileShowcaseSection from '../components/MobileShowcaseSection';

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 68px)', background: '#ffffff' }}>
      {/* 1. FIRST: TRUST STATS HERO WITH 4 ICONS & RELAXED BEANBAG CHARACTER (FULL BG) */}
      <TrustStatsBanner onNavigate={onNavigate} />

      {/* 2. SECOND: POLICY / CLAIM ID TRACKER & PROTECTED CAR SECTION (FULL BG) */}
      <HeroTrackerSection onNavigate={onNavigate} />

      {/* 3. THIRD: ENTERPRISE ARCHITECTURE SHOWCASE (FULL BG) */}
      <MobileShowcaseSection onNavigate={onNavigate} />

      {/* 4. FOOTER */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '36px 24px 48px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.84rem'
      }}>
        <div>&copy; 2026 InsureFlow Enterprise Platform &bull; Built with Spring Boot 3.2, React 18, and MySQL</div>
      </div>
    </div>
  );
}
