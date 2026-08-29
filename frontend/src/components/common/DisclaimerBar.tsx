import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBar() {
  return (
    <div
      className="w-full px-4 py-2 text-center text-xs leading-relaxed flex items-center justify-center gap-2 flex-wrap"
      style={{
        backgroundColor: 'var(--color-forest-950)',
        color: 'var(--color-sandal-200)',
      }}
    >
      <ShieldAlert className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-saffron-400)' }} />
      <span>
        <strong className="font-medium" style={{ color: 'var(--color-saffron-300)' }}>IP-SAKTI</strong> provides AI-assisted
        informational guidance and does not constitute legal advice. Verify critical decisions with a qualified IP/legal professional.
      </span>
    </div>
  );
}
