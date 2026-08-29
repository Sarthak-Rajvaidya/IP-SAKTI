import { ExternalLink, FileText } from 'lucide-react';
import type { Source } from '../../types';
import { Badge } from '../common/Primitives';
import { formatDate } from '../../lib/utils';

const statusTone = { verified: 'green', review: 'amber', international: 'blue' } as const;
const statusLabel = { verified: 'Verified', review: 'Review', international: 'International' } as const;

export default function SourceCard({ source, compact = false }: { source: Source; compact?: boolean }) {
  return (
    <a
      href={source.url}
      onClick={(e) => e.preventDefault()}
      className="block rounded-xl border p-4 hover:shadow-md transition-shadow group"
      style={{ borderColor: 'var(--color-sandal-300)', backgroundColor: 'var(--color-ivory-dim)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-herbal-600)' }} />
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--color-saffron-600)' }}>
              Source
            </div>
            <div className="font-medium text-sm leading-snug" style={{ color: 'var(--color-forest-900)' }}>
              {source.title}
            </div>
            {source.subTitle && (
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-charcoal-500)' }}>
                {source.subTitle}
              </div>
            )}
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge tone={statusTone[source.status]}>{statusLabel[source.status]}</Badge>
          <Badge tone="neutral">{source.jurisdiction === 'india' ? 'India' : 'International'}</Badge>
          <Badge tone="neutral">{source.documentType}</Badge>
          <span className="text-[11px] ml-auto" style={{ color: 'var(--color-charcoal-300)' }}>
            Updated {formatDate(source.lastUpdated)}
          </span>
        </div>
      )}
    </a>
  );
}
