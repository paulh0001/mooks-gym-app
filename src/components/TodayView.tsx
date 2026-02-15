'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { Workout, Plan, Exercise } from '@/lib/types';
import { getEffectiveModifier, applyDifficultyToWorkout } from '@/lib/adaptation';

function getDayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // Convert to Mon=0..Sun=6
}

function getCurrentWeek(plan: Plan): number {
  const created = new Date(plan.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.min(diffWeeks, plan.weekCount - 1);
}

function getExerciseName(exercises: Exercise[], id: string): string {
  return exercises.find((e) => e.id === id)?.name ?? id;
}

interface Props {
  onStartWorkout: (workout: Workout) => void;
}

export default function TodayView({ onStartWorkout }: Props) {
  const { data } = useApp();
  const plan = data.currentPlan;

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-bg">
        <div
          className="bevel-inset p-6 mb-4 bg-bg-surface"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          <span className="lcd text-4xl glow-green">--:--</span>
        </div>
        <h2
          className="text-xl text-text-bright mb-2 tracking-wide"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          NO PLAN LOADED
        </h2>
        <p className="text-text-secondary text-sm" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          Go to the Plan tab to create your workout plan.
        </p>
      </div>
    );
  }

  const weekIdx = getCurrentWeek(plan);
  const dayIdx = getDayOfWeek();
  const week = plan.weeks[weekIdx];
  const workoutId = week?.days[dayIdx] ?? null;

  const todayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIdx];

  if (!workoutId) {
    return (
      <div className="px-5 pt-safe bg-bg min-h-full">
        <div className="pt-12 pb-4">
          <p
            className="text-xs text-text-secondary uppercase tracking-widest"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Week {weekIdx + 1} // {todayName}
          </p>
          <h1
            className="text-2xl text-text-bright mt-1 tracking-wide"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            REST DAY
          </h1>
        </div>
        <div className="groove mb-4" />
        <div className="bevel bg-bg-card rounded-sm p-6 text-center border border-border">
          <div
            className="bevel-inset bg-bg-surface inline-block px-6 py-3 mb-3 rounded-sm"
          >
            <span className="lcd text-3xl glow-green" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              PAUSE
            </span>
          </div>
          <h3
            className="text-text-bright mb-1 tracking-wide"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            RECOVERY MODE
          </h3>
          <p className="text-sm text-text-secondary" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            Take it easy. Stretch, walk, or foam roll. Your muscles grow during rest.
          </p>
        </div>
        {/* Show upcoming workouts */}
        <div className="mt-6">
          <div className="chrome-bar rounded-sm px-3 py-1.5 mb-3">
            <h3
              className="text-xs text-text-secondary uppercase tracking-widest"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              &gt;&gt; QUEUE
            </h3>
          </div>
          {week?.days.slice(dayIdx + 1).map((wId, i) => {
            if (!wId) return null;
            const w = plan.workouts.find((wo) => wo.id === wId);
            if (!w) return null;
            const futureDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIdx + 1 + i];
            return (
              <div key={i} className="bevel bg-bg-card rounded-sm p-3 border border-border mb-2">
                <div
                  className="text-xs text-text-secondary uppercase tracking-wider"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {futureDay}
                </div>
                <div
                  className="text-text-bright text-sm"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {w.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const baseWorkout = plan.workouts.find((w) => w.id === workoutId);
  if (!baseWorkout) return null;

  const modifier = getEffectiveModifier(data.difficultyModifiers, baseWorkout.category);
  const workout = modifier !== 0
    ? applyDifficultyToWorkout(baseWorkout, modifier, data.exercises)
    : baseWorkout;

  const todaySessions = data.sessions.filter(
    (s) => s.date === new Date().toISOString().slice(0, 10) && s.workoutId === workoutId,
  );
  const completed = todaySessions.some((s) => s.completedAt);

  return (
    <div className="px-5 pt-safe pb-24 bg-bg min-h-full">
      {/* Header section */}
      <div className="pt-12 pb-2">
        <p
          className="text-xs text-text-secondary uppercase tracking-widest"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          Week {weekIdx + 1} // {todayName}
        </p>
        <h1
          className="text-2xl text-text-bright mt-1 tracking-wide"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          {workout.name}
        </h1>
        {modifier !== 0 && (
          <p
            className="text-xs text-primary mt-1 glow-green"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            [DIFF {modifier > 0 ? '+' : ''}{modifier}]
          </p>
        )}
      </div>

      <div className="groove mb-4" />

      {completed && (
        <div className="bevel bg-bg-card border border-primary/30 rounded-sm p-4 mb-4 scanlines">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className="text-primary glow-green"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              SESSION COMPLETE
            </span>
          </div>
        </div>
      )}

      {/* Exercises preview */}
      <div className="space-y-2 mb-6">
        {workout.exercises.map((pe, i) => (
          <div key={i} className="bevel bg-bg-card rounded-sm p-4 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <div
                  className="text-text-bright text-sm"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {getExerciseName(data.exercises, pe.exerciseId)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="lcd text-primary text-sm glow-green"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {pe.sets.length}x{pe.sets[0]?.reps}
                  </span>
                </div>
              </div>
              <div
                className="bevel-inset bg-bg-surface rounded-sm px-2 py-1"
              >
                <span
                  className="text-xs text-accent"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {pe.sets[0]?.restSeconds}s
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onStartWorkout(workout)}
        className="bevel-btn w-full py-4 rounded-sm bg-primary text-bg font-semibold text-lg active:brightness-75 transition-colors pulse-glow"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        {completed ? '>> REPLAY' : '>> START'}
      </button>
    </div>
  );
}
