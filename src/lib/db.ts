'use client';

import { AppData, DifficultyModifiers, Exercise, Stretch, WorkoutSession } from './types';
import { seedExercises } from './seed-exercises';
import { seedStretches } from './seed-stretches';

const DB_NAME = 'mooks_gym';
const DB_VERSION = 1;
const STORE_NAME = 'appdata';
const DATA_KEY = 'main';

function defaultModifiers(): DifficultyModifiers {
  return { global: 0, byCategory: { upper: 0, lower: 0, full_body: 0 } };
}

function defaultAppData(): AppData {
  return {
    exercises: seedExercises(),
    sessions: [],
    difficultyModifiers: defaultModifiers(),
    stretches: seedStretches(),
    shellColor: 'frosted_purple',
  };
}

// ── IndexedDB helpers ──

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Public API ──

let useLocalStorage = false;

function lsKey() {
  return `${DB_NAME}_${DATA_KEY}`;
}

export async function loadAppData(): Promise<AppData> {
  try {
    const data = await idbGet<AppData>(DATA_KEY);
    if (data) {
      // Ensure seed exercises are present (merge with any custom ones)
      const seeded = seedExercises();
      const seededIds = new Set(seeded.map((e) => e.id));
      const custom = data.exercises.filter((e) => !seededIds.has(e.id));
      data.exercises = [...seeded, ...custom];
      if (!data.stretches?.length) data.stretches = seedStretches();
      if (!data.difficultyModifiers) data.difficultyModifiers = defaultModifiers();
      if (!data.shellColor) data.shellColor = 'frosted_purple';
      return data;
    }
  } catch {
    useLocalStorage = true;
    try {
      const raw = localStorage.getItem(lsKey());
      if (raw) return JSON.parse(raw) as AppData;
    } catch { /* fall through */ }
  }
  return defaultAppData();
}

export async function saveAppData(data: AppData): Promise<void> {
  if (useLocalStorage) {
    localStorage.setItem(lsKey(), JSON.stringify(data));
    return;
  }
  try {
    await idbSet(DATA_KEY, data);
  } catch {
    useLocalStorage = true;
    localStorage.setItem(lsKey(), JSON.stringify(data));
  }
}

export async function resetAllData(): Promise<void> {
  try {
    await idbClear();
  } catch { /* ignore */ }
  try {
    localStorage.removeItem(lsKey());
  } catch { /* ignore */ }
}

// ── Convenience helpers used by context ──

export function addSession(data: AppData, session: WorkoutSession): AppData {
  return { ...data, sessions: [...data.sessions, session] };
}

export function addExercise(data: AppData, exercise: Exercise): AppData {
  return { ...data, exercises: [...data.exercises, exercise] };
}

export function updateExercise(data: AppData, exercise: Exercise): AppData {
  return {
    ...data,
    exercises: data.exercises.map((e) => (e.id === exercise.id ? exercise : e)),
  };
}

export function deleteExercise(data: AppData, id: string): AppData {
  return { ...data, exercises: data.exercises.filter((e) => e.id !== id) };
}
