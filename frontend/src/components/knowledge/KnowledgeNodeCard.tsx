import { motion } from 'framer-motion';
import type { KnowledgeNode } from '../../types';
import { Badge } from '../common/Primitives';

const categoryTone = {
  concept: 'green',
  law: 'blue',
  patent: 'gold',
  regulatory: 'blue',
  abs: 'amber',
  tk: 'amber',
} as const;

export default function KnowledgeNodeCard({ node, onClick }: { node: KnowledgeNode; onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="text-left rounded-xl border p-4 w-full hover:shadow-md transition-shadow"
      style={{ borderColor: 'var(--color-sandal-300)', backgroundColor: 'white' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-sm" style={{ color: 'var(--color-forest-900)' }}>{node.label}</span>
        <Badge tone={categoryTone[node.category]}>{node.category}</Badge>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>{node.description}</p>
    </motion.button>
  );
}
