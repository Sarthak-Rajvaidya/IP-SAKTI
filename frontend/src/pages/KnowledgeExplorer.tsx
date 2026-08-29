import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Network } from 'lucide-react';
import { getKnowledgeGraph, ApiError } from '../data/mockApi';
import ApiErrorBanner from '../components/common/ApiErrorBanner';
import type { KnowledgeEdge, KnowledgeNode } from '../types';
import KnowledgeNodeCard from '../components/knowledge/KnowledgeNodeCard';
import { Card } from '../components/common/Primitives';

export default function KnowledgeExplorer() {
  const [query, setQuery] = useState('Ashwagandha');
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getKnowledgeGraph()
      .then(({ nodes, edges }) => {
        setNodes(nodes);
        setEdges(edges);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the knowledge graph.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const root = nodes.find((n) => n.id === 'ashwagandha');
  const connected = edges
    .filter((e) => e.from === 'ashwagandha')
    .map((e) => ({ edge: e, node: nodes.find((n) => n.id === e.to) }))
    .filter((x) => x.node);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center">
        <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--color-herbal-200)' }}>
          <Network className="w-5 h-5" style={{ color: 'var(--color-forest-800)' }} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
          Knowledge Explorer
        </h2>
        <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color: 'var(--color-charcoal-500)' }}>
          A frontend representation of the future Knowledge Graph, connecting ingredients, laws, patents and regulations.
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-charcoal-300)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Ayurvedic knowledge, laws, patents, regulations…"
          className="w-full rounded-full border pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-herbal-500)]"
          style={{ borderColor: 'var(--color-sandal-300)' }}
        />
      </div>

      {error && <ApiErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--color-charcoal-500)' }}>Loading knowledge graph…</div>
      ) : (
        root && (
          <div className="flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="px-6 py-4 mb-6 border-2" style={{ borderColor: 'var(--color-saffron-400)' }}>
                <div className="font-display text-lg font-semibold text-center" style={{ color: 'var(--color-forest-900)' }}>
                  {root.label}
                </div>
              </Card>
            </motion.div>

            <div className="w-px h-8" style={{ backgroundColor: 'var(--color-sandal-300)' }} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-2">
              {connected.map(({ edge, node }, i) => (
                <motion.div
                  key={edge.to}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="text-center text-[10px] font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-charcoal-300)' }}>
                    — {edge.relation} —
                  </div>
                  <KnowledgeNodeCard node={node!} />
                </motion.div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
