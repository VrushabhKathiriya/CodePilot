import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Bot, CalendarDays, BarChart2, Star, Clock, Sparkles } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { SkeletonBox } from '../components/ui/Spinner';
import { aiApi } from '../api/ai.api';
import { formatRelativeTime } from '../utils/formatters';

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'summary',       label: 'Daily Summary',  icon: Star,        apiFn: (r) => aiApi.getSummary(r),       color: '#f59e0b' },
  { key: 'weekly',        label: 'Weekly Plan',    icon: CalendarDays, apiFn: (r) => aiApi.getWeekly(r),        color: '#6366f1' },
  { key: 'monthly',       label: 'Monthly Plan',   icon: BarChart2,   apiFn: (r) => aiApi.getMonthly(r),       color: '#10b981' },
  { key: 'contestReview', label: 'Contest Review', icon: Bot,         apiFn: (r) => aiApi.getContestReview(r), color: '#ef4444' },
];

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
function TabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px',
        background: isActive ? tab.color + '18' : 'transparent',
        border: `1px solid ${isActive ? tab.color + '55' : 'var(--border)'}`,
        borderRadius: 'var(--radius-full)',
        color: isActive ? tab.color : 'var(--text-muted)',
        fontFamily: 'var(--font-heading)',
        fontWeight: isActive ? 700 : 500,
        fontSize: 'var(--text-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <Icon size={15} />
      {tab.label}
    </button>
  );
}

// ─── INSIGHT CONTENT ──────────────────────────────────────────────────────────
function InsightContent({ tab, insight, loading, error, onRefresh }) {
  const text = insight?.insightText;
  const ts   = insight?.generatedAt;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 'var(--space-2) 0' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 8 }}>
          ✨ Generating your {tab.label.toLowerCase()} with Gemini AI...
        </p>
        {[100, 95, 88, 70, 50].map((w, i) => (
          <SkeletonBox key={i} height={14} style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
        <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginBottom: 12 }}>{error}</p>
        <Button variant="outline" size="sm" onClick={() => onRefresh(false)}>Try Again</Button>
      </div>
    );
  }

  if (!text) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 12 }}>
          No {tab.label.toLowerCase()} generated yet.
        </p>
        <Button variant="outline" size="sm" icon={<Sparkles size={14} />} onClick={() => onRefresh(false)}>
          Generate Now
        </Button>
      </div>
    );
  }

  // Split paragraphs for better readability
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div>
      {/* Timestamp */}
      {ts && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-4)' }}>
          <Clock size={11} /> Generated {formatRelativeTime(ts)}
        </p>
      )}

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AICoachPage() {
  const [activeTab,  setActiveTab]  = useState('summary');
  const [insights,   setInsights]   = useState({});   // key → insight object
  const [loading,    setLoading]    = useState({});
  const [errors,     setErrors]     = useState({});
  const [history,    setHistory]    = useState([]);

  useEffect(() => {
    document.title = 'AI Coach — CodePilot';
    // Auto-load the default tab (Daily Summary) on mount
    loadTab('summary', false);
    // Load history
    aiApi.getHistory(null, 5).then(res => {
      const h = res.data?.data;
      setHistory(Array.isArray(h) ? h : []);
    }).catch(() => {});
  }, []);

  const loadTab = useCallback(async (key, forceRefresh = false) => {
    // If data already loaded and not forcing refresh, skip API call
    if (!forceRefresh && insights[key]) return;

    const tab = TABS.find(t => t.key === key);
    if (!tab) return;

    setLoading(p => ({ ...p, [key]: true }));
    setErrors (p => ({ ...p, [key]: null  }));
    try {
      const res = await tab.apiFn(forceRefresh);
      const d   = res.data?.data;
      setInsights(p => ({ ...p, [key]: d }));
      // Refresh history after generating
      if (!forceRefresh || true) {
        aiApi.getHistory(null, 5).then(r => {
          const h = r.data?.data;
          setHistory(Array.isArray(h) ? h : []);
        }).catch(() => {});
      }
    } catch (e) {
      setErrors(p => ({ ...p, [key]: e.response?.data?.message || 'Failed to load. Try again.' }));
    } finally {
      setLoading(p => ({ ...p, [key]: false }));
    }
  }, [insights]);

  function handleTabClick(key) {
    setActiveTab(key);
    loadTab(key, false); // Load if not loaded yet, skip if cached
  }

  function handleRefresh() {
    loadTab(activeTab, true); // Force fresh generation
  }

  const currentTab = TABS.find(t => t.key === activeTab);

  return (
    <PageWrapper title="AI Coach">

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Your <span style={{ color: 'var(--accent)' }}>AI Coach</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          Personalized insights powered by Gemini AI — based on your synced coding stats
        </p>
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onClick={() => handleTabClick(tab.key)}
          />
        ))}
      </div>

      {/* Active tab card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card style={{ marginBottom: 'var(--space-6)' }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38,
                  background: (currentTab?.color || 'var(--accent)') + '18',
                  border: `1px solid ${(currentTab?.color || 'var(--accent)') + '44'}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {currentTab && <currentTab.icon size={18} color={currentTab.color} />}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                    {currentTab?.label}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw size={13} style={{ animation: loading[activeTab] ? 'spin 1s linear infinite' : 'none' }} />}
                onClick={handleRefresh}
                disabled={loading[activeTab]}
              >
                Refresh
              </Button>
            </div>

            {/* Card content */}
            <InsightContent
              tab={currentTab}
              insight={insights[activeTab]}
              loading={loading[activeTab]}
              error={errors[activeTab]}
              onRefresh={(force) => loadTab(activeTab, force)}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
            Insight History
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start',
                  paddingBottom: 'var(--space-3)',
                  borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6 }} />
                  {i < history.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge variant="accent">{h.insightType}</Badge>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {formatRelativeTime(h.generatedAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {h.insightText}
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
