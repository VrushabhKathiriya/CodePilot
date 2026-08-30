import React from 'react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: 'var(--text-sm)', color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function Perspective3DWrapper({ children, tilt = 8 }) {
  return (
    <div style={{ perspective: '1200px', perspectiveOrigin: '50% 20%' }}>
      <div style={{ transform: `rotateX(${tilt}deg)`, transformOrigin: 'top center', transition: 'transform var(--transition-slow)' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateX(0deg)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = `rotateX(${tilt}deg)`; }}
      >
        {children}
      </div>
    </div>
  );
}

export default function RatingLineChart({ data = [], lines = [], height = 260, use3D = true }) {
  const Wrapper = use3D ? Perspective3DWrapper : React.Fragment;

  // Compute domain so the max rating point is never clipped
  const allValues = data.flatMap(d => lines.map(l => d[l.key]).filter(v => v != null));
  const dataMin   = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax   = allValues.length > 0 ? Math.max(...allValues) : 100;
  const yMin      = Math.floor(dataMin * 0.97);          // 3% breathing room below
  const yMax      = Math.ceil(dataMax  * 1.04);          // 4% breathing room above

  return (
    <Wrapper>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 16, right: 24, left: -20, bottom: 0 }}>
          <defs>
            {lines.map((l) => (
              <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={l.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={l.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {lines.map((l) => (
            <React.Fragment key={l.key}>
              <Area
                type="monotone"
                dataKey={l.key}
                name={l.label || l.key}
                stroke={l.color}
                strokeWidth={2.5}
                fill={`url(#grad-${l.key})`}
                dot={false}
                activeDot={{ r: 5, fill: l.color, strokeWidth: 0 }}
              />
            </React.Fragment>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Wrapper>
  );
}
