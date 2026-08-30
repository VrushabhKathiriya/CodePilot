import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GitCommit, Star, GitPullRequest, AlertCircle,
  Users, BookOpen, Flame, Zap, GitBranch,
} from "lucide-react";
import Card from "../ui/Card";
import { SkeletonBox } from "../ui/Spinner";
import HeatMap from "./HeatMap";
import { syncApi } from "../../api/sync.api";

const GH_COLOR = "#6E40C9";
const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp   = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

const LANG_DEFAULTS = {
  JavaScript: "#F1E05A", TypeScript: "#3178C6", Python: "#3572A5",
  Java: "#B07219", "C++": "#F34B7D", C: "#555555", "C#": "#178600",
  Go: "#00ADD8", Rust: "#DEA584", Kotlin: "#A97BFF", Swift: "#F05138",
  Ruby: "#701516", PHP: "#4F5D95", HTML: "#E34C26", CSS: "#563D7C",
  Dart: "#00B4AB", Shell: "#89E051", Scala: "#C22D40", R: "#198CE7",
};

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
        {Icon && <Icon size={14} color={color || "var(--text-muted)"} />}
      </div>
      <p style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: color || "var(--text-primary)", lineHeight: 1.1 }}>{value ?? "—"}</p>
      {sub && <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function LanguageBar({ languages }) {
  if (!languages || languages.length === 0) return null;
  const top     = languages.slice(0, 8);
  const others  = languages.slice(8);
  const otherPct = others.reduce((s, l) => s + (l.percentage || 0), 0);
  const display = otherPct > 0
    ? [...top, { language: "Others", percentage: Math.round(otherPct * 10) / 10, color: "#8B949E" }]
    : top;
  return (
    <div>
      <div style={{ display: "flex", height: 10, borderRadius: "var(--radius-full)", overflow: "hidden", marginBottom: "var(--space-5)", gap: 2 }}>
        {display.map((l, i) => {
          const c = l.color || LANG_DEFAULTS[l.language] || "#8B949E";
          return (
            <div key={i} title={l.language + ": " + l.percentage + "%"}
              style={{ flex: l.percentage, background: c, minWidth: 4, transition: "flex 0.4s ease",
                borderRadius: i === 0 ? "4px 0 0 4px" : i === display.length - 1 ? "0 4px 4px 0" : 0 }}
            />
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px 16px" }}>
        {display.map((l, i) => {
          const c = l.color || LANG_DEFAULTS[l.language] || "#8B949E";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: c, flexShrink: 0 }} />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.language}</span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>{l.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GitHubPanel() {
  const [stats,     setStats]     = useState(null);
  const [languages, setLanguages] = useState([]);
  const [activity,  setActivity]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true); setError(null);
    try {
      const [statsRes, langsRes, actRes] = await Promise.all([
        syncApi.getGithubStats(),
        syncApi.getGithubLanguages(),
        syncApi.getGithubActivity(),
      ]);
      setStats(statsRes.data?.data || null);
      setLanguages(langsRes.data?.data || []);
      const raw = actRes.data?.data || [];
      const map = {};
      raw.forEach(d => {
        if (d.date) {
          const k = new Date(d.date).toISOString().slice(0, 10);
          map[k] = (map[k] || 0) + (d.contributions || 0);
        }
      });
      setActivity(map);
    } catch {
      setError("No GitHub data found. Go to Profile and sync your GitHub account first.");
    } finally { setLoading(false); }
  }

  const s = stats;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {error && (
        <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--warning)" }}>
          <AlertCircle size={15} /> {error}
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
        <StatCard icon={Zap}            label="Contributions" value={s?.totalContributions} color={GH_COLOR} />
        <StatCard icon={GitCommit}      label="Commits"       value={s?.totalCommits}       color="#22C55E" />
        <StatCard icon={BookOpen}       label="Repositories"  value={s?.totalRepos}         color="#3B82F6" />
        <StatCard icon={Star}           label="Stars"         value={s?.totalStars}         color="#F59E0B" />
        <StatCard icon={GitPullRequest} label="Pull Requests" value={s?.totalPRs}           color="#8B5CF6" />
        <StatCard icon={AlertCircle}    label="Issues"        value={s?.totalIssues}        color="#EF4444" />
        <StatCard icon={Users}          label="Followers"     value={s?.followers}          color="#EC4899" sub={s?.following != null ? "Following: " + s.following : null} />
        <StatCard icon={Flame}          label="Streak"        value={s?.currentStreak != null ? s.currentStreak + "d" : null} color="var(--warning)" sub={s?.maxStreak != null ? "Max: " + s.maxStreak + "d" : null} />
        <StatCard icon={GitBranch}      label="Active Days"   value={s?.totalActiveDays}    color="#14B8A6" />
      </motion.div>

      {loading && (
        <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <SkeletonBox height={120} />
          <SkeletonBox height={200} />
        </motion.div>
      )}

      {/* Contribution Heatmap */}
      {!loading && (
        <motion.div variants={fadeUp} style={{ marginBottom: "var(--space-4)" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
              <div>
                <p style={{ fontSize: "var(--text-xs)", color: GH_COLOR, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 2 }}>GitHub</p>
                <h6 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>Contribution Heatmap</h6>
              </div>
              {s?.totalContributions != null && (
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 600 }}>
                  {s.totalContributions} total
                </span>
              )}
            </div>
            {Object.keys(activity).length > 0
              ? <HeatMap data={activity} weeks={36} label="contributions" color={GH_COLOR} />
              : <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-8) 0" }}>No contribution data. Sync GitHub first.</p>
            }
          </Card>
        </motion.div>
      )}

      {/* Language Breakdown */}
      {!loading && (
        <motion.div variants={fadeUp}>
          <Card>
            <div style={{ marginBottom: "var(--space-4)" }}>
              <p style={{ fontSize: "var(--text-xs)", color: GH_COLOR, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 2 }}>GitHub</p>
              <h6 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>Languages</h6>
            </div>
            {languages.length > 0
              ? <LanguageBar languages={languages} />
              : <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center", padding: "var(--space-6) 0" }}>No language data. Sync GitHub first.</p>
            }
          </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
