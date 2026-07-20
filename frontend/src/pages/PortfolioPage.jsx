import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Briefcase, GraduationCap, Trophy } from 'lucide-react';
import { PublicNavbar } from '../components/layout/Navbar';
import Toast from '../components/shared/Toast';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PlatformBadge from '../components/shared/PlatformBadge';
import { PageSpinner } from '../components/ui/Spinner';
import { portfolioApi } from '../api/portfolio.api';
import { formatDate } from '../utils/formatters';

const TABS = ['Overview', 'Projects', 'Experience', 'Education', 'Achievements'];

const socialIcons = {
  github:   Globe,
  linkedin: Globe,
  twitter:  Globe,
  website:  Globe,
};

export default function PortfolioPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    document.title = `${username} — CodePilot Portfolio`;
    portfolioApi.getByUsername(username)
      .then((res) => setData(res.data?.data))
      .catch((e) => setError(e.response?.data?.message || 'Portfolio not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <><PublicNavbar /><PageSpinner message={`Loading ${username}'s portfolio…`} /></>;
  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <PublicNavbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 16, textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Portfolio not found</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back to home</Link>
      </div>
    </div>
  );

  const user = data?.user || data;
  const profile = user?.profile || {};
  const platforms = data?.codingPlatformStats || data?.platforms || [];
  const projects = data?.projects || [];
  const education = data?.educations || data?.education || [];
  const experience = data?.experiences || data?.experience || [];
  const achievements = data?.achievements || [];

  const socialList = Array.isArray(data?.socialLinks)
    ? data.socialLinks.map((s) => [s.platform, s.url])
    : Object.entries(data?.socialLinks || {});

  const avatarSrc = profile?.avatarUrl || user?.avatar;
  const nameDisplay = user?.fullName || user?.name || username;
  const bioDisplay = profile?.bio || user?.bio;

  const cfStat = platforms.find((p) => p.platform === 'CODEFORCES');
  const lcStat = platforms.find((p) => p.platform === 'LEETCODE');
  const totalSolvedVal = data?.summary?.totalSolved ?? data?.totalSolved;
  const contestCountVal = data?.summary?.totalContests ?? data?.contestCount;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <PublicNavbar />
      <Toast />

      {/* Hero */}
      <div style={{ paddingTop: 80, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)', flexWrap: 'wrap' }}
          >
            {/* Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'var(--accent-muted)', border: '3px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--accent)',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {avatarSrc
                ? <img src={avatarSrc} alt={nameDisplay} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (nameDisplay || 'U')[0].toUpperCase()
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                {nameDisplay}
              </h1>
              {bioDisplay && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>{bioDisplay}</p>
              )}

              {/* Platform Ratings */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-4)' }}>
                {platforms.map((p, i) => (
                  <PlatformBadge key={i} platform={p.platform} username={p.handle} rating={p.rating} />
                ))}
              </div>

              {/* Social Links */}
              <div style={{ display: 'flex', gap: 10 }}>
                {socialList.map(([key, url]) => {
                  const Icon = socialIcons[key] || Globe;
                  return url ? (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ width: 32, height: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--transition-fast), border-color var(--transition-fast)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <Icon size={14} />
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: 'var(--space-8)', borderBottom: '1px solid var(--border)' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: '10px 20px',
                background: 'none', border: 'none',
                borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontWeight: 600,
                fontSize: 'var(--text-sm)', cursor: 'pointer',
                transition: 'color var(--transition-fast)',
                marginBottom: -1,
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: 900 }}>
              {[{ label: 'Total Problems', value: totalSolvedVal }, { label: 'Contests', value: contestCountVal },
                { label: 'CF Rating', value: cfStat?.rating }, { label: 'LC Rating', value: lcStat?.rating }]
                .filter(x => x.value != null)
                .map(({ label, value }) => (
                  <Card key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--accent)' }}>{value}</p>
                  </Card>
                ))
              }
            </div>
          )}

          {tab === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {projects.length > 0 ? projects.map((p, i) => (
                <Card key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h6 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{p.title}</h6>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><ExternalLink size={14} /></a>}
                  </div>
                  {p.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>{p.description}</p>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(p.techStack || p.tech || []).map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                </Card>
              )) : <p style={{ color: 'var(--text-muted)' }}>No projects listed.</p>}
            </div>
          )}

          {tab === 2 && (
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {experience.length > 0 ? experience.map((e, i) => (
                <Card key={i}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={18} color="var(--text-muted)" />
                    </div>
                    <div>
                      <h6 style={{ fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{e.role}</h6>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{e.company}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatDate(e.startDate)} — {e.endDate ? formatDate(e.endDate) : 'Present'}</p>
                      {e.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>{e.description}</p>}
                    </div>
                  </div>
                </Card>
              )) : <p style={{ color: 'var(--text-muted)' }}>No experience listed.</p>}
            </div>
          )}

          {tab === 3 && (
            <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {education.length > 0 ? education.map((e, i) => (
                <Card key={i}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap size={18} color="var(--text-muted)" />
                    </div>
                    <div>
                      <h6 style={{ fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{e.institution}</h6>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{e.degree} {e.field ? `in ${e.field}` : ''}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatDate(e.startDate)} — {e.endDate ? formatDate(e.endDate) : 'Present'}</p>
                    </div>
                  </div>
                </Card>
              )) : <p style={{ color: 'var(--text-muted)' }}>No education listed.</p>}
            </div>
          )}

          {tab === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {achievements.length > 0 ? achievements.map((a, i) => (
                <Card key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Trophy size={18} color="var(--warning)" />
                    <h6 style={{ fontFamily: 'var(--font-heading)' }}>{a.title}</h6>
                  </div>
                  {a.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{a.description}</p>}
                  {a.date && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>{formatDate(a.date)}</p>}
                </Card>
              )) : <p style={{ color: 'var(--text-muted)' }}>No achievements listed.</p>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
