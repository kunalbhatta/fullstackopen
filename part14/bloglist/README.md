# Full Stack Open — Part 14 · Next.js Blog List

Independent practice implementation of Next.js Blog List exercises 1–23. Includes the App Router and Server Actions, Drizzle ORM/PostgreSQL, credentials auth, form validation, Tailwind, notifications, personal reading lists, API tokens, MDX homepage and development-only API testing endpoints.

## Run

Use Node.js 22.12+. In this directory, run npm install. Copy .env.example to .env.local and set DATABASE_URL to either your local PostgreSQL instance or a Neon/Postgres database. Set a random NEXTAUTH_SECRET and NEXTAUTH_URL=http://localhost:3000. Run npm run db:push and then npm run dev.

Visit http://localhost:3000. Register an account, create blogs, like them, search by title, save other people's blogs, mark posts as read, and generate API tokens from the personal profile page.

## Verify

GitHub Actions uses an isolated PostgreSQL 16 service to run TypeScript, ESLint, a production build, Drizzle schema setup, and Helsinki's official browser tests. You can run the same tests locally with npm run test:e2e after configuring a dedicated test database. The test suite DELETEs all app data between tests — never run it against a real account's database.

The Playwright fixtures and configuration are from the official Helsinki repository: https://github.com/fullstack-hy2020/next-js-tests .

## External work

Exercise 7 requires a Vercel deployment; hosting has not been set up. Exercise 8's Neon deployment is likewise account-specific, although the schema and database code are provided. Exercise 25 is course submission and is intentionally skipped because this is personal practice.
