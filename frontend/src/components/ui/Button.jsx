import React from 'react';

const variants = {
  primary:   { bg: 'var(--accent)',       color: '#fff',              border: 'none',                         hover: 'var(--accent-hover)' },
  secondary: { bg: 'transparent',         color: 'var(--text-primary)', border: '1px solid var(--border)',    hover: 'var(--bg-card-hover)' },
  ghost:     { bg: 'transparent',         color: 'var(--text-secondary)', border: 'none',                    hover: 'var(--bg-card)' },
  danger:    { bg: 'var(--error-muted)',  color: 'var(--error)',       border: '1px solid var(--error)',       hover: 'rgba(239,68,68,0.25)' },
  outline:   { bg: 'transparent',         color: 'var(--accent)',     border: '1px solid var(--accent)',       hover: 'var(--accent-muted)' },
};

const sizes = {
  sm:  { padding: '6px 14px', fontSize: 'var(--text-sm)',  borderRadius: 'var(--radius-md)' },
  md:  { padding: '10px 20px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-md)' },
  lg:  { padding: '14px 28px', fontSize: 'var(--text-lg)', borderRadius: 'var(--radius-lg)' },
  xl:  { padding: '16px 36px', fontSize: 'var(--text-xl)', borderRadius: 'var(--radius-lg)' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  onClick,
  type = 'button',
  style,
  className,
  ...props
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        backgroundColor: v.bg,
        color: v.color,
        border: v.border || 'none',
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = v.hover;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = variant === 'primary' ? 'var(--shadow-accent)' : '';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = v.bg;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 16, height: 16,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.8s linear infinite',
        }} />
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
