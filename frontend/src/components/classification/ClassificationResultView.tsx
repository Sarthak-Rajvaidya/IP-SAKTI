import { motion } from 'framer-motion';
import { Award, ArrowRight, RotateCcw } from 'lucide-react';
import type { ClassificationResult } from '../../types';
import ConfidenceMeter from '../common/ConfidenceMeter';
import { Card } from '../common/Primitives';
import { Link } from 'react-router-dom';

export default function ClassificationResultView({
  result,
  onRestart,
}: {
  result: ClassificationResult;
  onRestart: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4" style={{ color: 'var(--color-saffron-500)' }} />
          <span className="text-xs font-mono uppercase tracking-[0.14em]" style={{ color: 'var(--color-saffron-600)' }}>
            Product Classification
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-5" style={{ color: 'var(--color-forest-900)' }}>
          {result.label}
        </h2>

        <div className="max-w-xs mb-6">
          <ConfidenceMeter value={result.confidence} level={result.confidence >= 80 ? 'high' : result.confidence >= 60 ? 'medium' : 'low'} showExplainer={false} />
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-forest-900)' }}>Why?</div>
          <ul className="space-y-1.5">
            {result.reasons.map((r) => (
              <li key={r} className="text-sm flex items-start gap-2" style={{ color: 'var(--color-charcoal-700)' }}>
                <span style={{ color: 'var(--color-herbal-500)' }}>•</span> {r}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-forest-900)' }}>Potential Next Steps</div>
          <ol className="space-y-2">
            {result.nextSteps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-charcoal-700)' }}>
                <span
                  className="font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-herbal-200)', color: 'var(--color-forest-800)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/assistant"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-forest-800)' }}
        >
          Ask IP-SAKTI about this <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/ip-explorer"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium border"
          style={{ borderColor: 'var(--color-sandal-300)', color: 'var(--color-forest-800)' }}
        >
          Explore IP Strategy
        </Link>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium"
          style={{ color: 'var(--color-charcoal-500)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Start over
        </button>
      </div>
    </motion.div>
  );
}
