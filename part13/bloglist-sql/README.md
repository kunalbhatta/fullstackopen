# Part 13 · Relational databases

This Blog List API uses Express, Sequelize, and PostgreSQL. It includes SQL-backed filtering and author summaries, reading lists, and database sessions that log out or disable users immediately.

1. Create a PostgreSQL database named `bloglist` and copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and a long, random `JWT_SECRET`.
3. Run `npm ci` and `npm start`. Startup applies pending migrations.
4. Run `npm run list` to print blogs from the command line. Use `npm run migrate` or `npm run rollback` to apply or reverse a migration manually.

The API supports users, login and logout, blogs, an author summary, and reading lists at `/api/users`, `/api/login`, `/api/logout`, `/api/blogs`, `/api/authors`, and `/api/readinglists`. Send the login token as `Authorization: Bearer <token>` for protected routes.

For the integration tests, point `TEST_DATABASE_URL` at a dedicated PostgreSQL database and run `npm test`. The tests reset that database's application tables.
