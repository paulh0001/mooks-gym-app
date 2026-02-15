'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DifficultyFeedback, WorkoutSession, Stretch } from '@/lib/types';
import { useApp } from '@/lib/context';
import { updateModifiers } from '@/lib/adaptation';

const feedbackOptions: { value: DifficultyFeedback; label: string; emoji: string }[] = [
  { value: 'much_easier', label: 'Much Easier', emoji: '😴' },
  { value: 'easier', label: 'Easier', emoji: '🙂' },
  { value: 'same', label: 'Just Right', emoji: '💪' },
  { value: 'harder', label: 'Harder', emoji: '😤' },
  { value: 'much_harder', label: 'Much Harder', emoji: '🥵' },
];

// ── Stretch Timer ──

function StretchTimer({
  stretch,
  onDone,
  onSkip,
}: {
  stretch: Stretch;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [left, setLeft] = useState(stretch.durationSeconds);

  useEffect(() => {
    setLeft(stretch.durationSeconds);
  }, [stretch]);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  return (
    <div className="flex flex-col items-center text-center px-5">
      <div className="relative w-32 h-32 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a45" strokeWidth="5" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#39ff14" strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (left / stretch.durationSeconds)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl font-bold text-primary lcd"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {left}
          </span>
        </div>
      </div>
      <h2
        className="text-xl font-bold mb-2 text-text-bright"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        {stretch.name}
      </h2>
      <p className="text-sm text-text-secondary mb-6 leading-relaxed max-w-xs">
        {stretch.instructions}
      </p>
      <button
        onClick={onSkip}
        className="text-sm text-text-secondary underline hover:text-primary transition-colors"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        Skip this stretch
      </button>
    </div>
  );
}

// ── Main PostWorkout Component ──

interface Props {
  session: WorkoutSession;
  onDone: () => void;
}

export default function PostWorkout({ session, onDone }: Props) {
  const { data, update } = useApp();
  const [phase, setPhase] = useState<'feedback' | 'stretching' | 'done'>('feedback');
  const [selected, setSelected] = useState<DifficultyFeedback | null>(null);
  const [stretchIdx, setStretchIdx] = useState(0);

  const stretches = data.stretches.slice(0, 8); // 8 stretches max

  const handleFeedbackSubmit = useCallback(() => {
    if (!selected) return;

    // Save session with feedback
    const updatedSession = { ...session, difficultyFeedback: selected };
    update((prev) => ({
      ...prev,
      sessions: [...prev.sessions, updatedSession],
    }));

    // Update difficulty modifiers
    const workout = data.currentPlan?.workouts.find((w) => w.id === session.workoutId);
    if (workout) {
      update((prev) => ({
        ...prev,
        difficultyModifiers: updateModifiers(prev.difficultyModifiers, workout.category, selected),
      }));
    }

    setPhase('stretching');
  }, [selected, session, data.currentPlan, update]);

  const handleStretchDone = useCallback(() => {
    if (stretchIdx < stretches.length - 1) {
      setStretchIdx(stretchIdx + 1);
    } else {
      setPhase('done');
    }
  }, [stretchIdx, stretches.length]);

  const handleSkipStretching = useCallback(() => {
    setPhase('done');
  }, []);

  // Feedback phase
  if (phase === 'feedback') {
    return (
      <div
        className="min-h-[100dvh] flex flex-col bg-bg px-5 pt-safe"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        <div className="pt-16 pb-6 text-center">
          <div className="chrome-bar rounded-sm px-4 py-3 mb-4 inline-block">
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              // SESSION COMPLETE
            </span>
          </div>
          <div className="bevel rounded-sm bg-bg-surface p-6 mb-3">
            <div className="lcd rounded-sm p-4">
              <div className="text-5xl mb-3">🎉</div>
              <h1 className="text-2xl font-bold text-primary glow-green">Workout Complete!</h1>
              <p className="text-text-secondary mt-2 text-sm">How did that feel?</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {feedbackOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-sm transition-all ${
                selected === opt.value
                  ? 'bevel glow-green-box bg-bg-surface border border-primary/30'
                  : 'bevel-btn bg-bg-card border border-border'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className={`font-medium ${
                selected === opt.value ? 'text-primary' : 'text-text'
              }`}>
                {opt.label}
              </span>
              {opt.value === 'same' && (
                <span className="ml-auto text-xs text-text-secondary">Perfect</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto py-6 pb-8">
          <button
            onClick={handleFeedbackSubmit}
            disabled={!selected}
            className={`w-full py-4 rounded-sm font-semibold transition-all ${
              selected
                ? 'bevel-btn bg-bg-raised text-primary glow-green active:bg-bg-surface'
                : 'bevel-inset bg-bg-surface text-text-secondary'
            }`}
          >
            Continue to Stretching
          </button>
        </div>
      </div>
    );
  }

  // Stretching phase
  if (phase === 'stretching') {
    return (
      <div
        className="min-h-[100dvh] flex flex-col bg-bg pt-safe"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">
              Stretch {stretchIdx + 1}/{stretches.length}
            </p>
            <div className="chrome-bar rounded-sm px-3 py-1 mt-1 inline-block">
              <h1 className="text-lg font-bold text-text-bright">Cool Down</h1>
            </div>
          </div>
          <button
            onClick={handleSkipStretching}
            className="text-sm text-text-secondary bevel-btn rounded-sm px-3 py-1 hover:text-primary transition-colors"
          >
            Skip All
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 px-5 mb-8">
          {stretches.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-sm ${
                i <= stretchIdx ? 'bg-primary progress-shine' : 'bevel-inset bg-bg-surface'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 flex items-center">
          <StretchTimer
            key={stretches[stretchIdx].id}
            stretch={stretches[stretchIdx]}
            onDone={handleStretchDone}
            onSkip={handleStretchDone}
          />
        </div>
      </div>
    );
  }

  // Done
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg px-6 text-center pt-safe"
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      <div className="bevel rounded-sm bg-bg-surface p-8 max-w-xs w-full">
        <div className="lcd rounded-sm p-6">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-2xl font-bold mb-2 text-primary glow-green">All Done!</h1>
          <p className="text-text-secondary mb-8 text-sm">
            Great session. Recovery starts now.
          </p>
        </div>
        <button
          onClick={onDone}
          className="w-full mt-6 py-4 rounded-sm bevel-btn bg-bg-raised text-primary font-semibold glow-green active:bg-bg-surface transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
