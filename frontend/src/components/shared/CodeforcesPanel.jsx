import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Flame, Trophy, CheckSquare, TrendingUp,
  AlertCircle, ExternalLink, Filter, RefreshCw, RotateCcw,
} from 'lucide-react';
import Card from '../ui/Card';
import { SkeletonBox } from '../ui/Spinner';
import HeatMap from './HeatMap';
import RatingLineChart from '../charts/RatingLineChart';
import DifficultyBarChart from '../charts/DifficultyBarChart';
import DonutChart from '../charts/DonutChart';
import { syncApi } from '../../api/sync.api';
import { useAuthStore } from '../../store/authStore';
import { useAnalyticsStore } from '../../store/analyticsStore';

// ─── Codeforces rank colour map ───────────────────────────────────────────────
const RANK_COLORS = {
  newbie:                    '#808080',
  pupil:                     '#008000',
  specialist:                '#03a89e',
  expert:                    '#0000ff',
  'candidate master':        '#aa00aa',
  master:                    '#ff8c00',
  'international master':    '#ff8c00',
  grandmaster:               '#ff0000',
  'international grandmaster': '#ff0000',
  'legendary grandmaster':   '#ff0000',
};
function getRankColor(rank) {
  if (!rank) return 'var(--cf-color)';
  return RANK_COLORS[rank.toLowerCase()] || 'var(--cf-color)';
}

const TOPIC_COLORS = [
  '#FF4136','#1C86EE','#22C55E','#F59E0B','#8B5CF6','#EC4899',
  '#06B6D4','#F97316','#84CC16','#A78BFA','#34D399','#FB7185',
  '#38BDF8','#FBBF24','#C084FC','#4ADE80',
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ─── Mini stat card ───────────────────────────────────────────────────────────
function MiniStatCard({ label, value, sub, icon: Icon, color, loading }) {
  return (
    <Card hover style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {label}
        </p>
        {Icon && (
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)', background: `${color || 'var(--cf-color)'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color || 'var(--cf-color)'} />
          </div>
        )}
      </div>
      {loading ? (
        <SkeletonBox height={28} style={{ marginBottom: 4 }} />
      ) : (
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: color || 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 4 }}>
          {value ?? '—'}
        </p>
      )}
      {sub && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{sub}</p>}
    </Card>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function CodeforcesPanel({ cfPlatformStats, dashSummary, onSyncSuccess }) {
  const [contestHistory,      setContestHistory]      = useState([]);
  const [contestHistoryRaw,   setContestHistoryRaw]   = useState([]);
  const [upcoming,            setUpcoming]            = useState([]);
  const [activity,            setActivity]            = useState({});
  const [topicData,           setTopicData]           = useState([]);
  const [ratingBars,          setRatingBars]          = useState([]);
  const [solved,              setSolved]              = useState([]);
  const [unsolved,            setUnsolved]            = useState([]);
  const [problemTab,          setProblemTab]          = useState('unsolved');
  const [ratingFilter,        setRatingFilter]        = useState('all');
  const [loading,             setLoading]             = useState(true);
  const [upcomingLoading,     setUpcomingLoading]     = useState(false);
  const [problemsLoading,     setProblemsLoading]     = useState(true);
  const [error,               setError]              = useState(null);
  const [syncing,             setSyncing]            = useState(false);
  const [syncMsg,             setSyncMsg]            = useState(null);

  useEffect(() => {
    fetchAll();
    fetchUpcoming();
    fetchProblems();
  }, []);

  async function syncCodeforces() {
    const user = useAuthStore.getState().user;
    const handle = cfPlatformStats?.handle || user?.profile?.codeforcesHandle;
    if (!handle) { setSyncMsg({ type: 'error', text: 'Codeforces handle not found. Please sync from the Settings page first.' }); return; }
    setSyncing(true); setSyncMsg(null);
    try {
      await syncApi.syncPlatform({ platform: 'CODEFORCES', handle });
      useAnalyticsStore.getState().clearAll();
      setSyncMsg({ type: 'success', text: 'Codeforces synced! Reloading data…' });
      await Promise.all([
        fetchAll(),
        fetchProblems(),
        onSyncSuccess ? onSyncSuccess() : Promise.resolve(),
      ]);
      setTimeout(() => setSyncMsg(null), 3000);
    } catch (e) {
      setSyncMsg({ type: 'error', text: e?.response?.data?.message || 'Sync failed. Try again.' });
    } finally { setSyncing(false); }
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [histRes, actRes, topicsRes] = await Promise.all([
        syncApi.getContestHistory('CODEFORCES'),
        syncApi.getCpActivity('CODEFORCES'),
        syncApi.getTopicStats('CODEFORCES'),
      ]);

      const rawHistory = histRes.data?.data || [];
      setContestHistoryRaw(rawHistory);
      const hist = rawHistory.map(c => ({
        date:    new Date(c.contestDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        rating:  c.rating,
        contest: c.contestName,
        rank:    c.rank,
        delta:   c.ratingChange,
      }));
      setContestHistory(hist);

      const raw = actRes.data?.data || [];
      const map = {};
      raw.forEach(d => {
        if (d.date) {
          const key = new Date(d.date).toISOString().slice(0, 10);
          map[key] = (map[key] || 0) + (d.submissions || 0);
        }
      });
      setActivity(map);

      const allTopics     = topicsRes.data?.data || [];
      const ratingEntries = allTopics.filter(t => t.topic?.startsWith('rating:'));
      const tagEntries    = allTopics.filter(t => !t.topic?.startsWith('rating:'));

      setRatingBars(
        ratingEntries
          .map(t => ({ difficulty: t.topic.replace('rating:', ''), count: t.problemCount }))
          .sort((a, b) => parseInt(a.difficulty) - parseInt(b.difficulty))
      );
      setTopicData(
        tagEntries
          .sort((a, b) => b.problemCount - a.problemCount)
          .slice(0, 16)
          .map((t, i) => ({ name: t.topic, value: t.problemCount, color: TOPIC_COLORS[i % TOPIC_COLORS.length] }))
      );
    } catch (_) {
      setError('Failed to load some Codeforces data. Please re-sync Codeforces from the Profile page.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUpcoming() {
    setUpcomingLoading(true);
    try {
      const res = await syncApi.getUpcomingContests();
      const all = res.data?.data || [];
      // Filter Codeforces contests only
      setUpcoming(all.filter(c =>
        (c.platform || '').toLowerCase().includes('codeforces') ||
        (c.source   || '').toLowerCase().includes('codeforces')
      ));
    } catch (_) {
      setUpcoming([]);
    } finally {
      setUpcomingLoading(false);
    }
  }

  async function refreshUpcoming() {
    setUpcomingLoading(true);
    try {
      await syncApi.refreshUpcoming();
      await fetchUpcoming();
    } catch (_) {
      await fetchUpcoming();
    }
  }

  async function fetchProblems() {
    setProblemsLoading(true);
    try {

      const res = await syncApi.getCfProblems();
      const data = res.data?.data || {};
      setSolved(data.solved   || []);
      setUnsolved(data.unsolved || []);
    } catch (_) {
      setSolved([]);
      setUnsolved([]);
    } finally {
      setProblemsLoading(false);
    }
  }

  // Active list based on tab
  const activeList = problemTab === 'solved' ? solved : unsolved;

  // Rating options from the active list
  const activeRatings = useMemo(() =>
    [...new Set(activeList.map(p => p.rating).filter(Boolean))].sort((a, b) => a - b),
    [activeList]
  );

  // Filtered list
  const filteredList = useMemo(() => {
    if (ratingFilter === 'all') return activeList;
    return activeList.filter(p => p.rating === parseInt(ratingFilter));
  }, [activeList, ratingFilter]);

  const stats     = cfPlatformStats;
  const rankColor = getRankColor(stats?.rank);
  const ratingLines = [{ key: 'rating', label: 'CF Rating', color: '#1C86EE' }];

  // All fields now come directly from cfPlatformStats (backend returns them per-platform)
  const totalSolved   = stats?.solved        ?? null;
  const currentStreak = stats?.currentStreak ?? null;
  const maxStreak     = stats?.maxStreak     ?? null;
  const contestsCount = stats?.contestsCount ?? null;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* ── Sync Now Banner ── */}
      <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1C86EE' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>Codeforces</span>
          {cfPlatformStats?.handle && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>@{cfPlatformStats.handle}</span>
          )}
          {cfPlatformStats?.lastSyncedAt && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              · Last synced {new Date(cfPlatformStats.lastSyncedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          )}
        </div>
        <button
          onClick={syncCodeforces}
          disabled={syncing}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: syncing ? 'var(--accent-muted)' : 'var(--accent)',
            border: '1px solid transparent',
            borderRadius: 'var(--radius-md)',
            color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 700,
            padding: '6px 14px', cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <RotateCcw size={12} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </motion.div>

      {/* Sync status message */}
      {syncMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: syncMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'var(--warning-muted)',
            border: `1px solid ${syncMsg.type === 'success' ? '#22C55E' : 'var(--warning)'}`,
            borderRadius: 'var(--radius-md)', padding: '8px 14px', marginBottom: 'var(--space-3)',
            fontSize: 'var(--text-sm)', color: syncMsg.type === 'success' ? '#22C55E' : 'var(--warning)',
          }}
        >
          <AlertCircle size={14} /> {syncMsg.text}
        </motion.div>
      )}

      {/* Error banner */}
      {error && (
        <motion.div variants={fadeUp} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--warning-muted)', border: '1px solid var(--warning)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 'var(--space-4)',
          fontSize: 'var(--text-sm)', color: 'var(--warning)',
        }}>
          <AlertCircle size={15} />{error}
        </motion.div>
      )}

      {/* ── Stat Cards ── */}
      <motion.div variants={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-5)',
      }}>
        <MiniStatCard label="Rating"     value={stats?.rating}   color={rankColor}       icon={Star}        loading={!stats} />
        <MiniStatCard label="Max Rating" value={stats?.maxRating} color="#F59E0B"          icon={TrendingUp}  loading={!stats} />
        <MiniStatCard label="Rank"       value={stats?.rank}      color={rankColor}       icon={Trophy}      loading={!stats} sub="Current rank" />
        <MiniStatCard label="Solved"     value={totalSolved}      color="var(--success)"  icon={CheckSquare} loading={!stats} sub="All time" />
        <MiniStatCard label="Contests"   value={contestsCount}    color="#8B5CF6"         icon={Trophy}      loading={!stats} />
        <MiniStatCard
          label="Streak"
          value={currentStreak != null ? `${currentStreak}d` : null}
          color="var(--warning)"
          icon={Flame}
          loading={!stats}
          sub={maxStreak != null ? `Max: ${maxStreak}d` : 'Max: —'}
        />
      </motion.div>

      {/* ── Rating History + Contest History Table ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          {/* Chart header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cf-color)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Codeforces</p>
              <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Rating History</h6>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: '#1C86EE' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>CF Rating</span>
            </div>
          </div>

          {/* Rating chart */}
          {loading ? <SkeletonBox height={240} /> : contestHistory.length > 0 ? (
            <RatingLineChart data={contestHistory} lines={ratingLines} height={240} use3D={false} />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
              No contest history yet. Sync Codeforces to see your rating graph.
            </div>
          )}

          {/* Contest history table */}
          {!loading && contestHistoryRaw.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-4) 0' }} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                Contest Log — {contestHistoryRaw.length} contests
              </p>
              <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Rank', 'Change', 'Rating', 'Contest', 'Date'].map(h => (
                        <th key={h} style={{
                          padding: '7px 12px', textAlign: 'left',
                          fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...contestHistoryRaw].reverse().map((c, i) => {
                      const delta = c.ratingChange ?? 0;
                      const isPos = delta > 0;
                      const isNeg = delta < 0;
                      return (
                        <tr
                          key={i}
                          style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Rank */}
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: c.rank <= 10 ? '#F59E0B' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                            #{c.rank ?? '—'}
                          </td>
                          {/* Delta */}
                          <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              fontWeight: 700, fontSize: 'var(--text-xs)',
                              color: isPos ? 'var(--success)' : isNeg ? '#FF4136' : 'var(--text-muted)',
                            }}>
                              {isPos ? '+' : ''}{delta !== 0 ? delta : '—'}
                            </span>
                          </td>
                          {/* Rating after */}
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1C86EE', whiteSpace: 'nowrap' }}>
                            {c.rating ?? '—'}
                          </td>
                          {/* Contest name */}
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', maxWidth: 300 }}>
                            <a
                              href={`https://codeforces.com/contest/${c.contestId || ''}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#1C86EE'}
                              onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                            >
                              {c.contestName}
                            </a>
                          </td>
                          {/* Date */}
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                            {new Date(c.contestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* ── Upcoming CF Contests ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cf-color)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Codeforces</p>
              <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Upcoming Contests</h6>
            </div>
            <button
              onClick={refreshUpcoming}
              disabled={upcomingLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)', padding: '5px 12px', cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cf-color)'; e.currentTarget.style.color = 'var(--cf-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <RefreshCw size={12} style={{ animation: upcomingLoading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {upcomingLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <SkeletonBox key={i} height={72} />)}
            </div>
          ) : upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-6) 0' }}>
              No upcoming Codeforces contests found. Click Refresh to check.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {upcoming.map((c, i) => {
                const start    = new Date(c.startTime);
                const now      = new Date();
                const diffMs   = start - now;
                const diffHrs  = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffHrs / 24);
                const timeLeft = diffMs < 0 ? 'Live 🔴'
                  : diffDays > 0  ? `in ${diffDays}d ${diffHrs % 24}h`
                  : diffHrs  > 0  ? `in ${diffHrs}h`
                  : 'Starting soon';

                const durationMins = Math.round((c.duration || 0) / 60);
                const durStr = durationMins >= 60
                  ? `${Math.floor(durationMins / 60)}h ${durationMins % 60 > 0 ? `${durationMins % 60}m` : ''}`.trim()
                  : `${durationMins}m`;

                // Parse division / type from contest name
                const name = c.name || c.contestName || '';
                const divBadge = (() => {
                  if (/Educational/i.test(name))        return { label: 'Educational', bg: '#7C3AED22', color: '#A78BFA', border: '#7C3AED44' };
                  if (/Global.*Round/i.test(name))       return { label: 'Global',      bg: '#0F766E22', color: '#2DD4BF', border: '#0F766E44' };
                  if (/Div\.\s*1\s*\+\s*2/i.test(name)) return { label: 'Div. 1+2',   bg: '#B4530922', color: '#FCD34D', border: '#B4530966' };
                  if (/Div\.\s*1/i.test(name))           return { label: 'Div. 1',     bg: '#DC262622', color: '#F87171', border: '#DC262644' };
                  if (/Div\.\s*2/i.test(name))           return { label: 'Div. 2',     bg: '#1C86EE22', color: '#60A5FA', border: '#1C86EE44' };
                  if (/Div\.\s*3/i.test(name))           return { label: 'Div. 3',     bg: '#16A34A22', color: '#4ADE80', border: '#16A34A44' };
                  if (/Div\.\s*4/i.test(name))           return { label: 'Div. 4',     bg: '#15803D22', color: '#86EFAC', border: '#15803D44' };
                  return null;
                })();

                return (
                  <a
                    key={i}
                    href={c.url || 'https://codeforces.com/contests'}
                    target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                      transition: 'all var(--transition-fast)', cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cf-color)'; e.currentTarget.style.background = 'rgba(28,134,238,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Contest name + div badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          {divBadge && (
                            <span style={{
                              flexShrink: 0,
                              padding: '1px 8px', borderRadius: 'var(--radius-full)',
                              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
                              background: divBadge.bg, color: divBadge.color,
                              border: `1px solid ${divBadge.border}`,
                              whiteSpace: 'nowrap',
                            }}>
                              {divBadge.label}
                            </span>
                          )}
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                            {name || 'Upcoming Contest'}
                          </p>
                        </div>
                        {/* Date + duration */}
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                          {start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {' · '}
                          {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          {durationMins ? ` · ${durStr}` : ''}
                        </p>
                      </div>
                      {/* Countdown badge */}
                      <span style={{
                        marginLeft: 12, flexShrink: 0,
                        padding: '3px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)', fontWeight: 700,
                        background: diffMs < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(28,134,238,0.12)',
                        color:      diffMs < 0 ? '#EF4444'               : '#1C86EE',
                        border:     `1px solid ${diffMs < 0 ? '#EF444440' : 'rgba(28,134,238,0.3)'}`,
                      }}>
                        {timeLeft}
                      </span>
                    </div>
                  </a>
                );
              })}

            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Submission Heatmap ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Activity</p>
          <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Submission Heatmap</h6>
          {loading ? <SkeletonBox height={100} /> : <HeatMap data={activity} weeks={36} label="CF submissions" />}
        </Card>
      </motion.div>


      {/* ── Rating Bar + Topics Donut ── */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>

        {/* Rating Breakdown Bar Chart */}
        <Card>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Problems by Rating</p>
          <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Rating Breakdown</h6>
          {loading ? <SkeletonBox height={240} /> : ratingBars.length > 0 ? (
            <DifficultyBarChart data={ratingBars} height={240} use3D={false} />
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '0 24px' }}>
              No rating breakdown found. Re-sync Codeforces to populate this chart.
            </div>
          )}
        </Card>

        {/* Topics Donut */}
        <Card>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Topics</p>
          <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Tags Solved</h6>
          {loading ? <SkeletonBox height={200} /> : topicData.length > 0 ? (
            <>
              <DonutChart data={topicData.map(t => ({ name: t.name, value: t.value, color: t.color }))} height={180} innerRadius={50} label="topics" />
              <div style={{ maxHeight: 148, overflowY: 'auto', marginTop: 6 }}>
                {topicData.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginLeft: 8 }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No topic data. Sync Codeforces first.
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Problems: Solved + Unsolved ── */}
      <motion.div variants={fadeUp}>
        <Card>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* Solved / Unsolved toggle */}
              {[{ id: 'unsolved', label: 'Unsolved', count: unsolved.length, color: 'var(--warning)' },
                { id: 'solved',   label: 'Solved',   count: solved.length,   color: 'var(--success)' }].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setProblemTab(tab.id); setRatingFilter('all'); }}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `1px solid ${problemTab === tab.id ? tab.color : 'var(--border)'}`,
                    background: problemTab === tab.id ? `${tab.color}18` : 'transparent',
                    color: problemTab === tab.id ? tab.color : 'var(--text-muted)',
                    fontSize: 'var(--text-xs)', fontWeight: 700,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {tab.label}
                  {!problemsLoading && (
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>({tab.count})</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* Rating filter */}
              {!problemsLoading && activeRatings.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Filter size={13} color="var(--text-muted)" />
                  <select
                    value={ratingFilter}
                    onChange={e => setRatingFilter(e.target.value)}
                    style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      fontSize: 'var(--text-xs)', padding: '4px 8px', cursor: 'pointer', outline: 'none',
                    }}
                  >
                    <option value="all">All Ratings</option>
                    {activeRatings.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              {/* Refresh */}
              <button
                onClick={fetchProblems}
                disabled={problemsLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
                  fontSize: 'var(--text-xs)', padding: '5px 10px', cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cf-color)'; e.currentTarget.style.color = 'var(--cf-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <RefreshCw size={12} style={{ animation: problemsLoading ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          {problemsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4,5].map(i => <SkeletonBox key={i} height={42} />)}
            </div>
          ) : filteredList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              {ratingFilter !== 'all' ? `No ${problemTab} problems at rating ${ratingFilter}.` : `No ${problemTab} problems found.`}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Problem', 'Rating', 'Tags', ''].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredList.slice(0, 100).map((p, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', width: 32 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {p.contestId}{p.index}. {p.name}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {p.rating ? (
                          <span style={{
                            display: 'inline-block', background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                            padding: '2px 8px', fontSize: 'var(--text-xs)', fontWeight: 700,
                            color: p.rating <= 1000 ? 'var(--success)' : p.rating <= 1400 ? 'var(--cf-color)' : p.rating <= 1800 ? 'var(--warning)' : 'var(--accent)',
                          }}>{p.rating}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>
                          {p.tags.slice(0, 4).map((tag, ti) => (
                            <span key={ti} style={{
                              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-full)', padding: '2px 7px', fontSize: 10, color: 'var(--text-muted)',
                            }}>{tag}</span>
                          ))}
                          {p.tags.length > 4 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{p.tags.length - 4}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                          style={{
                            color: problemTab === 'unsolved' ? 'var(--cf-color)' : 'var(--success)',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 'var(--text-xs)', textDecoration: 'none', fontWeight: 600,
                          }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {problemTab === 'unsolved' ? 'Solve' : 'View'} <ExternalLink size={11} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredList.length > 100 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 12, padding: '8px 0' }}>
                  Showing 100 of {filteredList.length} {problemTab} problems
                </p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
