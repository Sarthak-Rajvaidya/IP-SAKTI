import { motion } from 'framer-motion';

export default function WizardProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-ivory-dim)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--color-herbal-500)' }}
            initial={{ width: 0 }}
            animate={{ width: i < current ? '100%' : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      ))}
    </div>
  );
}
