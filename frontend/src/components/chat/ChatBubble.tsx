import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import type { ChatMessage } from '../../types';
import AssistantResponseCard from './AssistantResponseCard';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: 'var(--color-herbal-500)' }}
        >
          <Leaf className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'order-1' : ''}`}>
        {!message.response ? (
          <div
            className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{
              backgroundColor: isUser ? 'var(--color-forest-800)' : 'white',
              color: isUser ? 'white' : 'var(--color-charcoal-800)',
              border: isUser ? 'none' : '1px solid var(--color-sandal-300)',
              borderTopRightRadius: isUser ? 4 : 16,
              borderTopLeftRadius: isUser ? 16 : 4,
            }}
          >
            {message.content}
          </div>
        ) : (
          <AssistantResponseCard response={message.response} />
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-herbal-500)' }}>
        <Leaf className="w-4 h-4 text-white" />
      </div>
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1"
        style={{ backgroundColor: 'white', border: '1px solid var(--color-sandal-300)', borderTopLeftRadius: 4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-herbal-500)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
