import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw, TrendingUp, Code2, GitBranch, Briefcase,
  CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { SkeletonBox } from "../components/ui/Spinner";
import RatingLineChart from "../components/charts/RatingLineChart";
import { careerApi } from "../api/career.api";
import { useToast } from "../hooks/useToast";

function scoreGrade(s) {
  if (s >= 85) return { label: "Excellent", color: "#22C55E" };
  if (s >= 70) return { label: "Good",      color: "#3B82F6" };
  if (s >= 50) return { label: "Average",   color: "#F59E0B" };
  return             { label: "Needs Work", color: "#EF4444" };
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ProgressBar({ label, value, max, color }) {
  const c   = color || "var(--accent)";
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "var(--text-xs)", color: c, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 99 }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: c, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function ProgressRing({ score, label, color, size }) {
  const s0    = score || 0;
  const sz    = size  || 130;
  const c     = color || "var(--accent)";
  const r     = 50;
  const circ  = 2 * Math.PI * r;
  const grade = scoreGrade(s0);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: sz, height: sz }}>
        <svg width={sz} height={sz} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={c} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (s0 / 100) * circ}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, color: c, lineHeight: 1 }}>{Math.round(s0)}</p>
          <p style={{ fontSize: 10, color: "var(--text-muted)" }}>/100</p>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)" }}>{label}</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: grade.color, background: grade.color + "20", padding: "2px 8px", borderRadius: 99 }}>{grade.label}</span>
      </div>
    </div>
  );
}

function parseDSA(dsa) {
  const d = dsa || {};
  const items = [];
  if (d.problemsSolved)       items.push({ label: "Problems Solved (" + (d.problemsSolved.value || 0) + ")", value: d.problemsSolved.points, max: d.problemsSolved.maxPoints });
  if (d.ratingLevel)          items.push({ label: "Rating Level (max " + (d.ratingLevel.maxRating || 0) + ")", value: d.ratingLevel.points, max: d.ratingLevel.maxPoints });
  if (d.contestParticipation) items.push({ label: "Contests (" + (d.contestParticipation.totalContests || 0) + ")", value: d.contestParticipation.points, max: d.contestParticipation.maxPoints });
  if (d.topicCoverage)        items.push({ label: "Topics Covered (" + (d.topicCoverage.distinctTopics || 0) + ")", value: d.topicCoverage.points, max: d.topicCoverage.maxPoints });
  if (d.difficultyDistribution) {
    const dd = d.difficultyDistribution;
    items.push({ label: "Difficulty Mix (E:" + (dd.easy||0) + " M:" + (dd.medium||0) + " H:" + (dd.hard||0) + ")", value: dd.points, max: dd.maxPoints });
  }
  return items;
}

function parseDev(dev) {
  const d = dev || {};
  const items = [];
  if (d.contributions) items.push({ label: "GitHub Contributions (" + (d.contributions.value || 0) + ")", value: d.contributions.points, max: d.contributions.maxPoints });
  if (d.repositories)  items.push({ label: "Repositories (" + (d.repositories.value || 0) + ")", value: d.repositories.points, max: d.repositories.maxPoints });
  if (d.activity)      items.push({ label: "Activity — Commits:" + (d.activity.commits || 0) + " PRs:" + (d.activity.prs || 0), value: d.activity.points, max: d.activity.maxPoints });
  if (d.projects)      items.push({ label: "Projects (" + (d.projects.value || 0) + ")", value: d.projects.points, max: d.projects.maxPoints });
  if (d.streak)        items.push({ label: "Current Streak (" + (d.streak.value || 0) + " days)", value: d.streak.points, max: d.streak.maxPoints });
  return items;
}

function parsePortfolio(port) {
  const p = port || {};
  const items = [];
  if (p.profileBasics) {
    const pb = p.profileBasics;
    const flags = [pb.hasBio && "Bio", pb.hasAvatar && "Avatar", pb.hasCountry && "Country"].filter(Boolean).join(", ");
    items.push({ label: "Profile Basics (" + (flags || "incomplete") + ")", value: pb.points, max: pb.maxPoints });
  }
  if (p.education)    items.push({ label: "Education (" + (p.education.count || 0) + " entry)", value: p.education.points, max: p.education.maxPoints });
  if (p.projects)     items.push({ label: "Projects (" + (p.projects.count || 0) + ")", value: p.projects.points, max: p.projects.maxPoints });
  if (p.achievements) items.push({ label: "Achievements (" + (p.achievements.count || 0) + ")", value: p.achievements.points, max: p.achievements.maxPoints });
  if (p.socialLinks)  items.push({ label: "Social Links (" + (p.socialLinks.count || 0) + ")", value: p.socialLinks.points, max: p.socialLinks.maxPoints });
  return items;
}

function buildTips(bd) {
  const tips = [];
  const dsa  = bd.dsa         || {};
  const dev  = bd.development || {};
  const port = bd.portfolio   || {};
  if ((dsa.problemsSolved?.value        || 0) < 300)  tips.push({ Icon: Code2,      color: "#1C86EE", text: "Solve more problems — aim for 300+ for max DSA score" });
  if ((dsa.contestParticipation?.totalContests || 0) < 20) tips.push({ Icon: TrendingUp, color: "#F59E0B", text: "Participate in more contests — 20+ gives full points" });
  if ((dsa.topicCoverage?.distinctTopics || 0) < 30)  tips.push({ Icon: CheckCircle, color: "#22C55E", text: "Cover at least 30 distinct algorithm topics" });
  if ((dev.streak?.value                || 0) === 0)  tips.push({ Icon: GitBranch,   color: "#8B5CF6", text: "Build a GitHub streak — even 7 days earns meaningful points" });
  if ((dev.contributions?.value         || 0) < 50)   tips.push({ Icon: GitBranch,   color: "#22C55E", text: "Increase GitHub contributions — aim for 50+ per year" });
  if (!port.profileBasics?.hasAvatar)                 tips.push({ Icon: Briefcase,   color: "#EC4899", text: "Add a profile avatar to complete portfolio basics" });
  if ((port.projects?.count             || 0) < 3)    tips.push({ Icon: Briefcase,   color: "#F59E0B", text: "Add more projects — 3+ gives full portfolio points" });
  if ((port.socialLinks?.count          || 0) < 3)    tips.push({ Icon: Briefcase,   color: "#3B82F6", text: "Add more social links (GitHub, LinkedIn, Website)" });
  return tips.slice(0, 5);
}

function SectionCard({ title, Icon, color, items, totalScore, maxScore }) {
  const [open, setOpen] = useState(true);
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  return (
    <Card style={{ marginBottom: "var(--space-4)" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: open ? "var(--space-4)" : 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} color={color} />
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{title}</p>
          <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 99, width: 180 }}>
            <div style={{ height: "100%", background: color, borderRadius: 99, width: pct + "%", transition: "width 1s" }} />
          </div>
        </div>
        <div style={{ textAlign: "right", marginRight: 8 }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xl)", fontWeight: 800, color }}>{totalScore}</p>
          <p style={{ fontSize: 10, color: "var(--text-muted)" }}>/{maxScore} pts</p>
        </div>
        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
          {items.map((item, i) => <ProgressBar key={i} label={item.label} value={item.value} max={item.max} color={color} />)}
        </div>
      )}
    </Card>
  );
}

export default function CareerPage() {
  const [data,       setData]       = useState(null);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null); // timestamp of last recalculate
  const toast = useToast();

  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    document.title = "Career Readiness — CodePilot";
    loadData();
  }, []);

  async function loadData(force) {
    // Enforce cooldown on forced recalculate
    if (force && lastRefresh) {
      const elapsed = Date.now() - lastRefresh;
      if (elapsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        toast.error("Please wait " + (mins > 0 ? mins + "m " : "") + secs + "s before recalculating again");
        return;
      }
    }

    force ? setRefreshing(true) : setLoading(true);
    try {
      // Run both in parallel, but handle errors individually
      const [readRes, histRes] = await Promise.allSettled([
        careerApi.getReadiness(!!force),
        careerApi.getReadinessHistory(15),
      ]);

      if (readRes.status === "fulfilled") {
        setData(readRes.value.data?.data);
        if (force) {
          setLastRefresh(Date.now());
          toast.success("Career readiness recalculated!");
        }
      } else {
        // Surface the actual error
        const msg = readRes.reason?.response?.data?.message || readRes.reason?.message || "Failed to recalculate";
        toast.error(msg);
      }

      if (histRes.status === "fulfilled") {
        setHistory(histRes.value.data?.data || []);
      }
    } catch (err) {
      toast.error("Failed to load career readiness");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }

  const bd       = data?.breakdown || {};
  const dsaItems  = parseDSA(bd.dsa);
  const devItems  = parseDev(bd.development);
  const portItems = parsePortfolio(bd.portfolio);
  const tips      = data ? buildTips(bd) : [];
  const overall   = data?.overallScore || 0;
  const grade     = scoreGrade(overall);

  const dsaMax  = dsaItems.reduce((s, i) => s + (i.max || 0), 0);
  const devMax  = devItems.reduce((s, i) => s + (i.max || 0), 0);
  const portMax = portItems.reduce((s, i) => s + (i.max || 0), 0);

  const histChart = [...history].reverse().map(h => ({
    date:        new Date(h.computedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    overall:     h.overallScore     || 0,
    dsa:         h.dsaScore         || 0,
    development: h.developmentScore || 0,
    portfolio:   h.portfolioScore   || 0,
  }));

  const overallR = 68;
  const overallCirc = 2 * Math.PI * overallR;

  return (
    <PageWrapper title="Career Readiness">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Career <span style={{ color: "var(--accent)" }}>Readiness</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            How ready are you for placement?
            {data && <span style={{ marginLeft: 8 }}>Last updated {fmtDate(data.computedAt)}</span>}
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} loading={refreshing} onClick={() => loadData(true)}>
          Recalculate
        </Button>
      </div>

      {/* Score Hero */}
      <Card style={{ marginBottom: "var(--space-5)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-10)", padding: "var(--space-8)", flexWrap: "wrap" }}>
            {[1,2,3,4].map(i => <SkeletonBox key={i} width={130} height={130} style={{ borderRadius: "50%" }} />)}
          </div>
        ) : data ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)" }}>
            {/* Overall ring */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Overall Score</p>
              <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 10px" }}>
                <svg width={160} height={160} viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r={overallR} fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
                  <circle cx="80" cy="80" r={overallR} fill="none" stroke={grade.color} strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={overallCirc}
                    strokeDashoffset={overallCirc * (1 - overall / 100)}
                    transform="rotate(-90 80 80)"
                    style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 900, color: grade.color, lineHeight: 1 }}>{Math.round(overall)}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>/100</p>
                </div>
              </div>
              <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 99, background: grade.color + "22", color: grade.color, fontWeight: 700, fontSize: "var(--text-sm)" }}>
                {grade.label}
              </span>
            </div>

            {/* 3 category rings */}
            <div style={{ display: "flex", gap: "var(--space-10)", flexWrap: "wrap", justifyContent: "center", paddingTop: 16, borderTop: "1px solid var(--border)", width: "100%" }}>
              {[
                { label: "DSA",         score: data.dsaScore         || 0, color: "#1C86EE" },
                { label: "Development", score: data.developmentScore || 0, color: "#22C55E" },
                { label: "Portfolio",   score: data.portfolioScore   || 0, color: "#8B5CF6" },
              ].map(s => (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                  <ProgressRing score={s.score} label={s.label} color={s.color} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "var(--space-12)", color: "var(--text-muted)" }}>
            <TrendingUp size={40} style={{ margin: "0 auto var(--space-4)" }} />
            <p>No data yet. Click <strong>Recalculate</strong> to compute your score.</p>
          </div>
        )}
      </Card>

      {/* Breakdown */}
      {data?.breakdown && (
        <>
          <h5 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-secondary)" }}>
            Score Breakdown
          </h5>
          <SectionCard title="DSA & Competitive Programming" Icon={Code2}      color="#1C86EE" items={dsaItems}  totalScore={data.dsaScore         || 0} maxScore={dsaMax  || 100} />
          <SectionCard title="Development & GitHub Activity"  Icon={GitBranch} color="#22C55E" items={devItems}  totalScore={data.developmentScore || 0} maxScore={devMax  || 100} />
          <SectionCard title="Portfolio & Profile"            Icon={Briefcase} color="#8B5CF6" items={portItems} totalScore={data.portfolioScore   || 0} maxScore={portMax || 100} />
        </>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <Card style={{ marginBottom: "var(--space-5)" }}>
          <h5 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} color="#F59E0B" /> How to Improve Your Score
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", borderLeft: "3px solid " + tip.color }}>
                <tip.Icon size={14} color={tip.color} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.5 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* History Chart */}
      {histChart.length >= 2 && (
        <Card style={{ marginBottom: "var(--space-4)" }}>
          <h5 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={15} color="var(--text-muted)" /> Score History
          </h5>
          <RatingLineChart
            data={histChart}
            lines={[
              { key: "overall",     label: "Overall",     color: "var(--accent)" },
              { key: "dsa",         label: "DSA",         color: "#1C86EE" },
              { key: "development", label: "Development", color: "#22C55E" },
              { key: "portfolio",   label: "Portfolio",   color: "#8B5CF6" },
            ]}
            height={220}
            use3D={false}
          />
        </Card>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <Card>
          <h5 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={15} color="var(--text-muted)" /> History Log
          </h5>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Overall", "DSA", "Development", "Portfolio"].map(h => (
                    <th key={h} style={{ textAlign: h === "Date" ? "left" : "center", padding: "6px 12px", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const g = scoreGrade(h.overallScore);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i === 0 ? "var(--bg-elevated)" : "transparent" }}>
                      <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>
                        {fmtDate(h.computedAt)}
                        {i === 0 && <span style={{ marginLeft: 6, fontSize: 10, background: "var(--accent)", color: "#fff", borderRadius: 99, padding: "1px 6px" }}>Latest</span>}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: g.color }}>{Math.round(h.overallScore)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", color: "#1C86EE", fontWeight: 600 }}>{Math.round(h.dsaScore)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", color: "#22C55E", fontWeight: 600 }}>{Math.round(h.developmentScore)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", color: "#8B5CF6", fontWeight: 600 }}>{Math.round(h.portfolioScore)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}
