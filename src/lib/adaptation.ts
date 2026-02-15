import {
  DifficultyFeedback,
  DifficultyModifiers,
  Plan,
  Workout,
  WorkoutCategory,
  Exercise,
  PlannedExercise,
} from './types';

const feedbackDelta: Record<DifficultyFeedback, number> = {
  much_easier: -2,
  easier: -1,
  same: 0,
  harder: 1,
  much_harder: 2,
};

export function updateModifiers(
  modifiers: DifficultyModifiers,
  category: WorkoutCategory,
  feedback: DifficultyFeedback,
): DifficultyModifiers {
  const delta = feedbackDelta[feedback];
  return {
    global: Math.max(-10, Math.min(10, modifiers.global + delta)),
    byCategory: {
      ...modifiers.byCategory,
      [category]: Math.max(
        -10,
        Math.min(10, (modifiers.byCategory[category] || 0) + delta),
      ),
    },
  };
}

/**
 * Apply difficulty modifier to a workout.
 * modifier > 0 → make harder (more reps/sets)
 * modifier < 0 → make easier (fewer reps/sets)
 */
export function applyDifficultyToWorkout(
  workout: Workout,
  modifier: number,
  exercises: Exercise[],
): Workout {
  const adjusted = workout.exercises.map((pe): PlannedExercise => {
    const sets = pe.sets.map((s) => {
      let reps = s.reps + modifier;
      reps = Math.max(3, Math.min(20, reps));

      let rest = s.restSeconds;
      if (modifier > 0) rest = Math.max(15, rest - 5 * modifier);
      if (modifier < 0) rest = Math.min(120, rest - 5 * modifier);

      return { ...s, reps, restSeconds: rest };
    });

    // If modifier >= 3 or <= -3, try to swap exercise variation
    let exerciseId = pe.exerciseId;
    if (Math.abs(modifier) >= 3) {
      const current = exercises.find((e) => e.id === pe.exerciseId);
      if (current) {
        const subId =
          modifier > 0
            ? current.harderSubstitution
            : current.easierSubstitution;
        if (subId && exercises.find((e) => e.id === subId)) {
          exerciseId = subId;
        }
      }
    }

    // If modifier >= 5, add a set; if <= -5 and more than 2 sets, remove one
    let finalSets = sets;
    if (modifier >= 5 && sets.length < 6) {
      finalSets = [...sets, { ...sets[sets.length - 1] }];
    } else if (modifier <= -5 && sets.length > 2) {
      finalSets = sets.slice(0, -1);
    }

    return { exerciseId, sets: finalSets };
  });

  return { ...workout, exercises: adjusted };
}

export function getEffectiveModifier(
  modifiers: DifficultyModifiers,
  category: WorkoutCategory,
): number {
  return modifiers.global + (modifiers.byCategory[category] || 0);
}
