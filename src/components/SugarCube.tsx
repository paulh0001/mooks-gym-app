'use client';

import React, { useRef, useState, useCallback } from 'react';

const CUBE_SIZE = 3; // pixel scale
const CUBE_PX = 16; // grid size

// 16x16 sugar cube pixel art
const CUBE_DATA = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,9,9,9,9,9,9,9,9,0,0,0,0,
  0,0,0,9,12,12,12,12,12,12,12,9,0,0,0,0,
  0,0,9,12,12,12,12,12,12,12,12,12,9,0,0,0,
  0,0,9,12,12,9,12,12,12,12,12,12,9,0,0,0,
  0,0,9,12,12,12,12,12,12,9,12,12,9,0,0,0,
  0,0,9,12,12,12,12,12,12,12,12,12,9,0,0,0,
  0,0,9,12,12,12,12,12,12,12,12,12,9,0,0,0,
  0,0,9,12,12,12,9,12,12,12,12,12,9,0,0,0,
  0,0,9,12,12,12,12,12,12,12,12,12,9,0,0,0,
  0,0,9,13,13,13,13,13,13,13,13,13,9,0,0,0,
  0,0,0,9,13,13,13,13,13,13,13,9,0,0,0,0,
  0,0,0,0,9,9,9,9,9,9,9,9,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

// Palette matches sprite-data
const PALETTE: Record<number, string> = {
  9: '#eeddcc',
  12: '#ffffff',
  13: '#ccccbb',
};

function cubeToBoxShadow(): string {
  const shadows: string[] = [];
  for (let y = 0; y < CUBE_PX; y++) {
    for (let x = 0; x < CUBE_PX; x++) {
      const idx = CUBE_DATA[y * CUBE_PX + x];
      if (idx === 0) continue;
      const color = PALETTE[idx];
      if (!color) continue;
      shadows.push(`${x * CUBE_SIZE}px ${y * CUBE_SIZE}px 0 ${color}`);
    }
  }
  return shadows.join(',');
}

const SHADOW = cubeToBoxShadow();
const RENDER_SIZE = CUBE_PX * CUBE_SIZE;

/** Static sugar cube display */
export function SugarCubeIcon({ scale = 1 }: { scale?: number }) {
  const s = CUBE_SIZE * scale;
  const shadows: string[] = [];
  for (let y = 0; y < CUBE_PX; y++) {
    for (let x = 0; x < CUBE_PX; x++) {
      const idx = CUBE_DATA[y * CUBE_PX + x];
      if (idx === 0) continue;
      const color = PALETTE[idx];
      if (!color) continue;
      shadows.push(`${x * s}px ${y * s}px 0 ${color}`);
    }
  }

  return (
    <div
      style={{
        display: 'inline-block',
        width: CUBE_PX * s,
        height: CUBE_PX * s,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: s,
          height: s,
          boxShadow: shadows.join(','),
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

/** Draggable sugar cube for feeding */
export default function SugarCube({
  onFeed,
  flyRef,
}: {
  onFeed: () => void;
  flyRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0, originX: 0, originY: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    const rect = cubeRef.current?.getBoundingClientRect();
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: rect?.left ?? 0,
      originY: rect?.top ?? 0,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
    });
  }, [dragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);

    // Hit detection: check if cube overlaps the fly container
    if (flyRef.current) {
      const flyRect = flyRef.current.getBoundingClientRect();
      const cubeX = startRef.current.originX + pos.x + RENDER_SIZE / 2;
      const cubeY = startRef.current.originY + pos.y + RENDER_SIZE / 2;

      if (
        cubeX >= flyRect.left &&
        cubeX <= flyRect.right &&
        cubeY >= flyRect.top &&
        cubeY <= flyRect.bottom
      ) {
        onFeed();
      }
    }

    setPos({ x: 0, y: 0 });
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [dragging, pos, flyRef, onFeed]);

  return (
    <div
      ref={cubeRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={dragging ? 'sugar-cube-glow' : ''}
      style={{
        display: 'inline-block',
        width: RENDER_SIZE,
        height: RENDER_SIZE,
        position: 'relative',
        cursor: dragging ? 'grabbing' : 'grab',
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: dragging ? 100 : 1,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: CUBE_SIZE,
          height: CUBE_SIZE,
          boxShadow: SHADOW,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
