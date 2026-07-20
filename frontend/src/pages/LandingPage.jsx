import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicNavbar } from '../components/layout/Navbar';
import Toast from '../components/shared/Toast';
import {
  BarChart3, Bot, Briefcase, BookOpen, Trophy, User,
  ArrowRight, Zap, ChevronRight,
} from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, title: 'Rating Analytics', desc: 'Track your Codeforces, LeetCode, CodeChef & AtCoder ratings over time with beautiful 3D charts.', color: '#3B82F6' },
  { icon: Bot, title: 'AI Coach', desc: 'Get personalized daily summaries, weekly plans, study plans, and contest reviews powered by Gemini AI.', color: '#FF4136' },
  { icon: BookOpen, title: 'Smart Recommendations', desc: 'Problems tailored to your weak topics and current rating — no more random grinding.', color: '#22C55E' },
  { icon: Briefcase, title: 'Career Readiness', desc: 'DSA score, development score, and portfolio score — know your placement readiness at a glance.', color: '#F59E0B' },
  { icon: Trophy, title: 'Contest Tracker', desc: 'Never miss an upcoming contest. Live updates from all major CP platforms in one timeline.', color: '#8B5CF6' },
  { icon: User, title: 'Public Portfolio', desc: 'Generate a shareable competitive programming portfolio page to impress recruiters.', color: '#EC4899' },
];

const PLATFORMS = [
  { name: 'Codeforces', color: '#1C86EE', abbr: 'CF' },
  { name: 'LeetCode',   color: '#FFA116', abbr: 'LC' },
  { name: 'CodeChef',   color: '#945ACF', abbr: 'CC' },
  { name: 'AtCoder',    color: '#00C0C0', abbr: 'AC' },
  { name: 'GitHub',     color: '#6E5494', abbr: 'GH' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  useEffect(() => { document.title = 'CodePilot — Your Competitive Programming OS'; }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      <PublicNavbar />
      <Toast />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 64,
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />

        {/* Diagonal slash */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: '55%',
          width: 6,
          background: 'var(--accent)',
          transform: 'rotate(12deg) scaleY(1.3)',
          transformOrigin: 'center',
          opacity: 0.9,
          pointerEvents: 'none',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '8%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(255,65,54,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 680 }}>
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--accent-muted)', border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-full)', padding: '5px 14px',
                fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--space-6)',
              }}>
                <Zap size={11} /> Powered by Gemini AI
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Your Personal OS<br />for{' '}
              <span style={{
                color: 'var(--accent)',
                position: 'relative',
              }}>
                Competitive<br />Programming
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                fontSize: 'var(--text-xl)', color: 'var(--text-secondary)',
                lineHeight: 1.6, marginBottom: 'var(--space-10)', maxWidth: 560,
              }}
            >
              Track ratings across all platforms, get AI-powered coaching, discover your next problem, and build a career-ready portfolio — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <Link
                to="/register"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--accent)', color: '#fff',
                  padding: '14px 28px', borderRadius: 'var(--radius-lg)',
                  fontWeight: 700, fontSize: 'var(--text-lg)', textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-accent)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = ''; }}
              >
                Connect Your Profiles <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: 'var(--text-secondary)',
                  padding: '14px 28px', borderRadius: 'var(--radius-lg)',
                  fontWeight: 600, fontSize: 'var(--text-lg)', textDecoration: 'none',
                  border: '1px solid var(--border)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            position: 'absolute', right: 'max(5%, 40px)', top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 16,
            zIndex: 2,
          }}
        >
          {[
            { n: '5+', label: 'Platforms' },
            { n: '100K+', label: 'Problems' },
            { n: 'AI', label: 'Powered' },
          ].map(({ n, label }) => (
            <div key={n} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '16px 24px', textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 'var(--text-3xl)', color: 'var(--accent)', lineHeight: 1 }}>{n}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PLATFORM MARQUEE ── */}
      <div style={{
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '20px 0', overflow: 'hidden', background: 'var(--bg-secondary)',
      }}>
        <div style={{
          display: 'flex', gap: 40,
          animation: 'marquee 18s linear infinite',
          width: 'max-content',
        }}>
          {[...PLATFORMS, ...PLATFORMS, ...PLATFORMS].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)',
                background: `${p.color}20`,
                border: `1px solid ${p.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: p.color,
              }}>{p.abbr}</span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 'var(--space-16)', maxWidth: 520 }}
          >
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--text-sm)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              EVERYTHING YOU NEED
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, letterSpacing: '-0.03em' }}>
              One platform.<br />Every edge.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={item}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                  height: '100%',
                  transition: 'border-color var(--transition-base), transform var(--transition-base)',
                  borderLeft: `3px solid ${color}`,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{title}</h5>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: 'var(--accent)', padding: 'var(--space-16) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 'var(--space-4)' }}>
              Ready to level up?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)' }}>
              Join thousands of competitive programmers tracking their progress with CodePilot.
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', color: 'var(--accent)',
                padding: '14px 32px', borderRadius: 'var(--radius-lg)',
                fontWeight: 800, fontSize: 'var(--text-lg)', textDecoration: 'none',
                transition: 'transform var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              Get Started Free <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: 'var(--space-8) var(--space-6)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 'var(--space-4)',
      }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Code<span style={{ color: 'var(--accent)' }}>Pilot</span>
        </span>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} CodePilot. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
