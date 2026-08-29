import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { escalateToHuman, ApiError } from '../../data/mockApi';
import ApiErrorBanner from './ApiErrorBanner';

export default function EscalationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('Patentability');
  const [jurisdiction, setJurisdiction] = useState('India');
  const [contact, setContact] = useState('Email');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await escalateToHuman({ query, areaOfConcern: area, jurisdiction, contactPreference: contact });
      setTicket(res.ticketId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong while submitting your request.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setTicket(null);
    setQuery('');
    setError(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(17, 26, 20, 0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ backgroundColor: 'var(--color-forest-900)' }}
            >
              <div className="flex items-center gap-2 text-white">
                <UserCheck className="w-4 h-4" style={{ color: 'var(--color-saffron-300)' }} />
                <h3 className="font-display text-base font-medium">Request a Human Facilitator</h3>
              </div>
              <button onClick={handleClose} aria-label="Close" className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {ticket ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-herbal-500)' }} />
                  <p className="font-display text-lg mb-1" style={{ color: 'var(--color-forest-900)' }}>Request submitted</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-charcoal-500)' }}>
                    Ticket <span className="font-mono">{ticket}</span> has been created.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded-full inline-flex"
                    style={{ backgroundColor: '#fbf0d9', color: '#8a5a13' }}>
                    Status: Pending Review
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-6 w-full rounded-xl py-2.5 text-sm font-medium text-white"
                    style={{ backgroundColor: 'var(--color-forest-800)' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>
                    AI guidance can be verified by a qualified IP or regulatory expert. We only collect what's needed to route your request.
                  </p>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Query</label>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      rows={3}
                      placeholder="Briefly describe what you'd like verified..."
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-herbal-500)]"
                      style={{ borderColor: 'var(--color-sandal-300)' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Area of concern</label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: 'var(--color-sandal-300)' }}
                      >
                        <option>Patentability</option>
                        <option>Traditional Knowledge</option>
                        <option>ABS Compliance</option>
                        <option>Regulatory Classification</option>
                        <option>Trademark / Branding</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Jurisdiction</label>
                      <select
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: 'var(--color-sandal-300)' }}
                      >
                        <option>India</option>
                        <option>International</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-charcoal-500)' }}>Contact preference</label>
                    <select
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: 'var(--color-sandal-300)' }}
                    >
                      <option>Email</option>
                      <option>Phone</option>
                      <option>In-app notification</option>
                    </select>
                  </div>

                  {error && <ApiErrorBanner message={error} onRetry={handleSubmit} />}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !query}
                    className="w-full rounded-xl py-2.5 text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-saffron-500)' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit request'}
                    {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
