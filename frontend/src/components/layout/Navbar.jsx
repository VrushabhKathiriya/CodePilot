import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

// Public Navbar (Landing + Auth pages)
export function PublicNavbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [leaving, setLeaving] = useState(false);

  const onLoginPage    = location.pathname === '/login';
  const onRegisterPage = location.pathname === '/register';

  // On landing page: animate swap on click. On auth pages: use route-based styling.
  const signInActive    = onLoginPage    || leaving;
  const getStartedActive = onRegisterPage || (!leaving && !onLoginPage);

  function handleSignIn(e) {
    if (onLoginPage) return; // already here
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => navigate('/login'), 350);
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 64, zIndex: 'var(--z-sticky)',
      background: 'rgba(13,13,13,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 var(--space-6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            Code<span style={{ color: 'var(--accent)' }}>Pilot</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Sign in */}
          <Link
            to="/login"
            onClick={handleSignIn}
            style={{
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: signInActive ? 600 : 500,
              padding: '7px 16px',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.3s ease',
              background:  signInActive ? 'var(--accent)' : 'transparent',
              color:       signInActive ? '#fff' : 'var(--text-secondary)',
              border:      signInActive ? '1px solid transparent' : '1px solid transparent',
              boxShadow:   signInActive ? 'var(--shadow-accent)' : 'none',
            }}
            onMouseEnter={(e) => { if (!signInActive) { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-muted)'; }}}
            onMouseLeave={(e) => { if (!signInActive) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}}
          >Sign in</Link>

          {/* Get Started */}
          <Link to="/register" style={{
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            padding: '7px 16px',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.3s ease',
            background:  getStartedActive ? 'var(--accent)' : 'transparent',
            color:       getStartedActive ? '#fff' : 'var(--text-muted)',
            border:      getStartedActive ? '1px solid transparent' : '1px solid var(--border)',
            boxShadow:   getStartedActive ? 'var(--shadow-accent)' : 'none',
          }}>Get Started</Link>
        </div>
      </div>
    </header>
  );
}

// App Topbar (for authenticated pages — shows above the sidebar)
export default function Navbar({ title }) {
  const { logout, user } = useAuth();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <header style={{
      position: 'sticky', top: 0,
      height: 64, zIndex: 90,
      background: 'rgba(13,13,13,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 var(--space-6)',
      justifyContent: 'space-between',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-xl)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)',
        }}>
          <Bell size={16} />
        </button>

        <button
          onClick={logout}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
            transition: 'color var(--transition-fast), border-color var(--transition-fast)',
          }}
          title="Logout"
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
