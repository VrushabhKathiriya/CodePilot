import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Bot, BookOpen, Briefcase,
  Settings, User, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics',       icon: BarChart3,        label: 'Analytics' },
  { to: '/ai-coach',        icon: Bot,              label: 'AI Coach' },
  { to: '/recommendations', icon: BookOpen,         label: 'Recommendations' },
  { to: '/career',          icon: Briefcase,        label: 'Career' },
];

const BOTTOM_ITEMS = [
  { to: '/profile',  icon: User,     label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const w = sidebarOpen ? 240 : 64;

  return (
    <aside style={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: w,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width var(--transition-base)',
      zIndex: 'var(--z-sticky)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarOpen ? '20px 20px 20px 20px' : '20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        borderBottom: '1px solid var(--border)',
        minHeight: 64,
      }}>
        {sidebarOpen && (
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#fff" />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'var(--text-lg)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              Code<span style={{ color: 'var(--accent)' }}>Pilot</span>
            </span>
          </Link>
        )}
        {!sidebarOpen && (
          <Link to="/dashboard">
            <div style={{
              width: 32, height: 32,
              background: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#fff" />
            </div>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)',
            flexShrink: 0,
            ...(sidebarOpen ? {} : { position: 'absolute', right: -12, top: 20,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 24, height: 24, zIndex: 10 }),
          }}
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              title={!sidebarOpen ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarOpen ? '10px 20px' : '10px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                fontSize: 'var(--text-sm)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              title={!sidebarOpen ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarOpen ? '10px 20px' : '10px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                fontSize: 'var(--text-sm)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && label}
            </Link>
          );
        })}

        {/* User avatar */}
        {sidebarOpen && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', marginTop: 4,
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--accent)',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user.name || user.username || 'U')[0].toUpperCase()
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontWeight: 600, fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.name || user.username}
              </p>
              <p style={{
                fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
