import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Zap, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authApi } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/shared/Toast';
import { PublicNavbar } from '../components/layout/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Forgot Password — CodePilot'; }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <Toast />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.3, pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-4)', paddingTop: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            width: '100%', maxWidth: 440,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)',
            position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-8)' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              Code<span style={{ color: 'var(--accent)' }}>Pilot</span>
            </span>
          </div>

          {!sent ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Forgot password</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
                Enter your email and we'll send a 6-digit OTP code.
              </p>
              <div style={{ height: 3, width: 40, background: 'var(--accent)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-8)' }} />
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <Input label="Email" type="email" placeholder="you@example.com" icon={<Mail size={16} />}
                  value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" loading={loading} fullWidth size="lg">Send OTP Code</Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'var(--success-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
                <Mail size={28} color="var(--success)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-3)' }}>Check your inbox</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                We sent a 6-digit OTP code to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>
              </p>
              <Button
                fullWidth
                size="lg"
                onClick={() => navigate('/reset-password', { state: { email } })}
              >
                Enter OTP &amp; Reset Password <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </Button>
            </motion.div>
          )}

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
