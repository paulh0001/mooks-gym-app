'use client';

import React from 'react';
import { ShellColor } from '@/lib/types';

interface Props {
  shellColor: ShellColor;
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
}

export default function TamagotchiShell({ shellColor, children, bottomNav }: Props) {
  return (
    <div className="tama-wrapper" data-color={shellColor}>
      <div className="tama-shell">
        {/* Plastic highlight reflection */}
        <div className="tama-highlight" />

        {/* Screen bezel (inset) */}
        <div className="tama-bezel">
          {/* LCD screen area */}
          <div className="tama-lcd scanlines">
            {children}
          </div>
        </div>

        {/* Bottom nav area inside shell */}
        {bottomNav && (
          <div className="tama-nav-area">
            {bottomNav}
          </div>
        )}
      </div>
    </div>
  );
}
