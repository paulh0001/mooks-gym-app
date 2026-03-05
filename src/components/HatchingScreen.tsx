'use client';

import React, { useState, useEffect } from 'react';
import FruitFly from './FruitFly';

interface Props {
  petName: string;
  onDone: () => void;
}

export default function HatchingScreen({ petName, onDone }: Props) {
  const [phase, setPhase] = useState<'egg' | 'crack1' | 'crack2' | 'hatch' | 'reveal'>('egg');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('crack1'), 1200),
      setTimeout(() => setPhase('crack2'), 2200),
      setTimeout(() => setPhase('hatch'), 3200),
      setTimeout(() => setPhase('reveal'), 4200),
      setTimeout(() => onDone(), 6500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-bg px-6">
      <div className="text-center">
        {/* Egg / hatching visual */}
        <div className="relative flex items-center justify-center mb-6" style={{ height: 180 }}>
          {phase !== 'reveal' ? (
            <div
              className={`transition-all duration-500 ${
                phase === 'hatch' ? 'scale-110 opacity-0' : ''
              }`}
            >
              {/* Egg */}
              <div
                className={`relative mx-auto transition-transform duration-200 ${
                  phase === 'crack1' ? 'animate-shake-sm' : ''
                } ${phase === 'crack2' ? 'animate-shake-lg' : ''}`}
                style={{ width: 80, height: 100 }}
              >
                <svg width="80" height="100" viewBox="0 0 80 100">
                  {/* Egg shape */}
                  <ellipse cx="40" cy="55" rx="32" ry="40" fill="#1a1a2e" stroke="#39ff14" strokeWidth="2" />
                  <ellipse cx="40" cy="50" rx="24" ry="30" fill="none" stroke="#39ff14" strokeWidth="0.5" opacity="0.3" />

                  {/* Cracks */}
                  {(phase === 'crack1' || phase === 'crack2' || phase === 'hatch') && (
                    <g stroke="#39ff14" strokeWidth="1.5" fill="none" opacity="0.8">
                      <polyline points="40,30 35,42 42,48 36,55" />
                      <polyline points="42,35 48,45 44,50" />
                    </g>
                  )}
                  {(phase === 'crack2' || phase === 'hatch') && (
                    <g stroke="#39ff14" strokeWidth="1.5" fill="none" opacity="0.9">
                      <polyline points="30,45 38,50 32,60 40,65" />
                      <polyline points="50,40 45,52 52,58" />
                      <polyline points="35,55 42,58 38,68" />
                    </g>
                  )}

                  {/* Glow from inside cracks */}
                  {(phase === 'crack2' || phase === 'hatch') && (
                    <ellipse cx="40" cy="50" rx="15" ry="18" fill="#39ff14" opacity="0.1" />
                  )}
                </svg>

                {/* Question mark before cracks */}
                {phase === 'egg' && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-3xl text-primary glow-green pulse-glow"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    ?
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div
                className="relative bevel-inset bg-bg-surface rounded-sm overflow-hidden mx-auto"
                style={{ width: 160, height: 140 }}
              >
                <FruitFly animationState="happy" containerWidth={160} containerHeight={140} />
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        <div style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          {phase === 'egg' && (
            <div className="text-text-secondary text-xs tracking-widest animate-pulse">
              SOMETHING IS HAPPENING...
            </div>
          )}
          {phase === 'crack1' && (
            <div className="text-primary glow-green text-xs tracking-widest">
              *CRACK*
            </div>
          )}
          {phase === 'crack2' && (
            <div className="text-primary glow-green text-sm tracking-widest">
              *CRACK CRACK*
            </div>
          )}
          {phase === 'hatch' && (
            <div className="text-primary glow-green text-lg tracking-widest pulse-glow">
              HATCHING!
            </div>
          )}
          {phase === 'reveal' && (
            <div>
              <div className="text-primary glow-green text-lg tracking-widest mb-2">
                {petName.toUpperCase()} IS BORN!
              </div>
              <div className="text-text-secondary text-xs tracking-widest">
                Take good care of your fly!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
