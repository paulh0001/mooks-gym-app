import { HungerStage, PetAnimationState, PetData } from './types';

// ── Hunger Calculation ──

function daysSince(isoDate: string): number {
  const then = new Date(isoDate + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

export function calculateHungerStage(lastFedDate: string): HungerStage {
  const days = daysSince(lastFedDate);
  if (days === 0) return 'happy';
  if (days === 1) return 'content';
  if (days === 2) return 'hungry';
  if (days === 3) return 'sad';
  if (days === 4) return 'sick';
  return 'dead'; // 5+
}

// ── Available Animation States ──

const statesByHunger: Record<HungerStage, PetAnimationState[]> = {
  happy: ['idle', 'walking', 'happy', 'dancing', 'playing_banjo'],
  content: ['idle', 'walking', 'happy'],
  hungry: ['idle', 'walking', 'sad'],
  sad: ['idle', 'sad'],
  sick: ['idle', 'sick'],
  dead: ['death'],
};

export function getAvailableStates(hunger: HungerStage): PetAnimationState[] {
  return statesByHunger[hunger];
}

// ── State Machine ──

export function pickNextState(
  hunger: HungerStage,
  currentState: PetAnimationState,
  hourOfDay: number,
): PetAnimationState {
  if (hunger === 'dead') return 'death';

  // Sleep bias at night (10pm-7am)
  const isNight = hourOfDay >= 22 || hourOfDay < 7;
  if (isNight) {
    // 70% chance of sleeping at night
    if (Math.random() < 0.7) return 'sleeping';
  }

  const available = getAvailableStates(hunger);
  // Avoid repeating the same state back-to-back (unless only one option)
  if (available.length > 1) {
    const filtered = available.filter((s) => s !== currentState);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  return available[0];
}

// ── Feed Pet ──

export function feedPet(pet: PetData): PetData | null {
  if (!pet.isAlive || pet.sugarCubes < 1) return null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...pet,
    sugarCubes: pet.sugarCubes - 1,
    lastFedDate: today,
    totalFed: pet.totalFed + 1,
    hungerStage: 'happy',
  };
}

// ── Create Pet ──

export function createPet(name: string, generation: number = 1): PetData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name,
    birthDate: today,
    lastFedDate: today,
    hungerStage: 'happy',
    isAlive: true,
    sugarCubes: 0,
    totalFed: 0,
    generation,
  };
}

// ── Interactions ──

export type InteractionType = 'pet' | 'dance' | 'banjo';

interface InteractionResult {
  accepted: boolean;
  message: string;
  animation: PetAnimationState;
}

const refusals: Record<InteractionType, string[]> = {
  pet: [
    'Buzzes away from your hand.',
    'Too busy grooming its wings.',
    'Stares at you... then turns around.',
    'Pretends not to notice you.',
    'Is currently in the middle of something important.',
    'Gives you a look that says "not now."',
    'Flew to the other side just to avoid you.',
  ],
  dance: [
    'Not feeling the rhythm right now.',
    'Says it only dances on Fridays.',
    'Claims its legs are tired.',
    'Would rather just vibe.',
    'Too self-conscious. Maybe later.',
    'Shakes its head. Hard pass.',
    'Pretends to be asleep.',
  ],
  banjo: [
    'Says the banjo is out of tune.',
    'Claims it forgot all the chords.',
    'Not in a banjo kind of mood.',
    'Says you have to pay for a private concert.',
    'Currently having creative differences with itself.',
    'Mumbles something about stage fright.',
    'Says the banjo is in the shop.',
  ],
};

const acceptMessages: Record<InteractionType, string[]> = {
  pet: [
    'Purrs... wait, flies don\'t purr. Buzzes contentedly.',
    'Leans into your finger.',
    'Wings flutter with joy!',
    'Closes its eyes and enjoys it.',
  ],
  dance: [
    'Busts out some moves!',
    'Absolutely shredding the dance floor.',
    'Doing the fruit fly shuffle!',
    'Going absolutely feral.',
  ],
  banjo: [
    'Plays a little tune for you!',
    'Strums a surprisingly good melody.',
    'Plays "Dueling Banjos" solo.',
    'A tiny bluegrass concert begins.',
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Refusal chance increases as hunger worsens
const refusalChance: Record<HungerStage, number> = {
  happy: 0.15,
  content: 0.25,
  hungry: 0.45,
  sad: 0.7,
  sick: 0.9,
  dead: 1,
};

// Some interactions require a minimum mood
const interactionToAnim: Record<InteractionType, PetAnimationState> = {
  pet: 'happy',
  dance: 'dancing',
  banjo: 'playing_banjo',
};

export function tryInteraction(hunger: HungerStage, type: InteractionType): InteractionResult {
  if (hunger === 'dead') {
    return { accepted: false, message: '...', animation: 'death' };
  }

  // Dance and banjo require happy or content mood
  if ((type === 'dance' || type === 'banjo') && (hunger === 'sad' || hunger === 'sick')) {
    return {
      accepted: false,
      message: hunger === 'sick' ? 'Too sick to do anything...' : pick(refusals[type]),
      animation: hunger === 'sick' ? 'sick' : 'sad',
    };
  }

  const roll = Math.random();
  if (roll < refusalChance[hunger]) {
    return {
      accepted: false,
      message: pick(refusals[type]),
      animation: hunger === 'sick' ? 'sick' : hunger === 'sad' ? 'sad' : 'idle',
    };
  }

  return {
    accepted: true,
    message: pick(acceptMessages[type]),
    animation: interactionToAnim[type],
  };
}

// ── Check Pet Status ──

export function checkPetStatus(pet: PetData): PetData {
  if (!pet.isAlive) return pet;
  const hunger = calculateHungerStage(pet.lastFedDate);
  return {
    ...pet,
    hungerStage: hunger,
    isAlive: hunger !== 'dead',
  };
}
