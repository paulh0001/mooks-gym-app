'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppData } from './types';
import { loadAppData, saveAppData, resetAllData } from './db';
import { seedExercises } from './seed-exercises';
import { seedStretches } from './seed-stretches';

interface AppContextValue {
  data: AppData;
  loaded: boolean;
  update: (updater: (prev: AppData) => AppData) => void;
  reset: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const defaultData: AppData = {
  exercises: seedExercises(),
  sessions: [],
  difficultyModifiers: { global: 0, byCategory: { upper: 0, lower: 0, full_body: 0 } },
  stretches: seedStretches(),
  shellColor: 'frosted_purple',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAppData().then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveAppData(next);
      return next;
    });
  }, []);

  const reset = useCallback(async () => {
    await resetAllData();
    const fresh: AppData = {
      exercises: seedExercises(),
      sessions: [],
      difficultyModifiers: { global: 0, byCategory: { upper: 0, lower: 0, full_body: 0 } },
      stretches: seedStretches(),
      shellColor: 'frosted_purple',
    };
    setData(fresh);
    await saveAppData(fresh);
  }, []);

  return (
    <AppContext.Provider value={{ data, loaded, update, reset }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
