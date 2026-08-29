import { ShieldCheck, Scale, Gauge, AlertOctagon, UserCheck, Lock } from 'lucide-react';
import { Card } from '../common/Primitives';

const items = [
  { icon: ShieldCheck, title: 'Source Grounding', desc: 'Answers are generated from retrieved sources.' },
  { icon: Scale, title: 'Jurisdiction Awareness', desc: 'India and international guidance are kept separate.' },
  { icon: Gauge, title: 'Confidence', desc: 'Answers include confidence indicators.' },
  { icon: AlertOctagon, title: 'Abstention', desc: '"I don\u2019t have sufficient authoritative evidence to answer this reliably."' },
  { icon: UserCheck, title: 'Human Escalation', desc: 'Users can request expert assistance.' },
  { icon: Lock, title: 'Privacy', desc: 'Minimal personal information is collected.' },
];

export default function TrustSection() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.title} className="p-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-sandal-100)' }}>
            <item.icon className="w-4.5 h-4.5" style={{ color: 'var(--color-saffron-600)' }} />
          </div>
          <h3 className="font-display text-sm font-medium mb-1" style={{ color: 'var(--color-forest-900)' }}>{item.title}</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>{item.desc}</p>
        </Card>
      ))}
    </div>
  );
}
