import { motion } from 'framer-motion';

export interface WizardStepDef {
  step: number;
  question: string;
  options: string[];
}

export const wizardSteps: WizardStepDef[] = [
  { step: 1, question: 'What is the product?', options: ['Herbal Formulation', 'Cosmetic / Personal Care', 'Food Supplement', 'Medicinal Extract'] },
  { step: 2, question: 'Is the formulation derived from a classical Ayurvedic text?', options: ['Yes, directly', 'Partially / inspired by', 'No, newly developed'] },
  { step: 3, question: 'Has the formulation been modified from the classical reference?', options: ['Yes, significantly modified', 'Minor modifications', 'No modification'] },
  { step: 4, question: 'What is its intended use?', options: ['Therapeutic / Medicine', 'Nutritional / Food', 'Cosmetic', 'Wellness / Other'] },
  { step: 5, question: 'Which market is targeted?', options: ['India only', 'India + International', 'International only'] },
  { step: 6, question: 'Does it contain biological resources sourced from India?', options: ['Yes', 'No', 'Unsure'] },
];

export default function WizardStep({
  def,
  onAnswer,
}: {
  def: WizardStepDef;
  onAnswer: (answer: string) => void;
}) {
  return (
    <motion.div
      key={def.step}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
    >
      <div className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--color-saffron-600)' }}>
        Step {def.step} of 6
      </div>
      <h3 className="font-display text-xl sm:text-2xl font-medium mb-6" style={{ color: 'var(--color-forest-900)' }}>
        {def.question}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {def.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            className="text-left rounded-xl border px-4 py-3.5 text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ borderColor: 'var(--color-sandal-300)', backgroundColor: 'white', color: 'var(--color-charcoal-800)' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
