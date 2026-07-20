import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import RatingLineChart from '../components/charts/RatingLineChart';
import DifficultyBarChart from '../components/charts/DifficultyBarChart';
import TopicRadarChart from '../components/charts/TopicRadarChart';
import DonutChart from '../components/charts/DonutChart';
import { SkeletonBox } from '../components/ui/Spinner';
import { useAnalytics } from '../hooks/useAnalytics';

const TABS = ['Ratings', 'Contests', 'Topics', 'Difficulty'];

const MOCK = {
  rating: [
    { date: 'Jan', codeforces: 1200, leetcode: 1500 },
    { date: 'Feb', codeforces: 1250, leetcode: 1580 },
    { date: 'Mar', codeforces: 1310, leetcode: 1620 },
    { date: 'Apr', codeforces: 1280, leetcode: 1660 },
    { date: 'May', codeforces: 1370, leetcode: 1700 },
    { date: 'Jun', codeforces: 1420, leetcode: 1750 },
  ],
  contests: [
    { date: 'Jan', rank: 450 }, { date: 'Feb', rank: 380 },
    { date: 'Mar', rank: 510 }, { date: 'Apr', rank: 290 },
    { date: 'May', rank: 320 }, { date: 'Jun', rank: 180 },
  ],
  topics: [
    { topic: 'DP', count: 42 }, { topic: 'Graphs', count: 28 },
    { topic: 'Trees', count: 35 }, { topic: 'Greedy', count: 50 },
    { topic: 'Binary Search', count: 30 }, { topic: 'Math', count: 22 },
    { topic: 'Strings', count: 18 }, { topic: 'Sorting', count: 38 },
  ],
  difficulty: [
    { difficulty: '800', count: 40 }, { difficulty: '900', count: 25 },
    { difficulty: '1000', count: 30 }, { difficulty: '1100', count: 20 },
    { difficulty: '1200', count: 15 }, { difficulty: '1300', count: 12 },
    { difficulty: '1400', count: 8 }, { difficulty: '1500', count: 6 },
    { difficulty: '1600', count: 4 }, { difficulty: '1700', count: 2 },
  ],
};

const RATING_LINES = [
  { key: 'codeforces', label: 'Codeforces', color: '#1C86EE' },
  { key: 'leetcode',   label: 'LeetCode',   color: '#FFA116' },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState(0);
  const { fetchRating, fetchContests, fetchTopics, fetchDifficulty,
          rating, contests, topics, difficulty, loading } = useAnalytics();

  useEffect(() => {
    document.title = 'Analytics — CodePilot';
    fetchRating();
    fetchContests();
    fetchTopics();
    fetchDifficulty();
  }, []);

  function mapTopics(data) {
    if (!data) return MOCK.topics;
    const raw = Array.isArray(data) ? data : data?.topics || (typeof data === 'object' ? Object.entries(data).map(([topic, count]) => ({ topic, count })) : []);
    if (!raw.length) return MOCK.topics;
    return raw.map((t) => ({
      topic: t.topic,
      count: t.solved ?? t.count ?? t.problemCount ?? 0,
    }));
  }

  function mapDifficulty(data) {
    if (!data) return MOCK.difficulty;
    const raw = Array.isArray(data) ? data : data?.difficultyBreakdown || data?.distribution || (typeof data === 'object' ? Object.entries(data).map(([difficulty, count]) => ({ difficulty, count })) : []);
    if (!raw.length) return MOCK.difficulty;
    return raw.map((d) => ({
      difficulty: d.difficulty,
      count: d.solved ?? d.count ?? d.attempted ?? 0,
    }));
  }

  const topicList = mapTopics(topics?.topics || topics?.topicStats || topics);
  const donutData = topicList.slice(0, 8).map((t) => ({
    name: t.topic,
    value: t.count,
  }));

  return (
    <PageWrapper title="Analytics">
      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 'var(--space-6)',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        padding: 4, border: '1px solid var(--border)', width: 'fit-content',
      }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              background: tab === i ? 'var(--accent)' : 'transparent',
              color: tab === i ? '#fff' : 'var(--text-muted)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Ratings Tab ── */}
      {tab === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>All Platforms</p>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginTop: 4 }}>Rating Progression</h4>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {RATING_LINES.map((l) => (
                  <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 3, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {loading.rating ? <SkeletonBox height={320} /> : (
              <RatingLineChart
                data={rating?.history || MOCK.rating}
                lines={RATING_LINES}
                height={320}
              />
            )}
          </Card>

          {/* Current ratings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { platform: 'Codeforces', rating: rating?.current?.codeforces, color: '#1C86EE' },
              { platform: 'LeetCode',   rating: rating?.current?.leetcode,   color: '#FFA116' },
              { platform: 'CodeChef',   rating: rating?.current?.codechef,   color: '#945ACF' },
              { platform: 'AtCoder',    rating: rating?.current?.atcoder,    color: '#00C0C0' },
            ].map(({ platform, rating: r, color }) => (
              <Card key={platform} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{platform}</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 800, color }}>{r ?? '—'}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Contests Tab ── */}
      {tab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Contest Rank History</h4>
            {loading.contests ? <SkeletonBox height={280} /> : (
              <RatingLineChart
                data={contests?.history || MOCK.contests}
                lines={[{ key: 'rank', label: 'Rank', color: '#8B5CF6' }]}
                height={280}
              />
            )}
          </Card>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { label: 'Total Contests', v: contests?.total ?? '—' },
              { label: 'Best Rank', v: contests?.bestRank ?? '—' },
              { label: 'Avg Rank', v: contests?.avgRank ?? '—' },
              { label: 'Rating Delta', v: contests?.ratingDelta != null ? `+${contests.ratingDelta}` : '—' },
            ].map(({ label, v }) => (
              <Card key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{v}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Topics Tab ── */}
      {tab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-4)' }}>
            <Card>
              <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Topic Distribution</h4>
              {loading.topics ? <SkeletonBox height={300} /> : (
                <TopicRadarChart data={topicList} height={340} />
              )}
            </Card>
            <Card>
              <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>Breakdown</h4>
              {loading.topics ? <SkeletonBox height={300} /> : (
                <DonutChart data={donutData} height={220} label="Topics" />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {topicList.slice(0, 6).map((t) => {
                  const max = Math.max(...topicList.map((x) => x.count), 1);
                  return (
                    <div key={t.topic}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{t.topic}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.count}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${(t.count / max) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ── Difficulty Tab ── */}
      {tab === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)' }}>Difficulty Distribution</h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Problems solved by difficulty rating (Codeforces scale)</p>
            {loading.difficulty ? <SkeletonBox height={340} /> : (
              <DifficultyBarChart
                data={mapDifficulty(difficulty)}
                height={340}
              />
            )}
          </Card>
        </motion.div>
      )}
    </PageWrapper>
  );
}
