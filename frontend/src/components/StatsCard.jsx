import React from 'react';

export default function StatsCard({ title, value, subtext, icon: Icon, color = '#2563eb', badgeText }) {
  return (
    <div className="glass-panel" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden', background: '#ffffff' }}>
      <div style={{
        position: 'absolute',
        top: '-15px',
        right: '-15px',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: `${color}12`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            <Icon size={24} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        {subtext && (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {subtext}
          </span>
        )}
        {badgeText && (
          <span className="badge badge-active" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
