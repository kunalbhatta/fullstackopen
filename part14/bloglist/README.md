# Full Stack Open — Part 14 · Next.js Blog List

Independent study implementation of the 2026 Next.js Blog List (exercises 1–23): App Router, Server Components and Server Actions, title search, Drizzle ORM/PostgreSQL, bcrypt credentials and NextAuth v5, validation with useActionState, Tailwind CSS and notification context, user profiles, reading lists, API tokens, MDX homepage, and development-only testing endpoints.

## Local setup

1. Use Node.js 22.12+; run npm install in this folder.
2. Create a Neon PostgreSQL database. Copy .env.example to .env.local and configure DATABASE_URL, NEXTAUTH_SECRET and NEXTAUTH_URL.
3. Run npm run db:push, then npm run dev and visit http://localhost:3000.
4. Register an account; create, search and like blogs; try reading lists and token regeneration on /me. The /api/me route accepts an Authorization Bearer token generated on the profile.

## Checks

Run npm run typecheck, npm run lint, and npm run build. For the official Playwright tests use npm run test:e2e after setting up a **separate test database** in .env.test. The test suite deletes data through the development-only reset route. Never use a production database for this test.

The Playwright suite and configuration were taken from the University of Helsinki's public next-js-tests repository, with test content retained. Source: https://github.com/fullstack-hy2020/next-js-tests . For migration history, run npm run db:generate and review the generated SQL before applying it.

## External setup not performed

Exercise 7: deploy via Vercel. Exercise 8: provision Neon and connect Vercel environment variables. Exercise 24: set database/auth secrets in GitHub Actions and verify browser test success. Exercise 25: submit your repository URL via the course system (intentionally not done as this is practice only).

No credentials are committed. A successful local database integration or external deployment has not been verified in this session.
