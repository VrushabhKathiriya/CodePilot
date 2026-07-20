import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { formatContestDate } from '../../utils/formatters';
import { PLATFORMS } from '../../utils/constants';
import Card from '../ui/Card';

export default function ContestCard({ contest }) {
  const { platform, name, startTime, duration, url } = contest || {};
  const p = PLATFORMS[platform?.toLowerCase()] || { name: platform, color: '#888', bg: '#88888820' };

  const start = startTime ? new Date(startTime) : null;
  const now   = new Date();
  const isLive = start && start <= now && start + (duration || 0) * 60000 > now.getTime();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 700,
          color: p.color, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {p.name || platform}
        </span>
        {isLive && (
          <span style={{
            fontSize: 'var(--text-xs)', fontWeight: 700,
            color: 'var(--success)', background: 'var(--success-muted)',
            padding: '2px 8px', borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            LIVE
          </span>
        )}
      </div>

      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {name || 'Upcoming Contest'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} />
          {start ? formatContestDate(startTime) : 'TBA'}
        </span>
        {duration && (
          <span>{Math.round(duration / 60)}h {duration % 60 > 0 ? `${duration % 60}m` : ''}</span>
        )}
      </div>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 'var(--text-xs)', color: p.color, fontWeight: 600,
            textDecoration: 'none', marginTop: 2,
          }}
        >
          Register <ExternalLink size={11} />
        </a>
      )}
    </Card>
  );
}
