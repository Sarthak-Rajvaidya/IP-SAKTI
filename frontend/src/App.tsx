import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { LanguageProvider } from './hooks/useLanguage';
import { DemoModeProvider } from './hooks/useDemoMode';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Classification from './pages/Classification';
import IPExplorer from './pages/IPExplorer';
import ABSAdvisor from './pages/ABSAdvisor';
import KnowledgeExplorer from './pages/KnowledgeExplorer';
import Sources from './pages/Sources';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <LanguageProvider>
      <DemoModeProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/classify" element={<Classification />} />
              <Route path="/ip-explorer" element={<IPExplorer />} />
              <Route path="/abs-advisor" element={<ABSAdvisor />} />
              <Route path="/knowledge" element={<KnowledgeExplorer />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </DemoModeProvider>
    </LanguageProvider>
  );
}

export default App;
