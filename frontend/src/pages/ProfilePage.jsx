import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Trash2, Edit3, Save, X, Globe, Link } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SkeletonBox } from '../components/ui/Spinner';
import { userApi } from '../api/user.api';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { authApi } from '../api/auth.api';
import { formatDate } from '../utils/formatters';

const PROFILE_TABS = ['Basic Info', 'Social Links', 'Education', 'Experience', 'Projects', 'Achievements'];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ name: '', headline: '', bio: '', location: '' });
  const avatarRef = useRef();

  useEffect(() => {
    document.title = 'Edit Profile — CodePilot';
    if (user) {
      setInfo({
        name: user.fullName || user.name || '',
        headline: user.headline || '',
        bio: user.profile?.bio || user.bio || '',
        location: user.profile?.country || user.location || '',
      });
    }
  }, [user]);

  async function saveInfo() {
    setSaving(true);
    try {
      const [resInfo, resProfile] = await Promise.all([
        userApi.updateInfo({ fullName: info.name }),
        userApi.upsertProfile({ bio: info.bio, country: info.location }),
      ]);
      setUser({
        ...user,
        ...resInfo.data?.data,
        profile: {
          ...user?.profile,
          ...resProfile.data?.data,
        },
      });
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
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

  const avatarSrc = user?.profile?.avatarUrl || user?.avatar;
  const initialLetter = (user?.fullName || user?.name || 'U')[0];

  return (
    <PageWrapper title="Edit Profile">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Edit <span style={{ color: 'var(--accent)' }}>Profile</span>
        </h2>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--space-6)', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
        {PROFILE_TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
            color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)',
            cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
            transition: 'color var(--transition-fast)',
          }}>{t}</button>
        ))}
      </div>

      {/* ── Basic Info ── */}
      {tab === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Avatar */}
            <Card style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto var(--space-4)' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent-muted)', border: '2px solid var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent)' }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initialLetter}
                </div>
                <button
                  onClick={() => avatarRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, background: 'var(--accent)', border: '2px solid var(--bg-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Camera size={13} color="#fff" />
                </button>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Click to change</p>
            </Card>

            {/* Info fields */}
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Input label="Full Name" value={info.name} onChange={(e) => setInfo(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
                  <Input label="Location" value={info.location} onChange={(e) => setInfo(p => ({ ...p, location: e.target.value }))} placeholder="New Delhi, India" />
                </div>
                <Input label="Headline" value={info.headline} onChange={(e) => setInfo(p => ({ ...p, headline: e.target.value }))} placeholder="Competitive Programmer | CS Student" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea
                    value={info.bio}
                    onChange={(e) => setInfo(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell the world about yourself..."
                    rows={4}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', padding: '10px 14px', resize: 'vertical', outline: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <Button onClick={saveInfo} loading={saving} icon={<Save size={16} />} style={{ alignSelf: 'flex-end' }}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ── Social Links ── */}
      {tab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SocialLinksSection user={user} setUser={setUser} toast={toast} />
        </motion.div>
      )}

      {/* ── Education ── */}
      {tab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GenericListSection
            title="Education"
            items={user?.education || []}
            onCreate={(d) => userApi.addEducation(d)}
            onUpdate={(id, d) => userApi.updateEducation(id, d)}
            onDelete={(id) => userApi.deleteEducation(id)}
            fields={[
              { key: 'institution', label: 'Institution', placeholder: 'BITS Pilani' },
              { key: 'degree', label: 'Degree', placeholder: 'B.Tech' },
              { key: 'field', label: 'Field of Study', placeholder: 'Computer Science' },
              { key: 'startDate', label: 'Start Date', type: 'date' },
              { key: 'endDate',   label: 'End Date (optional)', type: 'date' },
            ]}
            displayKey="institution"
            subKey="degree"
            onRefresh={async () => { const r = await authApi.getMe(); setUser(r.data?.data); }}
            toast={toast}
          />
        </motion.div>
      )}

      {/* ── Experience ── */}
      {tab === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GenericListSection
            title="Experience"
            items={user?.experience || []}
            onCreate={(d) => userApi.addExperience(d)}
            onUpdate={(id, d) => userApi.updateExperience(id, d)}
            onDelete={(id) => userApi.deleteExperience(id)}
            fields={[
              { key: 'company', label: 'Company', placeholder: 'Google' },
              { key: 'role', label: 'Role', placeholder: 'SWE Intern' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'startDate', label: 'Start Date', type: 'date' },
              { key: 'endDate',   label: 'End Date (optional)', type: 'date' },
            ]}
            displayKey="company"
            subKey="role"
            onRefresh={async () => { const r = await authApi.getMe(); setUser(r.data?.data); }}
            toast={toast}
          />
        </motion.div>
      )}

      {/* ── Projects ── */}
      {tab === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GenericListSection
            title="Projects"
            items={user?.projects || []}
            onCreate={(d) => userApi.addProject(d)}
            onUpdate={(id, d) => userApi.updateProject(id, d)}
            onDelete={(id) => userApi.deleteProject(id)}
            fields={[
              { key: 'title', label: 'Project Title', placeholder: 'My Awesome Project' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'url', label: 'URL (optional)', placeholder: 'https://...' },
              { key: 'githubUrl', label: 'GitHub URL (optional)', placeholder: 'https://github.com/...' },
            ]}
            displayKey="title"
            onRefresh={async () => { const r = await authApi.getMe(); setUser(r.data?.data); }}
            toast={toast}
          />
        </motion.div>
      )}

      {/* ── Achievements ── */}
      {tab === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GenericListSection
            title="Achievements"
            items={user?.achievements || []}
            onCreate={(d) => userApi.addAchievement(d)}
            onUpdate={(id, d) => userApi.updateAchievement(id, d)}
            onDelete={(id) => userApi.deleteAchievement(id)}
            fields={[
              { key: 'title', label: 'Title', placeholder: 'Codeforces Expert' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'date', label: 'Date', type: 'date' },
            ]}
            displayKey="title"
            onRefresh={async () => { const r = await authApi.getMe(); setUser(r.data?.data); }}
            toast={toast}
          />
        </motion.div>
      )}
    </PageWrapper>
  );
}

// ─── Social Links Section ─────────────────────────────────────────────────────
function SocialLinksSection({ user, setUser, toast }) {
  const platforms = ['github', 'linkedin', 'twitter', 'website'];
  const icons = { github: Globe, linkedin: Globe, twitter: Globe, website: Globe };
  const [links, setLinks] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    if (Array.isArray(user?.socialLinks)) {
      const map = {};
      user.socialLinks.forEach((s) => { map[s.platform] = s.url; });
      setLinks(map);
    } else if (user?.socialLinks) {
      setLinks(user.socialLinks);
    }
  }, [user]);

  async function save(platform) {
    setSaving((p) => ({ ...p, [platform]: true }));
    try {
      await userApi.upsertSocialLink({ platform, url: links[platform] || '' });
      toast.success(`${platform} link saved!`);
    } catch (e) {
      toast.error('Failed to save link');
    } finally { setSaving((p) => ({ ...p, [platform]: false })); }
  }

  return (
    <Card>
      <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-6)' }}>Social Links</h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {platforms.map((p) => {
          const Icon = icons[p];
          return (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="var(--text-muted)" />
              </div>
              <Input
                label={p.charAt(0).toUpperCase() + p.slice(1)}
                placeholder={`Your ${p} URL`}
                value={links[p] || ''}
                onChange={(e) => setLinks((prev) => ({ ...prev, [p]: e.target.value }))}
              />
              <Button variant="secondary" size="sm" loading={saving[p]} onClick={() => save(p)} style={{ flexShrink: 0, marginTop: 20 }}>Save</Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Generic List Section (Education, Experience, etc.) ───────────────────────
function GenericListSection({ title, items, onCreate, onUpdate, onDelete, fields, displayKey, subKey, onRefresh, toast }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function handleAdd() {
    setSaving(true);
    try {
      await onCreate(form);
      toast.success(`${title} added!`);
      await onRefresh();
      setAdding(false); setForm({});
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await onDelete(id);
      toast.success('Deleted');
      await onRefresh();
    } catch (e) { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h5 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{title}</h5>
        <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => setAdding(true)}>Add</Button>
      </div>

      {adding && (
        <Card style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--accent)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {fields.map((f) => f.type === 'textarea' ? (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
                <textarea
                  placeholder={f.placeholder}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  rows={3}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px', resize: 'vertical', outline: 'none' }}
                />
              </div>
            ) : (
              <Input key={f.key} label={f.label} type={f.type || 'text'} placeholder={f.placeholder}
                value={form[f.key] || ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => { setAdding(false); setForm({}); }} icon={<X size={14} />}>Cancel</Button>
              <Button size="sm" loading={saving} onClick={handleAdd} icon={<Save size={14} />}>Save</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {items.length === 0 && !adding && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: 'var(--space-6) 0' }}>No {title.toLowerCase()} added yet.</p>
        )}
        {items.map((item) => (
          <Card key={item.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{item[displayKey]}</p>
                {subKey && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{item[subKey]}</p>}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
