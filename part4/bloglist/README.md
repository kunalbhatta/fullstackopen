# Part 4 — Blog List API

Exercises 4.1–4.23 cover Express controllers, Mongoose models, Node and SuperTest tests, account validation, bcrypt password hashes, JWT authentication, and creator-only deletion.

## Run the API

```bash
cd part4/bloglist
npm ci
cp .env.example .env
npm run dev
```

Set `MONGODB_URI` to your database and `JWT_SECRET` to a private random value before running the server. The default address is http://localhost:3003. Create an account with `POST /api/users` using `username`, `name`, and `password`. Log in through `POST /api/login`. Use the returned token as a Bearer token when creating or deleting a blog.

The user-to-blogs list is populated from each blog’s creator field, so deletion needs to update only the blog collection.

## Verify

Copy `.env.test.example` to `.env.test` and set a dedicated test MongoDB database. The API tests clear the collections in that database.

```bash
npm test
```
