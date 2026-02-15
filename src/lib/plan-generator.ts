import {
  QuestionnaireAnswers,
  Plan,
  Workout,
  PlannedExercise,
  PlannedSet,
  Exercise,
  Equipment,
  WorkoutCategory,
  MovementPattern,
  WeekSchedule,
} from './types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface BuildCtx {
  answers: QuestionnaireAnswers;
  exercises: Exercise[];
  available: Exercise[]; // filtered by equipment
}

function filterByEquipment(exercises: Exercise[], equipment: Equipment[]): Exercise[] {
  const eqSet = new Set(equipment);
  // Always include bodyweight
  eqSet.add('bodyweight');
  return exercises.filter((ex) => ex.equipment.every((e) => eqSet.has(e)));
}

function pickExercises(
  pool: Exercise[],
  pattern: MovementPattern,
  count: number,
  maxTier: number,
): Exercise[] {
  const filtered = pool
    .filter((e) => e.movementPattern === pattern && e.difficultyTier <= maxTier)
    .sort((a, b) => a.difficultyTier - b.difficultyTier);

  // Deduplicate by primaryMuscle to get variety
  const seen = new Set<string>();
  const result: Exercise[] = [];
  for (const ex of filtered) {
    if (result.length >= count) break;
    const key = ex.primaryMuscle;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(ex);
    }
  }
  // Fill remaining if needed
  for (const ex of filtered) {
    if (result.length >= count) break;
    if (!result.includes(ex)) result.push(ex);
  }
  return result.slice(0, count);
}

function defaultSets(
  goal: QuestionnaireAnswers['goal'],
  tier: number,
): PlannedSet[] {
  let sets = 3;
  let reps = 10;
  let rest = 60;

  switch (goal) {
    case 'strength':
      sets = 4; reps = 6; rest = 90;
      break;
    case 'hypertrophy':
      sets = 3; reps = 12; rest = 60;
      break;
    case 'fat_loss':
      sets = 3; reps = 15; rest = 30;
      break;
    case 'general_fitness':
      sets = 3; reps = 10; rest = 60;
      break;
  }

  // Adjust slightly for difficulty tier
  if (tier >= 4) reps = Math.max(reps - 2, 4);

  return Array.from({ length: sets }, () => ({ reps, restSeconds: rest }));
}

function buildWarmup(ctx: BuildCtx): PlannedExercise[] {
  // Simple warmup: bodyweight squat + arm circles (represented as dead bug for simplicity)
  const warmups: PlannedExercise[] = [];
  const squat = ctx.available.find((e) => e.id === 'bodyweight_squat');
  const deadbug = ctx.available.find((e) => e.id === 'dead_bug');

  if (squat) {
    warmups.push({
      exerciseId: squat.id,
      sets: [{ reps: 10, restSeconds: 15 }],
    });
  }
  if (deadbug) {
    warmups.push({
      exerciseId: deadbug.id,
      sets: [{ reps: 8, restSeconds: 15 }],
    });
  }
  return warmups;
}

function buildWorkout(
  ctx: BuildCtx,
  name: string,
  category: WorkoutCategory,
  patterns: { pattern: MovementPattern; count: number }[],
): Workout {
  const maxTier = ctx.answers.experienceLevel === 'beginner' ? 3 : 5;
  const exercises: PlannedExercise[] = [];

  for (const { pattern, count } of patterns) {
    const picks = pickExercises(ctx.available, pattern, count, maxTier);
    for (const ex of picks) {
      exercises.push({
        exerciseId: ex.id,
        sets: defaultSets(ctx.answers.goal, ex.difficultyTier),
      });
    }
  }

  // Cap at 7 exercises
  const main = exercises.slice(0, 7);

  return {
    id: uid(),
    name,
    category,
    warmup: buildWarmup(ctx),
    exercises: main,
  };
}

function buildFullBody(ctx: BuildCtx, label: string): Workout {
  return buildWorkout(ctx, `Full Body ${label}`, 'full_body', [
    { pattern: 'legs', count: 2 },
    { pattern: 'push', count: 2 },
    { pattern: 'pull', count: 2 },
    { pattern: 'core', count: 1 },
  ]);
}

function buildUpper(ctx: BuildCtx, label: string): Workout {
  return buildWorkout(ctx, `Upper Body ${label}`, 'upper', [
    { pattern: 'push', count: 3 },
    { pattern: 'pull', count: 3 },
    { pattern: 'core', count: 1 },
  ]);
}

function buildLower(ctx: BuildCtx, label: string): Workout {
  return buildWorkout(ctx, `Lower Body ${label}`, 'lower', [
    { pattern: 'legs', count: 5 },
    { pattern: 'core', count: 1 },
  ]);
}

function generateWorkouts(ctx: BuildCtx): Workout[] {
  const freq = ctx.answers.frequency;

  if (freq <= 2) {
    return [buildFullBody(ctx, 'A'), buildFullBody(ctx, 'B')];
  }
  if (freq === 3) {
    return [buildFullBody(ctx, 'A'), buildFullBody(ctx, 'B'), buildFullBody(ctx, 'C')];
  }
  if (freq === 4) {
    return [buildUpper(ctx, 'A'), buildLower(ctx, 'A'), buildUpper(ctx, 'B'), buildLower(ctx, 'B')];
  }
  // 5-6 days
  return [
    buildUpper(ctx, 'A'),
    buildLower(ctx, 'A'),
    buildFullBody(ctx, 'A'),
    buildUpper(ctx, 'B'),
    buildLower(ctx, 'B'),
    ...(freq >= 6 ? [buildFullBody(ctx, 'B')] : []),
  ];
}

function distributeWorkouts(workouts: Workout[], frequency: number): WeekSchedule {
  // Place workouts across 7 days, spreading rest
  const days: (string | null)[] = Array(7).fill(null);

  if (frequency <= 3) {
    // Mon/Wed/Fri pattern
    const slots = [0, 2, 4]; // Mon, Wed, Fri
    for (let i = 0; i < frequency; i++) {
      days[slots[i]] = workouts[i % workouts.length].id;
    }
  } else if (frequency === 4) {
    // Mon/Tue/Thu/Fri
    const slots = [0, 1, 3, 4];
    for (let i = 0; i < 4; i++) {
      days[slots[i]] = workouts[i % workouts.length].id;
    }
  } else {
    // 5-6: fill from Monday
    for (let i = 0; i < frequency && i < 7; i++) {
      days[i] = workouts[i % workouts.length].id;
    }
  }

  return { days };
}

export function generatePlan(
  answers: QuestionnaireAnswers,
  exercises: Exercise[],
): Plan {
  const available = filterByEquipment(exercises, answers.equipment);
  const ctx: BuildCtx = { answers, exercises, available };

  const workouts = generateWorkouts(ctx);
  const weekSchedule = distributeWorkouts(workouts, answers.frequency);

  // Repeat same schedule for 4 weeks
  const weeks: WeekSchedule[] = Array.from({ length: 4 }, () => ({
    days: [...weekSchedule.days],
  }));

  return {
    id: uid(),
    createdAt: new Date().toISOString(),
    weekCount: 4,
    weeks,
    workouts,
  };
}
