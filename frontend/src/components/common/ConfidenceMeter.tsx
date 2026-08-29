import { motion } from 'framer-motion';
import type { ConfidenceLevel } from '../../types';

const levelCopy: Record<ConfidenceLevel, { label: string; color: string }> = {
  high: { label: 'High confidence', color: 'var(--color-herbal-500)' },
  medium: { label: 'Medium confidence', color: 'var(--color-saffron-500)' },
  low: { label: 'Low confidence', color: '#b5533e' },
};

export default function ConfidenceMeter({
  value,
  level,
  showExplainer = true,
}: {
  value: number;
  level: ConfidenceLevel;
  showExplainer?: boolean;
}) {
  const copy = levelCopy[level];
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>
          Confidence
        </span>
        <span className="font-mono text-sm font-semibold" style={{ color: copy.color }}>
          {value}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-ivory-dim)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: copy.color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: copy.color }}>
          {copy.label}
        </span>
      </div>
      {showExplainer && (
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>
          Confidence is based on source relevance, retrieval coverage and agreement between authoritative sources.
        </p>
      )}
    </div>
  );
}
