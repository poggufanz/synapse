import React, { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Check, Brain, Heart, Zap } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    text: "When you have a big deadline approaching, you usually...",
    options: [
      { text: "Plan every detail weeks in advance.", trait: "Planner" },
      { text: "Panic first, then hyperfocus at the last minute.", trait: "Procrastinator" },
      { text: "Just start working and figure it out as I go.", trait: "Improviser" },
    ]
  },
  {
    id: 2,
    text: "When you're stressed, what helps you most?",
    options: [
      { text: "Analyzing the problem logically.", trait: "Rational" },
      { text: "Venting to a friend or journaling.", trait: "Emotional" },
      { text: "Taking a break to distract myself.", trait: "Avoidant" },
    ]
  },
  {
    id: 3,
    text: "How do you prefer to learn new things?",
    options: [
      { text: "Reading documentation and theory.", trait: "Theoretical" },
      { text: "Watching videos or seeing diagrams.", trait: "Visual" },
      { text: "Just trying it out (trial and error).", trait: "Kinesthetic" },
    ]
  },
];

export default function PsychologyTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const { user, setUser, setOnboardingStep } = useUserStore();

  const handleOptionClick = (trait: string) => {
    const newAnswers = [...answers, trait];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Test Complete - Analyze
      finishTest(newAnswers);
    }
  };

  const finishTest = (finalAnswers: string[]) => {
    if (!user) return;

    // Simple logic to determine "Personality Type"
    let type = "The Balanced Realist";
    if (finalAnswers.includes("Planner") && finalAnswers.includes("Rational")) type = "The Stoic Architect";
    if (finalAnswers.includes("Procrastinator") && finalAnswers.includes("Emotional")) type = "The Anxious Achiever";
    if (finalAnswers.includes("Improviser") && finalAnswers.includes("Kinesthetic")) type = "The Chaos Pilot";

    setUser({
      ...user,
      personalityType: type,
      traits: finalAnswers,
    });

    setOnboardingStep('completed');
  };

  const question = QUESTIONS[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-2 rounded-full mb-12 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">
          Calibration Phase {currentStep + 1}/{QUESTIONS.length}
        </h2>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-12 leading-tight">
          {question.text}
        </h1>

        <div className="grid gap-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option.trait)}
              className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-blue-500/50 transition-all duration-300 text-left"
            >
              <span className="text-lg text-zinc-200 group-hover:text-white transition-colors">
                {option.text}
              </span>
              <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-blue-500 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-all">
                <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
