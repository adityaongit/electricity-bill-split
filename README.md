# SplitWatt — Electricity Bill Splitter

> Split electricity bills fairly among roommates using submeter readings.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-electricity--bill--split.vercel.app-orange?style=flat-square&logo=vercel)](https://electricity-bill-split.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## What is SplitWatt?

SplitWatt takes your flat's submeter readings, calculates how many units each area consumed, and distributes the total bill fairly — including shared common area costs split proportionally across all rooms.

No more spreadsheets. No more arguments.

---

## Features

- **Submeter-based splitting** — each room's share based on actual units consumed
- **Common area distribution** — shared costs split proportionally across all areas
- **Partial occupancy** — day-based proration for move-ins/move-outs mid-cycle
- **Bill history & dashboard** — spending trends, charts, and per-unit analytics
- **PDF & image export** — shareable bill summaries
- **WhatsApp sharing** — send individual shares directly
- **Guest mode** — no signup required, data stored locally
- **Google OAuth** — one-click sign in with persistent cloud storage
- **Dark / light mode**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Charts | Recharts (via shadcn chart) |
| Auth | better-auth |
| Database | MongoDB |
| PDF | @react-pdf/renderer |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone & install

```bash
git clone https://github.com/adityaongit/electricity-bill-split.git
cd electricity-bill-split
npm install
```

### 2. Environment variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Auth (better-auth)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional — enables Google sign-in)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── (auth)/           # Login & signup pages
├── (protected)/      # Authenticated app pages
│   ├── dashboard/
│   ├── bill/
│   │   ├── new/
│   │   ├── history/
│   │   └── [billId]/
│   ├── roommates/
│   └── settings/
├── api/              # API route handlers
├── share/            # Public bill share pages
└── page.tsx          # Landing page

components/
├── layout/           # AppHeader, GuestBanner, Logo
├── ui/               # shadcn/ui primitives + chart

lib/
├── data-service.ts   # Abstracted DB/local storage layer
├── guest-context.tsx # Guest mode provider
├── currency-context.tsx
├── auth-client.ts
└── analytics.ts
```

---

## Contributing

Contributions are welcome. Here's how to get started:

### Workflow

1. Fork the repository
2. Create a feature branch from `main`
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes — see guidelines below
4. Open a pull request against `main`

### Guidelines

- **TypeScript** — all new code must be typed; avoid `any`
- **Components** — use shadcn/ui primitives where possible; add new UI to `components/ui/`
- **Data layer** — all database/storage access goes through `lib/data-service.ts`; both authenticated and guest modes must work
- **Responsive** — test on mobile and desktop; mobile-first where it matters
- **No breaking guest mode** — guest users store data in IndexedDB; new features should support this where feasible

### Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
```

### Reporting Issues

Please open an issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser / OS if relevant

---

## License

[MIT](LICENSE)
