import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Stamp, MapPinned, BookOpen, Shapes, Lock, Sprout, X, ArrowRight,
} from 'lucide-react';
import { ipCategories } from '../data/domain';
import { sourcesById } from '../data/sources';
import { Card, Badge } from '../components/common/Primitives';
import SourceCard from '../components/citations/SourceCard';
import type { IPCategory } from '../types';

const iconMap: Record<string, typeof FlaskConical> = {
  FlaskConical, Stamp, MapPinned, BookOpen, Shapes, Lock, Sprout,
};

export default function IPExplorer() {
  const [selected, setSelected] = useState<IPCategory | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
          IP Strategy Explorer
        </h2>
        <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: 'var(--color-charcoal-500)' }}>
          Your innovation can be protected in more than one way. Explore each pathway to understand what it protects and when it applies.
        </p>
      </div>

      {/* decision tree visual */}
      <div className="hidden md:flex flex-col items-center mb-10">
        <div className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md" style={{ backgroundColor: 'var(--color-forest-900)' }}>
          YOUR INNOVATION
        </div>
        <svg width="100%" height="40" viewBox="0 0 600 40" className="max-w-2xl">
          <line x1="300" y1="0" x2="300" y2="14" stroke="var(--color-sandal-300)" strokeWidth="2" />
          <line x1="90" y1="14" x2="510" y2="14" stroke="var(--color-sandal-300)" strokeWidth="2" />
          <line x1="90" y1="14" x2="90" y2="40" stroke="var(--color-sandal-300)" strokeWidth="2" />
          <line x1="300" y1="14" x2="300" y2="40" stroke="var(--color-sandal-300)" strokeWidth="2" />
          <line x1="510" y1="14" x2="510" y2="40" stroke="var(--color-sandal-300)" strokeWidth="2" />
        </svg>
        <div className="grid grid-cols-3 gap-24 max-w-2xl w-full text-center">
          {['Patent', 'Trademark', 'Geographical Indication'].map((n) => (
            <div key={n} className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>
              {n}
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ipCategories.map((cat, i) => {
          const Icon = iconMap[cat.icon];
          return (
            <motion.button
              key={cat.id}
              onClick={() => setSelected(cat)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="text-left"
            >
              <Card className="p-5 h-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-herbal-200)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-forest-800)' }} />
                </div>
                <h3 className="font-display text-base font-medium mb-1.5" style={{ color: 'var(--color-forest-900)' }}>{cat.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>{cat.protects}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-saffron-600)' }}>
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </Card>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ backgroundColor: 'rgba(17,26,20,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="w-full sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b bg-white z-10" style={{ borderColor: 'var(--color-sandal-300)' }}>
                <h3 className="font-display text-xl font-medium" style={{ color: 'var(--color-forest-900)' }}>{selected.name}</h3>
                <button onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5" style={{ color: 'var(--color-charcoal-500)' }} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--color-charcoal-500)' }}>What it protects</div>
                  <p className="text-sm" style={{ color: 'var(--color-charcoal-800)' }}>{selected.protects}</p>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color: 'var(--color-charcoal-500)' }}>When it applies</div>
                  <p className="text-sm" style={{ color: 'var(--color-charcoal-800)' }}>{selected.whenApplies}</p>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>Basic eligibility</div>
                  <ul className="space-y-1">
                    {selected.eligibility.map((e) => (
                      <li key={e} className="text-sm flex gap-2" style={{ color: 'var(--color-charcoal-700)' }}><Badge tone="green">✓</Badge>{e}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-500)' }}>Important considerations</div>
                  <ul className="space-y-1">
                    {selected.considerations.map((c) => (
                      <li key={c} className="text-sm flex gap-2" style={{ color: 'var(--color-charcoal-700)' }}><Badge tone="amber">!</Badge>{c}</li>
                    ))}
                  </ul>
                </div>
                {selected.relatedSourceIds.length > 0 && (
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--color-charcoal-500)' }}>Related sources</div>
                    <div className="grid gap-2">
                      {selected.relatedSourceIds.map((id) => sourcesById[id] && <SourceCard key={id} source={sourcesById[id]} compact />)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
