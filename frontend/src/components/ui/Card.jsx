import React from 'react';

export default function Card({
  children,
  style,
  className,
  hover = true,
  accent = false,
  padding = 'var(--space-6)',
  onClick,
  ...props
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${accent ? 'var(--border-accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding,
        transition: hover ? 'transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...(accent && { boxShadow: '0 0 0 1px var(--accent-muted)' }),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = accent ? 'var(--accent)' : 'var(--text-muted)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = accent ? '0 0 0 1px var(--accent-muted)' : '';
          e.currentTarget.style.borderColor = accent ? 'var(--border-accent)' : 'var(--border)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}
