# Part 5 — Blog List frontend

Exercises 5.1–5.31 cover login, session persistence, blog editing controls, component tests, Playwright, React Router, and styled-components. The commit for 5.1–5.23 shows the earlier single-page version and its expandable blog cards.

## Run

Start the [Part 4 API](../../part4/bloglist#readme). Then, in a second terminal:

```bash
cd part5/bloglist
npm ci
npm run dev
```

Create an account through the API first. For example, with the API running locally:

```bash
curl http://localhost:3003/api/users \
  -H 'Content-Type: application/json' \
  --data '{"username":"demo","name":"Demo User","password":"demo-local-only"}'
```

Open the Vite URL and sign in with the account you created. An anonymous viewer can read blogs. A signed-in viewer can add and like blogs. The creator can remove their own blog.

## Verify

```bash
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Playwright starts a separate backend and frontend. Configure `TEST_MONGODB_URI` in `part4/bloglist/.env.test` with a dedicated test database. The Playwright suite clears that database between scenarios.
