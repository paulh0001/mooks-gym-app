'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { Exercise, Plan, PlannedExercise, PlannedSet, Workout } from '@/lib/types';
import WorkoutEditor from './WorkoutEditor';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  onCreatePlan: () => void;
}

export default function PlanView({ onCreatePlan }: Props) {
  const { data, update } = useApp();
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [viewWeek, setViewWeek] = useState(0);
  const plan = data.currentPlan;

  if (!plan) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6 text-center"
        style={{ fontFamily: "'Share Tech Mono', monospace", minHeight: 340 }}
      >
        <div className="text-4xl mb-3">📋</div>
        <h2 className="text-lg font-bold mb-2 text-primary uppercase tracking-widest">
          No Plan Yet
        </h2>
        <p className="text-text-secondary text-xs mb-4 uppercase tracking-widest">
          Answer a few questions and we&apos;ll build a personalized workout plan.
        </p>
        <button
          onClick={onCreatePlan}
          className="bevel-btn px-6 py-3 rounded-sm bg-bg-raised text-primary glow-green font-semibold active:opacity-80 uppercase tracking-widest text-sm"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          Create Plan
        </button>
      </div>
    );
  }

  if (editingWorkout) {
    const workout = plan.workouts.find((w) => w.id === editingWorkout);
    if (!workout) return null;
    return (
      <WorkoutEditor
        workout={workout}
        onSave={(updated) => {
          update((prev) => {
            if (!prev.currentPlan) return prev;
            return {
              ...prev,
              currentPlan: {
                ...prev.currentPlan,
                workouts: prev.currentPlan.workouts.map((w) =>
                  w.id === updated.id ? updated : w,
                ),
              },
            };
          });
          setEditingWorkout(null);
        }}
        onCancel={() => setEditingWorkout(null)}
      />
    );
  }

  const week = plan.weeks[viewWeek];

  return (
    <div className="px-3 py-3 overflow-y-auto" style={{ fontFamily: "'Share Tech Mono', monospace", maxHeight: 340 }}>
      {/* Header chrome bar */}
      <div className="chrome-bar flex items-center justify-between px-3 py-1.5 rounded-sm mb-3">
        <h1 className="text-sm font-bold text-primary uppercase tracking-widest glow-green">
          Your Plan
        </h1>
        <button
          onClick={onCreatePlan}
          className="text-xs text-primary font-medium uppercase tracking-widest hover:glow-green"
        >
          New
        </button>
      </div>

      {/* Week selector */}
      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {plan.weeks.map((_, i) => (
          <button
            key={i}
            onClick={() => setViewWeek(i)}
            className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap transition-all uppercase tracking-widest ${
              viewWeek === i
                ? 'bevel bg-bg-raised text-primary glow-green'
                : 'bevel-btn bg-bg-card border border-border text-text-secondary'
            }`}
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Week {i + 1}
          </button>
        ))}
      </div>

      {/* Days */}
      <div className="space-y-2">
        {week.days.map((workoutId, dayIdx) => {
          const workout = workoutId
            ? plan.workouts.find((w) => w.id === workoutId)
            : null;

          return (
            <div
              key={dayIdx}
              className="bevel-inset bg-bg-card rounded-sm border border-border overflow-hidden"
            >
              <div className="flex items-center p-4">
                <div
                  className="lcd w-10 h-10 rounded-sm bg-bg-surface flex items-center justify-center text-xs font-bold text-primary mr-3 border border-border uppercase tracking-widest"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {dayNames[dayIdx]}
                </div>
                {workout ? (
                  <div className="flex-1">
                    <div
                      className="font-medium text-text-bright uppercase tracking-widest"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      {workout.name}
                    </div>
                    <div
                      className="text-xs text-text-secondary uppercase tracking-widest"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      {workout.exercises.length} exercises
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex-1 text-text-secondary text-sm uppercase tracking-widest"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    Rest Day
                  </div>
                )}
                {workout && (
                  <button
                    onClick={() => setEditingWorkout(workout.id)}
                    className="bevel-btn text-xs text-primary font-medium px-3 py-1.5 rounded-sm bg-bg-raised border border-border uppercase tracking-widest"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Swap day instructions */}
      <p
        className="text-center text-xs text-text-secondary mt-6 uppercase tracking-widest"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        Tap Edit to modify exercises, sets, and reps
      </p>

      {/* Delete plan */}
      <button
        onClick={() => {
          if (confirm('Delete this plan? This cannot be undone.')) {
            update((prev) => ({ ...prev, currentPlan: undefined, questionnaire: undefined }));
          }
        }}
        className="bevel-btn w-full mt-6 py-3 text-danger text-sm font-medium rounded-sm border border-border bg-bg-card uppercase tracking-widest hover:opacity-80"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        Delete Plan
      </button>
    </div>
  );
}
