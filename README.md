# SplitWatt - Electricity Bill Splitter

A free and open source electricity bill splitter for roommates. Calculate fair splits based on submeter readings.

[![Live Demo](https://electricity-bill-split.vercel.app)](https://electricity-bill-split.vercel.app)

## ⚠️ Important: Use the `next-app` Version

This repository contains multiple branches:
- **`next-app` (this branch)** - The modern, actively maintained Next.js App Router version ✅ **USE THIS**
- `legacy-app` - Deprecated Next.js Pages Router version (no longer maintained)

**Please use the `next-app` version** for the best experience, latest features, and ongoing support.

## Features

- 🧮 Calculate electricity bill splits based on submeter readings
- 📊 Automatic distribution of common area costs
- 📅 Handle partial occupancy with day-based calculations
- 📤 Export bills as PDF or images
- 📱 Share directly via WhatsApp
- 💾 Save bills and history (requires account)
- 👻 Guest mode - no signup required

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

This is a [Next.js](https://nextjs.org) project using the App Router.

- `app/` - Next.js App Router pages and layouts
- `components/` - React components
- `lib/` - Utility functions and business logic
- `types/` - TypeScript type definitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details
