import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic } from 'lucide-react';

export const suggestedPrompts = [
  'Can my Ayurvedic formulation be patented?',
  'Does this formulation qualify as traditional knowledge?',
  'Do I need ABS approval?',
  'How should I protect my Ayurvedic brand?',
  'What changes if I export this product to the EU?',
  'Help classify my formulation.',
];

export function SuggestedPrompts({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestedPrompts.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className="text-xs rounded-full border px-3 py-1.5 transition-colors hover:bg-[var(--color-herbal-200)]"
          style={{ borderColor: 'var(--color-herbal-300)', color: 'var(--color-forest-800)', backgroundColor: 'var(--color-ivory-dim)' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export default function ChatInputBar({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  }

  function handleMic() {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      setValue((v) => v || 'Can I patent my new Ashwagandha-based formulation?');
    }, 1600);
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-9 left-0 flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'var(--color-saffron-500)', color: 'white' }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-white"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            🎙 Listening...
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="flex items-end gap-2 rounded-2xl border p-2"
        style={{ borderColor: 'var(--color-sandal-300)', backgroundColor: 'white' }}
      >
        <button
          onClick={handleMic}
          aria-label="Voice input"
          className="p-2.5 rounded-xl shrink-0 transition-colors"
          style={{
            backgroundColor: listening ? 'var(--color-saffron-500)' : 'var(--color-ivory-dim)',
            color: listening ? 'white' : 'var(--color-charcoal-500)',
          }}
        >
          <Mic className="w-4 h-4" />
        </button>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Ask about patentability, traditional knowledge, ABS, or regulatory classification…"
          className="flex-1 resize-none bg-transparent outline-none text-sm py-2.5 max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="p-2.5 rounded-xl shrink-0 text-white disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: 'var(--color-forest-800)' }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
