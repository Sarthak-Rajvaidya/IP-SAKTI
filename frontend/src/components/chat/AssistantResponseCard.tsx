import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { AssistantResponse } from '../../types';
import { Badge } from '../common/Primitives';
import SourceCard from '../citations/SourceCard';
import ConfidenceMeter from '../common/ConfidenceMeter';
import WhyThisAnswerPanel from './WhyThisAnswerPanel';

const signalDot = { green: '🟢', amber: '🟡', blue: '🔵' } as const;

export default function AssistantResponseCard({ response }: { response: AssistantResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'color-mix(in srgb, var(--color-herbal-400) 25%, transparent)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ backgroundColor: 'var(--color-forest-900)' }}
      >
        <Sparkles className="w-4 h-4" style={{ color: 'var(--color-saffron-300)' }} />
        <span className="text-sm font-medium text-white">AI Analysis</span>
        <span className="ml-auto">
          <Badge tone="gold">{response.jurisdiction === 'india' ? '🇮🇳 India' : '🌐 International'}</Badge>
        </span>
      </div>

      <div className="p-5 space-y-5 bg-white">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--color-charcoal-500)' }}>
              Product Context
            </div>
            <div style={{ color: 'var(--color-forest-900)' }}>{response.productContext}</div>
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--color-charcoal-500)' }}>
              Jurisdiction
            </div>
            <div style={{ color: 'var(--color-forest-900)' }}>
              {response.jurisdiction === 'india' ? 'India 🇮🇳' : 'International 🌐'}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>
            Assessment
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-charcoal-800)' }}>
            {response.assessment}
          </p>
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--color-charcoal-500)' }}>
            Relevant Considerations
          </div>
          <div className="flex flex-wrap gap-2">
            {response.considerations.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: 'var(--color-sandal-300)', backgroundColor: 'var(--color-ivory-dim)' }}
              >
                {signalDot[c.signal]} {c.label}
              </span>
            ))}
          </div>
        </div>

        <ConfidenceMeter value={response.confidence} level={response.confidenceLevel} />

        <div>
          <div className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--color-charcoal-500)' }}>
            Sources
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {response.sources.map((s) => (
              <SourceCard key={s.id} source={s} compact />
            ))}
          </div>
        </div>

        <WhyThisAnswerPanel data={response.whyThisAnswer} />
      </div>
    </motion.div>
  );
}
