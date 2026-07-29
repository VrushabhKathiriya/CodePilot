import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Filter, Star, Zap } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PlatformBadge from '../components/shared/PlatformBadge';
import { SkeletonBox } from '../components/ui/Spinner';
import { recommendationApi } from '../api/recommendation.api';
import { useToast } from '../hooks/useToast';

function ProblemCard({ problem }) {
  const { platform, title, difficulty, url, topic, reason, tags = [] } = problem || {};
  const diffColor = difficulty < 1200 ? 'var(--success)' : difficulty < 1600 ? '#F59E0B' : difficulty < 2000 ? 'var(--accent)' : '#AA0000';

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>
          {title || 'Problem'}
        </p>
        {difficulty && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700, color: diffColor, flexShrink: 0 }}>
            {difficulty}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <PlatformBadge platform={platform} size="sm" />
        {topic && <Badge variant="default">{topic}</Badge>}
      </div>
      {reason && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4, margin: '2px 0' }}>
          💡 <span style={{ fontStyle: 'italic' }}>{reason}</span>
        </p>
      )}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', marginTop: 4 }}>
          Solve <ExternalLink size={11} />
        </a>
      )}
    </Card>
  );
}

export default function RecommendationsPage() {
  const [all, setAll] = useState([]);
  const [daily, setDaily] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    document.title = 'Recommendations — CodePilot';
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [allRes, dailyRes, topicRes] = await Promise.allSettled([
        recommendationApi.getAll(),
        recommendationApi.getDaily(),
        recommendationApi.getTopics(),
      ]);
      if (allRes.status === 'fulfilled')   setAll(allRes.value.data?.data || []);
      if (dailyRes.status === 'fulfilled') setDaily(dailyRes.value.data?.data);
      if (topicRes.status === 'fulfilled') setTopics(topicRes.value.data?.data || []);
    } catch (e) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }

  // Extract problems list safely regardless of array or grouped object response
  const flatProblems = Array.isArray(all)
    ? all
    : (all?.recommendations || []).flatMap((g) => g.problems || g.suggestedQuestions || []);

  const byTopic = (flatProblems || []).reduce((acc, p) => {
    const t = p.topic || p.matchedTopic || 'General';
    if (!acc[t]) acc[t] = [];
    acc[t].push(p);
    return acc;
  }, {});

  const dailyProblem = daily?.dailySet?.[0] || (daily?.title ? daily : null);

  return (
    <PageWrapper title="Recommendations">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Problem <span style={{ color: 'var(--accent)' }}>Recommendations</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Personalized problems based on your weak spots and current rating
        </p>
      </div>

      {/* Daily Challenge */}
      {(loading || dailyProblem) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-6)' }}>
          <Card accent style={{
            background: 'linear-gradient(135deg, var(--accent-muted) 0%, var(--bg-card) 100%)',
            borderColor: 'var(--accent)',
          }}>
            {loading ? (
              <SkeletonBox height={80} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                      Daily Challenge
                    </p>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                      {dailyProblem?.title || 'Today\'s Problem'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <PlatformBadge platform={dailyProblem?.platform} size="sm" />
                      {dailyProblem?.difficulty && <Badge variant="accent">{dailyProblem.difficulty}</Badge>}
                    </div>
                  </div>
                </div>
                {dailyProblem?.url && (
                  <a href={dailyProblem.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="md" iconRight={<ExternalLink size={14} />}>
                      Solve Now
                    </Button>
                  </a>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Topic sections */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {[1,2,3,4,5,6].map((i) => <SkeletonBox key={i} height={120} />)}
        </div>
      ) : Object.keys(byTopic).length > 0 ? (
        Object.entries(byTopic).map(([topic, problems]) => (
          <motion.div key={topic} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
              <h5 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{topic}</h5>
              <Badge variant="default">{problems.length} problems</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {problems.map((p, i) => <ProblemCard key={i} problem={p} />)}
            </div>
          </motion.div>
        ))
      ) : (
        <Card style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
          <Star size={40} color="var(--text-muted)" style={{ margin: '0 auto var(--space-4)' }} />
          <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No recommendations yet</h5>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Sync your platforms first to get personalized recommendations.</p>
        </Card>
      )}
    </PageWrapper>
  );
}
