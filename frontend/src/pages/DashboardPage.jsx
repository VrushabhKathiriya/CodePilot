import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, CheckSquare, Flame, Trophy, ArrowRight, RefreshCw,
  CalendarDays, Bot,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/shared/StatCard';
import ContestCard from '../components/shared/ContestCard';
import HeatMap from '../components/shared/HeatMap';
import RatingLineChart from '../components/charts/RatingLineChart';
import TopicRadarChart from '../components/charts/TopicRadarChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonBox } from '../components/ui/Spinner';
import { useAnalytics } from '../hooks/useAnalytics';
import { syncApi } from '../api/sync.api';
import { aiApi } from '../api/ai.api';
import { analyticsApi } from '../api/analytics.api';
import { useAuthStore } from '../store/authStore';
import { formatRelativeTime } from '../utils/formatters';

// ─── Mock data for offline/empty state ───────────────────────────────────────
const MOCK_RATING_DATA = [
  { date: 'Jan', codeforces: 1200, leetcode: 1500 },
  { date: 'Feb', codeforces: 1250, leetcode: 1540 },
  { date: 'Mar', codeforces: 1310, leetcode: 1580 },
  { date: 'Apr', codeforces: 1280, leetcode: 1620 },
  { date: 'May', codeforces: 1350, leetcode: 1670 },
  { date: 'Jun', codeforces: 1400, leetcode: 1720 },
  { date: 'Jul', codeforces: 1380, leetcode: 1750 },
];

const MOCK_RADAR = [
  { topic: 'DP', count: 42 }, { topic: 'Graphs', count: 28 },
  { topic: 'Trees', count: 35 }, { topic: 'Greedy', count: 50 },
  { topic: 'Binary Search', count: 30 }, { topic: 'Math', count: 22 },
];

const RATING_LINES = [
  { key: 'codeforces', label: 'Codeforces', color: '#1C86EE' },
  { key: 'leetcode',   label: 'LeetCode',   color: '#FFA116' },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item    = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { fetchDashboard, dashboard, fetchRating, rating, fetchTopics, topics, loading, errors } = useAnalytics();
  const [contests, setContests] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [cpActivity, setCpActivity] = useState({});
  const [contestsLoading, setContestsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — CodePilot';
    fetchDashboard(true);
    fetchRating(true);
    fetchTopics(true);
    loadContests();
    loadAISummary();
    loadActivity();
  }, []);

  async function loadContests() {
    setContestsLoading(true);
    try {
      const res = await syncApi.getUpcomingContests();
      setContests((res.data?.data || []).slice(0, 4));
    } catch (_) {}
    finally { setContestsLoading(false); }
  }

  async function loadAISummary() {
    try {
      const res = await aiApi.getSummary();
      setAiSummary(res.data?.data);
    } catch (_) {}
  }

  async function loadActivity() {
    try {
      const res = await syncApi.getCpActivity();
      const raw = res.data?.data || [];
      const map = {};
      if (Array.isArray(raw)) {
        raw.forEach((item) => {
          if (item.date) {
            const dateStr = new Date(item.date).toISOString().split('T')[0];
            map[dateStr] = (map[dateStr] || 0) + (item.submissions || 0);
          }
        });
      } else if (raw && typeof raw === 'object') {
        Object.assign(map, raw);
      }
      setCpActivity(map);
    } catch (_) {}
  }

  const dash = dashboard;
  const isLoading = loading.dashboard;

  const cfStat = dash?.platforms?.find((p) => p.platform === 'CODEFORCES');

  const ratingData = rating?.history?.length > 0 ? rating.history : MOCK_RATING_DATA;
  const topicData = topics?.topics?.length > 0 ? topics.topics : MOCK_RADAR;

  return (
    <PageWrapper title="Dashboard">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Welcome back, <span style={{ color: 'var(--accent)' }}>{(user?.fullName || user?.name || user?.username || 'Coder').split(' ')[0]}</span> 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Here's your competitive programming snapshot
        </p>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
      >
        <motion.div variants={item}>
          <StatCard label="CF Rating" value={cfStat?.rating ?? dash?.cfRating ?? '—'} icon={Star} accentColor="#1C86EE"
            sub={cfStat?.rank ?? dash?.cfRank} loading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Problems Solved" value={dash?.totalProblemsSolved ?? dash?.totalSolved ?? '—'} icon={CheckSquare} accentColor="#22C55E"
            sub="All platforms" loading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Active Streak" value={(dash?.currentStreak ?? dash?.streak) != null ? `${dash?.currentStreak ?? dash?.streak}d` : '—'} icon={Flame}
            accentColor="#F59E0B" sub="Keep it up!" loading={isLoading} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard label="Contests" value={dash?.totalContests ?? dash?.contestCount ?? '—'} icon={Trophy} accentColor="#8B5CF6"
            sub="Total attended" loading={isLoading} />
        </motion.div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>

        {/* Rating Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Rating History</p>
                <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Rating Progression</h6>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {RATING_LINES.map((l) => (
                  <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 3, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <RatingLineChart
              data={ratingData}
              lines={RATING_LINES}
              height={240}
            />
          </Card>
        </motion.div>

        {/* Topic Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card style={{ height: '100%' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Topics</p>
            <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Topic Mastery</h6>
            <TopicRadarChart data={topicData} height={260} />
          </Card>
        </motion.div>

        {/* Upcoming Contests */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Upcoming</p>
                <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Contests</h6>
              </div>
              <CalendarDays size={18} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {contestsLoading
                ? [1,2,3].map((i) => <SkeletonBox key={i} height={80} />)
                : contests.length > 0
                  ? contests.map((c, i) => <ContestCard key={i} contest={c} />)
                  : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-8) 0' }}>No upcoming contests</p>
              }
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-4)' }}>

        {/* Activity Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Activity</p>
            <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Daily Submissions</h6>
            <HeatMap data={cpActivity} weeks={24} label="CP submissions" />
          </Card>
        </motion.div>

        {/* AI Insight Teaser */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card accent style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 36, height: 36, background: 'var(--accent-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="var(--accent)" />
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Coach</p>
                <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)' }}>Daily Summary</h6>
              </div>
            </div>

            {(aiSummary?.insightText || aiSummary?.content) ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>
                {(aiSummary.insightText || aiSummary.content).slice(0, 280)}…
              </p>
            ) : (
              <div style={{ flex: 1 }}>
                {[1,2,3].map((i) => <SkeletonBox key={i} height={14} style={{ marginBottom: 8 }} />)}
              </div>
            )}

            {(aiSummary?.generatedAt || aiSummary?.createdAt) && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                Generated {formatRelativeTime(aiSummary.generatedAt || aiSummary.createdAt)}
              </p>
            )}

            <Link
              to="/ai-coach"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)',
                color: 'var(--accent)', fontWeight: 600, textDecoration: 'none',
              }}
            >
              View full coaching <ArrowRight size={14} />
            </Link>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
