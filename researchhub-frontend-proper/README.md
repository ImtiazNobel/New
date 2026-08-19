# ResearchHub — backend scaffold

This is a real Next.js + PostgreSQL backend for the ResearchHub app we prototyped
as a browser artifact. It replaces every `window.storage` call from that prototype
with actual database-backed API routes.

## What's fully implemented here

- **Database schema** (`prisma/schema.prisma`): Users, Messages, MessageReads,
  Reviews, Bookmarks, Recommendations, plus the NextAuth tables.
- **Real authentication** (`lib/auth.ts`):
  - Google OAuth (real, via NextAuth — no more simulated picker)
  - Email + password, with passwords hashed via bcrypt and checked server-side
    (real verification, not the demo-grade check the artifact had to fake)
- **API routes** for every feature: profile CRUD, directory search/filter,
  bookmarks, messaging + unread counts, reviews/ratings, and supervisor-to-supervisor
  student recommendations. See the route list below.
- **`lib/api.ts`** — a typed fetch client so UI components can call these routes
  the same way they used to call `window.storage`.

## What's NOT done yet (and needs your input)

- **The UI itself.** This scaffold ships only a placeholder landing page
  (`app/page.tsx`). The actual screens (Landing, Auth, Dashboard, Directory,
  Messages, etc.) still live in the `ResearchHub.jsx` artifact from our chat —
  they need to be split into real pages under `app/` and pointed at `lib/api.ts`
  instead of `window.storage`. The component structure and Tailwind classes can
  mostly be reused as-is.
- **Real email delivery for OTP/verification.** The signup route creates the
  account but doesn't send anything — plug in Resend/SendGrid/Postmark inside
  `app/api/auth/signup/route.ts` if you want real verification emails.
- **Real-time messaging.** Right now you'd poll `/api/conversations` and
  `/api/messages/:id` on an interval (same as the artifact did). For instant
  delivery, swap in Pusher, Supabase Realtime, or a websocket server.
- **File/image uploads** (avatars) aren't wired up — add a storage provider
  (S3, Cloudinary, Supabase Storage) if you want real photo uploads.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Postgres.** Any Postgres works — local, Supabase, Neon, Railway, etc.
   Copy the env template and fill in your real values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
     (OAuth consent screen + credentials, redirect URI:
     `http://localhost:3000/api/auth/callback/google`)

3. **Run the migration** — this creates every table from `schema.prisma`:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run it**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## API route reference

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/signup` | POST | Create account (name, email, password) |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth — Google + credentials sign-in |
| `/api/users/me` | GET / PATCH | Get/update your own profile (role, bio, etc.) |
| `/api/users/:id` | GET | View another user's public profile |
| `/api/supervisors` | GET | Directory search (`?q=&department=&area=&accepting=`) |
| `/api/bookmarks` | GET / POST | List / toggle saved supervisors |
| `/api/conversations` | GET | All conversations + unread counts |
| `/api/messages/:contactId` | GET / POST | Read a thread (marks it read) / send a message |
| `/api/reviews/:supervisorId` | GET / POST | List reviews / submit-or-update your review |
| `/api/recommendations` | GET / POST | List (`?type=received|sent`) / send a recommendation |
| `/api/reads/recommendations` | GET / POST | Unread count / mark recommendations read |

All routes (except signup and NextAuth's own routes) require a logged-in session —
they call `getCurrentUser()` from `lib/session.ts` and return 401 if there isn't one.

## Porting the UI

The fastest path: take each component from the artifact (`Landing`, `AuthShell`,
`Dashboard`, `Directory`, `SupervisorDetail`, `Messages`, `MyProfile`,
`Recommendations`, etc.), drop it into its own file under `app/`, add
`"use client"` at the top, and replace each `safeGet/safeSet/safeList` call with
the matching `api.*` function from `lib/api.ts`. The visual design (colors, fonts,
Tailwind classes) doesn't need to change at all.
