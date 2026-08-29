import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DisclaimerBar from '../common/DisclaimerBar';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/assistant': 'Ask IP-SAKTI',
  '/classify': 'Product Classification',
  '/ip-explorer': 'IP Strategy Explorer',
  '/abs-advisor': 'Biodiversity & ABS Advisor',
  '/knowledge': 'Knowledge Explorer',
  '/sources': 'Sources & Citations',
  '/history': 'Query History',
  '/settings': 'Settings',
};

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-ivory)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} pageTitle={titles[location.pathname]} />
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <DisclaimerBar />
      </div>
    </div>
  );
}
