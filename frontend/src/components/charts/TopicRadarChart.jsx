import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px',
    }}>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 700 }}>
        {payload[0]?.payload?.topic}
      </p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
        {payload[0]?.value} problems
      </p>
    </div>
  );
};

export default function TopicRadarChart({ data = [], height = 300 }) {
  // data: [{ topic: 'DP', count: 40, full: 100 }, ...]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)' }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 'auto']}
          tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Radar
          name="Topics"
          dataKey="count"
          stroke="var(--accent)"
          fill="var(--accent)"
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
