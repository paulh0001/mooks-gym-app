'use client';

import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from '@/lib/context';
import { Workout, WorkoutSession, QuestionnaireAnswers } from '@/lib/types';
import { generatePlan } from '@/lib/plan-generator';
import BottomNav, { Tab } from '@/components/BottomNav';
import Questionnaire from '@/components/Questionnaire';
import TodayView from '@/components/TodayView';
import PlanView from '@/components/PlanView';
import LibraryView from '@/components/LibraryView';
import SettingsView from '@/components/SettingsView';
import WorkoutSessionRunner from '@/components/WorkoutSession';
import PostWorkout from '@/components/PostWorkout';
import InstallBanner from '@/components/InstallBanner';

type AppScreen =
  | { type: 'tabs' }
  | { type: 'questionnaire' }
  | { type: 'workout'; workout: Workout }
  | { type: 'postWorkout'; session: WorkoutSession };

function AppShell() {
  const { data, loaded, update } = useApp();
  const [tab, setTab] = useState<Tab>('today');
  const [screen, setScreen] = useState<AppScreen>({ type: 'tabs' });

  const handleQuestionnaireComplete = useCallback(
    (answers: QuestionnaireAnswers) => {
      const plan = generatePlan(answers, data.exercises);
      update((prev) => ({
        ...prev,
        questionnaire: answers,
        currentPlan: plan,
      }));
      setScreen({ type: 'tabs' });
      setTab('today');
    },
    [data.exercises, update],
  );

  const handleStartWorkout = useCallback((workout: Workout) => {
    setScreen({ type: 'workout', workout });
  }, []);

  const handleWorkoutComplete = useCallback((session: WorkoutSession) => {
    setScreen({ type: 'postWorkout', session });
  }, []);

  const handlePostWorkoutDone = useCallback(() => {
    setScreen({ type: 'tabs' });
    setTab('today');
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="bevel rounded-sm bg-bg-card p-8">
            <div className="lcd rounded-sm p-4 mb-3">
              <div
                className="text-2xl font-bold text-primary glow-green pulse-glow"
                style={{ fontFamily: "'Share Tech Mono', monospace" }}
              >
                MOOK&apos;S GYM
              </div>
            </div>
            <div
              className="text-xs text-text-secondary tracking-widest"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              LOADING...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-screen flows
  if (screen.type === 'questionnaire') {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
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

  // Tab views
  return (
    <div className="min-h-[100dvh] pb-20">
      <InstallBanner />

      {tab === 'today' && <TodayView onStartWorkout={handleStartWorkout} />}
      {tab === 'plan' && (
        <PlanView onCreatePlan={() => setScreen({ type: 'questionnaire' })} />
      )}
      {tab === 'library' && <LibraryView />}
      {tab === 'settings' && <SettingsView />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
