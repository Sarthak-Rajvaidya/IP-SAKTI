import { motion } from 'framer-motion';
import { pipelineStages } from '../../data/domain';

export default function AIPipeline() {
  return (
    <div className="relative overflow-x-auto pb-4">
      <div className="flex items-stretch gap-0 min-w-[820px] lg:min-w-0">
        {pipelineStages.map((stage, i) => (
          <div key={stage.id} className="flex items-center flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex flex-col items-center text-center px-2 group"
            >
              <div
                className="w-3 h-3 rounded-full mb-2 relative"
                style={{ backgroundColor: 'var(--color-saffron-500)' }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-saffron-400)' }}
                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                />
              </div>
              <div className="text-xs font-medium leading-tight w-24" style={{ color: 'var(--color-forest-900)' }}>
                {stage.label}
              </div>
              <div className="text-[10px] leading-snug w-32 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-1 z-10 bg-white rounded-lg shadow-lg p-2 border" style={{ borderColor: 'var(--color-sandal-300)', color: 'var(--color-charcoal-500)' }}>
                {stage.description}
              </div>
            </motion.div>
            {i < pipelineStages.length - 1 && (
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-sandal-300)' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
