import React, { useMemo } from 'react';

// Generates a GitHub-style contribution heatmap
// data: { [YYYY-MM-DD]: count }
export default function HeatMap({ data = {}, weeks = 26, label = 'Activity', color = '#FF4136' }) {
  const cells = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const d = new Date(startDate);
    while (d <= today) {
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: data[key] || 0 });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [data, weeks]);

  const maxCount = useMemo(() => Math.max(...Object.values(data), 1), [data]);
  const totalActivity = useMemo(() => Object.values(data).reduce((a, b) => a + b, 0), [data]);

  // Parse hex to r,g,b so we can make rgba at any opacity
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }
  const [r, g, b] = hexToRgb(color);

  function getColor(count) {
    if (!count) return 'var(--bg-elevated)';
    const intensity = count / maxCount;
    if (intensity < 0.25) return `rgba(${r},${g},${b},0.25)`;
    if (intensity < 0.50) return `rgba(${r},${g},${b},0.45)`;
    if (intensity < 0.75) return `rgba(${r},${g},${b},0.70)`;
    return `rgba(${r},${g},${b},0.95)`;
  }

  // Group by weeks
  const weekGroups = [];
  for (let i = 0; i < cells.length; i += 7) {
    weekGroups.push(cells.slice(i, i + 7));
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days   = ['S','M','T','W','T','F','S'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {totalActivity} total
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start', minWidth: 'max-content' }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 20 }}>
            {days.map((d, i) => (
              <div key={i} style={{
                height: 11, fontSize: 9, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', width: 10,
                visibility: i % 2 === 1 ? 'visible' : 'hidden',
              }}>{d}</div>
            ))}
          </div>

          {/* Week columns */}
          {weekGroups.map((week, wi) => {
            const firstDay = new Date(week[0]?.date);
            const showMonth = wi === 0 || firstDay.getDate() <= 7;
            return (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ height: 16, fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {showMonth ? months[firstDay.getMonth()] : ''}
                </div>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={`${cell.date}: ${cell.count} activity`}
                    style={{
                      width: 11, height: 11,
                      borderRadius: 2,
                      background: getColor(cell.count),
                      transition: 'transform var(--transition-fast)',
                      cursor: cell.count > 0 ? 'pointer' : 'default',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} style={{
            width: 11, height: 11, borderRadius: 2,
            background: v === 0 ? 'var(--bg-elevated)' : `rgba(${r},${g},${b},${0.25 + v * 0.7})`,
          }} />
        ))}
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}
