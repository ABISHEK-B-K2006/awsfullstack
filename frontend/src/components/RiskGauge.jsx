import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function RiskGauge({ score = 25, tier = 'LOW', size = 'normal' }) {
  const numScore = Math.min(100, Math.max(0, parseInt(score) || 0));

  let color = '#059669';
  let gradient = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
  let Icon = ShieldCheck;
  let tierLabel = 'LOW RISK';

  if (numScore > 70 || tier === 'HIGH') {
    color = '#e11d48';
    gradient = 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)';
    Icon = ShieldAlert;
    tierLabel = 'HIGH RISK';
  } else if (numScore > 35 || tier === 'MEDIUM') {
    color = '#d97706';
    gradient = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
    Icon = AlertTriangle;
    tierLabel = 'MEDIUM RISK';
  }

  if (size === 'compact') {
    return (
      <span className={`badge badge-${tier.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={13} />
        <span>{numScore}/100 ({tierLabel})</span>
      </span>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '14px',
      padding: '12px 18px',
      background: '#ffffff',
      border: `1px solid ${color}40`,
      borderRadius: 'var(--radius-md)',
      boxShadow: `0 2px 10px ${color}15`
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: `0 2px 8px ${color}40`
      }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          Actuarial Risk Index
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {numScore}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: color, textTransform: 'uppercase' }}>
            &bull; {tierLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
