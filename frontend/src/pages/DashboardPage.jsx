import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, GitBranch } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import CodeforcesPanel from "../components/shared/CodeforcesPanel";
import LeetCodePanel from "../components/shared/LeetCodePanel";
import GitHubPanel from "../components/shared/GitHubPanel";
import { useAnalytics } from "../hooks/useAnalytics";
import { useAuthStore } from "../store/authStore";

// Tab helper
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: 4, width: "fit-content" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 16px", borderRadius: "var(--radius-md)",
            border: "none", cursor: "pointer",
            fontSize: "var(--text-sm)", fontWeight: 600,
            transition: "all var(--transition-fast)",
            background: active === t.id ? "var(--bg-card)" : "transparent",
            color:      active === t.id ? "var(--text-primary)" : "var(--text-muted)",
            boxShadow:  active === t.id ? "var(--shadow-sm)" : "none",
          }}
        >
          {t.icon && <t.icon size={15} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

const MAIN_TABS = [
  { id: "cp",  label: "CP Stats",  icon: Code2 },
  { id: "dev", label: "Dev Stats", icon: GitBranch },
];

const CP_TABS = [
  { id: "codeforces", label: "Codeforces" },
  { id: "leetcode",   label: "LeetCode"   },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { fetchDashboard, dashboard, loading } = useAnalytics();
  const [mainTab, setMainTab] = useState("cp");
  const [cpTab,   setCpTab]   = useState("codeforces");

  useEffect(() => {
    document.title = "Dashboard — CodePilot";
    fetchDashboard(true);
  }, []);

  const dash   = dashboard;
  const cfStat = dash?.platforms?.find(p => p.platform === "CODEFORCES");
  const lcStat = dash?.platforms?.find(p => p.platform === "LEETCODE");

  return (
    <PageWrapper title="Dashboard">

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Welcome back, <span style={{ color: "var(--accent)" }}>{(user?.fullName || user?.username || "Coder").split(" ")[0]}</span> 👋
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 4 }}>
          Your competitive programming command center
        </p>
      </motion.div>

      {/* Main Tab Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
        <TabBar tabs={MAIN_TABS} active={mainTab} onChange={setMainTab} />
        {mainTab === "cp" && (
          <div style={{ display: "flex", gap: 4 }}>
            {CP_TABS.map(t => (
              <button key={t.id} onClick={() => setCpTab(t.id)}
                style={{
                  padding: "6px 14px", borderRadius: "var(--radius-md)",
                  border: "1px solid " + (cpTab === t.id ? "var(--cf-color)" : "var(--border)"),
                  background: cpTab === t.id ? "rgba(28,134,238,0.12)" : "transparent",
                  color: cpTab === t.id ? "var(--cf-color)" : "var(--text-muted)",
                  fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >{t.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">

        {/* CP Stats */}
        {mainTab === "cp" && (
          <motion.div key="cp" {...fade}>
            {cpTab === "codeforces" && (
              <CodeforcesPanel
                cfPlatformStats={cfStat}
                dashSummary={dash}
                onSyncSuccess={() => fetchDashboard(true)}
              />
            )}
            {cpTab === "leetcode" && (
              <motion.div key="lc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <LeetCodePanel
                  lcPlatformStats={lcStat}
                  onSyncSuccess={() => fetchDashboard(true)}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Dev Stats — GitHub */}
        {mainTab === "dev" && (
          <motion.div key="dev" {...fade}>
            <GitHubPanel />
          </motion.div>
        )}

      </AnimatePresence>
    </PageWrapper>
  );
}
