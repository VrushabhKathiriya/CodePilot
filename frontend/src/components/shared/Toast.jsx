import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const icons = {
  success: { icon: CheckCircle, color: 'var(--success)' },
  error:   { icon: XCircle,     color: 'var(--error)' },
  warning: { icon: AlertTriangle, color: 'var(--warning)' },
  info:    { icon: Info,         color: 'var(--info)' },
};

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, color } = icons[toast.type] || icons.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{    opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${color}33`,
        borderRadius: 'var(--radius-lg)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        maxWidth: 340,
        boxShadow: 'var(--shadow-lg)',
        pointerEvents: 'all',
      }}
    >
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
