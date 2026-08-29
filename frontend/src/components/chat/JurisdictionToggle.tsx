import { motion } from 'framer-motion';
import type { Jurisdiction } from '../../types';

export default function JurisdictionToggle({
  value,
  onChange,
}: {
  value: Jurisdiction;
  onChange: (j: Jurisdiction) => void;
}) {
  return (
    <div
      className="relative inline-flex p-1 rounded-full"
      style={{ backgroundColor: 'var(--color-forest-900)' }}
      role="tablist"
      aria-label="Jurisdiction"
    >
      <motion.div
        className="absolute top-1 bottom-1 rounded-full"
        style={{ backgroundColor: 'var(--color-saffron-500)', width: 'calc(50% - 4px)' }}
        animate={{ left: value === 'india' ? 4 : 'calc(50% + 0px)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      />
      <button
        role="tab"
        aria-selected={value === 'india'}
        onClick={() => onChange('india')}
        className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors"
        style={{ color: value === 'india' ? 'var(--color-forest-950)' : 'var(--color-sandal-200)' }}
      >
        🇮🇳 India
      </button>
      <button
        role="tab"
        aria-selected={value === 'international'}
        onClick={() => onChange('international')}
        className="relative z-10 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors"
        style={{ color: value === 'international' ? 'var(--color-forest-950)' : 'var(--color-sandal-200)' }}
      >
        🌐 International
      </button>
    </div>
  );
}
