import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: 'var(--text-sm)', color: p.fill, fontWeight: 700 }}>
          {p.value} problems
        </p>
      ))}
    </div>
  );
};

export default function DifficultyBarChart({ data = [], height = 260, use3D = true }) {
  // data: [{ difficulty: '800', count: 30 }, ...]
  // Color bars by difficulty range
  function getBarColor(difficulty) {
    const d = parseInt(difficulty, 10);
    if (d <= 1000) return '#22C55E';
    if (d <= 1400) return '#3B82F6';
    if (d <= 1800) return '#F59E0B';
    if (d <= 2200) return '#FF4136';
    return '#AA0000';
  }

  return (
    <div style={{
      ...(use3D ? {
        perspective: '1200px', perspectiveOrigin: '50% 0%',
      } : {}),
    }}>
      <div style={{
        ...(use3D ? {
          transform: 'rotateX(6deg)',
          transformOrigin: 'top center',
          transition: 'transform var(--transition-slow)',
        } : {}),
      }}
        onMouseEnter={(e) => { if (use3D) e.currentTarget.style.transform = 'rotateX(0deg)'; }}
        onMouseLeave={(e) => { if (use3D) e.currentTarget.style.transform = 'rotateX(6deg)'; }}
      >
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="difficulty"
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.difficulty)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
