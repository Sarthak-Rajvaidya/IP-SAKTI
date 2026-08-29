import { Globe, Sparkles, Bell, Shield } from 'lucide-react';
import { Card } from '../components/common/Primitives';
import { useLanguage } from '../hooks/useLanguage';
import { useDemoMode } from '../hooks/useDemoMode';
import { languageLabels } from '../lib/i18n';
import type { Language } from '../types';

function Row({ icon: Icon, title, desc, control }: { icon: any; title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-ivory-dim)' }}>
          <Icon className="w-4 h-4" style={{ color: 'var(--color-forest-800)' }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--color-forest-900)' }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-charcoal-500)' }}>{desc}</div>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-6 rounded-full relative transition-colors"
      style={{ backgroundColor: on ? 'var(--color-herbal-500)' : 'var(--color-sandal-300)' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

export default function Settings() {
  const { lang, setLang } = useLanguage();
  const { demoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-8" style={{ color: 'var(--color-forest-900)' }}>
        Settings &amp; Preferences
      </h2>

      <Card className="p-6 divide-y" style={{ borderColor: 'var(--color-sandal-300)' }}>
        <Row
          icon={Globe}
          title="Language"
          desc="Interface language for IP-SAKTI"
          control={
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-sandal-300)' }}
            >
              {(Object.keys(languageLabels) as Language[]).map((l) => (
                <option key={l} value={l}>{languageLabels[l]}</option>
              ))}
            </select>
          }
        />
        <Row
          icon={Sparkles}
          title="Demo Mode"
          desc="Preload a complete example journey for presentations"
          control={<Toggle on={demoMode} onClick={toggleDemoMode} />}
        />
        <Row
          icon={Bell}
          title="Notifications"
          desc="Get notified when a human facilitator responds"
          control={<Toggle on={true} onClick={() => {}} />}
        />
        <Row
          icon={Shield}
          title="Data & Privacy"
          desc="IP-SAKTI collects minimal personal information"
          control={<span className="text-xs font-mono" style={{ color: 'var(--color-charcoal-300)' }}>Managed</span>}
        />
      </Card>
    </div>
  );
}
