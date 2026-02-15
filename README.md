# Mook's Gym App

Adaptive workout companion — a mobile-first Progressive Web App built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Onboarding questionnaire** — goal, equipment, frequency, experience level
- **Auto-generated training plans** — 4-week blocks with balanced push/pull/legs/core
- **Guided workout sessions** — exercise-by-exercise with rest timers
- **Post-workout feedback** — difficulty rating that adapts future workouts
- **Stretching routine** — guided cool-down with per-stretch timers
- **Exercise library** — 50 seeded exercises + custom exercise creation
- **Workout history** — track completed sessions and difficulty trends
- **Fully offline** — all data stored locally in IndexedDB

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Click **Deploy** — no configuration needed

## Install on iPhone

1. Open the deployed URL in **Safari**
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

The app will launch in full-screen mode like a native app.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- IndexedDB for persistence (localStorage fallback)
- PWA with manifest.json and iOS meta tags
