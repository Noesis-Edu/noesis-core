import React, { useState } from 'react';
import { WelcomePage } from './pages/WelcomePage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { LessonPage } from './pages/LessonPage';
import { SummaryPage } from './pages/SummaryPage';
import { createSession, fetchSummary, getNextStep } from './services/apiClient';
import { StepDefinition } from './types/lesson';

export default function App() {
  const [view, setView] = useState<'welcome' | 'diagnostic' | 'lesson' | 'summary'>('welcome');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepDefinition | null>(null);
  const [summary, setSummary] = useState<{ accuracy: number; message: string } | null>(null);

  const startSession = async () => {
    setIsStarting(true);
    const { sessionId } = await createSession();
    setSessionId(sessionId);
    setView('diagnostic');
    setIsStarting(false);
  };

  const loadFirstStep = async () => {
    if (!sessionId) return;
    const { nextStep } = await getNextStep(sessionId, null);
    setCurrentStep(nextStep);
    setView('lesson');
  };

  const finishLesson = async () => {
    if (!sessionId) return;
    const summaryData = await fetchSummary(sessionId);
    setSummary({ accuracy: summaryData.accuracy, message: summaryData.message });
    setView('summary');
  };

  const reset = () => {
    setView('welcome');
    setSessionId(null);
    setCurrentStep(null);
    setSummary(null);
  };

  return (
    <main className="app-shell">
      {view === 'welcome' && <WelcomePage onStart={startSession} isStarting={isStarting} />}
      {view === 'diagnostic' && sessionId && <DiagnosticPage sessionId={sessionId} onComplete={loadFirstStep} />}
      {view === 'lesson' && sessionId && currentStep && (
        <LessonPage
          sessionId={sessionId}
          currentStep={currentStep}
          onAdvance={(step) => setCurrentStep(step)}
          onComplete={finishLesson}
        />
      )}
      {view === 'summary' && summary && (
        <SummaryPage message={summary.message} accuracy={summary.accuracy} onRestart={reset} />
      )}
    </main>
  );
}
