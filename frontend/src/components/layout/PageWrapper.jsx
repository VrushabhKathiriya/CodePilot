import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import Toast from '../shared/Toast';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function PageWrapper({ children, title }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="app-layout">
      <Sidebar />
      <main
        className={`main-content${sidebarOpen ? '' : ' sidebar-collapsed'}`}
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Navbar title={title} />
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ flex: 1, padding: 'var(--space-6)', overflowX: 'hidden' }}
        >
          {children}
        </motion.div>
      </main>
      <Toast />
    </div>
  );
}
