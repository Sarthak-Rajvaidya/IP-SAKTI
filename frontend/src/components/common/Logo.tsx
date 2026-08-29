import { cn } from '../../lib/utils';

export default function Logo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" className="shrink-0" aria-hidden="true">
        {/* shield: legal protection */}
        <path
          d="M20 3 L34 8.5 V19 C34 27.5 28 33.5 20 37 C12 33.5 6 27.5 6 19 V8.5 Z"
          fill="var(--color-forest-800)"
        />
        {/* leaf inside shield: ayurveda */}
        <path
          d="M20 12 C25 14 27 19 24.5 25 C19 25 15 21 15 16 C15 14.5 17 12.8 20 12 Z"
          fill="var(--color-herbal-400)"
        />
        <path d="M20 12.5 C18 17 18 21 24 25" stroke="var(--color-forest-900)" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* gold accent dot: knowledge point */}
        <circle cx="25.5" cy="12.5" r="1.6" fill="var(--color-saffron-400)" />
      </svg>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-display text-[1.05rem] font-semibold tracking-tight text-forest-900" style={{ color: 'var(--color-forest-900)' }}>
            IP-SAKTI
          </div>
        </div>
      )}
    </div>
  );
}
