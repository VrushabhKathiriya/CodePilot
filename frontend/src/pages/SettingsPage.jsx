import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Link2, Shield, Trash2, AlertTriangle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { syncApi } from '../api/sync.api';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useToast } from '../hooks/useToast';
import { formatRelativeTime } from '../utils/formatters';
import { PLATFORMS } from '../utils/constants';

const SETTINGS_TABS = ['Connected Platforms', 'Security', 'Account'];

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const { user } = useAuthStore();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Settings — CodePilot';
    async function loadFreshUser() {
      try {
        const res = await authApi.getMe();
        if (res.data?.data) {
          useAuthStore.getState().setUser(res.data.data);
        }
      } catch (_) {}
    }
    loadFreshUser();
  }, []);

  return (
    <PageWrapper title="Settings">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Account <span style={{ color: 'var(--accent)' }}>Settings</span>
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border)' }}>
        {SETTINGS_TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: tab === i ? '2px solid var(--accent)' : '2px solid transparent',
            color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)',
            cursor: 'pointer', marginBottom: -1, transition: 'color var(--transition-fast)',
          }}>{t}</button>
        ))}
      </div>

      {tab === 0 && <PlatformsTab user={user} toast={toast} />}
      {tab === 1 && <SecurityTab toast={toast} />}
      {tab === 2 && <AccountTab toast={toast} />}
    </PageWrapper>
  );
}

// ─── Platforms Tab ────────────────────────────────────────────────────────────
function PlatformsTab({ user, toast }) {
  const [handles, setHandles] = useState({});
  const [syncing, setSyncing] = useState({});
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const h = {};
    if (user?.profile) {
      if (user.profile.codeforcesHandle) h.codeforces = user.profile.codeforcesHandle;
      if (user.profile.leetcodeUsername) h.leetcode = user.profile.leetcodeUsername;
      if (user.profile.codechefUsername) h.codechef = user.profile.codechefUsername;
      if (user.profile.atcoderUsername)  h.atcoder  = user.profile.atcoderUsername;
      if (user.profile.gfgUsername)      h.geeksforgeeks = user.profile.gfgUsername;
      if (user.profile.githubUsername)   h.github   = user.profile.githubUsername;
    }
    (user?.codingPlatforms || user?.codingPlatformStats || []).forEach((p) => {
      const key = p.platform ? p.platform.toLowerCase() : '';
      if (key && p.handle) h[key] = p.handle;
    });
    setHandles(h);
  }, [user]);

  async function syncPlatform(platform) {
    const handle = handles[platform];
    if (!handle) return toast.error(`Enter your ${platform} username first`);
    setSyncing((p) => ({ ...p, [platform]: true }));
    try {
      await syncApi.syncPlatform({ platform, handle });
      useAnalyticsStore.getState().clearAll();
      try {
        const meRes = await authApi.getMe();
        if (meRes.data?.data) setUser(meRes.data.data);
      } catch (_) {}
      toast.success(`${PLATFORMS[platform]?.name || platform} synced!`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing((p) => ({ ...p, [platform]: false }));
    }
  }

  async function syncGithub() {
    const handle = handles.github;
    if (!handle) return toast.error('Enter your GitHub username first');
    setSyncing((p) => ({ ...p, github: true }));
    try {
      await syncApi.syncGithub({ handle });
      useAnalyticsStore.getState().clearAll();
      try {
        const meRes = await authApi.getMe();
        if (meRes.data?.data) setUser(meRes.data.data);
      } catch (_) {}
      toast.success('GitHub synced!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing((p) => ({ ...p, github: false }));
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <h5 style={{ fontFamily: 'var(--font-heading)', marginBottom: 4 }}>Connected Platforms</h5>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Enter your handles to sync your competitive programming data.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {Object.entries(PLATFORMS).map(([key, p]) => {
            const syncFn = key === 'github' ? syncGithub : () => syncPlatform(key);
            return (
              <div key={key} style={{
                display: 'grid', gridTemplateColumns: '160px 1fr auto',
                alignItems: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-4)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: p.bg, border: `1px solid ${p.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: p.color, flexShrink: 0 }}>
                    {p.logo}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{p.name}</span>
                </div>
                <Input
                  placeholder={`Your ${p.name} username`}
                  value={handles[key] || ''}
                  onChange={(e) => setHandles((prev) => ({ ...prev, [key]: e.target.value }))}
                />
                <Button
                  variant="secondary" size="sm"
                  icon={<RefreshCw size={13} />}
                  loading={syncing[key]}
                  onClick={syncFn}
                >
                  Sync
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ toast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-6)' }}>
          <Shield size={18} color="var(--accent)" />
          <h5 style={{ fontFamily: 'var(--font-heading)' }}>Change Password</h5>
        </div>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 440 }}>
          <Input label="Current Password" type="password" value={form.currentPassword}
            onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <Input label="New Password" type="password" value={form.newPassword}
            onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} />
          <Input label="Confirm New Password" type="password" value={form.confirm}
            onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} />
          <Button type="submit" loading={saving} style={{ alignSelf: 'flex-start' }}>Update Password</Button>
        </form>
      </Card>
    </motion.div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────
function AccountTab({ toast }) {
  const { clearUser } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      clearUser();
      window.location.href = '/';
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete account');
    } finally { setDeleting(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
          <AlertTriangle size={18} color="var(--error)" />
          <h5 style={{ fontFamily: 'var(--font-heading)', color: 'var(--error)' }}>Danger Zone</h5>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Deleting your account is permanent. All your data will be lost and cannot be recovered.
        </p>
        {!showConfirm ? (
          <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setShowConfirm(true)}>
            Delete Account
          </Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--error-muted)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--error)', fontWeight: 600 }}>Are you absolutely sure?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="danger" size="sm" loading={deleting} onClick={deleteAccount}>Yes, delete my account</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
