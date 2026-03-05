'use client';

import React, { useState, useMemo } from 'react';
import { Equipment, Exercise, ExperienceLevel, Goal, MovementPattern, QuestionnaireAnswers } from '@/lib/types';
import { useApp } from '@/lib/context';
import { YouTubeIcon, youtubeSearchUrl } from './ExerciseIcons';
import FruitFly from './FruitFly';

const goals: { value: Goal; label: string; desc: string }[] = [
  { value: 'strength', label: 'STRENGTH', desc: 'Lift heavier, get stronger' },
  { value: 'hypertrophy', label: 'MUSCLE & TONE', desc: 'Build muscle, look toned' },
  { value: 'fat_loss', label: 'FAT LOSS', desc: 'Burn fat, get lean' },
  { value: 'general_fitness', label: 'GENERAL FIT', desc: 'Stay fit and healthy' },
];

const equipmentOptions: { value: Equipment; label: string }[] = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'resistance_bands', label: 'Bands' },
  { value: 'pull_up_bar', label: 'Pull-Up Bar' },
  { value: 'bench', label: 'Bench' },
  { value: 'cable_machine', label: 'Cable Machine' },
  { value: 'machine', label: 'Gym Machines' },
  { value: 'trx', label: 'TRX / Suspension' },
];

interface Props {
  onComplete: (answers: QuestionnaireAnswers, petName: string) => void;
}

export default function Questionnaire({ onComplete }: Props) {
  const { data } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favSearch, setFavSearch] = useState('');
  const [frequency, setFrequency] = useState(3);
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [sessionMinutes, setSessionMinutes] = useState(30);
  const [petName, setPetName] = useState('');

  const totalSteps = 6;

  // Exercises filtered by selected equipment for the favorites picker
  const availableExercises = useMemo(() => {
    const eqSet = new Set(equipment);
    eqSet.add('bodyweight');
    return data.exercises.filter((ex) => ex.equipment.every((e) => eqSet.has(e)));
  }, [data.exercises, equipment]);

  // Group available exercises by movement pattern, filtered by search
  const groupedExercises = useMemo(() => {
    const query = favSearch.toLowerCase();
    const filtered = query
      ? availableExercises.filter((ex) => ex.name.toLowerCase().includes(query))
      : availableExercises;

    const groups: Record<string, Exercise[]> = {};
    const patternLabels: Record<MovementPattern, string> = {
      push: 'PUSH',
      pull: 'PULL',
      legs: 'LEGS',
      core: 'CORE',
      compound: 'COMPOUND',
    };
    for (const ex of filtered) {
      const label = patternLabels[ex.movementPattern] || ex.movementPattern.toUpperCase();
      if (!groups[label]) groups[label] = [];
      groups[label].push(ex);
    }
    return groups;
  }, [availableExercises, favSearch]);

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleEquipment(eq: Equipment) {
    if (eq === 'bodyweight') return;
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq],
    );
  }

  function next() {
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      onComplete(
        {
          goal: goal!,
          equipment,
          favoriteExerciseIds: favoriteIds.size > 0 ? Array.from(favoriteIds) : undefined,
          frequency,
          experienceLevel: experience,
          sessionMinutes,
        },
        petName.trim() || 'Buzzy',
      );
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  const canNext =
    step === 0 ? goal !== null :
    step === 1 ? equipment.length > 0 :
    step === 5 ? petName.trim().length > 0 :
    true;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg px-4 pt-safe">
      {/* Title bar - Winamp style */}
      <div className="chrome-bar -mx-4 px-4 pt-10 pb-3 relative">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xs" style={{ fontFamily: "'Share Tech Mono', monospace" }}>▶</span>
          <h1 className="text-sm font-bold tracking-wider text-text-bright uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            New Program Setup
          </h1>
        </div>
        {/* Progress bar - like a media seek bar */}
        <div className="mt-3 h-3 bevel-inset rounded-sm overflow-hidden bg-chrome-dark">
          <div
            className="h-full progress-shine rounded-sm transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-secondary" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            STEP {step + 1}
          </span>
          <span className="text-[10px] text-text-secondary" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            {step + 1}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-5">
        {step === 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              SELECT GOAL
            </h2>
            <div className="groove mb-4" />
            <div className="space-y-2">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`w-full text-left p-3 transition-all ${
                    goal === g.value
                      ? 'bevel bg-bg-raised glow-green-box'
                      : 'bevel-btn'
                  }`}
                >
                  <div className={`text-sm font-bold tracking-wide ${goal === g.value ? 'text-primary glow-green' : 'text-text-bright'}`}
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    {g.label}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              EQUIPMENT
            </h2>
            <div className="groove mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => toggleEquipment(eq.value)}
                  className={`p-3 text-left transition-all ${
                    equipment.includes(eq.value)
                      ? 'bevel bg-bg-raised glow-green-box'
                      : 'bevel-btn'
                  } ${eq.value === 'bodyweight' ? 'opacity-60' : ''}`}
                >
                  <div className={`text-xs font-bold tracking-wide ${equipment.includes(eq.value) ? 'text-primary' : 'text-text-bright'}`}
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    {eq.label}
                  </div>
                  {eq.value === 'bodyweight' && (
                    <div className="text-[9px] text-text-secondary mt-0.5">LOCKED</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              PICK FAVORITES
            </h2>
            <div className="groove mb-2" />
            <p className="text-[10px] text-text-secondary mb-3" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              OPTIONAL -- tap exercises you like. They&apos;ll be prioritized in your plan.
            </p>

            {/* Search */}
            <input
              type="text"
              value={favSearch}
              onChange={(e) => setFavSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full lcd px-3 py-2 rounded-sm text-xs text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/40 mb-3"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            />

            {/* Selected count */}
            {favoriteIds.size > 0 && (
              <div className="lcd px-3 py-1.5 rounded-sm text-center text-[10px] tracking-wide mb-3">
                {favoriteIds.size} SELECTED
              </div>
            )}

            {/* Grouped exercise list */}
            <div className="space-y-4 max-h-[45vh] overflow-y-auto -mx-1 px-1">
              {Object.entries(groupedExercises).map(([group, exercises]) => (
                <div key={group}>
                  <div className="text-[10px] font-bold tracking-widest text-text-secondary mb-1.5" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    {group}
                  </div>
                  <div className="space-y-1">
                    {exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className={`flex items-center gap-2.5 px-3 py-2 transition-all ${
                          favoriteIds.has(ex.id)
                            ? 'bevel bg-bg-raised glow-green-box'
                            : 'bevel-btn'
                        }`}
                      >
                        {/* Exercise info -- tap to toggle */}
                        <button
                          onClick={() => toggleFavorite(ex.id)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className={`text-xs font-bold tracking-wide truncate ${favoriteIds.has(ex.id) ? 'text-primary' : 'text-text-bright'}`}
                            style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            {ex.name}
                          </div>
                          <div className="text-[9px] text-text-secondary mt-0.5">
                            {ex.primaryMuscle.replace('_', ' ').toUpperCase()} -- {ex.equipment.join(', ')}
                          </div>
                        </button>

                        {/* YouTube link */}
                        <a
                          href={youtubeSearchUrl(ex.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-sm bevel-btn"
                          title="Watch on YouTube"
                        >
                          <YouTubeIcon />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedExercises).length === 0 && (
                <div className="text-center text-xs text-text-secondary py-6" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  No exercises match your search
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              FREQUENCY
            </h2>
            <div className="groove mb-6" />
            <div className="flex justify-center items-center gap-5 mb-6">
              <button
                onClick={() => setFrequency(Math.max(2, frequency - 1))}
                className="bevel-btn w-12 h-12 flex items-center justify-center text-text-bright text-xl font-bold"
              >
                ◀
              </button>
              <div className="lcd px-6 py-4 rounded-sm text-center min-w-[100px]">
                <div className="text-5xl font-bold">{frequency}</div>
                <div className="text-[10px] tracking-widest opacity-60 mt-1">DAYS/WK</div>
              </div>
              <button
                onClick={() => setFrequency(Math.min(6, frequency + 1))}
                className="bevel-btn w-12 h-12 flex items-center justify-center text-text-bright text-xl font-bold"
              >
                ▶
              </button>
            </div>
            <div className="lcd p-3 rounded-sm text-center text-xs tracking-wide">
              {frequency <= 2 && '>> FULL BODY WORKOUTS <<'}
              {frequency === 3 && '>> BALANCED TRAINING <<'}
              {frequency === 4 && '>> UPPER/LOWER SPLIT <<'}
              {frequency >= 5 && '>> ADVANCED SPLIT <<'}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              PROFILE
            </h2>
            <div className="groove mb-4" />

            <div className="mb-6">
              <label className="text-[10px] font-bold tracking-widest text-text-secondary mb-2 block" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                EXPERIENCE LVL
              </label>
              <div className="flex gap-2">
                {(['beginner', 'intermediate'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExperience(lvl)}
                    className={`flex-1 p-3 text-center uppercase text-xs font-bold tracking-wider transition-all ${
                      experience === lvl
                        ? 'bevel bg-bg-raised text-primary glow-green'
                        : 'bevel-btn text-text-bright'
                    }`}
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold tracking-widest text-text-secondary mb-2 block" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                SESSION LENGTH
              </label>
              <div className="lcd p-3 rounded-sm text-center mb-3">
                <span className="text-3xl font-bold">{sessionMinutes}</span>
                <span className="text-xs ml-1 opacity-60">MIN</span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-chrome-dark rounded-sm"
              />
              <div className="flex justify-between text-[10px] text-text-secondary mt-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                <span>20</span>
                <span>60</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              NAME YOUR FLY
            </h2>
            <div className="groove mb-4" />

            <div className="mb-6">
              <label className="text-[10px] font-bold tracking-widest text-text-secondary mb-2 block" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                YOUR PET FRUIT FLY
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value.slice(0, 12))}
                placeholder="Enter a name..."
                maxLength={12}
                className="w-full lcd px-4 py-3 rounded-sm text-lg text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/40"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
                autoFocus
              />
              <div className="text-right text-[10px] text-text-secondary mt-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                {petName.length}/12
              </div>
            </div>

            {/* Fly preview */}
            <div className="flex justify-center">
              <div
                className="relative bevel-inset bg-bg-surface rounded-sm overflow-hidden"
                style={{ width: 160, height: 140 }}
              >
                <FruitFly animationState="idle" containerWidth={160} containerHeight={140} />
              </div>
            </div>
            <div className="text-center mt-3 text-xs text-text-secondary" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              This little buddy depends on you!
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls - media player style */}
      <div className="py-4 pb-8 flex gap-2">
        {step > 0 && (
          <button
            onClick={back}
            className="bevel-btn px-5 py-3 text-text-secondary text-xs font-bold tracking-widest"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            ◀◀ BACK
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext}
          className={`flex-1 py-3 font-bold text-sm tracking-widest transition-all ${
            canNext
              ? 'bevel-btn text-primary glow-green'
              : 'bevel-inset text-text-secondary opacity-50'
          }`}
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          {step === totalSteps - 1 ? '▶ HATCH & START' : 'NEXT ▶▶'}
        </button>
      </div>
    </div>
  );
}
