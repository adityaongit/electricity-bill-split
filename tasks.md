# SplitWatt — Build Tasks

## Phase 1: Foundation
- [x] Install shadcn/ui + base components (button, card, input, label)
- [x] Create `lib/db.ts` (MongoDB singleton with lazy init)
- [x] Create `lib/utils.ts` (cn, formatCurrency, formatDate, formatDateShort)
- [x] Build landing page with hero, features, how-it-works, CTA
- [x] Create `robots.ts`, `sitemap.ts`
- [x] Root layout with metadata, fonts
- [x] Header + Footer components
- [x] Custom 404 page
- [x] JSON-LD component for SEO

## Phase 2: Authentication
- [x] Install `better-auth`, `mongodb`
- [x] Create `lib/auth.ts` (lazy init with Proxy for build safety)
- [x] Create `lib/auth-client.ts` (createAuthClient, useSession, signIn, signUp, signOut)
- [x] Create `middleware.ts` (protects dashboard/bill/settings/roommates routes)
- [x] Auth API route (`/api/auth/[...all]`)
- [x] Login page with email/password + Google OAuth
- [x] Signup page with email/password + Google OAuth
- [x] Auth card, OAuth buttons, login form, signup form components
- [x] Providers component (Toaster)

## Phase 3: Flat + Roommate Management
- [x] Types: `flat.ts`, `roommate.ts`, `bill.ts`, `api.ts`
- [x] `lib/validations.ts` with Zod schemas
- [x] `lib/api-utils.ts` (session helper, JSON responses)
- [x] Flat API routes (GET list, POST create, GET/PATCH/DELETE by ID)
- [x] Roommate API routes (GET by flat, POST add, PATCH/DELETE by ID)
- [x] Install remaining shadcn components (dialog, sheet, table, tabs, badge, skeleton, separator, dropdown-menu, select)
- [x] Protected layout with AppHeader (sidebar nav, mobile sheet, user dropdown)
- [x] Roommates management page (grouped by area, add/remove)
- [x] Settings page (profile, create flat, list/delete flats)

## Phase 4: Bill Splitting
- [x] `lib/bill-calculator.ts` (pure function, ported from legacy script.js)
- [x] Bill API routes (GET paginated, POST create+compute, GET detail+splits, DELETE)
- [x] New bill page with live preview + auto reading shift
- [x] Bill detail page with summary cards, submeter readings, distribution table

## Phase 5: Dashboard + History
- [x] Dashboard with stats cards, recent bill, quick actions
- [x] Bill history page with pagination
- [x] Loading skeletons and empty states throughout

## Phase 6: Export + Share
- [x] Install `@react-pdf/renderer`, `html-to-image`
- [x] `lib/whatsapp.ts` (format summary, generate wa.me URL)
- [x] PDF document component (`BillPdfDocument`)
- [x] PDF API route (`GET /api/bills/[billId]/pdf`)
- [x] Image export (client-side html-to-image)
- [x] WhatsApp share (client-side deep link)
- [x] Export actions component integrated into bill detail page

## Verification
- [x] `npm run build` — zero TypeScript errors, zero ESLint errors
- [x] `npm run lint` — clean
- [ ] `npm run dev` — test full auth flow
- [ ] Bill flow — create flat, add roommates, create bill, verify calculations
- [ ] Export — PDF, image, WhatsApp
- [ ] Mobile responsive testing (375px)
- [ ] Lighthouse audit
