import type { IPCategory, Agent, PipelineStage, KnowledgeNode, KnowledgeEdge } from '../types';

export const ipCategories: IPCategory[] = [
  {
    id: 'patent',
    name: 'Patent',
    icon: 'FlaskConical',
    protects: 'A novel, inventive and industrially applicable formulation, process or extraction method.',
    whenApplies: 'When your formulation, process or delivery mechanism goes meaningfully beyond what is already described in classical texts or prior art.',
    eligibility: [
      'Novelty over classical & documented prior art',
      'Inventive step beyond obvious modification',
      'Not excluded under Section 3(p) as mere traditional knowledge',
      'Industrial applicability',
    ],
    considerations: [
      'TKDL prior-art search is essential before filing',
      'Combination of known herbs is often refused unless a non-obvious technical effect is shown',
      'Process patents may be viable even where product patents are not',
    ],
    relatedSourceIds: ['src-patents-act-3p', 'src-tk-digital-library', 'src-trips'],
  },
  {
    id: 'trademark',
    name: 'Trademark',
    icon: 'Stamp',
    protects: 'Your brand name, logo, packaging trade dress and product identity in the market.',
    whenApplies: 'As soon as you have a commercial brand name — independent of whether the formulation itself is patentable.',
    eligibility: [
      'Distinctiveness (not merely descriptive of the ingredient or effect)',
      'No conflict with existing registered marks',
      'Not deceptive as to composition or geographic origin',
    ],
    considerations: [
      'Generic Ayurvedic/Sanskrit terms are difficult to register alone',
      'Consider word mark + logo mark as separate applications',
      'International expansion can route through the Madrid System',
    ],
    relatedSourceIds: ['src-trademarks-act', 'src-madrid'],
  },
  {
    id: 'gi',
    name: 'Geographical Indication',
    icon: 'MapPinned',
    protects: 'A product whose qualities are essentially attributable to a specific geographic origin (e.g. a regional cultivar or preparation method).',
    whenApplies: 'When a defined community or region produces the product using a locally-rooted method — GI is collective, not individually owned.',
    eligibility: [
      'Demonstrable link between origin and product characteristics',
      'Association of producers or authorised registered user status',
      'Established reputation tied to the region',
    ],
    considerations: [
      'GI cannot be held by a single private company — registration is collective',
      'Complements, rather than replaces, trademark protection',
    ],
    relatedSourceIds: ['src-gi-act'],
  },
  {
    id: 'copyright',
    name: 'Copyright',
    icon: 'BookOpen',
    protects: 'Original written, artistic or educational expression — training material, illustrations, packaging artwork, formulation manuals.',
    whenApplies: 'Automatically, upon creation of an original expressive work — no formulation itself is protected, only its expression.',
    eligibility: [
      'Originality of expression (not the underlying idea or formula)',
      'Fixed in a tangible form',
    ],
    considerations: [
      'Does not protect the formulation or method, only how it is described or illustrated',
      'Useful for protecting patient literature, brand storytelling and training content',
    ],
    relatedSourceIds: ['src-copyright-act'],
  },
  {
    id: 'design',
    name: 'Design',
    icon: 'Shapes',
    protects: 'The visual appearance of an article — bottle shape, packaging form, applicator design.',
    whenApplies: 'When a product\u2019s distinctive shape or ornamentation has commercial value independent of its function.',
    eligibility: [
      'Novelty and originality of visual form',
      'Not dictated solely by function',
      'Not previously published or disclosed',
    ],
    considerations: [
      'File before public disclosure — grace periods are limited',
      'International filings can route through the Hague System',
    ],
    relatedSourceIds: ['src-designs-act', 'src-hague'],
  },
  {
    id: 'trade-secret',
    name: 'Trade Secret',
    icon: 'Lock',
    protects: 'Confidential formulation ratios, extraction parameters or process know-how kept undisclosed.',
    whenApplies: 'When you would rather keep exact proportions or process confidential than disclose them in a patent application.',
    eligibility: [
      'Genuinely confidential information',
      'Reasonable steps taken to maintain secrecy',
      'Commercial value derived from secrecy',
    ],
    considerations: [
      'No registration exists — protection depends on contracts, NDAs and access controls',
      'Cannot be combined with patent protection for the same specific know-how',
    ],
    relatedSourceIds: [],
  },
  {
    id: 'pvp',
    name: 'Plant Variety Protection',
    icon: 'Sprout',
    protects: 'A new or extant plant variety, including farmer-developed cultivars relevant to a formulation\u2019s source material.',
    whenApplies: 'When cultivation, breeding or selection has produced a distinct, uniform and stable plant variety used in your supply chain.',
    eligibility: [
      'Distinctiveness, uniformity and stability (DUS criteria)',
      'Novelty of commercialisation',
      'Farmers\u2019 rights and benefit-sharing obligations may apply',
    ],
    considerations: [
      'Distinct from patent protection — covers the plant variety itself, not a formulation',
      'Important where a proprietary cultivar underpins ingredient quality',
    ],
    relatedSourceIds: ['src-pvp-act'],
  },
];

export const agents: Agent[] = [
  {
    id: 'patent-agent',
    name: 'Patent Agent',
    role: 'Patentability & prior-art reasoning',
    description: 'Will assess novelty and inventive step against TKDL and global patent prior art, and flag Section 3(p)-type exclusions.',
  },
  {
    id: 'abs-agent',
    name: 'ABS Agent',
    role: 'Biodiversity & benefit-sharing reasoning',
    description: 'Will evaluate access and benefit-sharing exposure for biological resources referenced in a formulation.',
  },
  {
    id: 'regulatory-agent',
    name: 'Regulatory Agent',
    role: 'AYUSH, drug, food & cosmetic classification',
    description: 'Will route classification questions to the correct regulatory pathway and licensing authority.',
  },
  {
    id: 'international-agent',
    name: 'International IP Agent',
    role: 'TRIPS, WIPO & export-market reasoning',
    description: 'Will translate an Indian IP position into the equivalent international filing and compliance pathway.',
  },
];

export const pipelineStages: PipelineStage[] = [
  { id: 'query', label: 'User Query', description: 'The practitioner, researcher or founder asks a question in natural language.' },
  { id: 'lang', label: 'Language Detection', description: 'The query language is identified across supported Indian languages.' },
  { id: 'classification', label: 'Product Classification', description: 'The formulation is classified as classical, proprietary or novel.' },
  { id: 'jurisdiction', label: 'Jurisdiction Detection', description: 'The query is routed as an India-specific or international question.' },
  { id: 'routing', label: 'Query Routing', description: 'The question is routed to the relevant IP, ABS or regulatory reasoning path.' },
  { id: 'retrieval', label: 'Source Retrieval', description: 'Authoritative statutes, guidance and treaty text are retrieved (RAG).' },
  { id: 'graph', label: 'Knowledge Graph', description: 'Retrieved sources are cross-linked with ingredients, prior art and precedent.' },
  { id: 'reasoning', label: 'LLM Reasoning', description: 'The model reasons over retrieved context to draft a grounded answer.' },
  { id: 'verification', label: 'Citation Verification', description: 'Every claim in the draft answer is checked against its cited source.' },
  { id: 'confidence', label: 'Confidence Scoring', description: 'Source agreement and retrieval coverage are scored into a confidence indicator.' },
  { id: 'answer', label: 'Answer', description: 'A source-cited, jurisdiction-aware answer is returned to the user.' },
];

export const knowledgeNodes: KnowledgeNode[] = [
  { id: 'ashwagandha', label: 'Ashwagandha', category: 'concept', description: 'Withania somnifera — a widely used adaptogenic herb in classical and proprietary Ayurvedic formulations.' },
  { id: 'tk', label: 'Traditional Knowledge', category: 'tk', description: 'Knowledge documented in classical Ayurvedic texts, often searchable via the TKDL.' },
  { id: 'bio-resource', label: 'Biological Resource', category: 'concept', description: 'A biological material governed by access and benefit-sharing obligations under the Biological Diversity framework.' },
  { id: 'ayurveda', label: 'Ayurveda', category: 'concept', description: 'The classical system of medicine within which the formulation is situated.' },
  { id: 'patents', label: 'Patents', category: 'patent', description: 'Statutory protection for novel, inventive and industrially applicable formulations or processes.' },
  { id: 'abs', label: 'ABS', category: 'abs', description: 'Access & Benefit Sharing obligations arising from commercial use of biological resources.' },
  { id: 'regulatory', label: 'Regulatory References', category: 'regulatory', description: 'AYUSH, FSSAI and drug-classification guidance applicable to the product.' },
];

export const knowledgeEdges: KnowledgeEdge[] = [
  { from: 'ashwagandha', to: 'tk', relation: 'documented in' },
  { from: 'ashwagandha', to: 'bio-resource', relation: 'is a' },
  { from: 'ashwagandha', to: 'ayurveda', relation: 'used within' },
  { from: 'ashwagandha', to: 'patents', relation: 'relevant to' },
  { from: 'ashwagandha', to: 'abs', relation: 'subject to' },
  { from: 'ashwagandha', to: 'regulatory', relation: 'classified under' },
];
