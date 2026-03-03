'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { ShellColor } from '@/lib/types';

const shellColors: { value: ShellColor; label: string; color: string }[] = [
  { value: 'frosted_purple', label: 'Purple', color: '#8b6fba' },
  { value: 'teal', label: 'Teal', color: '#4db8a8' },
  { value: 'pink', label: 'Pink', color: '#d06b9e' },
  { value: 'green', label: 'Green', color: '#6bba6f' },
  { value: 'orange', label: 'Orange', color: '#d09050' },
];

export default function SettingsView() {
  const { data, update, reset } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  // History subview
  if (showHistory) {
    const sessions = [...data.sessions].reverse();

    return (
      <div className="px-3 py-4 overflow-y-auto" style={{ fontFamily: "'Share Tech Mono', monospace", maxHeight: 340 }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-sm uppercase tracking-widest text-text-bright">
            Workout History
          </h1>
          <button
            onClick={() => setShowHistory(false)}
            className="text-xs uppercase tracking-widest text-primary glow-green"
          >
            [Back]
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-xs uppercase tracking-widest">
            No workouts completed yet.
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const workout = data.currentPlan?.workouts.find((w) => w.id === s.workoutId);
              const completedSets = s.exercises.reduce(
                (acc, e) => acc + e.sets.filter((set) => set.completed).length,
                0,
              );
              const totalSets = s.exercises.reduce((acc, e) => acc + e.sets.length, 0);

              return (
                <div key={s.id} className="bevel bg-bg-card rounded-sm border border-border p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-text-bright uppercase tracking-wider">
                        {workout?.name ?? 'Workout'}
                      </div>
                      <div className="text-[10px] text-text-secondary mt-1 tracking-wide">
                        {s.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="lcd glow-green px-2 py-0.5 rounded-sm inline-block">
                        <span className="text-xs text-primary">{completedSets}/{totalSets}</span>
                      </div>
                      {s.difficultyFeedback && (
                        <div className="text-[10px] text-text-secondary mt-1 capitalize tracking-wide">
                          {s.difficultyFeedback.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const totalSessions = data.sessions.length;
  const totalSets = data.sessions.reduce(
    (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.filter((set) => set.completed).length, 0),
    0,
  );

  return (
    <div
      className="px-3 py-4 overflow-y-auto"
      style={{ fontFamily: "'Share Tech Mono', monospace", maxHeight: 340 }}
    >
      <div className="chrome-bar px-3 py-1.5 rounded-sm mb-3">
        <h1 className="text-sm uppercase tracking-widest text-text-bright glow-green">
          SETTINGS
        </h1>
      </div>

      {/* Shell Color Picker */}
      <div className="bevel bg-bg-card rounded-sm p-3 border border-border mb-3">
        <h3 className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">
          Shell Color
        </h3>
        <div className="flex gap-3 justify-center">
          {shellColors.map((sc) => (
            <button
              key={sc.value}
              onClick={() => update((prev) => ({ ...prev, shellColor: sc.value }))}
              className="relative"
              title={sc.label}
            >
              <div
                className="w-8 h-8 rounded-full transition-all"
                style={{
                  background: sc.color,
                  boxShadow: data.shellColor === sc.value
                    ? `0 0 12px ${sc.color}, 0 0 4px ${sc.color}`
                    : '0 2px 4px rgba(0,0,0,0.3)',
                  border: data.shellColor === sc.value
                    ? '2px solid #ffffff'
                    : '2px solid transparent',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Pet Stats */}
      {data.pet && (
        <div className="bevel bg-bg-card rounded-sm p-3 border border-border mb-3">
          <h3 className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">
            Pet Stats
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Name</span>
              <span className="text-primary">{data.pet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Generation</span>
              <span className="text-text-bright">{data.pet.generation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Fed</span>
              <span className="text-text-bright">{data.pet.totalFed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Born</span>
              <span className="text-text-bright">{data.pet.birthDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status</span>
              <span className={data.pet.isAlive ? 'text-primary' : 'text-danger'}>
                {data.pet.isAlive ? data.pet.hungerStage.toUpperCase() : 'DEAD'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bevel bg-bg-card rounded-sm p-3 border border-border">
          <div className="lcd glow-green rounded-sm px-2 py-1 mb-1">
            <div className="text-2xl text-primary glow-green">{totalSessions}</div>
          </div>
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
            Workouts
          </div>
        </div>
        <div className="bevel bg-bg-card rounded-sm p-3 border border-border">
          <div className="lcd glow-green rounded-sm px-2 py-1 mb-1">
            <div className="text-2xl text-primary glow-green">{totalSets}</div>
          </div>
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">
            Sets Done
          </div>
        </div>
      </div>

      {/* Difficulty Modifiers */}
      <div className="bevel bg-bg-card rounded-sm p-3 border border-border mb-3">
        <h3 className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">
          Difficulty
        </h3>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">Global</span>
            <span
              className={`${data.difficultyModifiers.global > 0 ? 'text-danger' : data.difficultyModifiers.global < 0 ? 'text-primary' : 'text-text'}`}
            >
              {data.difficultyModifiers.global > 0 ? '+' : ''}{data.difficultyModifiers.global}
            </span>
          </div>
          {Object.entries(data.difficultyModifiers.byCategory).map(([cat, val]) => (
            <div key={cat} className="flex justify-between text-xs">
              <span className="text-text-secondary capitalize">{cat.replace('_', ' ')}</span>
              <span className={`${val > 0 ? 'text-danger' : val < 0 ? 'text-primary' : 'text-text'}`}>
                {val > 0 ? '+' : ''}{val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        <button
          onClick={() => setShowHistory(true)}
          className="bevel-btn w-full flex items-center justify-between bg-bg-raised p-3 rounded-sm border border-border"
        >
          <span className="text-[10px] uppercase tracking-widest text-text-bright">
            Workout History
          </span>
          <span className="text-primary text-xs glow-green">{'>>'}</span>
        </button>

        <button
          onClick={async () => {
            if (confirm('Reset all data? This will delete your plan, history, custom exercises, AND your fly. This cannot be undone.')) {
              await reset();
            }
          }}
          className="bevel-btn w-full flex items-center justify-between bg-bg-raised p-3 rounded-sm border border-border"
        >
          <span className="text-[10px] uppercase tracking-widest text-danger">
            Reset All Data
          </span>
          <span className="text-danger text-xs">{'>>'}</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] text-text-secondary/50 tracking-wider">
          Mook&apos;s Gym v2.0 // Tamagotchi Edition
        </p>
      </div>
    </div>
  );
}
