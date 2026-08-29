import { useEffect, useState } from 'react';
import { Landmark, Globe2 } from 'lucide-react';
import { getSources, ApiError } from '../data/mockApi';
import ApiErrorBanner from '../components/common/ApiErrorBanner';
import type { Source } from '../types';
import SourceCard from '../components/citations/SourceCard';

export default function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    getSources()
      .then(setSources)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load sources.'));
  }

  useEffect(() => {
    load();
  }, []);

  const indian = sources.filter((s) => s.jurisdiction === 'india');
  const intl = sources.filter((s) => s.jurisdiction === 'international');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {error && <ApiErrorBanner message={error} onRetry={load} />}

      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
          Sources &amp; Citations
        </h2>
        <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color: 'var(--color-charcoal-500)' }}>
          The authoritative corpus IP-SAKTI's answers will be grounded in. Every source is versioned and traceable.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="w-4 h-4" style={{ color: 'var(--color-forest-800)' }} />
          <h3 className="font-display text-lg font-medium" style={{ color: 'var(--color-forest-900)' }}>Indian Sources</h3>
          <span className="text-xs font-mono" style={{ color: 'var(--color-charcoal-300)' }}>({indian.length})</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {indian.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe2 className="w-4 h-4" style={{ color: 'var(--color-forest-800)' }} />
          <h3 className="font-display text-lg font-medium" style={{ color: 'var(--color-forest-900)' }}>International Sources</h3>
          <span className="text-xs font-mono" style={{ color: 'var(--color-charcoal-300)' }}>({intl.length})</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {intl.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
