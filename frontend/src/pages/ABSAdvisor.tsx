import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Info } from 'lucide-react';
import { Card, Badge } from '../components/common/Primitives';
import { assessABS, ApiError } from '../data/mockApi';
import ApiErrorBanner from '../components/common/ApiErrorBanner';
import type { ABSResult } from '../types';

const inputClass = 'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-herbal-500)]';
const inputStyle = { borderColor: 'var(--color-sandal-300)' };

export default function ABSAdvisor() {
  const [resource, setResource] = useState('Ashwagandha');
  const [origin, setOrigin] = useState('India');
  const [commercialIntent, setCommercialIntent] = useState(true);
  const [entityType, setEntityType] = useState('Startup');
  const [useType, setUseType] = useState('Commercial');
  const [result, setResult] = useState<ABSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssess() {
    setLoading(true);
    setError(null);
    try {
      const res = await assessABS({ resource, origin, commercialIntent, entityType, useType });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong while running the ABS assessment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center">
        <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--color-herbal-200)' }}>
          <Leaf className="w-5 h-5" style={{ color: 'var(--color-forest-800)' }} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
          Biodiversity &amp; ABS Advisor
        </h2>
        <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color: 'var(--color-charcoal-500)' }}>
          Understand your preliminary Access &amp; Benefit Sharing exposure before commercialising a biological resource.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Biological Resource</span>
            <input value={resource} onChange={(e) => setResource(e.target.value)} className={`${inputClass} mt-1`} style={inputStyle} />
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Source</span>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className={`${inputClass} mt-1`} style={inputStyle}>
              <option>India</option>
              <option>Outside India</option>
              <option>Mixed / Unsure</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Commercial Intent</span>
            <select value={commercialIntent ? 'Yes' : 'No'} onChange={(e) => setCommercialIntent(e.target.value === 'Yes')} className={`${inputClass} mt-1`} style={inputStyle}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Entity Type</span>
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className={`${inputClass} mt-1`} style={inputStyle}>
              <option>Startup / Company</option>
              <option>Individual Practitioner</option>
              <option>Academic / Research Institution</option>
              <option>Foreign Entity</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Research / Commercial Use</span>
            <select value={useType} onChange={(e) => setUseType(e.target.value)} className={`${inputClass} mt-1`} style={inputStyle}>
              <option>Commercial</option>
              <option>Research</option>
              <option>Both</option>
            </select>
          </label>
        </div>

        <button
          onClick={handleAssess}
          disabled={loading}
          className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-forest-800)' }}
        >
          {loading ? 'Assessing…' : 'Run Preliminary Assessment'}
        </button>
      </Card>

      {error && <ApiErrorBanner message={error} onRetry={handleAssess} />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="text-xs font-mono uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--color-saffron-600)' }}>
              Preliminary Assessment
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Badge tone={result.status === 'review-recommended' ? 'amber' : 'green'}>
                {result.status === 'review-recommended' ? '🟡 Review Recommended' : '🟢 Likely Exempt'}
              </Badge>
            </div>
            <h3 className="font-display text-xl font-medium mb-3" style={{ color: 'var(--color-forest-900)' }}>
              {result.headline}
            </h3>
            <div className="mb-5">
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-forest-900)' }}>Why?</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-charcoal-700)' }}>{result.reasoning}</p>
            </div>
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-forest-900)' }}>Next Steps</div>
              <ul className="space-y-1.5">
                {result.nextSteps.map((s) => (
                  <li key={s} className="text-sm flex items-start gap-2" style={{ color: 'var(--color-charcoal-700)' }}>
                    <span style={{ color: 'var(--color-herbal-500)' }}>→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-lg p-3 text-xs" style={{ backgroundColor: 'var(--color-ivory-dim)', color: 'var(--color-charcoal-500)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              This is preliminary information, not legal advice.
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
