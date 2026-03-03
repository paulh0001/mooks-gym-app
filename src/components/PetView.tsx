'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { PetAnimationState, Workout, Plan } from '@/lib/types';
import { checkPetStatus, feedPet, pickNextState, createPet, tryInteraction, InteractionType } from '@/lib/pet-logic';
import FruitFly from './FruitFly';
import SugarCube, { SugarCubeIcon } from './SugarCube';

function getDayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function getCurrentWeek(plan: Plan): number {
  const created = new Date(plan.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.min(diffWeeks, plan.weekCount - 1);
}

function getTodayWorkout(plan: Plan): Workout | null {
  const weekIdx = getCurrentWeek(plan);
  const dayIdx = getDayOfWeek();
  const workoutId = plan.weeks[weekIdx]?.days[dayIdx] ?? null;
  if (!workoutId) return null;
  return plan.workouts.find((w) => w.id === workoutId) ?? null;
}

const HUNGER_BAR: Record<string, { fill: number; label: string; cssClass: string }> = {
  happy: { fill: 100, label: 'HAPPY', cssClass: 'hunger-happy' },
  content: { fill: 80, label: 'CONTENT', cssClass: 'hunger-content' },
  hungry: { fill: 55, label: 'HUNGRY', cssClass: 'hunger-hungry' },
  sad: { fill: 35, label: 'SAD', cssClass: 'hunger-sad' },
  sick: { fill: 15, label: 'SICK', cssClass: 'hunger-sick' },
  dead: { fill: 0, label: 'DEAD', cssClass: 'hunger-dead' },
};

interface Props {
  onStartWorkout: (workout: Workout) => void;
  onCreatePlan: () => void;
}

export default function PetView({ onStartWorkout, onCreatePlan }: Props) {
  const { data, update } = useApp();
  const pet = data.pet;
  const plan = data.currentPlan;

  const [animState, setAnimState] = useState<PetAnimationState>('idle');
  const [showEating, setShowEating] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [flyMessage, setFlyMessage] = useState<string | null>(null);
  const [lcdWidth, setLcdWidth] = useState(0);
  const [lcdHeight] = useState(200);
  const flyAreaRef = useRef<HTMLDivElement>(null);
  const lcdRef = useRef<HTMLDivElement>(null);

  // Measure LCD viewport
  useEffect(() => {
    if (lcdRef.current) {
      setLcdWidth(lcdRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (lcdRef.current) setLcdWidth(lcdRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check pet status on mount
  useEffect(() => {
    if (pet && pet.isAlive) {
      const updated = checkPetStatus(pet);
      if (updated.hungerStage !== pet.hungerStage || updated.isAlive !== pet.isAlive) {
        update((prev) => ({ ...prev, pet: updated }));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // State machine: cycle animation states
  useEffect(() => {
    if (!pet?.isAlive) {
      setAnimState('death');
      return;
    }
    if (showEating || interacting) return; // manual overrides

    const interval = setInterval(() => {
      const hour = new Date().getHours();
      setAnimState((prev) => pickNextState(pet.hungerStage, prev, hour));
    }, 4000);

    return () => clearInterval(interval);
  }, [pet?.isAlive, pet?.hungerStage, showEating, interacting]);

  // Feed handler
  const handleFeed = useCallback(() => {
    if (!pet || !pet.isAlive || pet.sugarCubes < 1) return;
    const fedPet = feedPet(pet);
    if (!fedPet) return;
    update((prev) => ({ ...prev, pet: fedPet }));
    setShowEating(true);
    setAnimState('eating');
    setTimeout(() => {
      setShowEating(false);
      setAnimState('happy');
    }, 2000);
  }, [pet, update]);

  // Hatch new egg (after death)
  const handleHatchNew = useCallback(() => {
    const newGen = (pet?.generation ?? 1) + 1;
    const name = prompt('Name your new fly (max 12 chars):', '') ?? 'Buzzy';
    const newPet = createPet(name.slice(0, 12) || 'Buzzy', newGen);
    update((prev) => ({ ...prev, pet: newPet }));
  }, [pet, update]);

  // Interaction handler
  const handleInteraction = useCallback((type: InteractionType) => {
    if (!pet || !pet.isAlive || interacting || showEating) return;
    const result = tryInteraction(pet.hungerStage, type);
    setInteracting(true);
    setAnimState(result.animation);
    setFlyMessage(result.message);
    setTimeout(() => {
      setInteracting(false);
      setFlyMessage(null);
    }, 3000);
  }, [pet, interacting, showEating]);

  // No pet yet
  if (!pet) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-center"
        style={{ fontFamily: "'Share Tech Mono', monospace", minHeight: 360 }}
      >
        <div className="text-4xl mb-4">🥚</div>
        <div className="text-primary glow-green text-lg mb-2">NO PET YET</div>
        <div className="text-text-secondary text-xs mb-5">
          Complete the setup questionnaire to hatch your fly!
        </div>
        <button
          onClick={onCreatePlan}
          className="bevel-btn px-6 py-3 rounded-sm text-primary glow-green text-sm tracking-widest pulse-glow"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          HATCH YOUR FLY
        </button>
      </div>
    );
  }

  const hunger = HUNGER_BAR[pet.hungerStage] ?? HUNGER_BAR.happy;
  const todayWorkout = plan ? getTodayWorkout(plan) : null;
  const todayDone = plan
    ? data.sessions.some(
        (s) =>
          s.date === new Date().toISOString().slice(0, 10) &&
          s.completedAt &&
          todayWorkout &&
          s.workoutId === todayWorkout.id,
      )
    : false;

  // Dead state
  if (!pet.isAlive) {
    return (
      <div
        className="flex flex-col items-center p-4 text-center"
        style={{ fontFamily: "'Share Tech Mono', monospace", minHeight: 360 }}
      >
        <div className="text-text-secondary text-xs tracking-widest mb-2">
          GENERATION {pet.generation}
        </div>
        <div
          ref={lcdRef}
          className="w-full relative mb-4"
          style={{ height: lcdHeight, background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}
        >
          <FruitFly
            animationState="death"
            containerWidth={lcdWidth}
            containerHeight={lcdHeight}
          />
        </div>
        <div className="text-danger text-lg mb-1">R.I.P. {pet.name}</div>
        <div className="text-text-secondary text-xs mb-4">
          Your fly passed away from hunger...
        </div>
        <button
          onClick={handleHatchNew}
          className="bevel-btn px-6 py-3 text-primary glow-green text-sm tracking-widest"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          HATCH NEW EGG
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col p-3"
      style={{ fontFamily: "'Share Tech Mono', monospace", minHeight: 360 }}
    >
      {/* Header: name + gen + sugar cubes */}
      <div className="flex justify-between items-start mb-2 px-1">
        <div>
          <div className="text-primary glow-green text-sm tracking-wider">{pet.name}</div>
          <div className="text-text-secondary text-[10px] tracking-widest">GEN {pet.generation}</div>
        </div>
        <div className="flex items-center gap-1">
          <SugarCubeIcon scale={0.5} />
          <span className="text-text-bright text-sm ml-1">{pet.sugarCubes}</span>
        </div>
      </div>

      {/* LCD Viewport - fly wanders here */}
      <div
        ref={(el) => {
          (lcdRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          (flyAreaRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className="w-full relative mb-3"
        style={{
          height: lcdHeight,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <FruitFly
          animationState={animState}
          containerWidth={lcdWidth}
          containerHeight={lcdHeight}
        />
        {/* Speech bubble */}
        {flyMessage && (
          <div
            className="absolute top-2 left-2 right-2 text-center px-2 py-1 rounded-sm text-[10px] tracking-wide"
            style={{
              background: 'rgba(10, 26, 10, 0.85)',
              color: '#39ff14',
              fontFamily: "'Share Tech Mono', monospace",
              border: '1px solid rgba(57, 255, 20, 0.3)',
              zIndex: 10,
            }}
          >
            {flyMessage}
          </div>
        )}
      </div>

      {/* Interaction buttons */}
      <div className="flex gap-1 mb-2 px-1">
        <button
          onClick={() => handleInteraction('pet')}
          disabled={interacting || showEating}
          className={`flex-1 bevel-btn py-1.5 text-[10px] tracking-widest rounded-sm ${
            interacting || showEating ? 'text-text-secondary opacity-50' : 'text-text-bright'
          }`}
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          PET
        </button>
        <button
          onClick={() => handleInteraction('dance')}
          disabled={interacting || showEating}
          className={`flex-1 bevel-btn py-1.5 text-[10px] tracking-widest rounded-sm ${
            interacting || showEating ? 'text-text-secondary opacity-50' : 'text-text-bright'
          }`}
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          DANCE
        </button>
        <button
          onClick={() => handleInteraction('banjo')}
          disabled={interacting || showEating}
          className={`flex-1 bevel-btn py-1.5 text-[10px] tracking-widest rounded-sm ${
            interacting || showEating ? 'text-text-secondary opacity-50' : 'text-text-bright'
          }`}
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          BANJO
        </button>
      </div>

      {/* Hunger bar */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary tracking-widest">HUNGER</span>
          <div className="flex-1 h-3 bevel-inset bg-bg-surface rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${hunger.cssClass}`}
              style={{ width: `${hunger.fill}%` }}
            />
          </div>
          <span className="text-[10px] text-text-bright tracking-wider w-16 text-right">
            {hunger.label}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-1">
        {pet.sugarCubes > 0 ? (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-[10px] text-text-secondary tracking-widest mb-1">
              DRAG TO FLY
            </div>
            <SugarCube onFeed={handleFeed} flyRef={flyAreaRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] text-text-secondary tracking-widest">
              NO SUGAR CUBES
            </span>
          </div>
        )}

        {todayWorkout && !todayDone ? (
          <button
            onClick={() => onStartWorkout(todayWorkout)}
            className="flex-1 bevel-btn py-3 text-primary glow-green text-xs tracking-widest"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            START WORKOUT
          </button>
        ) : todayDone ? (
          <div className="flex-1 flex items-center justify-center text-[10px] text-primary glow-green tracking-widest">
            WORKOUT DONE
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[10px] text-text-secondary tracking-widest">
            REST DAY
          </div>
        )}
      </div>
    </div>
  );
}
