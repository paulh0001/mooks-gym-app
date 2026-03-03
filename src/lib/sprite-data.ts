import { PetAnimationState } from './types';

/**
 * 32x32 pixel sprite data for the fruit fly pet.
 * Each frame is a flat array of 32*32 = 1024 entries.
 * 0 = transparent, otherwise a palette index.
 *
 * Palette:
 * 1 = body dark (#2a1a0a)
 * 2 = body mid (#5c3d1e)
 * 3 = body highlight (#8b6934)
 * 4 = wing translucent (#88bbdd88) - rendered with opacity
 * 5 = eye red (#cc2222)
 * 6 = eye highlight (#ff6644)
 * 7 = leg dark (#3a2a1a)
 * 8 = antenna (#4a3a2a)
 * 9 = white/highlight (#eeddcc)
 * 10 = banjo body (#cc9944)
 * 11 = banjo neck (#886633)
 * 12 = sugar cube white (#ffffff)
 * 13 = sugar cube shadow (#ccccbb)
 */

export const PALETTE: Record<number, string> = {
  1: '#2a1a0a',
  2: '#5c3d1e',
  3: '#8b6934',
  4: 'rgba(136,187,221,0.45)',
  5: '#cc2222',
  6: '#ff6644',
  7: '#3a2a1a',
  8: '#4a3a2a',
  9: '#eeddcc',
  10: '#cc9944',
  11: '#886633',
  12: '#ffffff',
  13: '#ccccbb',
};

export const PIXEL_SIZE = 3; // each pixel renders at 3x3 CSS pixels
export const GRID_SIZE = 32;

// Helper to create a 32x32 grid (all transparent)
function empty(): number[] {
  return new Array(GRID_SIZE * GRID_SIZE).fill(0);
}

// Helper: set pixel at (x, y) in flat array
function px(grid: number[], x: number, y: number, color: number) {
  if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
    grid[y * GRID_SIZE + x] = color;
  }
}

// Helper: draw horizontal line
function hLine(grid: number[], x1: number, x2: number, y: number, color: number) {
  for (let x = x1; x <= x2; x++) px(grid, x, y, color);
}

// Helper: draw filled rect
function rect(grid: number[], x1: number, y1: number, x2: number, y2: number, color: number) {
  for (let y = y1; y <= y2; y++) hLine(grid, x1, x2, y, color);
}

// Helper: draw a filled ellipse
function ellipse(grid: number[], cx: number, cy: number, rx: number, ry: number, color: number) {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        px(grid, x, y, color);
      }
    }
  }
}

// ── Base Fruit Fly Drawing Functions ──

function drawBody(grid: number[], cx: number, cy: number) {
  // Main body (oval) - wider than tall
  ellipse(grid, cx, cy, 5, 4, 2);
  // Body highlight stripe
  ellipse(grid, cx, cy - 1, 3, 2, 3);
  // Body outline darks at bottom
  hLine(grid, cx - 4, cx + 4, cy + 4, 1);
  hLine(grid, cx - 3, cx + 3, cy + 5, 1);
}

function drawHead(grid: number[], cx: number, cy: number) {
  // Head (round, above body)
  ellipse(grid, cx, cy, 4, 3, 2);
  ellipse(grid, cx, cy, 3, 2, 3);
}

function drawEyes(grid: number[], cx: number, cy: number) {
  // Left compound eye
  ellipse(grid, cx - 3, cy, 2, 2, 5);
  px(grid, cx - 3, cy - 1, 6); // highlight
  // Right compound eye
  ellipse(grid, cx + 3, cy, 2, 2, 5);
  px(grid, cx + 3, cy - 1, 6); // highlight
}

function drawClosedEyes(grid: number[], cx: number, cy: number) {
  // Closed eyes - just lines
  hLine(grid, cx - 4, cx - 2, cy, 1);
  hLine(grid, cx + 2, cx + 4, cy, 1);
}

function drawSadEyes(grid: number[], cx: number, cy: number) {
  // Sad droopy eyes
  ellipse(grid, cx - 3, cy, 2, 2, 5);
  px(grid, cx - 4, cy - 1, 1); // droopy corner
  ellipse(grid, cx + 3, cy, 2, 2, 5);
  px(grid, cx + 4, cy - 1, 1);
}

function drawAntennae(grid: number[], cx: number, cy: number) {
  // Left antenna
  px(grid, cx - 2, cy - 1, 8);
  px(grid, cx - 3, cy - 2, 8);
  px(grid, cx - 4, cy - 3, 8);
  px(grid, cx - 4, cy - 4, 9); // tip
  // Right antenna
  px(grid, cx + 2, cy - 1, 8);
  px(grid, cx + 3, cy - 2, 8);
  px(grid, cx + 4, cy - 3, 8);
  px(grid, cx + 4, cy - 4, 9); // tip
}

function drawWings(grid: number[], cx: number, cy: number, spread: boolean) {
  if (spread) {
    // Wings spread out
    // Left wing
    ellipse(grid, cx - 7, cy - 3, 4, 6, 4);
    // Right wing
    ellipse(grid, cx + 7, cy - 3, 4, 6, 4);
  } else {
    // Wings folded back
    // Left wing
    ellipse(grid, cx - 4, cy - 2, 3, 5, 4);
    // Right wing
    ellipse(grid, cx + 4, cy - 2, 3, 5, 4);
  }
}

function drawFoldedWings(grid: number[], cx: number, cy: number) {
  // Wings folded tight against body (sleeping)
  ellipse(grid, cx - 2, cy + 1, 2, 4, 4);
  ellipse(grid, cx + 2, cy + 1, 2, 4, 4);
}

function drawLegs(grid: number[], cx: number, cy: number, pose: 'stand' | 'walk1' | 'walk2' | 'dance') {
  const bodyBottom = cy + 5;
  if (pose === 'stand' || pose === 'walk1') {
    // 3 legs each side, angled down
    // Left
    px(grid, cx - 4, bodyBottom, 7);
    px(grid, cx - 5, bodyBottom + 1, 7);
    px(grid, cx - 3, bodyBottom, 7);
    px(grid, cx - 3, bodyBottom + 1, 7);
    px(grid, cx - 2, bodyBottom, 7);
    px(grid, cx - 1, bodyBottom + 1, 7);
    // Right
    px(grid, cx + 4, bodyBottom, 7);
    px(grid, cx + 5, bodyBottom + 1, 7);
    px(grid, cx + 3, bodyBottom, 7);
    px(grid, cx + 3, bodyBottom + 1, 7);
    px(grid, cx + 2, bodyBottom, 7);
    px(grid, cx + 1, bodyBottom + 1, 7);
  }
  if (pose === 'walk2') {
    // Alternate leg positions
    px(grid, cx - 5, bodyBottom, 7);
    px(grid, cx - 6, bodyBottom + 1, 7);
    px(grid, cx - 3, bodyBottom + 1, 7);
    px(grid, cx - 3, bodyBottom + 2, 7);
    px(grid, cx - 1, bodyBottom, 7);
    px(grid, cx - 1, bodyBottom + 1, 7);
    px(grid, cx + 5, bodyBottom, 7);
    px(grid, cx + 6, bodyBottom + 1, 7);
    px(grid, cx + 3, bodyBottom + 1, 7);
    px(grid, cx + 3, bodyBottom + 2, 7);
    px(grid, cx + 1, bodyBottom, 7);
    px(grid, cx + 1, bodyBottom + 1, 7);
  }
  if (pose === 'dance') {
    // Legs up in the air
    px(grid, cx - 5, bodyBottom - 1, 7);
    px(grid, cx - 6, bodyBottom - 2, 7);
    px(grid, cx - 3, bodyBottom, 7);
    px(grid, cx - 2, bodyBottom - 1, 7);
    px(grid, cx + 5, bodyBottom - 1, 7);
    px(grid, cx + 6, bodyBottom - 2, 7);
    px(grid, cx + 3, bodyBottom, 7);
    px(grid, cx + 2, bodyBottom - 1, 7);
  }
}

// ── Frame Builders ──

// Body center position (fits in 32x32 with room for wings + antennae)
const BCX = 16; // body center X
const HCY = 8;  // head center Y
const BCY = 16; // body center Y

function buildIdleFrame1(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  return g;
}

function buildIdleFrame2(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  return g;
}

function buildWalkFrame1(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'walk1');
  return g;
}

function buildWalkFrame2(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'walk2');
  return g;
}

function buildSleepFrame1(): number[] {
  const g = empty();
  // Antennae drooped
  px(g, BCX - 2, HCY - 1, 8);
  px(g, BCX - 3, HCY - 1, 8);
  px(g, BCX - 4, HCY, 9);
  px(g, BCX + 2, HCY - 1, 8);
  px(g, BCX + 3, HCY - 1, 8);
  px(g, BCX + 4, HCY, 9);
  drawFoldedWings(g, BCX, BCY);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawClosedEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  // Z's
  px(g, BCX + 7, HCY - 3, 9);
  px(g, BCX + 8, HCY - 3, 9);
  px(g, BCX + 8, HCY - 4, 9);
  px(g, BCX + 7, HCY - 4, 9);
  return g;
}

function buildSleepFrame2(): number[] {
  const g = empty();
  px(g, BCX - 2, HCY - 1, 8);
  px(g, BCX - 3, HCY - 1, 8);
  px(g, BCX - 4, HCY, 9);
  px(g, BCX + 2, HCY - 1, 8);
  px(g, BCX + 3, HCY - 1, 8);
  px(g, BCX + 4, HCY, 9);
  drawFoldedWings(g, BCX, BCY);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawClosedEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  // Bigger Z
  px(g, BCX + 9, HCY - 5, 9);
  px(g, BCX + 10, HCY - 5, 9);
  px(g, BCX + 11, HCY - 5, 9);
  px(g, BCX + 10, HCY - 6, 9);
  px(g, BCX + 9, HCY - 6, 9);
  px(g, BCX + 9, HCY - 7, 9);
  px(g, BCX + 10, HCY - 7, 9);
  px(g, BCX + 11, HCY - 7, 9);
  return g;
}

function buildEatingFrame1(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY + 1); // head dipped down
  drawEyes(g, BCX, HCY + 1);
  drawLegs(g, BCX, BCY, 'stand');
  // Sugar cube in front
  rect(g, BCX - 1, BCY + 7, BCX + 1, BCY + 9, 12);
  px(g, BCX + 1, BCY + 9, 13);
  return g;
}

function buildEatingFrame2(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY); // head back up
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  // Smaller crumb
  px(g, BCX, BCY + 8, 12);
  return g;
}

function buildHappyFrame1(): number[] {
  const g = empty();
  // Bouncy antennae
  px(g, BCX - 2, HCY - 2, 8);
  px(g, BCX - 3, HCY - 3, 8);
  px(g, BCX - 4, HCY - 4, 8);
  px(g, BCX - 5, HCY - 5, 9);
  px(g, BCX + 2, HCY - 2, 8);
  px(g, BCX + 3, HCY - 3, 8);
  px(g, BCX + 4, HCY - 4, 8);
  px(g, BCX + 5, HCY - 5, 9);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX, BCY - 1); // slight bounce up
  drawHead(g, BCX, HCY - 1);
  drawEyes(g, BCX, HCY - 1);
  drawLegs(g, BCX, BCY, 'stand');
  return g;
}

function buildHappyFrame2(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY + 1); // bounce down
  drawHead(g, BCX, HCY + 1);
  drawEyes(g, BCX, HCY + 1);
  drawLegs(g, BCX, BCY, 'stand');
  return g;
}

function buildSadFrame1(): number[] {
  const g = empty();
  // Droopy antennae
  px(g, BCX - 2, HCY, 8);
  px(g, BCX - 3, HCY + 1, 8);
  px(g, BCX - 4, HCY + 1, 9);
  px(g, BCX + 2, HCY, 8);
  px(g, BCX + 3, HCY + 1, 8);
  px(g, BCX + 4, HCY + 1, 9);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawSadEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  return g;
}

function buildSadFrame2(): number[] {
  const g = empty();
  px(g, BCX - 2, HCY, 8);
  px(g, BCX - 3, HCY + 1, 8);
  px(g, BCX - 4, HCY + 2, 9);
  px(g, BCX + 2, HCY, 8);
  px(g, BCX + 3, HCY + 1, 8);
  px(g, BCX + 4, HCY + 2, 9);
  drawFoldedWings(g, BCX, BCY);
  drawBody(g, BCX, BCY + 1);
  drawHead(g, BCX, HCY + 1);
  drawSadEyes(g, BCX, HCY + 1);
  drawLegs(g, BCX, BCY, 'stand');
  return g;
}

function buildSickFrame1(): number[] {
  const g = empty();
  // Limp antennae
  px(g, BCX - 2, HCY, 8);
  px(g, BCX - 3, HCY + 1, 8);
  px(g, BCX + 2, HCY, 8);
  px(g, BCX + 3, HCY + 1, 8);
  drawFoldedWings(g, BCX, BCY);
  drawBody(g, BCX, BCY + 1);
  drawHead(g, BCX, HCY + 1);
  drawSadEyes(g, BCX, HCY + 1);
  drawLegs(g, BCX, BCY, 'stand');
  // Green sick squiggle
  px(g, BCX + 6, HCY, 3);
  px(g, BCX + 7, HCY - 1, 3);
  px(g, BCX + 8, HCY, 3);
  return g;
}

function buildSickFrame2(): number[] {
  const g = empty();
  px(g, BCX - 2, HCY, 8);
  px(g, BCX - 3, HCY + 1, 8);
  px(g, BCX + 2, HCY, 8);
  px(g, BCX + 3, HCY + 1, 8);
  drawFoldedWings(g, BCX, BCY);
  drawBody(g, BCX, BCY + 2);
  drawHead(g, BCX, HCY + 2);
  drawSadEyes(g, BCX, HCY + 2);
  drawLegs(g, BCX, BCY, 'stand');
  px(g, BCX + 7, HCY + 1, 3);
  px(g, BCX + 8, HCY, 3);
  px(g, BCX + 9, HCY + 1, 3);
  return g;
}

function buildDanceFrame1(): number[] {
  const g = empty();
  // Perky antennae
  px(g, BCX - 2, HCY - 2, 8);
  px(g, BCX - 3, HCY - 4, 8);
  px(g, BCX - 4, HCY - 5, 9);
  px(g, BCX + 2, HCY - 2, 8);
  px(g, BCX + 3, HCY - 4, 8);
  px(g, BCX + 4, HCY - 5, 9);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX, BCY - 2); // lifted up
  drawHead(g, BCX, HCY - 2);
  drawEyes(g, BCX, HCY - 2);
  drawLegs(g, BCX, BCY, 'dance');
  return g;
}

function buildDanceFrame2(): number[] {
  const g = empty();
  px(g, BCX - 2, HCY - 1, 8);
  px(g, BCX - 4, HCY - 3, 8);
  px(g, BCX - 5, HCY - 4, 9);
  px(g, BCX + 2, HCY - 1, 8);
  px(g, BCX + 4, HCY - 3, 8);
  px(g, BCX + 5, HCY - 4, 9);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'walk2');
  return g;
}

function buildDanceFrame3(): number[] {
  const g = empty();
  px(g, BCX - 2, HCY - 2, 8);
  px(g, BCX - 3, HCY - 4, 8);
  px(g, BCX - 3, HCY - 5, 9);
  px(g, BCX + 2, HCY - 2, 8);
  px(g, BCX + 3, HCY - 4, 8);
  px(g, BCX + 3, HCY - 5, 9);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX + 1, BCY - 1); // lean right
  drawHead(g, BCX + 1, HCY - 1);
  drawEyes(g, BCX + 1, HCY - 1);
  drawLegs(g, BCX, BCY, 'dance');
  return g;
}

function buildBanjoFrame1(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, false);
  drawBody(g, BCX, BCY);
  drawHead(g, BCX, HCY);
  drawEyes(g, BCX, HCY);
  drawLegs(g, BCX, BCY, 'stand');
  // Banjo - circle body + neck
  ellipse(g, BCX + 8, BCY + 2, 3, 3, 10);
  px(g, BCX + 8, BCY - 1, 11);
  px(g, BCX + 8, BCY - 2, 11);
  px(g, BCX + 8, BCY - 3, 11);
  px(g, BCX + 8, BCY - 4, 11);
  // Strings
  px(g, BCX + 7, BCY - 1, 9);
  px(g, BCX + 9, BCY - 1, 9);
  return g;
}

function buildBanjoFrame2(): number[] {
  const g = empty();
  drawAntennae(g, BCX, HCY);
  drawWings(g, BCX, BCY, true);
  drawBody(g, BCX, BCY - 1); // slight bounce
  drawHead(g, BCX, HCY - 1);
  drawEyes(g, BCX, HCY - 1);
  drawLegs(g, BCX, BCY, 'walk1');
  // Banjo
  ellipse(g, BCX + 8, BCY + 1, 3, 3, 10);
  px(g, BCX + 8, BCY - 2, 11);
  px(g, BCX + 8, BCY - 3, 11);
  px(g, BCX + 8, BCY - 4, 11);
  px(g, BCX + 8, BCY - 5, 11);
  px(g, BCX + 7, BCY - 2, 9);
  px(g, BCX + 9, BCY - 2, 9);
  // Music notes
  px(g, BCX + 12, HCY - 2, 9);
  px(g, BCX + 11, HCY - 1, 9);
  return g;
}

function buildDeathFrame1(): number[] {
  const g = empty();
  // Fly on its back, legs up
  drawBody(g, BCX, BCY + 2);
  drawHead(g, BCX, HCY + 4);
  // X eyes
  px(g, BCX - 3, HCY + 3, 1);
  px(g, BCX - 2, HCY + 4, 1);
  px(g, BCX - 3, HCY + 5, 1);
  px(g, BCX - 2, HCY + 3, 1);
  px(g, BCX + 3, HCY + 3, 1);
  px(g, BCX + 2, HCY + 4, 1);
  px(g, BCX + 3, HCY + 5, 1);
  px(g, BCX + 2, HCY + 3, 1);
  // Legs up in air
  px(g, BCX - 4, BCY - 1, 7);
  px(g, BCX - 5, BCY - 2, 7);
  px(g, BCX - 2, BCY - 1, 7);
  px(g, BCX - 1, BCY - 2, 7);
  px(g, BCX + 4, BCY - 1, 7);
  px(g, BCX + 5, BCY - 2, 7);
  px(g, BCX + 2, BCY - 1, 7);
  px(g, BCX + 1, BCY - 2, 7);
  // Wings flat
  hLine(g, BCX - 8, BCX - 3, BCY + 4, 4);
  hLine(g, BCX + 3, BCX + 8, BCY + 4, 4);
  // Halo
  hLine(g, BCX - 2, BCX + 2, HCY - 1, 9);
  px(g, BCX - 3, HCY, 9);
  px(g, BCX + 3, HCY, 9);
  hLine(g, BCX - 2, BCX + 2, HCY + 1, 9);
  return g;
}

function buildDeathFrame2(): number[] {
  // Same as frame 1 but halo slightly higher (subtle float)
  const g = buildDeathFrame1();
  // Clear old halo
  hLine(g, BCX - 2, BCX + 2, HCY - 1, 0);
  px(g, BCX - 3, HCY, 0);
  px(g, BCX + 3, HCY, 0);
  hLine(g, BCX - 2, BCX + 2, HCY + 1, 0);
  // New halo higher
  hLine(g, BCX - 2, BCX + 2, HCY - 2, 9);
  px(g, BCX - 3, HCY - 1, 9);
  px(g, BCX + 3, HCY - 1, 9);
  hLine(g, BCX - 2, BCX + 2, HCY, 9);
  return g;
}

// ── Build All Frames ──

export type SpriteFrames = Record<PetAnimationState, number[][]>;

export function buildAllSprites(): SpriteFrames {
  return {
    idle: [buildIdleFrame1(), buildIdleFrame2()],
    walking: [buildWalkFrame1(), buildWalkFrame2()],
    sleeping: [buildSleepFrame1(), buildSleepFrame2()],
    eating: [buildEatingFrame1(), buildEatingFrame2()],
    happy: [buildHappyFrame1(), buildHappyFrame2()],
    sad: [buildSadFrame1(), buildSadFrame2()],
    sick: [buildSickFrame1(), buildSickFrame2()],
    dancing: [buildDanceFrame1(), buildDanceFrame2(), buildDanceFrame3()],
    playing_banjo: [buildBanjoFrame1(), buildBanjoFrame2()],
    death: [buildDeathFrame1(), buildDeathFrame2()],
  };
}
