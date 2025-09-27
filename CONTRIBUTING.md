# Contributing

Thanks for your interest in contributing! We welcome issues, feature requests, and pull requests.

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting started

### Prerequisites
- Node.js 22+
- Bun package manager
- PostgreSQL 14+

### Setup
1. Fork and clone the repository.
2. Install dependencies:
   - bun: `bun install`
3. Copy environment file: `cp .env.example .env.local` and fill in values.
4. Create the database and set `DATABASE_URL` in `.env.local`.
5. Run migrations with Drizzle:
   - Generate (if needed): `bunx drizzle-kit generate`
   - Push: `bunx drizzle-kit push`
6. Start the dev server: `bun dev`.

### Env configuration
See `.env.example` for all supported variables. At minimum you will need:
- `DATABASE_URL`
- `AUTH_SECRET`

Optional integrations (configure only if you use them): PostHog, Supabase, Cloudinary, Resend, OAuth providers (Google/GitHub/LinkedIn), Letraz proxy.

## Development workflow

### Branching
- Create feature branches from `main`: `feature/<short-description>`.

### Coding standards
- Type-safe, readable code (see repository lint settings).
- No secrets in code. Use environment variables.
- Server-only secrets must never be referenced on the client.

### Commit messages
- Clear and descriptive. Example: `feat(auth): add LinkedIn provider`.

### Running checks
- Lint: `bun run lint`
- Build: `bun run build`

### Submitting changes
1. Ensure the app builds locally.
2. Open a pull request against `main` with a concise description and screenshots if UI changes.
3. Link related issues and add notes on migrations or breaking changes.

## Reporting issues
Use GitHub Issues. For security vulnerabilities, please follow [SECURITY.md](./SECURITY.md).

## License
By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
