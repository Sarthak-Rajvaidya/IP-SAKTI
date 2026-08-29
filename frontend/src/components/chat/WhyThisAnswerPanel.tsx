import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { WhyThisAnswer } from '../../types';
import { Badge } from '../common/Primitives';

export default function WhyThisAnswerPanel({ data }: { data: WhyThisAnswer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-sandal-300)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ backgroundColor: 'var(--color-ivory-dim)' }}
      >
        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-forest-900)' }}>
          <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-herbal-600)' }} />
          Why am I seeing this answer?
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-charcoal-500)' }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="p-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>
                  Retrieved Sources
                </div>
                <div style={{ color: 'var(--color-forest-900)' }}>{data.retrievedSourceCount} authoritative sources</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>
                  Jurisdiction
                </div>
                <Badge tone="gold">{data.jurisdiction === 'india' ? 'India' : 'International'}</Badge>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>
                  Relevant Provisions
                </div>
                <ul className="space-y-1" style={{ color: 'var(--color-forest-900)' }}>
                  {data.relevantProvisions.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>
                  Knowledge Areas
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {data.knowledgeAreas.map((k) => (
                    <Badge key={k} tone="green">{k}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
