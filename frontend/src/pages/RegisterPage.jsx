import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { authApi } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/shared/Toast';
import { PublicNavbar } from '../components/layout/Navbar';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Create Account — CodePilot'; }, []);

  function validate() {
    const e = {};
    if (!form.fullName.trim())   e.fullName = 'Full Name is required';
    if (!form.username.trim())   e.username = 'Username is required';
    if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!form.email.trim())      e.email = 'Email is required';
    if (!form.password)          e.password = 'Password is required';
    else {
      const pass = form.password;
      const hasLength = pass.length >= 8;
      const hasUpper = /[A-Z]/.test(pass);
      const hasLower = /[a-z]/.test(pass);
      const hasNumber = /[0-9]/.test(pass);
      const hasSpecial = /[^A-Za-z0-9]/.test(pass);
      if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        e.password = 'Password must be 8+ chars and contain uppercase, lowercase, number & special char';
      }
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({}); setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const field = (key, label, type, placeholder, icon) => (
    <Input
      id={`reg-${key}`}
      label={label}
      type={type || 'text'}
      placeholder={placeholder}
      icon={icon}
      value={form[key]}
      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      error={errors[key]}
      autoComplete={key === 'password' ? 'new-password' : key}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <Toast />

      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px', opacity: 0.3, pointerEvents: 'none',
      }} />

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)', paddingTop: 80,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            width: '100%', maxWidth: 480,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-10)',
            position: 'relative', zIndex: 1,
            boxShadow: 'var(--shadow-lg)',
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

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>
            Create account
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
            Start your competitive programming journey
          </p>
          <div style={{ height: 3, width: 40, background: 'var(--accent)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-8)' }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {field('fullName', 'Full Name',  'text',     'John Doe',          <User size={16} />)}
            {field('username', 'Username',   'text',     'johndoe_cp',        <User size={16} />)}
            {field('email',    'Email',      'email',    'you@example.com',   <Mail size={16} />)}
            {field('password', 'Password',   'password', 'Min 8 chars (e.g. Pass@123)', <Lock size={16} />)}

            <Button type="submit" loading={loading} fullWidth size="lg" icon={<UserPlus size={18} />} style={{ marginTop: 8 }}>
              Create Account
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-6)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
