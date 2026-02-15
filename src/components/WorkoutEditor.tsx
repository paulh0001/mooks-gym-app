'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { Exercise, PlannedExercise, PlannedSet, Workout } from '@/lib/types';

interface Props {
  workout: Workout;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

export default function WorkoutEditor({ workout, onSave, onCancel }: Props) {
  const { data } = useApp();
  const [exercises, setExercises] = useState<PlannedExercise[]>([...workout.exercises]);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function getExName(id: string): string {
    return data.exercises.find((e) => e.id === id)?.name ?? id;
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof PlannedSet, value: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      ex.sets = sets;
      next[exIdx] = ex;
      return next;
    });
  }

  function addSet(exIdx: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1] ?? { reps: 10, restSeconds: 60 };
      ex.sets = [...ex.sets, { ...lastSet }];
      next[exIdx] = ex;
      return next;
    });
  }

  function removeSet(exIdx: number) {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      if (ex.sets.length > 1) {
        ex.sets = ex.sets.slice(0, -1);
      }
      next[exIdx] = ex;
      return next;
    });
  }

  function removeExercise(exIdx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  }

  function moveExercise(exIdx: number, dir: -1 | 1) {
    setExercises((prev) => {
      const next = [...prev];
      const target = exIdx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[exIdx], next[target]] = [next[target], next[exIdx]];
      return next;
    });
  }

  function addExercise(ex: Exercise) {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        sets: Array.from({ length: 3 }, () => ({ reps: 10, restSeconds: 60 })),
      },
    ]);
    setShowAddPicker(false);
    setSearchQuery('');
  }

  const filteredExercises = data.exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !exercises.some((pe) => pe.exerciseId === e.id),
  );

  // Add exercise picker
  if (showAddPicker) {
    return (
      <div className="min-h-[100dvh] bg-bg px-5 pt-safe" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="chrome-bar pt-12 pb-4 flex items-center justify-between px-4 -mx-5">
          <h1 className="text-xl font-bold text-text-bright tracking-wide uppercase">Add Exercise</h1>
          <button
            onClick={() => { setShowAddPicker(false); setSearchQuery(''); }}
            className="text-sm text-text-secondary hover:text-text-bright transition-colors"
          >
            Cancel
          </button>
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-sm bevel-inset bg-bg-surface text-sm mb-4 text-primary border border-border placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary/50 mt-4"
          autoFocus
        />
        <div className="space-y-2 pb-24">
          {filteredExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => addExercise(ex)}
              className="w-full text-left bevel bg-bg-card p-4 rounded-sm border border-border hover:border-primary/40 transition-colors"
            >
              <div className="font-medium text-text-bright">{ex.name}</div>
              <div className="text-xs text-text-secondary mt-0.5">
                {ex.primaryMuscle} · {ex.equipment.join(', ')}
              </div>
            </button>
          ))}
          {filteredExercises.length === 0 && (
            <p className="text-center text-sm text-text-secondary py-8">No matching exercises</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-bg px-5 pt-safe pb-32" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
      <div className="chrome-bar pt-12 pb-4 flex items-center justify-between px-4 -mx-5">
        <h1 className="text-xl font-bold text-text-bright tracking-wide uppercase">Edit: {workout.name}</h1>
        <button onClick={onCancel} className="text-sm text-text-secondary hover:text-text-bright transition-colors">Cancel</button>
      </div>

      <div className="space-y-4 mt-4">
        {exercises.map((pe, exIdx) => (
          <div key={exIdx} className="bevel bg-bg-card rounded-sm border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm text-primary tracking-wide uppercase">{getExName(pe.exerciseId)}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => moveExercise(exIdx, -1)}
                  disabled={exIdx === 0}
                  className="bevel-btn w-8 h-8 rounded-sm bg-bg-raised flex items-center justify-center text-xs text-text-secondary disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveExercise(exIdx, 1)}
                  disabled={exIdx === exercises.length - 1}
                  className="bevel-btn w-8 h-8 rounded-sm bg-bg-raised flex items-center justify-center text-xs text-text-secondary disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeExercise(exIdx)}
                  className="bevel-btn w-8 h-8 rounded-sm bg-bg-raised flex items-center justify-center text-xs text-danger"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sets table */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 text-[10px] text-text-secondary font-medium px-1 uppercase tracking-widest">
                <span>SET</span>
                <span>REPS</span>
                <span>REST (s)</span>
              </div>
              {pe.sets.map((s, sIdx) => (
                <div key={sIdx} className="grid grid-cols-3 gap-2">
                  <div className="flex items-center text-sm text-text-secondary px-1">
                    {sIdx + 1}
                  </div>
                  <input
                    type="number"
                    value={s.reps}
                    onChange={(e) => updateSet(exIdx, sIdx, 'reps', Math.max(1, Number(e.target.value)))}
                    className="bevel-inset bg-bg-surface border border-border rounded-sm px-2 py-1.5 text-sm text-center w-full text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <input
                    type="number"
                    value={s.restSeconds}
                    onChange={(e) => updateSet(exIdx, sIdx, 'restSeconds', Math.max(0, Number(e.target.value)))}
                    className="bevel-inset bg-bg-surface border border-border rounded-sm px-2 py-1.5 text-sm text-center w-full text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => addSet(exIdx)}
                className="bevel-btn flex-1 text-xs text-primary font-medium py-2 rounded-sm bg-bg-raised border border-border"
              >
                + Set
              </button>
              {pe.sets.length > 1 && (
                <button
                  onClick={() => removeSet(exIdx)}
                  className="bevel-btn flex-1 text-xs text-danger font-medium py-2 rounded-sm bg-bg-raised border border-border"
                >
                  − Set
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAddPicker(true)}
        className="bevel-btn w-full mt-4 py-3 rounded-sm border border-border bg-bg-raised text-sm text-text-secondary font-medium hover:text-primary hover:border-primary/40 transition-colors"
      >
        + Add Exercise
      </button>

      {/* Save button */}
      <div className="fixed bottom-20 left-0 right-0 px-5 pb-safe chrome-bar">
        <div className="py-3">
          <button
            onClick={() => onSave({ ...workout, exercises })}
            className="bevel-btn w-full py-4 rounded-sm bg-bg-raised border border-primary text-primary font-semibold glow-green active:opacity-80 uppercase tracking-widest"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
