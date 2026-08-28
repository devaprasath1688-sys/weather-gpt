# WeatherGPT (SIH26068)

Smart India Hackathon 2026 project scaffold. **Phase 1 only** — app shell, layout, and health/status. Weather, AI, maps, alerts, notifications, and voice are not implemented yet.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Status: [http://localhost:3000/health](http://localhost:3000/health) and [http://localhost:3000/api/health](http://localhost:3000/api/health).

Keep secrets out of `NEXT_PUBLIC_*` variables. Copy `.env.example` to `.env.local` and fill values only when a later phase needs them.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
