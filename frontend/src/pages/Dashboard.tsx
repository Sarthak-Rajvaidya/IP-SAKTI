import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  ScrollText,
  Leaf,
  Landmark,
  Globe2,
  Quote,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Logo from '../components/common/Logo';
import { Card, Eyebrow } from '../components/common/Primitives';
import AIPipeline from '../components/knowledge/AIPipeline';
import AgentTeam from '../components/knowledge/AgentTeam';
import TrustSection from '../components/knowledge/TrustSection';

const capabilities = [
  { icon: FlaskConical, title: 'Patent Intelligence', desc: 'Understand patentability and traditional-knowledge exclusions.' },
  { icon: ScrollText, title: 'Traditional Knowledge', desc: 'Identify potential TK/prior-art concerns before you file.' },
  { icon: Leaf, title: 'ABS Compliance', desc: 'Understand biodiversity and Access & Benefit Sharing obligations.' },
  { icon: Landmark, title: 'Regulatory Guidance', desc: 'Navigate AYUSH, drug, food and cosmetic classifications.' },
  { icon: Globe2, title: 'International IP', desc: 'Explore TRIPS, WIPO, PCT, Madrid, Hague and export regimes.' },
  { icon: Quote, title: 'Source-Cited Answers', desc: 'Every answer traces back to its authoritative source.' },
];

export default function Dashboard() {
  return (
    <div className="veined-surface">
      {/* Hero */}
      <section className="px-5 sm:px-8 lg:px-12 pt-14 pb-16 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <Eyebrow>Intelligent IP &amp; Regulatory Sahayak for Ayurveda</Eyebrow>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold mt-3 mb-5 leading-tight" style={{ color: 'var(--color-forest-900)' }}>
            Your AI Sahayak for Ayurveda<br className="hidden sm:block" /> IP &amp; Regulation
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-3" style={{ color: 'var(--color-charcoal-700)' }}>
            Navigate patents, traditional knowledge, biodiversity compliance, AYUSH regulations and
            international IP regimes — with answers grounded in authoritative sources.
          </p>
          <p className="text-sm font-medium mb-8" style={{ color: 'var(--color-saffron-600)' }}>
            Protecting Ayurveda's Knowledge. Powering Ayurveda's Innovation.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
              style={{ backgroundColor: 'var(--color-forest-800)' }}
            >
              Ask IP-SAKTI <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/classify"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold border"
              style={{ borderColor: 'var(--color-sandal-300)', color: 'var(--color-forest-800)', backgroundColor: 'white' }}
            >
              Classify My Product
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Capability cards */}
      <section className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="p-5 h-full hover:shadow-md transition-shadow">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--color-herbal-200)' }}
                >
                  <c.icon className="w-5 h-5" style={{ color: 'var(--color-forest-800)' }} />
                </div>
                <h3 className="font-display text-base font-medium mb-1" style={{ color: 'var(--color-forest-900)' }}>
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-charcoal-500)' }}>
                  {c.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pb-16">
        <div className="text-center mb-8">
          <Eyebrow>How it will work</Eyebrow>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-2" style={{ color: 'var(--color-forest-900)' }}>
            The AI Reasoning Pipeline
          </h2>
          <p className="max-w-xl mx-auto text-sm mt-2" style={{ color: 'var(--color-charcoal-500)' }}>
            A frontend representation of the architecture that will connect to the RAG and knowledge-graph backend.
          </p>
        </div>
        <AIPipeline />
      </section>

      {/* Agent team */}
      <section className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pb-16">
        <div className="text-center mb-8">
          <Eyebrow>Planned AI orchestration layer</Eyebrow>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-2 flex items-center justify-center gap-2" style={{ color: 'var(--color-forest-900)' }}>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--color-saffron-500)' }} />
            AI Research Team
          </h2>
        </div>
        <AgentTeam />
      </section>

      {/* Trust & safety */}
      <section className="px-5 sm:px-8 lg:px-12 max-w-6xl mx-auto pb-20">
        <div className="text-center mb-8">
          <Eyebrow>Responsible AI</Eyebrow>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-2" style={{ color: 'var(--color-forest-900)' }}>
            Trust &amp; Safety
          </h2>
        </div>
        <TrustSection />
      </section>
    </div>
  );
}
