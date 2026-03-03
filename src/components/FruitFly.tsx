'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { PetAnimationState } from '@/lib/types';
import { buildAllSprites, PALETTE, PIXEL_SIZE, GRID_SIZE, SpriteFrames } from '@/lib/sprite-data';

interface Props {
  animationState: PetAnimationState;
  containerWidth: number;
  containerHeight: number;
}

// Convert a frame (flat number array) into a CSS box-shadow string
function frameToBoxShadow(frame: number[], pixelSize: number): string {
  const shadows: string[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const colorIdx = frame[y * GRID_SIZE + x];
      if (colorIdx === 0) continue;
      const color = PALETTE[colorIdx];
      if (!color) continue;
      const px = x * pixelSize;
      const py = y * pixelSize;
      shadows.push(`${px}px ${py}px 0 ${color}`);
    }
  }
  return shadows.join(',');
}

// States where the fly should not wander
const staticStates: PetAnimationState[] = ['sleeping', 'eating', 'sick', 'death'];

export default function FruitFly({ animationState, containerWidth, containerHeight }: Props) {
  const sprites = useMemo<SpriteFrames>(() => buildAllSprites(), []);
  const [frameIdx, setFrameIdx] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [facingLeft, setFacingLeft] = useState(false);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const animRef = useRef<number>(0);

  const spritePixelWidth = GRID_SIZE * PIXEL_SIZE;
  const spritePixelHeight = GRID_SIZE * PIXEL_SIZE;

  // Center on mount
  useEffect(() => {
    if (containerWidth > 0 && containerHeight > 0) {
      setPosX((containerWidth - spritePixelWidth) / 2);
      setPosY((containerHeight - spritePixelHeight) / 2);
    }
  }, [containerWidth, containerHeight, spritePixelWidth, spritePixelHeight]);

  // Frame cycling
  const frames = sprites[animationState] ?? sprites.idle;
  useEffect(() => {
    setFrameIdx(0);
    const speed = animationState === 'dancing' ? 250 : animationState === 'sleeping' ? 800 : 500;
    const interval = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % frames.length);
    }, speed);
    return () => clearInterval(interval);
  }, [animationState, frames.length]);

  // Autonomous movement
  useEffect(() => {
    if (staticStates.includes(animationState)) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const isWalking = animationState === 'walking' || animationState === 'dancing';
    const maxSpeed = isWalking ? 1.2 : 0.4;

    function pickNewVelocity() {
      const angle = Math.random() * Math.PI * 2;
      const speed = maxSpeed * (0.5 + Math.random() * 0.5);
      velocityRef.current = {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    }

    pickNewVelocity();
    let changeTick = 0;
    const changeInterval = 60 + Math.floor(Math.random() * 120); // frames between direction changes

    function tick() {
      changeTick++;
      if (changeTick > changeInterval) {
        pickNewVelocity();
        changeTick = 0;
      }

      const { vx, vy } = velocityRef.current;

      setPosX((prev) => {
        let next = prev + vx;
        const maxX = containerWidth - spritePixelWidth;
        if (next < 0) { next = 0; velocityRef.current.vx = Math.abs(vx); }
        if (next > maxX) { next = maxX; velocityRef.current.vx = -Math.abs(vx); }
        return next;
      });

      setPosY((prev) => {
        let next = prev + vy;
        const maxY = containerHeight - spritePixelHeight;
        if (next < 0) { next = 0; velocityRef.current.vy = Math.abs(vy); }
        if (next > maxY) { next = maxY; velocityRef.current.vy = -Math.abs(vy); }
        return next;
      });

      setFacingLeft(vx < 0);
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [animationState, containerWidth, containerHeight, spritePixelWidth, spritePixelHeight]);

  const currentFrame = frames[frameIdx % frames.length];
  const boxShadow = useMemo(
    () => frameToBoxShadow(currentFrame, PIXEL_SIZE),
    [currentFrame],
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        width: spritePixelWidth,
        height: spritePixelHeight,
        transform: facingLeft ? 'scaleX(-1)' : 'none',
        transition: 'transform 0.2s',
      }}
    >
      <div
        style={{
          width: PIXEL_SIZE,
          height: PIXEL_SIZE,
          boxShadow,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
