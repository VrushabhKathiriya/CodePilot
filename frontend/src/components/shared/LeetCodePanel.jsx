import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, Trophy, TrendingUp, AlertCircle, ExternalLink, RefreshCw, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';
import { SkeletonBox } from '../ui/Spinner';
import HeatMap from './HeatMap';
import RatingLineChart from '../charts/RatingLineChart';
import DonutChart from '../charts/DonutChart';
import { syncApi } from '../../api/sync.api';
import { useAuthStore } from '../../store/authStore';
import { useAnalyticsStore } from '../../store/analyticsStore';

const LC_COLOR   = '#FFA116';
const DIFF_COLOR = { Easy: '#22C55E', Medium: '#F59E0B', Hard: '#EF4444' };
const TOPIC_COLORS = [
  '#6366F1','#F59E0B','#10B981','#EF4444','#3B82F6','#8B5CF6',
  '#EC4899','#14B8A6','#F97316','#84CC16','#06B6D4','#A855F7',
  '#22C55E','#E11D48','#0EA5E9','#D97706',
];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

function MiniStatCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
        {Icon && <Icon size={14} color={color || 'var(--text-muted)'} />}
      </div>
      <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: color || 'var(--text-primary)', lineHeight: 1.1 }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function DiffCard({ label, count, color }) {
  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 'var(--radius-lg)', padding: '18px 20px', textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color, lineHeight: 1 }}>
        {count != null ? count : <span style={{ fontSize: 'var(--text-xl)', opacity: 0.5 }}>—</span>}
      </p>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>problems solved</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'Wrong Answer':          { color: '#EF4444', bg: '#EF444418', label: 'WA'  },
    'Time Limit Exceeded':   { color: '#F59E0B', bg: '#F59E0B18', label: 'TLE' },
    'Runtime Error':         { color: '#F97316', bg: '#F9731618', label: 'RTE' },
    'Memory Limit Exceeded': { color: '#8B5CF6', bg: '#8B5CF618', label: 'MLE' },
    'Compile Error':         { color: '#6366F1', bg: '#6366F118', label: 'CE'  },
  };
  const m = map[status] || { color: 'var(--text-muted)', bg: 'var(--bg-elevated)', label: (status || '?').split(' ').map(w => w[0]).join('') };
  return (
    <span style={{ padding: '1px 7px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 800, color: m.color, background: m.bg, border: `1px solid ${m.color}33` }}>
      {m.label}
    </span>
  );
}

export default function LeetCodePanel({ lcPlatformStats, onSyncSuccess }) {
  const [contestHistoryChart, setContestHistoryChart] = useState([]);
  const [contestHistoryRaw,   setContestHistoryRaw]   = useState([]);
  const [upcoming,            setUpcoming]            = useState([]);
  const [activity,            setActivity]            = useState({});
  const [topicData,           setTopicData]           = useState([]);
  const [solvedProblems,      setSolvedProblems]      = useState([]);
  const [attemptedProblems,   setAttemptedProblems]   = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [upcomingLoading,     setUpcomingLoading]     = useState(false);
  const [problemsLoading,     setProblemsLoading]     = useState(true);
  const [error,               setError]               = useState(null);
  const [probTab,             setProbTab]             = useState('solved');
  const [diffFilter,          setDiffFilter]          = useState('All'); // All | Easy | Medium | Hard

  const [syncing,            setSyncing]             = useState(false);
  const [syncMsg,             setSyncMsg]             = useState(null); // { type: 'success'|'error', text }

  useEffect(() => { fetchAll(); fetchUpcoming(); fetchProblems(); }, []);

  async function syncLeetCode() {
    const user = useAuthStore.getState().user;
    const handle = lcPlatformStats?.handle || user?.profile?.leetcodeUsername;
    if (!handle) { setSyncMsg({ type: 'error', text: 'LeetCode handle not found. Please sync from the Settings page first.' }); return; }
    setSyncing(true); setSyncMsg(null);
    try {
      await syncApi.syncPlatform({ platform: 'LEETCODE', handle });
      useAnalyticsStore.getState().clearAll();
      setSyncMsg({ type: 'success', text: 'LeetCode synced! Reloading data…' });
      // Refresh all panel data and parent dashboard stats
      await Promise.all([
        fetchAll(),
        fetchProblems(),
        onSyncSuccess ? onSyncSuccess() : Promise.resolve(),
      ]);
      // Clear success msg after 3s
      setTimeout(() => setSyncMsg(null), 3000);
    } catch (e) {
      setSyncMsg({ type: 'error', text: e?.response?.data?.message || 'Sync failed. Try again.' });
    } finally { setSyncing(false); }
  }

  async function fetchAll() {
    setLoading(true); setError(null);
    try {
      const [histRes, actRes, topicsRes] = await Promise.all([
        syncApi.getContestHistory('LEETCODE'),
        syncApi.getCpActivity('LEETCODE'),
        syncApi.getTopicStats('LEETCODE'),
      ]);
      // Sort oldest → newest so chart shows progression left→right with latest on right
      const rawHistory = [...(histRes.data?.data || [])].sort(
        (a, b) => new Date(a.contestDate) - new Date(b.contestDate)
      );
      const historyWithDelta = rawHistory.map((c, idx) => {
        if (c.ratingChange !== undefined && c.ratingChange !== null) return c;
        const prevRating = idx === 0 ? 1500 : (rawHistory[idx - 1].rating || 1500);
        return {
          ...c,
          ratingChange: c.rating != null ? (c.rating - prevRating) : null,
        };
      });
      setContestHistoryRaw(historyWithDelta);
      setContestHistoryChart(rawHistory.map(c => ({
        date:   new Date(c.contestDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        rating: c.rating,
      })));
      const raw = actRes.data?.data || [];
      const map = {};
      raw.forEach(d => {
        if (d.date) { const k = new Date(d.date).toISOString().slice(0, 10); map[k] = (map[k] || 0) + (d.submissions || 0); }
      });
      setActivity(map);
      const allTopics = (topicsRes.data?.data || []).filter(t => !t.topic?.startsWith('rating:'));
      setTopicData(allTopics.sort((a, b) => b.problemCount - a.problemCount).slice(0, 16).map((t, i) => ({ name: t.topic, value: t.problemCount, color: TOPIC_COLORS[i % TOPIC_COLORS.length] })));
    } catch {
      setError('Failed to load LeetCode data. Please re-sync LeetCode from the Profile page.');
    } finally { setLoading(false); }
  }

  async function fetchUpcoming() {
    setUpcomingLoading(true);
    try {
      const res = await syncApi.getUpcomingContests();
      const all = res.data?.data || [];
      setUpcoming(all.filter(c => (c.platform || '').toLowerCase().includes('leetcode') || (c.source || '').toLowerCase().includes('leetcode')));
    } catch { setUpcoming([]); } finally { setUpcomingLoading(false); }
  }

  async function refreshUpcoming() {
    setUpcomingLoading(true);
    try { await syncApi.refreshUpcoming(); } catch { /* ignore */ }
    await fetchUpcoming();
  }

  async function fetchProblems() {
    setProblemsLoading(true);
    try {
      const res  = await syncApi.getLeetCodeProblems();
      const data = res.data?.data || {};
      setSolvedProblems(data.solved || []);
      setAttemptedProblems(data.attempted || []);
    } catch { setSolvedProblems([]); setAttemptedProblems([]); }
    finally { setProblemsLoading(false); }
  }

  const stats      = lcPlatformStats;
  const ratingLines = [{ key: 'rating', label: 'LC Rating', color: LC_COLOR }];

  const RefreshBtn = ({ onClick, loading: l, accentColor }) => (
    <button onClick={onClick} disabled={l}
      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', padding: '5px 12px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      <RefreshCw size={12} style={{ animation: l ? 'spin 1s linear infinite' : 'none' }} /> Refresh
    </button>
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* ── Sync Now Banner ── */}
      <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: LC_COLOR }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>LeetCode</span>
          {lcPlatformStats?.handle && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>@{lcPlatformStats.handle}</span>
          )}
          {lcPlatformStats?.lastSyncedAt && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              · Last synced {new Date(lcPlatformStats.lastSyncedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          )}
        </div>
        <button
          onClick={syncLeetCode}
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

      {error && (
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warning-muted)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>
          <AlertCircle size={15} />{error}
        </motion.div>
      )}

      {/* ── Difficulty Cards ── */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <DiffCard label="Easy"   count={stats?.easySolved}   color={DIFF_COLOR.Easy}   />
        <DiffCard label="Medium" count={stats?.mediumSolved} color={DIFF_COLOR.Medium} />
        <DiffCard label="Hard"   count={stats?.hardSolved}   color={DIFF_COLOR.Hard}   />
      </motion.div>

      {/* ── Contest Stat Cards ── */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <MiniStatCard label="Contest Rating" value={stats?.rating}        color={LC_COLOR}         icon={Star}       />
        <MiniStatCard label="Max Rating"     value={stats?.maxRating}     color="#F59E0B"           icon={TrendingUp} />
        <MiniStatCard label="Contests"       value={stats?.contestsCount} color="#8B5CF6"           icon={Trophy}     />
        <MiniStatCard label="Streak" value={stats?.currentStreak != null ? `${stats.currentStreak}d` : null} color="var(--warning)" icon={Flame} sub={stats?.maxStreak != null ? `Max: ${stats.maxStreak}d` : 'Max: —'} />
      </motion.div>

      {/* ── Rating History ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: LC_COLOR, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>LeetCode</p>
              <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Contest Rating History</h6>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: LC_COLOR }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>LC Rating</span>
            </div>
          </div>
          {loading ? <SkeletonBox height={240} /> : contestHistoryChart.length > 0 ? (
            <RatingLineChart data={contestHistoryChart} lines={ratingLines} height={240} use3D={false} />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No contest history. Sync LeetCode to see your rating graph.
            </div>
          )}

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
                        <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...contestHistoryRaw].reverse().map((c, i) => {
                      const delta = c.ratingChange;
                      const isPos = delta > 0;
                      const isNeg = delta < 0;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: c.rank <= 10 ? '#F59E0B' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>#{c.rank ?? '—'}</td>
                          <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              fontWeight: 700, fontSize: 'var(--text-xs)',
                              color: isPos ? '#22C55E' : isNeg ? '#EF4444' : 'var(--text-muted)',
                            }}>
                              {isPos ? '+' : ''}{delta !== null && delta !== undefined ? delta : '—'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: LC_COLOR, whiteSpace: 'nowrap' }}>{c.rating ?? '—'}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', maxWidth: 300 }}>
                            <a href="https://leetcode.com/contest/" target="_blank" rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'none' }}
                              onMouseEnter={e => e.currentTarget.style.color = LC_COLOR}
                              onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                            >{c.contestName}</a>
                          </td>
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

      {/* ── Upcoming Contests ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: LC_COLOR, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>LeetCode</p>
              <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Upcoming Contests</h6>
            </div>
            <RefreshBtn onClick={refreshUpcoming} loading={upcomingLoading} accentColor={LC_COLOR} />
          </div>
          {upcomingLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3].map(i => <SkeletonBox key={i} height={68} />)}</div>
          ) : upcoming.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-6) 0' }}>
              No upcoming LeetCode contests found. Click Refresh to check.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {upcoming.map((c, i) => {
                const start    = new Date(c.startTime);
                const diffMs   = start - new Date();
                const diffHrs  = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffHrs / 24);
                const timeLeft = diffMs < 0 ? 'Live 🔴' : diffDays > 0 ? `in ${diffDays}d ${diffHrs % 24}h` : diffHrs > 0 ? `in ${diffHrs}h` : 'Starting soon';
                const durMins  = Math.round((c.duration || 0) / 60);
                const durStr   = durMins >= 60 ? `${Math.floor(durMins / 60)}h${durMins % 60 > 0 ? ` ${durMins % 60}m` : ''}` : `${durMins}m`;
                const cname    = c.name || c.contestName || '';
                const badge    = /Biweekly/i.test(cname) ? { label: 'Biweekly', bg: '#7C3AED22', color: '#A78BFA', border: '#7C3AED44' } : /Weekly/i.test(cname) ? { label: 'Weekly', bg: `${LC_COLOR}22`, color: LC_COLOR, border: `${LC_COLOR}44` } : null;
                return (
                  <a key={i} href={c.url || 'https://leetcode.com/contest/'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', transition: 'all var(--transition-fast)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = LC_COLOR; e.currentTarget.style.background = `${LC_COLOR}0a`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {badge && <span style={{ flexShrink: 0, padding: '1px 8px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 800, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{badge.label}</span>}
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{cname || 'Upcoming Contest'}</p>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                          {start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}{durMins ? ` · ${durStr}` : ''}
                        </p>
                      </div>
                      <span style={{ marginLeft: 12, flexShrink: 0, padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 700, background: diffMs < 0 ? 'rgba(239,68,68,0.15)' : `${LC_COLOR}18`, color: diffMs < 0 ? '#EF4444' : LC_COLOR, border: `1px solid ${diffMs < 0 ? '#EF444440' : `${LC_COLOR}44`}` }}>{timeLeft}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Heatmap ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Activity</p>
          <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Submission Heatmap</h6>
          {loading ? <SkeletonBox height={100} /> : <HeatMap data={activity} weeks={36} label="LC submissions" />}
        </Card>
      </motion.div>

      {/* ── Topics Donut ── */}
      <motion.div variants={fadeUp} style={{ marginBottom: 'var(--space-4)' }}>
        <Card>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Topics</p>
          <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Tags Solved</h6>
          {loading ? <SkeletonBox height={220} /> : topicData.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 'var(--space-4)', alignItems: 'start' }}>
              <DonutChart data={topicData.map(t => ({ name: t.name, value: t.value, color: t.color }))} height={200} innerRadius={52} label="topics" />
              <div style={{ maxHeight: 220, overflowY: 'auto', paddingTop: 4 }}>
                {topicData.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginLeft: 8 }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No topic data. Sync LeetCode first.</div>
          )}
        </Card>
      </motion.div>

      {/* ── Problems: Solved / Attempted ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: LC_COLOR, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>LeetCode</p>
              <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginTop: 2 }}>Problems</h6>
            </div>
            <RefreshBtn onClick={fetchProblems} loading={problemsLoading} accentColor={LC_COLOR} />
          </div>

          {/* Solved / Attempted tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: 4, width: 'fit-content' }}>
            {[
              { id: 'solved',    label: `Solved (${solvedProblems.length})`,                    activeColor: '#22C55E' },
              { id: 'attempted', label: `Attempted / Unsolved (${attemptedProblems.length})`,   activeColor: '#EF4444' },
            ].map(t => (
              <button key={t.id} onClick={() => { setProbTab(t.id); setDiffFilter('All'); }}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600, transition: 'all var(--transition-fast)', background: probTab === t.id ? 'var(--bg-card)' : 'transparent', color: probTab === t.id ? t.activeColor : 'var(--text-muted)', boxShadow: probTab === t.id ? 'var(--shadow-sm)' : 'none' }}
              >{t.label}</button>
            ))}
          </div>

          {/* Difficulty filter */}
          {(() => {
            const source = probTab === 'solved' ? solvedProblems : attemptedProblems;
            const counts = { All: source.length, Easy: 0, Medium: 0, Hard: 0 };
            source.forEach(p => { if (p.difficulty && counts[p.difficulty] != null) counts[p.difficulty]++; });
            return (
              <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                {[['All','var(--text-muted)'],['Easy','#22C55E'],['Medium','#F59E0B'],['Hard','#EF4444']].map(([d, color]) => (
                  <button key={d} onClick={() => setDiffFilter(d)}
                    style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', border: `1px solid ${diffFilter === d ? color : 'var(--border)'}`, background: diffFilter === d ? `${color}18` : 'transparent', color: diffFilter === d ? color : 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all var(--transition-fast)' }}
                  >{d} ({counts[d]})</button>
                ))}
              </div>
            );
          })()}

          {problemsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1,2,3,4,5].map(i => <SkeletonBox key={i} height={40} />)}</div>
          ) : probTab === 'solved' ? (
            (() => {
              const filtered = diffFilter === 'All' ? solvedProblems : solvedProblems.filter(p => p.difficulty === diffFilter);
              return filtered.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
                  {solvedProblems.length === 0 ? 'No recent solved problems. Sync LeetCode first.' : `No ${diffFilter} problems found in recent submissions.`}
                </p>
              ) : (
                <div style={{ overflowX: 'auto', maxHeight: 460, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['#','Problem','Difficulty','Solved On','Link'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => {
                        const dc = { Easy: '#22C55E', Medium: '#F59E0B', Hard: '#EF4444' };
                        const dcolor = dc[p.difficulty] || 'var(--text-muted)';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, width: 40 }}>{i + 1}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{p.title}</td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                              {p.difficulty
                                ? <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 800, color: dcolor, background: `${dcolor}18`, border: `1px solid ${dcolor}33` }}>{p.difficulty}</span>
                                : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                              {p.solvedAt ? new Date(p.solvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                              <a href={p.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: '#22C55E', fontWeight: 600, textDecoration: 'none' }}
                              >View <ExternalLink size={11} /></a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()
          ) : (
            (() => {
              const filtered = diffFilter === 'All' ? attemptedProblems : attemptedProblems.filter(p => p.difficulty === diffFilter);
              return filtered.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
                  {attemptedProblems.length === 0 ? 'No attempted-but-unsolved problems found in recent submissions.' : `No ${diffFilter} attempted problems found.`}
                </p>
              ) : (
                <div style={{ overflowX: 'auto', maxHeight: 460, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['#','Problem','Difficulty','Last Status','Last Attempt','Link'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => {
                        const dc = { Easy: '#22C55E', Medium: '#F59E0B', Hard: '#EF4444' };
                        const dcolor = dc[p.difficulty] || 'var(--text-muted)';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, width: 40 }}>{i + 1}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{p.title}</td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                              {p.difficulty
                                ? <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 800, color: dcolor, background: `${dcolor}18`, border: `1px solid ${dcolor}33` }}>{p.difficulty}</span>
                                : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}><StatusBadge status={p.lastStatus} /></td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                              {p.attemptedAt ? new Date(p.attemptedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                              <a href={p.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: '#EF4444', fontWeight: 600, textDecoration: 'none' }}
                              >Solve <ExternalLink size={11} /></a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </Card>
      </motion.div>

    </motion.div>
  );
}

