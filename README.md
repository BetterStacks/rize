## Rize

A modern, open-source profile and portfolio platform built with Next.js. Rize lets users create rich profiles with projects, writings, a gallery, and privacy-aware analytics. It includes a dashboard, onboarding flow, and OAuth sign-in.

- **Framework**: Next.js (App Router)
- **DB & ORM**: PostgreSQL + Drizzle ORM
- **Auth**: better-auth (Email/Password + Google/GitHub/LinkedIn)
- **UI**: Tailwind CSS, Radix UI, shadcn components
- **State/Queries**: React Query
- **Analytics (optional)**: PostHog
- **Email (optional)**: Resend, Loops
- **Storage/Other (optional)**: Supabase client, Cloudinary scripts

### Features
- Profile builder with sections for experience, education, projects, writings, and social links
- Image gallery with client-side cropping and limits
- Privacy-aware profile analytics (pageviews, geography breakdown) via PostHog
- OAuth sign-in with Google, GitHub, LinkedIn, and email/password
- Onboarding flow and settings dashboard
- API routes for importing profile data (GitHub/LinkedIn)

---

### Requirements
- Node.js 22+
- Bun package manager
- PostgreSQL 14+

### Quickstart
1. Clone and install dependencies:
```bash
bun install
```
2. Create and configure environment:
```bash
cp .env.example .env.local
```
Fill in at least the required variables (see Env section below).
3. Provision a Postgres database and set `DATABASE_URL`.
4. Run database migrations:
```bash
bunx drizzle-kit push
```
5. Start the dev server:
```bash
bun dev
```
Visit `http://localhost:3000`.

---

### Environment variables
The app is modular: enable only the integrations you need. Below is a practical set based on what the code reads today.

- Required
  - `DATABASE_URL` – Postgres connection string
  - `AUTH_SECRET` – secret for session/auth (generate a strong random value)
  - `NEXT_PUBLIC_BASE_URL` – public base URL (e.g., `http://localhost:3000`)
  - `BASE_URL` – server base URL; usually same as above in development

- OAuth providers (enable as needed)
  - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

- Analytics (optional)
  - Client: `NEXT_PUBLIC_POSTHOG_KEY` (project key), optionally `NEXT_PUBLIC_POSTHOG_HOST`
  - Server analytics endpoint: `POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY`, optionally `POSTHOG_API_HOST` (defaults to `https://us.posthog.com`)

- Email (optional)
  - `RESEND_API_KEY` – for development scripts/examples
  - `RIZE_LOOPS_API_KEY` – for transactional email via Loops
  - Suggested: `EMAIL_FROM` – default sender, e.g., `Rize <no-reply@example.com>`

- Supabase (optional, used client-side)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Letraz integration (optional)
  - `NEXT_PUBLIC_LETRAZ_URL` – Letraz API/UI base URL
  - `LETRAZ_API_KEY` – Server-side only. If you integrate resume parsing, proxy via a server route; do not expose this in the client.
  - `NEXT_PUBLIC_LETRAZ_CONNECTION` – feature flag (`true|false`)

- Cloudinary (optional; scripts)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

> Tip: Keep all secrets out of the client. Any variable used in the browser must be prefixed with `NEXT_PUBLIC_`.

---

### Database and migrations
- Drizzle config lives in `drizzle.config.ts`.
- Migrations output to the `drizzle/` directory.
- Apply migrations:
```bash
bunx drizzle-kit push
```

### Authentication
This project uses `better-auth` with a Drizzle adapter. Email/password is enabled by default; OAuth providers are optional and require environment configuration.

- Configure providers in `src/lib/auth.ts` via env vars above.
- Set `AUTH_SECRET` and `NEXT_PUBLIC_BASE_URL`/`BASE_URL`.
- Ensure your OAuth app callback URLs match your deployment environment.

### Analytics (optional)
- Client analytics is initialized in `src/lib/PostHogProvider.tsx` when `NEXT_PUBLIC_POSTHOG_KEY` is present.
- Server analytics dashboard endpoint lives at `src/app/api/analytics/profile-views/route.ts` and uses `POSTHOG_PROJECT_ID` and `POSTHOG_PERSONAL_API_KEY`.
- `next.config.ts` already includes rewrites to PostHog’s ingestion endpoints.

### Email and storage (optional)
- Resend-based scripts live in `src/scripts/` for development/testing campaigns.
- Loops transactional email is in `src/lib/email-service.ts` (guarded by `RIZE_LOOPS_API_KEY`).
- Supabase client (`src/lib/supabase.ts`) is available for client-side interactions if needed.
- Cloudinary upload helper scripts are under `src/scripts/`.

---

### Scripts
These TypeScript scripts can be run via Bun:

- Send claim emails (Resend):
```bash
bun run src/scripts/send-claim-emails.ts
```
- Test email campaign (Resend):
```bash
bun run src/scripts/test-email-campaign.ts
```
- Upload a single file to Cloudinary:
```bash
bun run src/scripts/upload-single-file.ts
```
- Seed users from resumes:
```bash
bun run src/scripts/seed-users-from-resumes.ts
```
> Ensure `.env.local` contains the required keys for each script before running.

---

### Project structure (high level)
- `src/app/` – App Router routes (pages, API routes), layouts
- `src/components/` – UI components and feature modules
- `src/actions/` – server actions (data mutations)
- `src/lib/` – auth, db, clients, utils, providers
- `src/db/` – Drizzle schema and email-related types
- `src/scripts/` – optional helper scripts (emails, uploads, seeding)
- `public/` – static assets and icons

### Development
- Start: `bun dev`
- Lint: `bun run lint`
- Build: `bun run build`
- Start production server: `bun run start`

### Deployment
- Set environment variables in your hosting provider (e.g., Vercel/Render/Fly).
- Ensure Postgres is reachable and run migrations before the first start.
- If using analytics, configure PostHog keys and verify rewrites in `next.config.ts`.
- If you enable any optional integrations (email/storage), set only the keys you need.

### Security & privacy
- Never expose server-only secrets in client bundles. Avoid using non-`NEXT_PUBLIC_` env vars in client code.
- Rotate keys if you suspect exposure.
- See [SECURITY.md](./SECURITY.md) for private vulnerability reporting.

### Troubleshooting
- Missing env vars: check `.env.local` and that your host injects them at build/runtime.
- Auth callback issues: ensure OAuth redirect URLs match `NEXT_PUBLIC_BASE_URL`/`BASE_URL`.
- Database errors: verify `DATABASE_URL` and that migrations have been applied.
- PostHog not capturing: verify keys and that the proxy rewrites are active.

### Contributing & License
- Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).
- Licensed under the [MIT License](./LICENSE).
