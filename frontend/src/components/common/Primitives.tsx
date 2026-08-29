import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn('rounded-2xl border shadow-sm', className)}
      style={{
        borderColor: 'color-mix(in srgb, var(--color-herbal-400) 20%, transparent)',
        backgroundColor: 'white',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type BadgeTone = 'green' | 'amber' | 'blue' | 'neutral' | 'gold';

const toneStyles: Record<BadgeTone, string> = {
  green: 'bg-[color-mix(in_srgb,var(--color-herbal-400)_18%,white)] text-[var(--color-forest-800)]',
  amber: 'bg-[#fbf0d9] text-[#8a5a13]',
  blue: 'bg-[#e4edf5] text-[#2c5170]',
  neutral: 'bg-[var(--color-ivory-dim)] text-[var(--color-charcoal-700)]',
  gold: 'bg-[color-mix(in_srgb,var(--color-saffron-400)_20%,white)] text-[var(--color-saffron-600)]',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono tracking-tight',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-mono text-xs uppercase tracking-[0.14em]"
      style={{ color: 'var(--color-saffron-600)' }}
    >
      {children}
    </div>
  );
}
