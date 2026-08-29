import { useState } from 'react';
import { Menu, Globe, Sparkles, ChevronDown, User } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useDemoMode } from '../../hooks/useDemoMode';
import { languageLabels } from '../../lib/i18n';
import type { Language } from '../../types';

export default function Topbar({ onMenuClick, pageTitle }: { onMenuClick: () => void; pageTitle?: string }) {
  const { lang, setLang } = useLanguage();
  const { demoMode, toggleDemoMode } = useDemoMode();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 h-16 flex items-center justify-between gap-3 px-4 lg:px-6 border-b backdrop-blur"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-herbal-400) 16%, transparent)',
        backgroundColor: 'color-mix(in srgb, var(--color-ivory) 90%, transparent)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 -ml-1.5" aria-label="Open menu">
          <Menu className="w-5 h-5" style={{ color: 'var(--color-forest-800)' }} />
        </button>
        {pageTitle && (
          <h1 className="font-display text-lg font-medium truncate" style={{ color: 'var(--color-forest-900)' }}>
            {pageTitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleDemoMode}
          className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium font-mono transition-colors"
          style={{
            backgroundColor: demoMode ? 'var(--color-saffron-500)' : 'var(--color-ivory-dim)',
            color: demoMode ? 'white' : 'var(--color-charcoal-700)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {demoMode ? 'Demo Mode: ON' : 'Demo Mode'}
        </button>

        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            onBlur={() => setTimeout(() => setLangOpen(false), 150)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: 'var(--color-ivory-dim)', color: 'var(--color-charcoal-700)' }}
          >
            <Globe className="w-3.5 h-3.5" />
            {languageLabels[lang]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {langOpen && (
            <div
              className="absolute right-0 mt-1 w-36 rounded-lg border bg-white shadow-lg overflow-hidden z-30"
              style={{ borderColor: 'var(--color-sandal-300)' }}
            >
              {(Object.keys(languageLabels) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-ivory-dim)]"
                  style={{ color: l === lang ? 'var(--color-forest-800)' : 'var(--color-charcoal-700)', fontWeight: l === lang ? 600 : 400 }}
                >
                  {languageLabels[l]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-forest-800)' }}
        >
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}
