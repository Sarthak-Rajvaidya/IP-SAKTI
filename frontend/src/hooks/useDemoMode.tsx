import { createContext, useContext, useState, type ReactNode } from 'react';

interface DemoContextValue {
  demoMode: boolean;
  toggleDemoMode: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(false);
  return (
    <DemoContext.Provider value={{ demoMode, toggleDemoMode: () => setDemoMode((v) => !v) }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}
