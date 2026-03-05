'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AppProvider, useApp } from '@/lib/context';
import { Workout, WorkoutSession, QuestionnaireAnswers } from '@/lib/types';
import { generatePlan } from '@/lib/plan-generator';
import { createPet, checkPetStatus } from '@/lib/pet-logic';
import BottomNav, { Tab } from '@/components/BottomNav';
import Questionnaire from '@/components/Questionnaire';
import PetView from '@/components/PetView';
import PlanView from '@/components/PlanView';
import LibraryView from '@/components/LibraryView';
import SettingsView from '@/components/SettingsView';
import WorkoutSessionRunner from '@/components/WorkoutSession';
import PostWorkout from '@/components/PostWorkout';
import InstallBanner from '@/components/InstallBanner';
import TamagotchiShell from '@/components/TamagotchiShell';
import HatchingScreen from '@/components/HatchingScreen';

type AppScreen =
  | { type: 'tabs' }
  | { type: 'questionnaire' }
  | { type: 'hatching'; petName: string }
  | { type: 'workout'; workout: Workout }
  | { type: 'postWorkout'; session: WorkoutSession };

function AppShell() {
  const { data, loaded, update } = useApp();
  const [tab, setTab] = useState<Tab>('pet');
  const [screen, setScreen] = useState<AppScreen>({ type: 'tabs' });

  // Check pet status on load
  useEffect(() => {
    if (loaded && data.pet && data.pet.isAlive) {
      const updated = checkPetStatus(data.pet);
      if (updated.hungerStage !== data.pet.hungerStage || updated.isAlive !== data.pet.isAlive) {
        update((prev) => ({ ...prev, pet: updated }));
      }
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuestionnaireComplete = useCallback(
    (answers: QuestionnaireAnswers, petName: string) => {
      const plan = generatePlan(answers, data.exercises);
      const pet = createPet(petName);
      update((prev) => ({
        ...prev,
        questionnaire: answers,
        currentPlan: plan,
        pet,
      }));
      setScreen({ type: 'hatching', petName });
    },
    [data.exercises, update],
  );

  const handleHatchingDone = useCallback(() => {
    setScreen({ type: 'tabs' });
    setTab('pet');
  }, []);

  const handleStartWorkout = useCallback((workout: Workout) => {
    setScreen({ type: 'workout', workout });
  }, []);

  const handleWorkoutComplete = useCallback((session: WorkoutSession) => {
    setScreen({ type: 'postWorkout', session });
  }, []);

  const handlePostWorkoutDone = useCallback(() => {
    setScreen({ type: 'tabs' });
    setTab('pet');
  }, []);

  if (!loaded) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center bg-bg"
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
        }}
      >
        <div className="text-center">
          <div
            className="bevel rounded-sm bg-bg-card p-8"
            style={{
              background: '#1a1a2e',
              padding: '2rem',
              borderRadius: '2px',
              border: '2px solid #3a3a55',
            }}
          >
            <div
              className="lcd rounded-sm p-4 mb-3"
              style={{
                background: '#0a1a0a',
                color: '#39ff14',
                padding: '1rem',
                borderRadius: '2px',
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              <div
                className="text-2xl font-bold text-primary glow-green pulse-glow"
                style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '1.5rem', fontWeight: 700 }}
              >
                MOOK&apos;S GYM
              </div>
            </div>
            <div
              className="text-xs text-text-secondary tracking-widest"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.75rem',
                color: '#7a7a8e',
                letterSpacing: '0.1em',
              }}
            >
              LOADING...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen flows render OUTSIDE the shell
  if (screen.type === 'questionnaire') {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  if (screen.type === 'hatching') {
    return <HatchingScreen petName={screen.petName} onDone={handleHatchingDone} />;
  }

  if (screen.type === 'workout') {
    return (
      <WorkoutSessionRunner
        workout={screen.workout}
        onComplete={handleWorkoutComplete}
        onCancel={() => setScreen({ type: 'tabs' })}
      />
    );
  }

  if (screen.type === 'postWorkout') {
    return (
      <PostWorkout
        session={screen.session}
        onDone={handlePostWorkoutDone}
      />
    );
  }

  // Tab views inside the Tamagotchi shell
  const bottomNav = <BottomNav active={tab} onChange={setTab} />;

  return (
    <TamagotchiShell shellColor={data.shellColor} bottomNav={bottomNav}>
      <InstallBanner />

      {tab === 'pet' && <PetView onStartWorkout={handleStartWorkout} onCreatePlan={() => setScreen({ type: 'questionnaire' })} />}
      {tab === 'plan' && (
        <PlanView onCreatePlan={() => setScreen({ type: 'questionnaire' })} />
      )}
      {tab === 'library' && <LibraryView />}
      {tab === 'settings' && <SettingsView />}
    </TamagotchiShell>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
