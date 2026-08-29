import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProductContext } from '../../types';
import { Card } from '../common/Primitives';

const defaultContext: ProductContext = {
  productType: '',
  productName: '',
  ingredients: '',
  intendedUse: 'Medicine',
  targetMarket: 'India',
  innovationStatus: 'Unknown',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-herbal-500)] transition-colors';
const inputStyle = { borderColor: 'var(--color-sandal-300)' };

export default function ProductContextPanel({
  onAutoClassify,
  context,
  onChange,
  collapsedDefault = false,
}: {
  onAutoClassify: () => void;
  context: ProductContext;
  onChange: (c: ProductContext) => void;
  collapsedDefault?: boolean;
}) {
  const [open, setOpen] = useState(!collapsedDefault);
  const [classifying, setClassifying] = useState(false);

  function set<K extends keyof ProductContext>(key: K, value: ProductContext[K]) {
    onChange({ ...context, [key]: value });
  }

  async function handleAutoClassify() {
    setClassifying(true);
    await new Promise((r) => setTimeout(r, 900));
    onChange({ ...context, innovationStatus: 'Proprietary', productType: context.productType || 'Herbal Formulation' });
    setClassifying(false);
    onAutoClassify();
  }

  return (
    <Card className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="text-left">
          <div className="font-display text-base font-medium" style={{ color: 'var(--color-forest-900)' }}>
            Product Context
          </div>
          <div className="text-xs" style={{ color: 'var(--color-charcoal-500)' }}>
            Give IP-SAKTI context before you ask — answers get sharper.
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="px-5 pb-5 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product Type">
              <select value={context.productType} onChange={(e) => set('productType', e.target.value)} className={inputClass} style={inputStyle}>
                <option value="">Select / Not classified</option>
                <option>Herbal Formulation</option>
                <option>Classical Ayurvedic Medicine</option>
                <option>Cosmetic / Personal Care</option>
                <option>Nutraceutical / Food Supplement</option>
                <option>Extraction / Process</option>
              </select>
            </Field>
            <Field label="Product Name">
              <input
                value={context.productName}
                onChange={(e) => set('productName', e.target.value)}
                placeholder="e.g. AshwaCalm Tablets"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <Field label="Ingredients / Biological Resources">
              <input
                value={context.ingredients}
                onChange={(e) => set('ingredients', e.target.value)}
                placeholder="e.g. Ashwagandha, Brahmi"
                className={inputClass}
                style={inputStyle}
              />
            </Field>
            <Field label="Intended Use">
              <select value={context.intendedUse} onChange={(e) => set('intendedUse', e.target.value)} className={inputClass} style={inputStyle}>
                <option>Medicine</option>
                <option>Food</option>
                <option>Cosmetic</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Target Market">
              <select value={context.targetMarket} onChange={(e) => set('targetMarket', e.target.value)} className={inputClass} style={inputStyle}>
                <option>India</option>
                <option>International</option>
              </select>
            </Field>
            <Field label="Innovation Status">
              <select value={context.innovationStatus} onChange={(e) => set('innovationStatus', e.target.value)} className={inputClass} style={inputStyle}>
                <option>Classical</option>
                <option>Proprietary</option>
                <option>New</option>
                <option>Unknown</option>
              </select>
            </Field>
          </div>

          <button
            onClick={handleAutoClassify}
            disabled={classifying}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-forest-800)' }}
          >
            <Wand2 className="w-4 h-4" />
            {classifying ? 'Classifying…' : 'Auto-classify product'}
          </button>
        </motion.div>
      )}
    </Card>
  );
}

export { defaultContext };
