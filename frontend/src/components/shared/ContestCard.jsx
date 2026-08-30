import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { formatContestDate } from '../../utils/formatters';
import { PLATFORMS } from '../../utils/constants';
import Card from '../ui/Card';

// ─── Parse division type from contest name ────────────────────────────────────
function getDivBadge(name = '') {
  if (/Educational/i.test(name))        return { label: 'Educational', bg: '#7C3AED22', color: '#A78BFA', border: '#7C3AED44' };
  if (/Global.*Round/i.test(name))       return { label: 'Global',      bg: '#0F766E22', color: '#2DD4BF', border: '#0F766E44' };
  if (/Div\.\s*1\s*\+\s*2/i.test(name)) return { label: 'Div. 1+2',   bg: '#B4530922', color: '#FCD34D', border: '#B4530966' };
  if (/Div\.\s*1/i.test(name))           return { label: 'Div. 1',     bg: '#DC262622', color: '#F87171', border: '#DC262644' };
  if (/Div\.\s*2/i.test(name))           return { label: 'Div. 2',     bg: '#1C86EE22', color: '#60A5FA', border: '#1C86EE44' };
  if (/Div\.\s*3/i.test(name))           return { label: 'Div. 3',     bg: '#16A34A22', color: '#4ADE80', border: '#16A34A44' };
  if (/Div\.\s*4/i.test(name))           return { label: 'Div. 4',     bg: '#15803D22', color: '#86EFAC', border: '#15803D44' };
  return null;
}

export default function ContestCard({ contest }) {
  const { platform, name, contestName, startTime, duration, url } = contest || {};
  const displayName = name || contestName || 'Upcoming Contest';
  const p = PLATFORMS[platform?.toLowerCase()] || { name: platform, color: '#888', bg: '#88888820' };
  const divBadge = getDivBadge(displayName);

  const start = startTime ? new Date(startTime) : null;
  const now   = new Date();
  const isLive = start && start <= now && start + (duration || 0) * 60000 > now.getTime();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Platform label + LIVE badge */}
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

      {/* Division badge + name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {divBadge && (
          <span style={{
            alignSelf: 'flex-start',
            padding: '1px 8px', borderRadius: 'var(--radius-full)',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
            background: divBadge.bg, color: divBadge.color,
            border: `1px solid ${divBadge.border}`,
          }}>
            {divBadge.label}
          </span>
        )}
        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {displayName}
        </p>
      </div>

      {/* Date + duration */}
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
