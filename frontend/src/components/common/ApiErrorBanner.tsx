import { AlertTriangle } from 'lucide-react';

export default function ApiErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3"
      style={{ borderColor: '#e3b57c', backgroundColor: '#fbf0d9' }}
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#8a5a13' }} />
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: '#8a5a13' }}>
          Couldn't reach IP-SAKTI backend
        </p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8a5a13' }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium underline"
            style={{ color: '#8a5a13' }}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
