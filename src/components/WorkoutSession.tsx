'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Workout, CompletedExercise, CompletedSet, WorkoutSession as Session, Exercise } from '@/lib/types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getExercise(exercises: Exercise[], id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

// ── Rest Timer Component ──

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const pct = ((seconds - left) / seconds) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a45" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#39ff14" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="lcd glow-green text-4xl font-bold text-primary px-3 py-1 rounded-sm"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {left}
          </span>
          <span
            className="text-xs text-text-secondary mt-1"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            seconds
          </span>
        </div>
      </div>
      <p
        className="text-text-secondary mt-4 text-sm"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        Rest before next set
      </p>
      <button
        onClick={onDone}
        className="mt-4 px-6 py-2 rounded-sm bevel-btn text-sm font-medium text-text-bright"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        Skip Rest
      </button>
    </div>
  );
}

// ── Main Session Component ──

interface Props {
  workout: Workout;
  onComplete: (session: Session) => void;
  onCancel: () => void;
}

export default function WorkoutSessionRunner({ workout, onComplete, onCancel }: Props) {
  const { data } = useApp();
  const [exerciseIdx, setExerciseIdx] = useState(-1); // -1 = warmup summary
  const [setIdx, setSetIdx] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [completed, setCompleted] = useState<CompletedExercise[]>(() =>
    workout.exercises.map((pe) => ({
      exerciseId: pe.exerciseId,
      sets: pe.sets.map((s) => ({ reps: s.reps, weight: s.weight, completed: false })),
    })),
  );
  const startedAt = useRef(new Date().toISOString());

  const allExercises = workout.exercises;
  const currentPlanned = exerciseIdx >= 0 ? allExercises[exerciseIdx] : null;
  const currentExercise = currentPlanned
    ? getExercise(data.exercises, currentPlanned.exerciseId)
    : null;

  const handleSetComplete = useCallback(() => {
    if (!currentPlanned || exerciseIdx < 0) return;

    setCompleted((prev) => {
      const next = [...prev];
      const ex = { ...next[exerciseIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], completed: true };
      ex.sets = sets;
      next[exerciseIdx] = ex;
      return next;
    });

    const isLastSet = setIdx >= currentPlanned.sets.length - 1;
    const isLastExercise = exerciseIdx >= allExercises.length - 1;

    if (isLastSet && isLastExercise) {
      // Workout done
      const session: Session = {
        id: uid(),
        workoutId: workout.id,
        planId: data.currentPlan?.id ?? '',
        date: new Date().toISOString().slice(0, 10),
        startedAt: startedAt.current,
        completedAt: new Date().toISOString(),
        exercises: completed.map((c, i) => {
          if (i === exerciseIdx) {
            const sets = [...c.sets];
            sets[setIdx] = { ...sets[setIdx], completed: true };
            return { ...c, sets };
          }
          return c;
        }),
      };
      onComplete(session);
    } else if (isLastSet) {
      // Move to next exercise
      setIsResting(true);
    } else {
      // Rest then next set
      setIsResting(true);
    }
  }, [exerciseIdx, setIdx, currentPlanned, allExercises, completed, workout, data.currentPlan, onComplete]);

  const handleRestDone = useCallback(() => {
    setIsResting(false);
    if (!currentPlanned || exerciseIdx < 0) return;

    const isLastSet = setIdx >= currentPlanned.sets.length - 1;
    if (isLastSet) {
      setExerciseIdx(exerciseIdx + 1);
      setSetIdx(0);
    } else {
      setSetIdx(setIdx + 1);
    }
  }, [exerciseIdx, setIdx, currentPlanned]);

  // Warmup screen
  if (exerciseIdx === -1) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-bg px-5 pt-safe">
        <div className="chrome-bar pt-12 pb-4 flex items-center justify-between px-4 -mx-5">
          <h1
            className="text-xl font-bold text-text-bright"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {workout.name}
          </h1>
          <button
            onClick={onCancel}
            className="text-sm text-danger px-3 py-1 bevel-btn rounded-sm"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Cancel
          </button>
        </div>

        {workout.warmup && workout.warmup.length > 0 && (
          <div className="mb-6 mt-4">
            <h2
              className="text-sm font-semibold text-primary glow-green mb-3 tracking-widest"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              WARM-UP
            </h2>
            {workout.warmup.map((w, i) => {
              const ex = getExercise(data.exercises, w.exerciseId);
              return (
                <div key={i} className="bevel-inset bg-bg-surface rounded-sm p-4 mb-2">
                  <div
                    className="font-medium text-text-bright"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {ex?.name ?? w.exerciseId}
                  </div>
                  <div
                    className="text-sm text-text-secondary"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {w.sets[0]?.reps} reps – light and controlled
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mb-6 mt-2">
          <h2
            className="text-sm font-semibold text-primary glow-green mb-3 tracking-widest"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            TODAY&apos;S EXERCISES
          </h2>
          {allExercises.map((pe, i) => {
            const ex = getExercise(data.exercises, pe.exerciseId);
            return (
              <div key={i} className="bevel-inset bg-bg-surface rounded-sm p-4 mb-2">
                <div
                  className="font-medium text-text-bright"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {ex?.name ?? pe.exerciseId}
                </div>
                <div
                  className="text-sm text-text-secondary"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {pe.sets.length} sets × {pe.sets[0]?.reps} reps · {pe.sets[0]?.restSeconds}s rest
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto py-6 pb-8">
          <button
            onClick={() => { setExerciseIdx(0); setSetIdx(0); }}
            className="w-full py-4 rounded-sm bevel-btn text-primary font-semibold text-lg glow-green pulse-glow"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Begin Workout
          </button>
        </div>
      </div>
    );
  }

  // Rest screen
  if (isResting && currentPlanned) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-bg px-5 pt-safe">
        <div className="chrome-bar pt-12 pb-4 flex items-center justify-between px-4 -mx-5">
          <h1
            className="text-lg font-bold text-text-bright"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {workout.name}
          </h1>
          <button
            onClick={onCancel}
            className="text-sm text-danger bevel-btn rounded-sm px-3 py-1"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Cancel
          </button>
        </div>
        <RestTimer
          seconds={currentPlanned.sets[setIdx]?.restSeconds ?? 60}
          onDone={handleRestDone}
        />
      </div>
    );
  }

  // Active set screen
  if (!currentExercise || !currentPlanned) return null;

  const progress = ((exerciseIdx * 100) / allExercises.length);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg px-5 pt-safe">
      {/* Header */}
      <div className="chrome-bar pt-12 pb-2 flex items-center justify-between px-4 -mx-5">
        <div>
          <p
            className="text-xs text-text-secondary"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Exercise {exerciseIdx + 1}/{allExercises.length}
          </p>
          <h1
            className="text-xl font-bold mt-0.5 text-text-bright"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {currentExercise.name}
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-danger px-3 py-1 bevel-btn rounded-sm"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          Cancel
        </button>
      </div>

      {/* Progress bar */}
      <div className="bevel-inset h-3 bg-bg-surface rounded-sm mb-6 mt-4 overflow-hidden">
        <div
          className="h-full progress-shine rounded-sm transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Instructions */}
      <div className="bevel-inset bg-bg-surface rounded-sm p-4 mb-6">
        <p
          className="text-sm text-text-secondary leading-relaxed"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          {currentExercise.instructions}
        </p>
      </div>

      {/* Set indicator */}
      <div className="flex gap-2 mb-8 justify-center">
        {currentPlanned.sets.map((_, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold transition-all ${
              i < setIdx
                ? 'lcd glow-green-box text-primary glow-green'
                : i === setIdx
                  ? 'lcd text-primary glow-green glow-green-box scale-110'
                  : 'bevel-inset bg-bg-surface text-text-secondary'
            }`}
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {i < setIdx ? '>' : i + 1}
          </div>
        ))}
      </div>

      {/* Current set info */}
      <div className="text-center mb-8">
        <div
          className="lcd glow-green text-5xl font-bold text-primary inline-block px-6 py-3 rounded-sm mb-2"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          {currentPlanned.sets[setIdx]?.reps}
        </div>
        <div
          className="text-text-secondary text-sm"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          reps · Set {setIdx + 1} of {currentPlanned.sets.length}
        </div>
      </div>

      {/* Complete set button */}
      <div className="mt-auto py-6 pb-8">
        <button
          onClick={handleSetComplete}
          className="w-full py-5 rounded-sm bevel-btn text-primary font-semibold text-lg glow-green glow-green-box active:brightness-90 transition-all"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          Complete Set &gt;
        </button>
      </div>
    </div>
  );
}
