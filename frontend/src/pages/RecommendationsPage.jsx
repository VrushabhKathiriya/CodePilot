import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Zap, BookOpen, Target, TrendingUp, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import PlatformBadge from "../components/shared/PlatformBadge";
import { SkeletonBox } from "../components/ui/Spinner";
import { recommendationApi } from "../api/recommendation.api";

const DIFF_STYLE = {
  EASY:   { color: "#22C55E", bg: "#22C55E18", label: "Easy"   },
  MEDIUM: { color: "#F59E0B", bg: "#F59E0B18", label: "Medium" },
  HARD:   { color: "#EF4444", bg: "#EF444418", label: "Hard"   },
};

const LEVEL_STYLE = {
  EASY:   { color: "#22C55E", label: "Beginner" },
  MEDIUM: { color: "#F59E0B", label: "Intermediate" },
  HARD:   { color: "#EF4444", label: "Advanced" },
};

const TOPIC_ICONS = {
  "Array":                 "📦",
  "String":                "📝",
  "Hash Table":            "🗝️",
  "Math":                  "📐",
  "Sorting":               "📶",
  "Two Pointers":          "👉👈",
  "Sliding Window":        "🪟",
  "Binary Search":         "🔍",
  "Stack":                 "🥞",
  "Linked List":           "🔗",
  "Tree":                  "🌳",
  "Heap (Priority Queue)": "🏔️",
  "Graph":                 "🕸️",
  "Backtracking":          "🔄",
  "Dynamic Programming":   "🧮",
  "Greedy":                "💡",
  "Bit Manipulation":      "⚡",
  // Legacy aliases
  "Graphs":                "🕸️",
  "Trees":                 "🌳",
  "Strings":               "📝",
  "Prefix Sum":            "📊",
};

function DiffBadge({ difficulty }) {
  const d = (difficulty || "").toUpperCase();
  const s = DIFF_STYLE[d] || { color: "var(--text-muted)", bg: "var(--bg-elevated)", label: difficulty || "?" };
  return (
    <span style={{
      padding: "2px 9px", borderRadius: "var(--radius-full)",
      fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg,
      border: "1px solid " + s.color + "33",
    }}>{s.label}</span>
  );
}

function ProblemCard({ problem, rank }) {
  const { platform, title, difficulty, url, topic, reason } = problem || {};
  const ds = DIFF_STYLE[(difficulty || "").toUpperCase()] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid " + (ds.color || "var(--accent)"),
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "box-shadow var(--transition-fast), transform var(--transition-fast)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = ""; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: 1.4, flex: 1 }}>
          {title || "Problem"}
        </p>
        <DiffBadge difficulty={difficulty} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <PlatformBadge platform={platform} size="sm" />
        {topic && <Badge variant="default">{TOPIC_ICONS[topic] || "🏷️"} {topic}</Badge>}
      </div>

      {reason && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
          💡 <em>{reason}</em>
        </p>
      )}

      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: "var(--text-xs)", color: "var(--accent)", fontWeight: 700,
            textDecoration: "none", marginTop: 2,
          }}
        >
          Solve on {platform?.charAt(0) + (platform?.slice(1)?.toLowerCase() || "")} <ExternalLink size={11} />
        </a>
      )}
    </motion.div>
  );
}

export default function RecommendationsPage() {
  const [data,    setData]    = useState(null); // full response object
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    document.title = "Recommendations — CodePilot";
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true); setError(null);
    try {
      const res  = await recommendationApi.getTopics();
      setData(res.data?.data || null);
    } catch (e) {
      setError("Failed to load recommendations. Please try again.");
    } finally { setLoading(false); }
  }

  const groups     = data?.topics || [];
  const userLevel  = data?.userLevel;
  const weakTopics = data?.weakTopics || [];
  const allProblems = groups.flatMap(g => g.problems || []);
  const ls = LEVEL_STYLE[userLevel] || {};

  return (
    <PageWrapper title="Recommendations">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "var(--space-6)" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
            Problem <span style={{ color: "var(--accent)" }}>Recommendations</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Personalized problems based on your weak topics and current rating
          </p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
            fontSize: "var(--text-xs)", fontWeight: 700, padding: "8px 14px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--warning)" }}>
          <AlertCircle size={15} /> {error}
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <SkeletonBox height={90} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-3)" }}>
            {[1,2,3,4,5,6].map(i => <SkeletonBox key={i} height={130} />)}
          </div>
        </div>
      ) : allProblems.length === 0 ? (
        /* ── Empty State ── */
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ textAlign: "center", padding: "var(--space-12) var(--space-8)" }}>
            <div style={{ width: 64, height: 64, background: "var(--accent-muted)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4)" }}>
              <BookOpen size={28} color="var(--accent)" />
            </div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xl)", marginBottom: 10 }}>
              No recommendations yet
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: 400, margin: "0 auto var(--space-5)", lineHeight: 1.7 }}>
              Sync your Codeforces or LeetCode account from the <strong style={{ color: "var(--text-secondary)" }}>Dashboard</strong> to unlock personalized problem recommendations based on your weak topics.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><ChevronRight size={14} color="var(--accent)" /> Dashboard → CP Stats → Sync Now</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><ChevronRight size={14} color="var(--accent)" /> Then come back here for personalized problems</div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Level + Weak Topics Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-3)", marginBottom: "var(--space-6)", alignItems: "start" }}>

            {/* User level card */}
            {userLevel && (
              <Card style={{ textAlign: "center", padding: "16px 24px", minWidth: 140 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: ls.color + "20", border: "2px solid " + ls.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <TrendingUp size={18} color={ls.color} />
                </div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Your Level</p>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: ls.color }}>{ls.label}</p>
              </Card>
            )}

            {/* Weak topics */}
            {weakTopics.length > 0 && (
              <Card style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Target size={15} color="var(--accent)" />
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Weak Topics to Focus On</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {weakTopics.map((t, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--accent-muted)", border: "1px solid var(--accent)", borderRadius: "var(--radius-full)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--accent)" }}>
                      {TOPIC_ICONS[t] || "🏷️"} {t}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Problem groups by topic */}
          {groups.map((group, gi) => (
            <motion.div
              key={group.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              style={{ marginBottom: "var(--space-8)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: 20 }}>{TOPIC_ICONS[group.topic] || "🏷️"}</span>
                <h5 style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", fontWeight: 700 }}>
                  {group.topic}
                </h5>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "2px 10px", fontWeight: 600 }}>
                  Rank #{group.rank} weakest
                </span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: 4 }}>
                  {(group.problems || []).length} problem{(group.problems || []).length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "var(--space-3)" }}>
                {(group.problems || []).map((p, pi) => (
                  <ProblemCard key={pi} problem={p} rank={group.rank} />
                ))}
              </div>
            </motion.div>
          ))}

          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center", marginTop: "var(--space-4)" }}>
            {allProblems.length} problems recommended · Sync your platforms to update recommendations
          </p>
        </motion.div>
      )}
    </PageWrapper>
  );
}
