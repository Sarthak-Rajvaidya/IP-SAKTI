import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon } from 'lucide-react';
import { getHistory, ApiError } from '../data/mockApi';
import ApiErrorBanner from '../components/common/ApiErrorBanner';
import type { HistoryItem } from '../types';
import { Card, Badge } from '../components/common/Primitives';
import { formatDate } from '../lib/utils';

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    getHistory()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load query history.'));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--color-herbal-200)' }}>
          <HistoryIcon className="w-5 h-5" style={{ color: 'var(--color-forest-800)' }} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
          Recent Queries
        </h2>
      </div>

      {error && <ApiErrorBanner message={error} onRetry={load} />}

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-forest-900)' }}>{item.query}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-charcoal-300)' }}>{formatDate(item.date)}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge tone="neutral">{item.jurisdiction === 'india' ? 'India' : 'International'}</Badge>
                <Badge tone={item.confidenceLevel === 'high' ? 'green' : item.confidenceLevel === 'medium' ? 'amber' : 'neutral'}>
                  {item.confidenceLevel === 'high' ? 'High Confidence' : item.confidenceLevel === 'medium' ? 'Medium Confidence' : 'Low Confidence'}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm py-10" style={{ color: 'var(--color-charcoal-500)' }}>No queries yet. Ask IP-SAKTI to get started.</p>
        )}
      </div>
    </div>
  );
}
