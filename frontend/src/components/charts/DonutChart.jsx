import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;
const COLORS = ['#FF4136','#3B82F6','#22C55E','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#F97316'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px',
    }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 700 }}>
        {payload[0]?.name}: <span style={{ color: payload[0]?.payload?.color || 'var(--accent)' }}>{payload[0]?.value}</span>
      </p>
    </div>
  );
};

export default function DonutChart({ data = [], height = 240, innerRadius = 60, label = '' }) {
  // data: [{ name: 'DP', value: 40 }, ...]
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius + 36}
            strokeWidth={2}
            stroke="var(--bg-card)"
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
