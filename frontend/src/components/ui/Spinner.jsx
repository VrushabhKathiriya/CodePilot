import React from 'react';

export default function Spinner({ size = 24, color = 'var(--accent)', style }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid var(--border)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function PageSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 16,
    }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{message}</p>
    </div>
  );
}

export function SkeletonBox({ width = '100%', height = 20, style }) {
  return (
    <div
      className="animate-shimmer"
      style={{ width, height, borderRadius: 'var(--radius-md)', ...style }}
    />
  );
}
