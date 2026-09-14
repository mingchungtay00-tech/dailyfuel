# DailyFuel

DailyFuel is a mobile-first calorie and macro tracking PWA built with Next.js.

It is designed for quick daily food logging, AI-assisted nutrition estimates, saved foods, weight tracking, local insights, and optional app locking.

## Features

- Food logging by photo and description
- Gemini-powered nutrition analysis
- Saved foods / presets
- Meal grouping for Breakfast, Lunch, Dinner, and Snack
- Daily calorie and macro tracking
- Weight tracking and progress insights
- 7-day / 30-day trends
- Gemini daily nutrition summary
- English and Simplified Chinese UI
- Configurable AI reply language
- Light / Dark / System appearance
- Local-first data storage
- PIN lock with optional WebAuthn device authentication
- Export / import backup
- PWA support

## Tech Stack

- Next.js
- React
- Vercel
- Gemini 2.5 Flash
- WebAuthn
- LocalStorage

## Environment Variables

Create a local `.env.local` file:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

For Vercel, add the same variable under:

**Project Settings → Environment Variables**

Do not commit your real API key to GitHub.

## Run Locally

```bash
npm install
npm run dev
```

Then open:

```
http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Data & Privacy

DailyFuel is local-first.

Food logs, saved foods, weight records, profile settings, summaries, theme settings, and app preferences are primarily stored in the browser on the user's device.

The Gemini API is called only when AI-powered features are used.

## Security

API secrets must only be stored in environment variables.

The source code references:

```js
process.env.GEMINI_API_KEY
```

The actual key must never be hardcoded into the repository.

## Deployment

The app is deployed on Vercel.

Production:

https://dailyfuel-gamma.vercel.app

## Repository

https://github.com/mingchungtay00-tech/dailyfuel
