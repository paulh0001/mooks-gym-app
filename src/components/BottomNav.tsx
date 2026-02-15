'use client';

import React from 'react';

export type Tab = 'today' | 'plan' | 'library' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'today',
    label: 'PLAY',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
      </svg>
    ),
  },
  {
    id: 'plan',
    label: 'LIST',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'library',
    label: 'LIB',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'EQ',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 chrome-bar pb-safe">
      <div className="flex justify-around items-center h-14">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              active === t.id
                ? 'text-primary glow-green'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {t.icon}
            <span className="text-[9px] mt-0.5 font-bold tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
      {/* Groove line at top */}
      <div className="absolute top-0 left-0 right-0 groove" />
    </nav>
  );
}
