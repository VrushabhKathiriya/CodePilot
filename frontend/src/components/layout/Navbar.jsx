import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';

// Public Navbar (Landing + Auth pages)
export function PublicNavbar() {
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link to="/login" style={{
            color: 'var(--text-secondary)', textDecoration: 'none',
            fontSize: 'var(--text-sm)', fontWeight: 500,
            transition: 'color var(--transition-fast)',
          }}>Sign in</Link>
          <Link to="/register" style={{
            background: 'var(--accent)', color: '#fff',
            padding: '8px 18px', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none',
            transition: 'background var(--transition-fast)',
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
