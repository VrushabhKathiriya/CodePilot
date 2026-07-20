import React from 'react';
import { PLATFORMS } from '../../utils/constants';

export default function PlatformBadge({ platform, username, rating, size = 'md' }) {
  const p = PLATFORMS[platform?.toLowerCase()] || {
    name: platform, color: '#888', bg: 'rgba(136,136,136,0.12)', logo: '?',
  };

  const isSmall = size === 'sm';
  const fontSize = isSmall ? 'var(--text-xs)' : 'var(--text-sm)';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? 6 : 8,
      padding: isSmall ? '4px 10px' : '6px 14px',
      background: p.bg,
      border: `1px solid ${p.color}33`,
      borderRadius: 'var(--radius-full)',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: isSmall ? 9 : 10,
        fontWeight: 700,
        color: p.color,
        letterSpacing: '0.02em',
      }}>
        {p.logo}
      </span>
      {username && (
        <span style={{ fontSize, color: 'var(--text-secondary)', fontWeight: 500 }}>{username}</span>
      )}
      {rating != null && (
        <span style={{ fontSize, color: p.color, fontWeight: 700 }}>{rating}</span>
      )}
    </div>
  );
}
