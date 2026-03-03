// ── Equipment & Muscle Groups ──

export type Equipment =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'resistance_bands'
  | 'pull_up_bar'
  | 'bench'
  | 'cable_machine'
  | 'other';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body';

export type MovementPattern = 'push' | 'pull' | 'legs' | 'core' | 'compound';

export type Goal = 'strength' | 'hypertrophy' | 'fat_loss' | 'general_fitness';
export type ExperienceLevel = 'beginner' | 'intermediate';
export type WorkoutCategory = 'upper' | 'lower' | 'full_body';

// ── Exercise ──

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment[];
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  movementPattern: MovementPattern;
  difficultyTier: 1 | 2 | 3 | 4 | 5;
  instructions: string;
  easierSubstitution?: string; // exercise id
  harderSubstitution?: string; // exercise id
  isCustom?: boolean;
}

// ── Plan & Workout ──

export interface PlannedSet {
  reps: number;
  weight?: number; // optional for bodyweight
  restSeconds: number;
}

export interface PlannedExercise {
  exerciseId: string;
  sets: PlannedSet[];
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  exercises: PlannedExercise[];
  warmup?: PlannedExercise[];
}

export interface WeekSchedule {
  /** index 0=Monday … 6=Sunday, null=rest day */
  days: (string | null)[]; // workout id or null
}

export interface Plan {
  id: string;
  createdAt: string;
  weekCount: number;
  weeks: WeekSchedule[];
  workouts: Workout[];
}

// ── Questionnaire ──

export interface QuestionnaireAnswers {
  goal: Goal;
  equipment: Equipment[];
  frequency: number; // 2-6
  experienceLevel: ExperienceLevel;
  sessionMinutes: number; // 20-60
}

// ── Session Tracking ──

export interface CompletedSet {
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface CompletedExercise {
  exerciseId: string;
  sets: CompletedSet[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  planId: string;
  date: string; // ISO date
  startedAt: string; // ISO datetime
  completedAt?: string;
  exercises: CompletedExercise[];
  difficultyFeedback?: DifficultyFeedback;
}

// ── Feedback & Adaptation ──

export type DifficultyFeedback =
  | 'much_easier'
  | 'easier'
  | 'same'
  | 'harder'
  | 'much_harder';

export interface DifficultyModifiers {
  global: number; // -10 to +10
  byCategory: Record<WorkoutCategory, number>;
}

// ── Stretches ──

export interface Stretch {
  id: string;
  name: string;
  instructions: string;
  durationSeconds: number;
  targetMuscles: MuscleGroup[];
}

// ── Pet System ──

export type HungerStage = 'happy' | 'content' | 'hungry' | 'sad' | 'sick' | 'dead';

export type PetAnimationState =
  | 'idle'
  | 'walking'
  | 'sleeping'
  | 'eating'
  | 'happy'
  | 'sad'
  | 'sick'
  | 'dancing'
  | 'playing_banjo'
  | 'death';

export type ShellColor = 'frosted_purple' | 'teal' | 'pink' | 'green' | 'orange';

export interface PetData {
  name: string;
  birthDate: string; // ISO date
  lastFedDate: string; // ISO date
  hungerStage: HungerStage;
  isAlive: boolean;
  sugarCubes: number;
  totalFed: number;
  generation: number;
}

// ── App State ──

export interface AppData {
  questionnaire?: QuestionnaireAnswers;
  currentPlan?: Plan;
  exercises: Exercise[];
  sessions: WorkoutSession[];
  difficultyModifiers: DifficultyModifiers;
  stretches: Stretch[];
  pet?: PetData;
  shellColor: ShellColor;
}
