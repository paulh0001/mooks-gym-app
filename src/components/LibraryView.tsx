'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { Exercise, Equipment, MuscleGroup, MovementPattern } from '@/lib/types';
import { YouTubeIcon, youtubeSearchUrl } from './ExerciseIcons';

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes',
  calves: 'Calves', core: 'Core', full_body: 'Full Body',
};

const muscleFilters: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core',
];

function uid(): string {
  return 'custom_' + Math.random().toString(36).slice(2, 10);
}

export default function LibraryView() {
  const { data, update } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('chest');
  const [newPattern, setNewPattern] = useState<MovementPattern>('push');
  const [newEquip, setNewEquip] = useState<Equipment[]>(['bodyweight']);
  const [newInstructions, setNewInstructions] = useState('');
  const [newTier, setNewTier] = useState<1 | 2 | 3 | 4 | 5>(2);

  const filtered = data.exercises.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && e.primaryMuscle !== filter) return false;
    return true;
  });

  // Detail view
  if (showDetail) {
    const ex = data.exercises.find((e) => e.id === showDetail);
    if (!ex) return null;

    return (
      <div className="min-h-[100dvh] bg-bg px-5 pt-safe pb-24" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="pt-12 pb-4 flex items-center justify-between chrome-bar rounded-sm px-3 py-2">
          <button onClick={() => setShowDetail(null)} className="text-sm text-primary glow-green uppercase tracking-widest">
            &larr; BACK
          </button>
          {ex.isCustom && (
            <button
              onClick={() => {
                update((prev) => ({
                  ...prev,
                  exercises: prev.exercises.filter((e) => e.id !== ex.id),
                }));
                setShowDetail(null);
              }}
              className="text-sm text-danger uppercase tracking-widest"
            >
              DELETE
            </button>
          )}
        </div>

        <h1 className="text-2xl text-text-bright mt-4 mb-4 glow-green uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{ex.name}</h1>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bevel-btn px-3 py-1 rounded-sm text-primary text-xs uppercase tracking-widest glow-green" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            {muscleLabels[ex.primaryMuscle]}
          </span>
          {ex.secondaryMuscles?.map((m) => (
            <span key={m} className="bevel-btn px-3 py-1 rounded-sm bg-bg-card border border-border text-xs text-text-secondary uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              {muscleLabels[m]}
            </span>
          ))}
        </div>

        <a
          href={youtubeSearchUrl(ex.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bevel-btn px-4 py-2 rounded-sm mb-4"
        >
          <YouTubeIcon size={16} />
          <span className="text-xs text-text-bright uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            Watch Form
          </span>
        </a>

        <div className="bevel bg-bg-card rounded-sm p-4 border border-border mb-4">
          <h3 className="text-sm text-text-secondary mb-2 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>INSTRUCTIONS</h3>
          <p className="text-sm leading-relaxed text-text">{ex.instructions}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bevel bg-bg-card rounded-sm p-3 border border-border">
            <div className="text-xs text-text-secondary uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Equipment</div>
            <div className="text-sm text-text-bright mt-0.5" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{ex.equipment.join(', ')}</div>
          </div>
          <div className="bevel bg-bg-card rounded-sm p-3 border border-border">
            <div className="text-xs text-text-secondary uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Difficulty</div>
            <div className="text-sm mt-0.5" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              <span className="text-primary glow-green">{'●'.repeat(ex.difficultyTier)}</span><span className="text-text-secondary">{'○'.repeat(5 - ex.difficultyTier)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create form
  if (showCreate) {
    return (
      <div className="min-h-[100dvh] bg-bg px-5 pt-safe pb-24" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="pt-12 pb-4 flex items-center justify-between chrome-bar rounded-sm px-3 py-2">
          <h1 className="text-xl text-text-bright uppercase tracking-widest glow-green">Create Exercise</h1>
          <button onClick={() => setShowCreate(false)} className="text-sm text-text-secondary uppercase tracking-widest">
            Cancel
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-text-secondary block mb-1 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 rounded-sm border border-border bevel-inset bg-bg-surface text-sm text-text-bright"
              placeholder="e.g., Pistol Squat"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary block mb-1 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Primary Muscle</label>
            <select
              value={newMuscle}
              onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)}
              className="w-full p-3 rounded-sm border border-border bevel-inset bg-bg-surface text-sm text-text-bright"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              {muscleFilters.map((m) => (
                <option key={m} value={m}>{muscleLabels[m]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-secondary block mb-1 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Movement Pattern</label>
            <div className="flex gap-2">
              {(['push', 'pull', 'legs', 'core'] as MovementPattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPattern(p)}
                  className={`flex-1 py-2 rounded-sm text-xs uppercase tracking-widest bevel-btn ${
                    newPattern === p ? 'text-primary glow-green border border-primary' : 'bg-bg-card border border-border text-text-secondary'
                  }`}
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-text-secondary block mb-1 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Difficulty (1-5)</label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewTier(t)}
                  className={`w-10 h-10 rounded-sm text-sm bevel-btn ${
                    newTier === t ? 'lcd text-primary glow-green border border-primary' : 'bg-bg-card border border-border text-text-secondary'
                  }`}
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-text-secondary block mb-1 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Instructions</label>
            <textarea
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-sm border border-border bevel-inset bg-bg-surface text-sm text-text-bright"
              placeholder="Describe how to perform this exercise..."
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (!newName.trim()) return;
            const exercise: Exercise = {
              id: uid(),
              name: newName.trim(),
              equipment: newEquip,
              primaryMuscle: newMuscle,
              movementPattern: newPattern,
              difficultyTier: newTier,
              instructions: newInstructions,
              isCustom: true,
            };
            update((prev) => ({ ...prev, exercises: [...prev.exercises, exercise] }));
            setShowCreate(false);
            setNewName('');
            setNewInstructions('');
          }}
          disabled={!newName.trim()}
          className={`w-full mt-6 py-4 rounded-sm bevel-btn uppercase tracking-widest text-sm ${
            newName.trim() ? 'text-primary glow-green border border-primary glow-green-box' : 'bg-bg-raised border border-border text-text-secondary'
          }`}
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          Create Exercise
        </button>
      </div>
    );
  }

  // List view
  return (
    <div className="px-3 py-3 overflow-y-auto" style={{ fontFamily: "'Share Tech Mono', monospace", maxHeight: 340 }}>
      <div className="flex items-center justify-between chrome-bar rounded-sm px-3 py-1.5 mb-3">
        <h1 className="text-sm text-text-bright uppercase tracking-widest glow-green">Library</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-7 h-7 rounded-sm bevel-btn flex items-center justify-center text-primary text-sm glow-green"
        >
          +
        </button>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded-sm border border-border bevel-inset bg-bg-surface text-xs text-text-bright mb-3"
      />

      {/* Muscle filter chips */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-3">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest whitespace-nowrap bevel-btn ${
            !filter ? 'text-primary glow-green border border-primary' : 'bg-bg-card border border-border text-text-secondary'
          }`}
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          All
        </button>
        {muscleFilters.map((m) => (
          <button
            key={m}
            onClick={() => setFilter(filter === m ? null : m)}
            className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest whitespace-nowrap bevel-btn ${
              filter === m ? 'text-primary glow-green border border-primary' : 'bg-bg-card border border-border text-text-secondary'
            }`}
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {muscleLabels[m]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setShowDetail(ex.id)}
            className="w-full text-left bevel bg-bg-card p-4 rounded-sm border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-bright">{ex.name}</div>
                <div className="text-xs mt-0.5" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  <span className="text-text-secondary">{muscleLabels[ex.primaryMuscle]}</span>
                  <span className="text-text-secondary"> · </span>
                  <span className="text-primary glow-green">{'●'.repeat(ex.difficultyTier)}</span><span className="text-text-secondary">{'○'.repeat(5 - ex.difficultyTier)}</span>
                </div>
              </div>
              {ex.isCustom && (
                <span className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded-sm bevel-btn uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  Custom
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-text-secondary mt-4 uppercase tracking-widest">
        {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
