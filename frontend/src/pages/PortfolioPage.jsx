import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink, Globe,
  Briefcase, GraduationCap, Trophy, BookOpen,
  Star, Flame, Zap, MapPin, Calendar, Users,
  GitCommit, GitPullRequest, AlertCircle, LayoutDashboard, LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PlatformBadge from '../components/shared/PlatformBadge';
import { PageSpinner } from '../components/ui/Spinner';
import { portfolioApi } from '../api/portfolio.api';

const TABS = ['Overview', 'CP Stats', 'GitHub', 'Projects', 'Experience', 'Education', 'Achievements'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PC = { CODEFORCES: '#1C86EE', LEETCODE: '#FFA116', CODECHEF: '#945ACF', ATCODER: '#00C0C0', GEEKSFORGEEKS: '#2F8D46' };
const SI = { github: Globe, linkedin: Globe, twitter: Globe, website: Globe };
const LD = { JavaScript: '#F1E05A', TypeScript: '#3178C6', Python: '#3572A5', Java: '#B07219', 'C++': '#F34B7D', C: '#555', Go: '#00ADD8', Rust: '#DEA584' };

function fmtPeriod(sm, sy, em, ey, isCurrent) {
  const s = sm ? MONTHS[sm - 1] + ' ' + sy : (sy || '');
  const e = isCurrent ? 'Present' : ey ? (em ? MONTHS[em - 1] + ' ' + ey : String(ey)) : 'Present';
  return s + ' \u2013 ' + e;
}

function Stat({ label, value, color, icon: Icon }) {
  const c = color || '#6366f1';
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', textAlign: 'center' }}>
      {Icon && <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}><Icon size={15} color={c} /></div>}
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: c, lineHeight: 1, marginBottom: 5 }}>{value ?? '\u2014'}</p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  );
}

function SecTitle({ children }) {
  return <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border)' }}>{children}</h5>;
}

function Empty({ msg }) {
  return <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontStyle: 'italic', paddingTop: 'var(--space-4)' }}>{msg}</p>;
}

function PortfolioNavbar() {
  const { user, logout } = useAuth();
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 64,
      zIndex: 100, background: 'rgba(13,13,13,0.96)',
      backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--space-6)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={14} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Code<span style={{ color: 'var(--accent)' }}>Pilot</span></span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <LayoutDashboard size={13} /> Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                {(user.fullName || user.username || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{user.username}</span>
              <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }} title="Logout"><LogOut size={13} /></button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--radius-md)' }}>Sign in</Link>
            <Link to="/register" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent)' }}>Get Started</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default function PortfolioPage() {
  const { username } = useParams();
  const { user, logout } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState(0);

  useEffect(() => {
    document.title = username + ' \u2014 CodePilot Portfolio';
    portfolioApi.getByUsername(username)
      .then(r  => setData(r.data?.data))
      .catch(e => setError(e.response?.data?.message || 'Portfolio not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <><PortfolioNavbar /><PageSpinner message={'Loading ' + username + "'s portfolio\u2026"} /></>;

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <PortfolioNavbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 14, textAlign: 'center', padding: 24 }}>
        <AlertCircle size={40} color="var(--accent)" />
        <h3 style={{ fontFamily: 'var(--font-heading)' }}>Portfolio not found</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>\u2190 Back to home</Link>
      </div>
    </div>
  );

  const profile      = data?.profile     || {};
  const platforms    = data?.codingPlatformStats || [];
  const projects     = data?.projects    || [];
  const education    = data?.educations  || [];
  const experience   = data?.experiences || [];
  const achievements = data?.achievements || [];
  const gh           = data?.githubStats;
  const ghLangs      = data?.githubLanguages || [];
  const badges       = data?.platformBadges  || [];
  const topicStats   = (data?.topicStats || []).filter(t => !t.topic?.startsWith('rating:'));
  const summary      = data?.summary || {};
  const socialLinks  = data?.socialLinks || [];
  const nameDisplay  = data?.fullName || username;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <PortfolioNavbar />

      {/* HERO */}
      <div style={{ paddingTop: 64, borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ padding: 'var(--space-10) var(--space-6) 0', maxWidth: 1100 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>

            {/* Avatar */}
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--accent-muted)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--accent)', flexShrink: 0, overflow: 'hidden' }}>
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={nameDisplay} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (nameDisplay || 'U')[0].toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>{nameDisplay}</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 8 }}>@{username}</p>
              {profile?.bio && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 520, lineHeight: 1.7, marginBottom: 10 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {profile?.country && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {profile.country}</span>}
                {data?.createdAt && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> Joined {new Date(data.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>}
                {profile?.profileViews > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {profile.profileViews} views</span>}
              </div>
              {platforms.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {platforms.map((p, i) => <PlatformBadge key={i} platform={p.platform} username={p.handle} rating={p.rating} />)}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {profile?.githubUsername && (
                  <a href={'https://github.com/' + profile.githubUsername} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#22C55E15', border: '1px solid #22C55E40', borderRadius: 'var(--radius-full)', color: '#22C55E', textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>
                    <Globe size={11} />
                    GitHub
                  </a>
                )}
                {socialLinks.map(s => {
                  const platformName = s.platform ? s.platform.charAt(0).toUpperCase() + s.platform.slice(1).toLowerCase() : 'Link';
                  const platformColors = { linkedin: ['#0A66C2', '#0A66C215', '#0A66C240'], twitter: ['#1DA1F2', '#1DA1F215', '#1DA1F240'], website: ['var(--accent)', 'var(--accent-muted)', 'var(--border)'] };
                  const [textColor, bg, border] = platformColors[s.platform?.toLowerCase()] || ['var(--accent)', 'var(--accent-muted)', 'var(--border)'];
                  return s.url ? (
                    <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: bg, border: '1px solid ' + border, borderRadius: 'var(--radius-full)', color: textColor, textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>
                      <Globe size={11} />
                      {platformName}
                    </a>
                  ) : null;
                })}
              </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Problems', value: summary.totalSolved,   color: 'var(--accent)' },
                { label: 'Contests', value: summary.totalContests, color: '#F59E0B' },
                { label: 'Projects', value: summary.totalProjects, color: '#8B5CF6' },
                { label: 'Badges',   value: summary.totalBadges,   color: '#EC4899' },
              ].filter(x => x.value > 0).map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color }}>{value}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)',
                marginBottom: -1, transition: 'color 0.15s',
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)', maxWidth: 1100 }}>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>

          {/* OVERVIEW */}
          {tab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {platforms.length > 0 && (
                <div>
                  <SecTitle>Competitive Programming</SecTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 'var(--space-3)' }}>
                    {platforms.map((p, i) => (
                      <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '3px solid ' + (PC[p.platform] || 'var(--accent)'), borderRadius: 'var(--radius-lg)', padding: '12px 14px' }}>
                        <p style={{ fontSize: 10, color: PC[p.platform] || 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{p.platform}</p>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>{p.rating ?? '\u2014'}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rating \u00b7 Max {p.maxRating ?? '\u2014'}</p>
                        {p.totalSolved > 0 && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{p.totalSolved} solved</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {gh && (
                <div>
                  <SecTitle>GitHub</SecTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 'var(--space-3)' }}>
                    {[
                      { label: 'Contributions', value: gh.totalContributions, icon: Zap,       color: '#6E40C9' },
                      { label: 'Commits',       value: gh.totalCommits,       icon: GitCommit, color: '#22C55E' },
                      { label: 'Repos',         value: gh.totalRepos,         icon: BookOpen,  color: '#3B82F6' },
                      { label: 'Followers',     value: gh.followers,          icon: Users,     color: '#EC4899' },
                      { label: 'Max Streak',    value: gh.maxStreak ? gh.maxStreak + 'd' : null, icon: Flame, color: '#F59E0B' },
                    ].filter(x => x.value != null).map(p => <Stat key={p.label} {...p} />)}
                  </div>
                </div>
              )}
              {topicStats.length > 0 && (
                <div>
                  <SecTitle>Top Topics</SecTitle>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {topicStats.slice(0, 16).map((t, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        {t.topic} <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{t.problemCount}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {badges.length > 0 && (
                <div>
                  <SecTitle>Platform Badges</SecTitle>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {badges.map((b, i) => (
                      <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {b.badgeIconUrl && <img src={b.badgeIconUrl} alt={b.badgeName} style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                        <div><p style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{b.badgeName}</p><p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.platform}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CP STATS */}
          {tab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {platforms.length === 0 ? <Empty msg="No competitive programming stats synced yet." /> : platforms.map((p, pi) => (
                <div key={pi}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PC[p.platform] || 'var(--accent)', flexShrink: 0 }} />
                    <h6 style={{ fontFamily: 'var(--font-heading)', color: PC[p.platform] || 'var(--accent)', fontWeight: 700 }}>{p.platform}</h6>
                    {p.handle && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>@{p.handle}</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    {[
                      { label: 'Rating',       value: p.rating,        color: PC[p.platform] },
                      { label: 'Max Rating',   value: p.maxRating,     color: '#F59E0B' },
                      { label: 'Rank',         value: p.rank },
                      { label: 'Total Solved', value: p.totalSolved,   color: '#22C55E' },
                      { label: 'Contests',     value: p.contestsCount, color: '#8B5CF6' },
                      { label: 'Max Streak',   value: p.maxStreak ? p.maxStreak + 'd' : null, color: '#F59E0B' },
                    ].filter(x => x.value != null).map(({ label, value, color }) => (
                      <div key={label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color: color || 'var(--text-primary)' }}>{value}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  {p.platform === 'LEETCODE' && (p.easySolved || p.mediumSolved || p.hardSolved) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-3)' }}>
                      {[['Easy', p.easySolved, '#22C55E'], ['Medium', p.mediumSolved, '#F59E0B'], ['Hard', p.hardSolved, '#EF4444']].map(([d, c, col]) => (
                        <div key={d} style={{ background: col + '15', border: '1px solid ' + col + '30', borderRadius: 'var(--radius-lg)', padding: 12, textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: col }}>{c ?? '\u2014'}</p>
                          <p style={{ fontSize: 10, color: col, fontWeight: 700, textTransform: 'uppercase' }}>{d}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {pi < platforms.length - 1 && <div style={{ height: 1, background: 'var(--border)', marginTop: 'var(--space-6)' }} />}
                </div>
              ))}
            </div>
          )}

          {/* GITHUB */}
          {tab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {!gh ? <Empty msg="No GitHub stats synced yet." /> : <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 'var(--space-3)' }}>
                  {[
                    { label: 'Contributions', value: gh.totalContributions, icon: Zap,            color: '#6E40C9' },
                    { label: 'Commits',       value: gh.totalCommits,       icon: GitCommit,      color: '#22C55E' },
                    { label: 'Repos',         value: gh.totalRepos,         icon: BookOpen,       color: '#3B82F6' },
                    { label: 'Stars',         value: gh.totalStars,         icon: Star,           color: '#F59E0B' },
                    { label: 'Pull Requests', value: gh.totalPRs,           icon: GitPullRequest, color: '#8B5CF6' },
                    { label: 'Issues',        value: gh.totalIssues,        icon: AlertCircle,    color: '#EF4444' },
                    { label: 'Followers',     value: gh.followers,          icon: Users,          color: '#EC4899' },
                    { label: 'Active Days',   value: gh.totalActiveDays,    icon: Calendar,       color: '#14B8A6' },
                    { label: 'Max Streak',    value: gh.maxStreak ? gh.maxStreak + 'd' : null, icon: Flame, color: '#F59E0B' },
                  ].filter(x => x.value != null).map(p => <Stat key={p.label} {...p} />)}
                </div>
                {ghLangs.length > 0 && (
                  <Card>
                    <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', marginBottom: 12 }}>Languages</h6>
                    <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 14, gap: 2 }}>
                      {ghLangs.slice(0, 8).map((l, i) => { const c = l.color || LD[l.language] || '#8B949E'; return <div key={i} title={l.language + ': ' + l.percentage + '%'} style={{ flex: l.percentage, background: c, minWidth: 4 }} />; })}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '8px 16px' }}>
                      {ghLangs.slice(0, 8).map((l, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color || LD[l.language] || '#8B949E', flexShrink: 0 }} />
                          <span style={{ fontSize: 'var(--text-sm)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.language}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{l.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>}
            </div>
          )}

          {/* PROJECTS */}
          {tab === 3 && (
            projects.length === 0 ? <Empty msg="No projects listed." /> :
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 'var(--space-4)' }}>
              {projects.map((p, i) => (
                <Card key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.thumbnailUrl && <img src={p.thumbnailUrl} alt={p.title} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h6 style={{ fontFamily: 'var(--font-heading)', flex: 1 }}>{p.title}</h6>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><Globe size={14} /></a>}
                      {p.liveUrl   && <a href={p.liveUrl}   target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><ExternalLink size={14} /></a>}
                    </div>
                  </div>
                  {p.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>{p.description}</p>}
                  {p.techStack?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{p.techStack.map((t, ti) => <Badge key={ti}>{t}</Badge>)}</div>}
                </Card>
              ))}
            </div>
          )}

          {/* EXPERIENCE */}
          {tab === 4 && (
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {experience.length === 0 ? <Empty msg="No experience listed." /> : experience.map((e, i) => (
                <Card key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 42, height: 42, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={17} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h6 style={{ fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{e.jobTitle}</h6>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>{e.company}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: e.description ? 8 : 0 }}>
                      {fmtPeriod(e.startMonth, e.startYear, e.endMonth, e.endYear, e.isCurrent)}
                    </p>
                    {e.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{e.description}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* EDUCATION */}
          {tab === 5 && (
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {education.length === 0 ? <Empty msg="No education listed." /> : education.map((e, i) => (
                <Card key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 42, height: 42, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={17} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h6 style={{ fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{e.instituteName}</h6>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>{e.degree}{e.branch ? ' \u00b7 ' + e.branch : ''}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{e.startYear} {'–'} {e.graduationYear || 'Present'}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {tab === 6 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: 'var(--space-4)' }}>
              {achievements.length === 0 ? <Empty msg="No achievements listed." /> : achievements.map((a, i) => (
                <Card key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: '#F59E0B20', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Trophy size={15} color="#F59E0B" />
                    </div>
                    <h6 style={{ fontFamily: 'var(--font-heading)', flex: 1 }}>{a.title}</h6>
                  </div>
                  {a.issuer && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700 }}>{a.issuer}</p>}
                  {a.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{a.description}</p>}
                  {(a.issueMonth || a.issueYear) && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {a.issueMonth ? MONTHS[a.issueMonth - 1] + ' ' : ''}{a.issueYear}
                    </p>
                  )}
                  {a.certificateUrl && (
                    <a href={a.certificateUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                      View Certificate <ExternalLink size={10} />
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
