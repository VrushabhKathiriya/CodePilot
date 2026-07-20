import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Bot, CalendarDays, BarChart2, BookOpen, Star, Clock } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { SkeletonBox } from '../components/ui/Spinner';
import { useAI } from '../hooks/useAI';
import { formatRelativeTime } from '../utils/formatters';

const SECTIONS = [
  { key: 'summary',       label: 'Daily Summary',   icon: Star,        type: 'DAILY' },
  { key: 'weekly',        label: 'Weekly Plan',     icon: CalendarDays, type: 'WEEKLY' },
  { key: 'monthly',       label: 'Monthly Plan',    icon: BarChart2,   type: 'MONTHLY' },
  { key: 'studyPlan',     label: 'Study Plan',      icon: BookOpen,    type: 'STUDY_PLAN' },
  { key: 'contestReview', label: 'Contest Review',  icon: Bot,         type: 'CONTEST_REVIEW' },
];

function AICard({ section, data, loading, error, onRefresh }) {
  const Icon = section.icon;
  const content = data?.insightText || data?.content || data?.text || (typeof data === 'string' ? data : null);
  const ts = data?.generatedAt || data?.createdAt || data?.updatedAt;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{section.label}</p>
            {ts && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} /> {formatRelativeTime(ts)}
            </p>}
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} loading={loading} onClick={() => onRefresh(true)}>
          Refresh
        </Button>
      </div>

      {loading && !content ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map((i) => <SkeletonBox key={i} height={14} style={{ width: i === 5 ? '60%' : '100%' }} />)}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          <p style={{ color: 'var(--error)', marginBottom: 8 }}>{error}</p>
          <Button variant="outline" size="sm" onClick={() => onRefresh(false)}>Try again</Button>
        </div>
      ) : content ? (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 12 }}>No data yet</p>
          <Button variant="outline" size="sm" onClick={() => onRefresh(false)}>Generate</Button>
        </div>
      )}
    </Card>
  );
}

export default function AICoachPage() {
  const { fetchSummary, fetchWeekly, fetchMonthly, fetchStudyPlan, fetchContestReview, fetchHistory, data, loading, errors } = useAI();
  const [history, setHistory] = useState([]);

  const fetchers = {
    summary:       fetchSummary,
    weekly:        fetchWeekly,
    monthly:       fetchMonthly,
    studyPlan:     fetchStudyPlan,
    contestReview: fetchContestReview,
  };

  useEffect(() => {
    document.title = 'AI Coach — CodePilot';
    // Load all sections
    SECTIONS.forEach((s) => fetchers[s.key]?.(false));
    // Load history
    fetchHistory().then((h) => setHistory(Array.isArray(h) ? h.slice(0, 5) : []));
  }, []);

  return (
    <PageWrapper title="AI Coach">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Your <span style={{ color: 'var(--accent)' }}>AI Coach</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Personalized insights, plans, and reviews powered by Gemini AI
        </p>
      </div>

      {/* 2-column grid of AI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {SECTIONS.map((section) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: SECTIONS.indexOf(section) * 0.08 }}
          >
            <AICard
              section={section}
              data={data[section.key]}
              loading={loading[section.key]}
              error={errors[section.key]}
              onRefresh={(refresh) => fetchers[section.key]?.(refresh)}
            />
          </motion.div>
        ))}
      </div>

      {/* History Timeline */}
      {history.length > 0 && (
        <Card>
          <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
            Insight History
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', paddingBottom: 'var(--space-3)', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6 }} />
                  {i < history.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge variant="accent">{h.insightType || h.type}</Badge>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatRelativeTime(h.generatedAt || h.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {h.insightText || h.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}
