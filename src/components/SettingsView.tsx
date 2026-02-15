'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';

export default function SettingsView() {
  const { data, reset } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  // History subview
  if (showHistory) {
    const sessions = [...data.sessions].reverse();

    return (
      <div className="min-h-[100dvh] bg-bg px-5 pt-safe pb-24" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="pt-12 pb-4">
          <div className="chrome-bar flex items-center justify-between px-3 py-2 rounded-sm">
            <h1
              className="text-sm uppercase tracking-widest text-text-bright"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              Workout History
            </h1>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs uppercase tracking-widest text-primary glow-green"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              [Back]
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div
            className="text-center py-12 text-text-secondary text-xs uppercase tracking-widest"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
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
                <div key={s.id} className="bevel bg-bg-card rounded-sm border border-border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className="text-sm text-text-bright uppercase tracking-wider"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                      >
                        {workout?.name ?? 'Workout'}
                      </div>
                      <div
                        className="text-xs text-text-secondary mt-1 tracking-wide"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                      >
                        {s.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="lcd glow-green px-2 py-1 rounded-sm inline-block">
                        <span
                          className="text-sm text-primary"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          {completedSets}/{totalSets}
                        </span>
                      </div>
                      {s.difficultyFeedback && (
                        <div
                          className="text-xs text-text-secondary mt-1 capitalize tracking-wide"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
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
    <div className="px-5 pt-safe pb-24 bg-bg" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
      <div className="pt-12 pb-6">
        <div className="chrome-bar px-3 py-2 rounded-sm">
          <h1
            className="text-lg uppercase tracking-widest text-text-bright glow-green"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            EQ
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bevel bg-bg-card rounded-sm p-4 border border-border">
          <div className="lcd glow-green rounded-sm px-2 py-2 mb-2">
            <div
              className="text-3xl text-primary glow-green"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              {totalSessions}
            </div>
          </div>
          <div
            className="text-xs text-text-secondary uppercase tracking-widest mt-1"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Workouts
          </div>
        </div>
        <div className="bevel bg-bg-card rounded-sm p-4 border border-border">
          <div className="lcd glow-green rounded-sm px-2 py-2 mb-2">
            <div
              className="text-3xl text-primary glow-green"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              {totalSets}
            </div>
          </div>
          <div
            className="text-xs text-text-secondary uppercase tracking-widest mt-1"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Sets Completed
          </div>
        </div>
      </div>

      {/* Difficulty Modifiers */}
      <div className="bevel bg-bg-card rounded-sm p-4 border border-border mb-6">
        <h3
          className="text-xs text-text-secondary uppercase tracking-widest mb-3"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          Difficulty Modifiers
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span
              className="uppercase tracking-widest text-text-secondary text-xs"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              Global
            </span>
            <span
              className={`${data.difficultyModifiers.global > 0 ? 'text-danger' : data.difficultyModifiers.global < 0 ? 'text-primary' : 'text-text'}`}
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              {data.difficultyModifiers.global > 0 ? '+' : ''}{data.difficultyModifiers.global}
            </span>
          </div>
          {Object.entries(data.difficultyModifiers.byCategory).map(([cat, val]) => (
            <div key={cat} className="flex justify-between text-sm">
              <span
                className="capitalize uppercase tracking-widest text-text-secondary text-xs"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                {cat.replace('_', ' ')}
              </span>
              <span
                className={`${val > 0 ? 'text-danger' : val < 0 ? 'text-primary' : 'text-text'}`}
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
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
          className="bevel-btn w-full flex items-center justify-between bg-bg-raised p-4 rounded-sm border border-border"
        >
          <span
            className="text-xs uppercase tracking-widest text-text-bright"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Workout History
          </span>
          <span
            className="text-primary text-xs glow-green"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {'>>'}
          </span>
        </button>

        <button
          onClick={async () => {
            if (confirm('Reset all data? This will delete your plan, history, and custom exercises. This cannot be undone.')) {
              await reset();
            }
          }}
          className="bevel-btn w-full flex items-center justify-between bg-bg-raised p-4 rounded-sm border border-border"
        >
          <span
            className="text-xs uppercase tracking-widest text-danger"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Reset All Data
          </span>
          <span
            className="text-danger text-xs"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            {'>>'}
          </span>
        </button>
      </div>

      <div className="mt-8 text-center">
        <div className="groove rounded-sm inline-block px-6 py-2 bg-bg-surface border border-border">
          <p
            className="text-xs text-text-secondary tracking-widest"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Mook&apos;s Gym App v1.0
          </p>
          <p
            className="text-[10px] text-text-secondary/50 mt-0.5 tracking-wider"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            Copyright (c) 2024 Mook Software
          </p>
        </div>
      </div>
    </div>
  );
}
