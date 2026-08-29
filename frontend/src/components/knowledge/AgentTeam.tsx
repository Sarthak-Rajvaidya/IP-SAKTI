import { motion } from 'framer-motion';
import { FlaskConical, Leaf, Landmark, Globe2, Network } from 'lucide-react';
import { agents } from '../../data/domain';
import { Card, Badge } from '../common/Primitives';

const iconMap: Record<string, typeof FlaskConical> = {
  'patent-agent': FlaskConical,
  'abs-agent': Leaf,
  'regulatory-agent': Landmark,
  'international-agent': Globe2,
};

export default function AgentTeam() {
  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-md"
          style={{ backgroundColor: 'var(--color-forest-900)' }}
        >
          <Network className="w-4 h-4" style={{ color: 'var(--color-saffron-300)' }} />
          IP-SAKTI Orchestrator
        </div>
        <div className="w-px h-8" style={{ backgroundColor: 'var(--color-sandal-300)' }} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent, i) => {
          const Icon = iconMap[agent.id];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <Card className="p-5 h-full">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--color-herbal-200)' }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: 'var(--color-forest-800)' }} />
                </div>
                <h3 className="font-display text-sm font-medium mb-1" style={{ color: 'var(--color-forest-900)' }}>
                  {agent.name}
                </h3>
                <p className="text-xs mb-2" style={{ color: 'var(--color-saffron-600)' }}>{agent.role}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>
                  {agent.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <Badge tone="amber">Planned AI orchestration layer — not yet implemented</Badge>
      </div>
    </div>
  );
}
