import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonBox } from '../components/ui/Spinner';
import RatingLineChart from '../components/charts/RatingLineChart';
import { careerApi } from '../api/career.api';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';

// Circular progress ring component
function ProgressRing({ score = 0, label, color = 'var(--accent)', size = 140 }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          {/* Track */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color, lineHeight: 1 }}>
            {Math.round(score)}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>/100</p>
        </div>
      </div>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>{label}</p>
    </div>
  );
}

export default function CareerPage() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    document.title = 'Career Readiness — CodePilot';
    loadData();
  }, []);

  async function loadData(force = false) {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const [readRes, histRes] = await Promise.allSettled([
        careerApi.getReadiness(force),
        careerApi.getReadinessHistory(10),
      ]);
      if (readRes.status === 'fulfilled') setData(readRes.value.data?.data);
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data?.data || []);
    } catch (e) {
      toast.error('Failed to load career readiness');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  const scores = data ? [
    { label: 'DSA Score',         score: data.dsaScore || 0,         color: '#1C86EE' },
    { label: 'Development Score', score: data.developmentScore || 0, color: '#22C55E' },
    { label: 'Portfolio Score',   score: data.portfolioScore || 0,   color: '#8B5CF6' },
  ] : [];

  const histChart = history.map((h) => ({
    date: formatDate(h.computedAt, { month: 'short', day: 'numeric' }),
    overall:     h.overallScore || 0,
    dsa:         h.dsaScore || 0,
    development: h.developmentScore || 0,
  })).reverse();

  return (
    <PageWrapper title="Career Readiness">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Career <span style={{ color: 'var(--accent)' }}>Readiness</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Your placement-readiness score breakdown</p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} loading={refreshing} onClick={() => loadData(true)}>
          Recalculate
        </Button>
      </div>

      {/* Scores */}
      <Card style={{ marginBottom: 'var(--space-4)' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-12)', padding: 'var(--space-8)' }}>
            {[1,2,3].map((i) => <SkeletonBox key={i} width={140} height={140} style={{ borderRadius: '50%' }} />)}
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-8)' }}>
            {/* Overall badge */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                background: 'var(--accent)',
                color: '#fff',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                fontWeight: 800,
                padding: '8px 28px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '-0.01em',
              }}>
                Overall: {Math.round(data.overallScore || 0)}/100
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {scores.map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                  <ProgressRing score={s.score} label={s.label} color={s.color} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
            <TrendingUp size={40} style={{ margin: '0 auto var(--space-4)' }} />
            <p>No data yet. Click Recalculate to compute your score.</p>
          </div>
        )}
      </Card>

      {/* Breakdown */}
      {data?.breakdown && (
        <Card style={{ marginBottom: 'var(--space-4)' }}>
          <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Score Breakdown</h5>
          {Object.entries(data.breakdown).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>{typeof val === 'number' ? Math.round(val) : val}</span>
              </div>
              {typeof val === 'number' && (
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(val, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* History Chart */}
      {histChart.length > 1 && (
        <Card>
          <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Score History</h5>
          <RatingLineChart
            data={histChart}
            lines={[
              { key: 'overall',     label: 'Overall',    color: 'var(--accent)' },
              { key: 'dsa',         label: 'DSA',        color: '#1C86EE' },
              { key: 'development', label: 'Development',color: '#22C55E' },
            ]}
            height={240}
            use3D={false}
          />
        </Card>
      )}
    </PageWrapper>
  );
}
