# Blog List extension

Run `npm ci` from this directory to install both workspaces. Copy `server/.env.example` to `server/.env` and set your own MongoDB connection and JWT secret.

## Development

- Start the Express API with `npm run dev --workspace server`.
- In a second terminal, start Vite with `npm run dev`.

To create a local user, POST `username`, `name`, and `password` to `http://localhost:3001/api/users`. The login, create-blog, and user directory pages are linked from the navigation bar.

## Production

Run `npm run build && npm start` from this directory. Express serves both the JSON API and the built client, including deep links. The default URL is http://localhost:3001/.

## Checks

Run `npm run format:check` and `npm test --workspace client`. For backend tests, set `TEST_MONGODB_URI` to a separate test database and run `npm test --workspace server`.
