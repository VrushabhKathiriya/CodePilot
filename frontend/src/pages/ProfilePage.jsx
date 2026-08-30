import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Plus, Trash2, Edit3, Save, X, Globe, ChevronUp, ChevronDown,
  Briefcase, GraduationCap, Trophy, Folder, Calendar, MapPin, ExternalLink
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { userApi } from '../api/user.api';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/auth.api';

const PROFILE_TABS = ['Basic Info', 'Social Links', 'Education', 'Experience', 'Projects', 'Achievements'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtPeriod(sm, sy, em, ey, isCurrent) {
  const s = sm ? MONTHS[sm - 1] + ' ' + sy : (sy || '');
  const e = isCurrent ? 'Present' : ey ? (em ? MONTHS[em - 1] + ' ' + ey : String(ey)) : 'Present';
  if (!s && !e) return '';
  return s + ' - ' + e;
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ name: '', headline: '', bio: '', location: '' });
  const avatarRef = useRef();

  // Fetch full user profile details on mount
  useEffect(() => {
    document.title = 'Edit Profile - CodePilot';
    async function loadFullUser() {
      try {
        const res = await authApi.getMe();
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load profile details', e);
      } finally {
        setLoading(false);
      }
    }
    loadFullUser();
  }, []);

  useEffect(() => {
    if (user) {
      setInfo({
        name: user.fullName || user.name || '',
        headline: user.headline || '',
        bio: user.profile?.bio || user.bio || '',
        location: user.profile?.country || user.location || '',
      });
    }
  }, [user]);

  const refreshUser = async () => {
    try {
      const r = await authApi.getMe();
      if (r.data?.data) setUser(r.data.data);
    } catch (_) {}
  };

  async function saveInfo() {
    setSaving(true);
    try {
      await Promise.all([
        userApi.updateInfo({ fullName: info.name }),
        userApi.upsertProfile({ bio: info.bio, country: info.location }),
      ]);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await userApi.uploadAvatar(fd);
      const newAvatar = res.data?.data?.avatarUrl || res.data?.data?.avatar || res.data?.data?.url;
      setUser({
        ...user,
        avatar: newAvatar,
        profile: { ...user?.profile, avatarUrl: newAvatar },
      });
      toast.success('Avatar updated!');
    } catch (e) {
      toast.error('Failed to upload avatar');
    }
  }

  if (loading) {
    return (
      <PageWrapper title="Edit Profile">
        <PageSpinner message="Loading your profile..." />
      </PageWrapper>
    );
  }

  const avatarSrc = user?.profile?.avatarUrl || user?.avatar;
  const initialLetter = (user?.fullName || user?.name || 'U')[0]?.toUpperCase();

  const educationsList = user?.educations || user?.education || [];
  const experiencesList = user?.experiences || user?.experience || [];
  const projectsList = user?.projects || [];
  const achievementsList = user?.achievements || [];

  return (
    <PageWrapper title="Edit Profile">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Edit <span style={{ color: 'var(--accent)' }}>Profile</span>
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
          Manage your personal details, portfolio sections, and social presence.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-6)', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
        {PROFILE_TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: -1,
              transition: 'color var(--transition-fast)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {tab === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
            <Card style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto var(--space-4)' }}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'var(--accent-muted)', border: '3px solid var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--accent)' }}>
                  {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initialLetter}
                </div>
                <button
                  onClick={() => avatarRef.current?.click()}
                  style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, background: 'var(--accent)', border: '2px solid var(--bg-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Upload new avatar"
                >
                  <Camera size={15} color="#fff" />
                </button>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>Upload Profile Photo</p>
            </Card>

            <Card style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input label="Full Name" value={info.name} onChange={(e) => setInfo(p => ({ ...p, name: e.target.value }))} placeholder="Vrushabh Kathiriya" />
                  <Input label="Country / Location" value={info.location} onChange={(e) => setInfo(p => ({ ...p, location: e.target.value }))} placeholder="India" />
                </div>
                <Input label="Headline" value={info.headline} onChange={(e) => setInfo(p => ({ ...p, headline: e.target.value }))} placeholder="Backend developer passionate about system design" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    value={info.bio}
                    onChange={(e) => setInfo(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell the community about yourself, your interests, and goals..."
                    rows={4}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      padding: '10px 14px',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.6
                    }}
                  />
                </div>
                <Button onClick={saveInfo} loading={saving} icon={<Save size={16} />} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Social Links */}
      {tab === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SocialLinksSection user={user} refreshUser={refreshUser} toast={toast} />
        </motion.div>
      )}

      {/* Education */}
      {tab === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GenericListSection
            title="Education"
            icon={GraduationCap}
            items={educationsList}
            onCreate={(d) => userApi.addEducation({
              ...d,
              startYear: d.startYear ? parseInt(d.startYear) : null,
              graduationYear: d.graduationYear ? parseInt(d.graduationYear) : null,
            })}
            onUpdate={(id, d) => userApi.updateEducation(id, {
              ...d,
              startYear: d.startYear ? parseInt(d.startYear) : null,
              graduationYear: d.graduationYear ? parseInt(d.graduationYear) : null,
            })}
            onDelete={(id) => userApi.deleteEducation(id)}
            fields={[
              { key: 'instituteName', label: 'Institute / University Name', placeholder: 'Pandit Deendayal Energy University', required: true },
              { key: 'degree', label: 'Degree', placeholder: 'B.Tech', required: true },
              { key: 'branch', label: 'Branch / Major', placeholder: 'Computer Science' },
              { key: 'startYear', label: 'Start Year', type: 'number', placeholder: '2023' },
              { key: 'graduationYear', label: 'Graduation Year', type: 'number', placeholder: '2027' },
            ]}
            renderCard={(item) => (
              <div>
                <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {item.instituteName}
                </h6>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                  {item.degree}{item.branch ? ` · ${item.branch}` : ''}
                </p>
                {(item.startYear || item.graduationYear) && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {item.startYear || ''} - {item.graduationYear || 'Present'}
                  </p>
                )}
              </div>
            )}
            onRefresh={refreshUser}
            toast={toast}
          />
        </motion.div>
      )}

      {/* Experience */}
      {tab === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GenericListSection
            title="Experience"
            icon={Briefcase}
            items={experiencesList}
            onCreate={(d) => userApi.addExperience({
              ...d,
              startMonth: d.startMonth ? parseInt(d.startMonth) : null,
              startYear: d.startYear ? parseInt(d.startYear) : null,
              endMonth: d.endMonth ? parseInt(d.endMonth) : null,
              endYear: d.endYear ? parseInt(d.endYear) : null,
              isCurrent: !!d.isCurrent,
            })}
            onUpdate={(id, d) => userApi.updateExperience(id, {
              ...d,
              startMonth: d.startMonth ? parseInt(d.startMonth) : null,
              startYear: d.startYear ? parseInt(d.startYear) : null,
              endMonth: d.endMonth ? parseInt(d.endMonth) : null,
              endYear: d.endYear ? parseInt(d.endYear) : null,
              isCurrent: !!d.isCurrent,
            })}
            onDelete={(id) => userApi.deleteExperience(id)}
            fields={[
              { key: 'company', label: 'Company / Organization', placeholder: 'Splitify', required: true },
              { key: 'jobTitle', label: 'Job Title / Role', placeholder: 'Backend Developer', required: true },
              { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Key responsibilities...' },
              { key: 'startMonth', label: 'Start Month (1-12)', type: 'number', placeholder: '6' },
              { key: 'startYear', label: 'Start Year', type: 'number', placeholder: '2025' },
              { key: 'endMonth', label: 'End Month (1-12)', type: 'number', placeholder: '12' },
              { key: 'endYear', label: 'End Year', type: 'number', placeholder: '2026' },
              { key: 'isCurrent', label: 'Currently working here', type: 'checkbox' },
            ]}
            renderCard={(item) => (
              <div>
                <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {item.jobTitle}
                </h6>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                  {item.company}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: item.description ? 6 : 0 }}>
                  {fmtPeriod(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isCurrent)}
                </p>
                {item.description && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                    {item.description}
                  </p>
                )}
              </div>
            )}
            onRefresh={refreshUser}
            toast={toast}
          />
        </motion.div>
      )}

      {/* Projects */}
      {tab === 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GenericListSection
            title="Projects"
            icon={Folder}
            items={projectsList}
            onCreate={(d) => userApi.addProject({
              ...d,
              techStack: typeof d.techStack === 'string' ? d.techStack.split(',').map(t => t.trim()).filter(Boolean) : (d.techStack || []),
            })}
            onUpdate={(id, d) => userApi.updateProject(id, {
              ...d,
              techStack: typeof d.techStack === 'string' ? d.techStack.split(',').map(t => t.trim()).filter(Boolean) : (d.techStack || []),
            })}
            onDelete={(id) => userApi.deleteProject(id)}
            onReorder={(orderPayload) => userApi.reorderProjects({ order: orderPayload })}
            fields={[
              { key: 'title', label: 'Project Title', placeholder: 'CodePilot v2', required: true },
              { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Platform features...', required: true },
              { key: 'techStack', label: 'Tech Stack (comma separated)', placeholder: 'Node.js, Redis, Docker' },
              { key: 'githubUrl', label: 'GitHub Repository URL', placeholder: 'https://github.com/vrush07/codepilot-v2' },
              { key: 'liveUrl', label: 'Live Demo URL (optional)', placeholder: 'https://...' },
              { key: 'thumbnailUrl', label: 'Thumbnail Image URL (optional)', placeholder: 'https://...' },
            ]}
            renderCard={(item) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </h6>
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex' }}>
                      <Globe size={14} />
                    </a>
                  )}
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'flex' }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                {item.description && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                    {item.description}
                  </p>
                )}
                {Array.isArray(item.techStack) && item.techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.techStack.map((t, idx) => (
                      <Badge key={idx}>{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            onRefresh={refreshUser}
            toast={toast}
          />
        </motion.div>
      )}

      {/* Achievements */}
      {tab === 5 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GenericListSection
            title="Achievements"
            icon={Trophy}
            items={achievementsList}
            onCreate={(d) => userApi.addAchievement({
              ...d,
              issueMonth: d.issueMonth ? parseInt(d.issueMonth) : null,
              issueYear: d.issueYear ? parseInt(d.issueYear) : null,
            })}
            onUpdate={(id, d) => userApi.updateAchievement(id, {
              ...d,
              issueMonth: d.issueMonth ? parseInt(d.issueMonth) : null,
              issueYear: d.issueYear ? parseInt(d.issueYear) : null,
            })}
            onDelete={(id) => userApi.deleteAchievement(id)}
            fields={[
              { key: 'title', label: 'Achievement Title', placeholder: 'AWS Certified Developer', required: true },
              { key: 'issuer', label: 'Issuer / Organization', placeholder: 'Amazon' },
              { key: 'description', label: 'Description', type: 'textarea', placeholder: 'PDEU Hackathon winner' },
              { key: 'issueMonth', label: 'Issue Month (1-12)', type: 'number', placeholder: '3' },
              { key: 'issueYear', label: 'Issue Year', type: 'number', placeholder: '2025' },
              { key: 'certificateUrl', label: 'Certificate URL', placeholder: 'https://example.com/cert.pdf' },
            ]}
            renderCard={(item) => (
              <div>
                <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {item.title}
                </h6>
                {item.issuer && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                    {item.issuer}
                  </p>
                )}
                {(item.issueMonth || item.issueYear) && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
                    {item.issueMonth ? MONTHS[item.issueMonth - 1] + ' ' : ''}{item.issueYear || ''}
                  </p>
                )}
                {item.description && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                    {item.description}
                  </p>
                )}
                {item.certificateUrl && (
                  <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                    View Certificate <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}
            onRefresh={refreshUser}
            toast={toast}
          />
        </motion.div>
      )}
    </PageWrapper>
  );
}

function SocialLinksSection({ user, refreshUser, toast }) {
  const platforms = [
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
    { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
    { key: 'website', label: 'Personal Website', placeholder: 'https://yourwebsite.com' },
  ];

  const [links, setLinks] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const map = {};
    if (Array.isArray(user?.socialLinks)) {
      user.socialLinks.forEach((s) => { if (s.platform) map[s.platform.toLowerCase()] = s.url; });
    } else if (user?.socialLinks) {
      Object.keys(user.socialLinks).forEach((k) => { map[k.toLowerCase()] = user.socialLinks[k]; });
    }
    setLinks(map);
  }, [user]);

  async function save(platformKey) {
    setSaving((p) => ({ ...p, [platformKey]: true }));
    try {
      const urlVal = links[platformKey] || '';
      if (!urlVal.trim()) {
        await userApi.deleteSocialLink(platformKey);
      } else {
        await userApi.upsertSocialLink({ platform: platformKey, url: urlVal.trim() });
      }
      toast.success(platformKey + ' link updated!');
      await refreshUser();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save link');
    } finally {
      setSaving((p) => ({ ...p, [platformKey]: false }));
    }
  }

  return (
    <Card style={{ padding: 'var(--space-6)' }}>
      <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Social Links & Portfolio</h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {platforms.map((p) => (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={18} color="var(--accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label={p.label}
                placeholder={p.placeholder}
                value={links[p.key] || ''}
                onChange={(e) => setLinks((prev) => ({ ...prev, [p.key]: e.target.value }))}
              />
            </div>
            <Button variant="secondary" size="sm" loading={saving[p.key]} onClick={() => save(p.key)} style={{ flexShrink: 0, marginTop: 22 }}>
              Save
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GenericListSection({ title, icon: Icon, items = [], onCreate, onUpdate, onDelete, onReorder, fields, renderCard, onRefresh, toast }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const startAdd = () => {
    const init = {};
    fields.forEach(f => { init[f.key] = f.type === 'checkbox' ? false : ''; });
    setForm(init);
    setEditingId('new');
  };

  const startEdit = (item) => {
    const init = {};
    fields.forEach(f => {
      if (f.key === 'techStack' && Array.isArray(item[f.key])) {
        init[f.key] = item[f.key].join(', ');
      } else {
        init[f.key] = item[f.key] !== undefined && item[f.key] !== null ? item[f.key] : '';
      }
    });
    setForm(init);
    setEditingId(item.id);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm({});
  };

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId === 'new') {
        await onCreate(form);
        toast.success(title + ' entry added!');
      } else {
        await onUpdate(editingId, form);
        toast.success(title + ' entry updated!');
      }
      await onRefresh();
      cancelForm();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast.success('Deleted successfully');
      await onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete entry');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMove(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderPayload = newItems.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    setReordering(true);
    try {
      await onReorder(orderPayload);
      toast.success('Order updated successfully!');
      await onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update order');
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={20} color="var(--accent)" />}
          <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h5>
        </div>
        {editingId !== 'new' && (
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={startAdd}>
            Add {title}
          </Button>
        )}
      </div>

      {editingId && (
        <Card style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--accent)', padding: 'var(--space-6)' }}>
          <h6 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--accent)' }}>
            {editingId === 'new' ? 'Add New ' + title : 'Edit ' + title}
          </h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {fields.map((f) => {
              if (f.type === 'textarea') {
                return (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
                    <textarea
                      placeholder={f.placeholder}
                      value={form[f.key] || ''}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      rows={3}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        padding: '10px 14px',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />
                  </div>
                );
              }
              if (f.type === 'checkbox') {
                return (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
                    <input
                      type="checkbox"
                      id={f.key}
                      checked={!!form[f.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <label htmlFor={f.key} style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      {f.label}
                    </label>
                  </div>
                );
              }
              return (
                <Input
                  key={f.key}
                  label={f.label}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  value={form[f.key] !== undefined && form[f.key] !== null ? form[f.key] : ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              );
            })}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="ghost" size="sm" onClick={cancelForm} icon={<X size={14} />}>
                Cancel
              </Button>
              <Button size="sm" loading={saving} onClick={handleSave} icon={<Save size={14} />}>
                {editingId === 'new' ? 'Save Entry' : 'Update Entry'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {items.length === 0 && !editingId && (
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              No {title.toLowerCase()} added yet. Click <strong>Add {title}</strong> above to create one.
            </p>
          </Card>
        )}
        {items.map((item, index) => (
          <Card key={item.id} style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                {renderCard(item)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {/* Up/Down Reorder Buttons */}
                {onReorder && items.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 6 }}>
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0 || reordering}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: index === 0 || reordering ? 'not-allowed' : 'pointer',
                        color: index === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                        padding: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: index === 0 ? 0.4 : 1,
                      }}
                      title="Move Up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === items.length - 1 || reordering}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: index === items.length - 1 || reordering ? 'not-allowed' : 'pointer',
                        color: index === items.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                        padding: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: index === items.length - 1 ? 0.4 : 1,
                      }}
                      title="Move Down"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => startEdit(item)}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, display: 'flex', alignItems: 'center' }}
                  title="Edit"
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <Edit3 size={14} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, display: 'flex', alignItems: 'center' }}
                  title="Delete"
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'var(--error)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
