import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import JurisdictionToggle from '../components/chat/JurisdictionToggle';
import ProductContextPanel, { defaultContext } from '../components/chat/ProductContextPanel';
import ChatInputBar, { SuggestedPrompts } from '../components/chat/ChatInputBar';
import { ChatBubble, TypingIndicator } from '../components/chat/ChatBubble';
import EscalationModal from '../components/common/EscalationModal';
import ApiErrorBanner from '../components/common/ApiErrorBanner';
import { askAssistant, ApiError } from '../data/mockApi';
import { useDemoMode } from '../hooks/useDemoMode';
import { useLanguage } from '../hooks/useLanguage';
import type { ChatMessage, Jurisdiction, ProductContext } from '../types';

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Namaste! I'm IP-SAKTI, your Ayurveda IP & Regulatory Sahayak.\n\nI can help you understand patentability, traditional knowledge, biodiversity obligations, AYUSH classification and international IP pathways.\n\nWhat are you trying to protect or commercialise?",
  timestamp: new Date().toISOString(),
};

export default function Assistant() {
  const { demoMode } = useDemoMode();
  const { lang } = useLanguage();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('india');
  const [context, setContext] = useState<ProductContext>(defaultContext);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const demoRan = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (demoMode && !demoRan.current) {
      demoRan.current = true;
      setContext({
        productType: 'Herbal Formulation',
        productName: 'AshwaCalm Tablets',
        ingredients: 'Ashwagandha (Withania somnifera)',
        intendedUse: 'Medicine',
        targetMarket: 'India',
        innovationStatus: 'Proprietary',
      });
      handleSend('Can I patent my new Ashwagandha-based formulation?');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  async function handleSend(text: string) {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    setLastQuery(text);
    try {
      const response = await askAssistant(text, jurisdiction, context, lang);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: '',
        response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong while contacting IP-SAKTI.';
      setError(message);
      // Remove the user message's optimistic bubble state isn't needed — we
      // keep it, but don't add a broken assistant response for it.
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    if (lastQuery) {
      // Drop the last (failed) user message before re-sending to avoid duplicates.
      setMessages((prev) => prev.slice(0, -1));
      handleSend(lastQuery);
    }
  }

  const hasConversation = messages.length > 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
            Ask IP-SAKTI
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-charcoal-500)' }}>
            Answers are jurisdiction-aware and grounded in retrieved authoritative sources.
          </p>
        </div>
        <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />
      </div>

      <ProductContextPanel
        context={context}
        onChange={setContext}
        onAutoClassify={() => {}}
        collapsedDefault={hasConversation}
      />

      <div className="space-y-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {loading && <TypingIndicator />}
        {error && <ApiErrorBanner message={error} onRetry={handleRetry} />}
        <div ref={bottomRef} />
      </div>

      {!hasConversation && (
        <div>
          <div className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--color-charcoal-500)' }}>
            Try asking
          </div>
          <SuggestedPrompts onSelect={handleSend} />
        </div>
      )}

      <div className="sticky bottom-4">
        <ChatInputBar onSend={handleSend} disabled={loading} />
      </div>

      {hasConversation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
          <button
            onClick={() => setEscalationOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-medium rounded-full border px-4 py-2"
            style={{ borderColor: 'var(--color-sandal-300)', color: 'var(--color-forest-800)' }}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Escalate to Human Expert
          </button>
        </motion.div>
      )}

      <EscalationModal open={escalationOpen} onClose={() => setEscalationOpen(false)} />
    </div>
  );
}
