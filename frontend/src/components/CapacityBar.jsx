import React from 'react';

export default function CapacityBar({ maxLimit, remainingLimit, showDetails = true, height = 8 }) {
  const max = parseFloat(maxLimit) || 1;
  const rem = parseFloat(remainingLimit) || 0;
  const utilized = Math.max(0, max - rem);
  const remainingPct = Math.min(100, Math.max(0, (rem / max) * 100));

  let colorClass = 'bg-emerald-500';
  let barGradient = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
  let textColor = '#34d399';

  if (remainingPct <= 20) {
    barGradient = 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)';
    textColor = '#fb7185';
  } else if (remainingPct <= 50) {
    barGradient = 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)';
    textColor = '#fbbf24';
  }

  return (
    <div className="capacity-wrapper">
      {showDetails && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Remaining Buffer:</span>
          <span style={{ fontWeight: 700, color: textColor, fontFamily: 'var(--font-mono)' }}>
            ₹{rem.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({remainingPct.toFixed(1)}%)
          </span>
        </div>
      )}
      <div className="capacity-track" style={{ height: `${height}px` }}>
        <div
          className="capacity-fill"
          style={{
            width: `${remainingPct}%`,
            background: barGradient
          }}
        />
      </div>
      {showDetails && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Utilized: ₹{utilized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span>Max Capping: ₹{max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}
    </div>
  );
}
