import React from 'react';

const presets = {
  default: { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  accent:  { bg: 'var(--accent-muted)', color: 'var(--accent)',         border: '1px solid var(--border-accent)' },
  success: { bg: 'var(--success-muted)', color: 'var(--success)',        border: '1px solid rgba(34,197,94,0.3)' },
  warning: { bg: 'var(--warning-muted)', color: 'var(--warning)',        border: '1px solid rgba(245,158,11,0.3)' },
  error:   { bg: 'var(--error-muted)',   color: 'var(--error)',          border: '1px solid rgba(239,68,68,0.3)' },
  info:    { bg: 'var(--info-muted)',    color: 'var(--info)',           border: '1px solid rgba(59,130,246,0.3)' },
};

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  style,
  customColor,
  customBg,
}) {
  const p = presets[variant] || presets.default;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      background: customBg || p.bg,
      color: customColor || p.color,
      border: p.border,
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: customColor || p.color,
          display: 'inline-block',
        }} />
      )}
      {children}
    </span>
  );
}
