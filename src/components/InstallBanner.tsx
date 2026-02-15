'use client';

import React, { useState, useEffect } from 'react';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('mooks_gym_install_dismissed');
    if (!dismissed && isIOS() && !isStandalone()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 chrome-bar px-4 py-3 pt-safe border-b border-primary/30 glow-green-box">
      <div className="flex items-start gap-3 pt-2">
        <div className="flex-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          <p className="text-sm font-bold text-primary glow-green tracking-wider">INSTALL MOOK&apos;S GYM</p>
          <p className="text-xs text-text-secondary mt-0.5 tracking-wide">
            Tap{' '}
            <svg className="inline w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14m-7-7l7-7 7 7" />
              <rect x="4" y="18" width="16" height="2" rx="1" />
            </svg>{' '}
            then &quot;Add to Home Screen&quot;
          </p>
        </div>
        <button
          onClick={() => {
            setShow(false);
            localStorage.setItem('mooks_gym_install_dismissed', '1');
          }}
          className="bevel-btn text-text-secondary text-xs px-2 py-1 rounded-sm"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          [X]
        </button>
      </div>
    </div>
  );
}
