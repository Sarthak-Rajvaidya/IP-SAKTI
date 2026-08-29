import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WizardStep, { wizardSteps } from '../components/classification/WizardStep';
import WizardProgress from '../components/classification/WizardProgress';
import ClassificationResultView from '../components/classification/ClassificationResultView';
import { classifyProduct, ApiError } from '../data/mockApi';
import ApiErrorBanner from '../components/common/ApiErrorBanner';
import type { ClassificationAnswer, ClassificationResult } from '../types';

export default function Classification() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ClassificationAnswer[]>([]);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnswer(answer: string) {
    const def = wizardSteps[stepIndex];
    const nextAnswers = [...answers, { step: def.step, question: def.question, answer }];
    setAnswers(nextAnswers);

    if (stepIndex < wizardSteps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      await submitClassification(nextAnswers);
    }
  }

  async function submitClassification(finalAnswers: ClassificationAnswer[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await classifyProduct(finalAnswers);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong while classifying your product.');
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStepIndex(0);
    setAnswers([]);
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-forest-900)' }}>
          Classify Your Ayurvedic Product
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-charcoal-500)' }}>
          Correct regulatory classification is the first step toward the right IP strategy.
        </p>
      </div>

      {!result && !loading && (
        <>
          <WizardProgress current={stepIndex} total={wizardSteps.length} />
          <AnimatePresence mode="wait">
            <WizardStep def={wizardSteps[stepIndex]} onAnswer={handleAnswer} key={stepIndex} />
          </AnimatePresence>
        </>
      )}

      {loading && (
        <div className="text-center py-16">
          <div
            className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-herbal-400)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-charcoal-500)' }}>Classifying your formulation…</p>
        </div>
      )}

      {error && !loading && (
        <ApiErrorBanner message={error} onRetry={() => submitClassification(answers)} />
      )}

      {result && !loading && <ClassificationResultView result={result} onRestart={restart} />}
    </div>
  );
}
