import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../ui/Card';

export default function StatCard({ label, value, sub, trend, icon: Icon, accentColor, loading }) {
  const trendColor = trend > 0 ? 'var(--success)' : trend < 0 ? 'var(--error)' : 'var(--text-muted)';
  const TrendIcon  = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background accent */}
      {accentColor && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 80, height: 80,
          background: `radial-gradient(circle at top right, ${accentColor}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {label}
        </p>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: accentColor ? `${accentColor}20` : 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color={accentColor || 'var(--text-muted)'} />
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ height: 36, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 8 }} className="animate-shimmer" />
      ) : (
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 800,
          color: accentColor || 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: 6,
          letterSpacing: '-0.03em',
        }}>
          {value ?? '—'}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trend != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: trendColor, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            <TrendIcon size={12} />
            {Math.abs(trend)}
          </span>
        )}
        {sub && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </Card>
  );
}
