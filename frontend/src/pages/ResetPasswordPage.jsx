import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Zap, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authApi } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/shared/Toast';
import { PublicNavbar } from '../components/layout/Navbar';

export default function ResetPasswordPage() {
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [form, setForm]       = useState({ password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const inputRefs = useRef([]);

  const toast    = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email    = location.state?.email || '';

  useEffect(() => {
    document.title = 'Reset Password — CodePilot';
    // If no email in state, send back to forgot-password
    if (!email) navigate('/forgot-password', { replace: true });
  }, []);

  // OTP box handlers
  function handleOtpChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    const otpCode = otp.join('');
    if (otpCode.length < 6)                   errs.otp      = 'Please enter the full 6-digit OTP';
    if (!form.password)                        errs.password = 'Password is required';
    else if (form.password.length < 8)         errs.password = 'Min 8 characters';
    if (form.password !== form.confirm)        errs.confirm  = 'Passwords do not match';
    if (Object.keys(errs).length) return setErrors(errs);

    setErrors({}); setLoading(true);
    try {
      await authApi.resetPassword({ email, otp: otpCode, newPassword: form.password });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Check your OTP and try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
          style={{ width: '100%', maxWidth: 440, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-10)', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-lg)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-8)' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              Code<span style={{ color: 'var(--accent)' }}>Pilot</span>
            </span>
          </div>

          {!done ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Reset password</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
                Enter the OTP sent to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong> and choose a new password.
              </p>
              <div style={{ height: 3, width: 40, background: 'var(--accent)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-8)' }} />

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

                {/* OTP boxes */}
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>6-Digit OTP Code</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        style={{
                          width: 52, height: 58,
                          textAlign: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 700,
                          background: 'var(--bg-elevated)',
                          border: `1px solid ${digit ? 'var(--accent)' : errors.otp ? 'var(--error)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-lg)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          transition: 'border-color var(--transition-fast)',
                        }}
                      />
                    ))}
                  </div>
                  {errors.otp && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', marginTop: 6, textAlign: 'center' }}>{errors.otp}</p>}
                </div>

                <Input
                  label="New Password" type="password" placeholder="Min 8 characters"
                  icon={<Lock size={16} />}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  error={errors.password}
                />
                <Input
                  label="Confirm Password" type="password" placeholder="Repeat new password"
                  icon={<Lock size={16} />}
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  error={errors.confirm}
                />

                <Button type="submit" loading={loading} fullWidth size="lg" style={{ marginTop: 4 }}>
                  Reset Password
                </Button>
              </form>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
                <Link to="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  <ArrowLeft size={14} /> Resend OTP
                </Link>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'var(--success-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
                <CheckCircle size={28} color="var(--success)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-3)' }}>Password reset!</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Your password has been updated successfully.</p>
              <Button onClick={() => navigate('/login')} fullWidth size="lg">Sign In</Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
