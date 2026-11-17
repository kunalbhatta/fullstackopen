# Part 8 — GraphQL library

Exercises 8.1–8.26 cover a GraphQL schema, author and genre filters, MongoDB, login, Apollo Client, recommendations, and WebSocket subscriptions. Author counts are read with one aggregate query and one author query regardless of the number of authors.

## Run

```bash
cd part8/library
npm ci
cp server/.env.example server/.env
```

Set a MongoDB URI and a private random JWT secret in `server/.env`. From this directory run `npm run seed --workspace server` to load the sample library, then `npm start`. In a second terminal use `npm run dev` and open the Vite URL.

The API is at http://localhost:4000/graphql. Create a local account before using the edit controls:

```graphql
mutation {
  createUser(username: "reader", favoriteGenre: "classic", password: "your-local-password") {
    username
  }
}
```

Open two browser tabs to see a new book appear in both. Subscriptions use the same GraphQL endpoint over WebSocket.

## Verify

Run `npm run build`. Set `TEST_MONGODB_URI` to a separate test database and run `npm test`. The tests clear their database’s collections.

Book and author fixtures are from [Helsinki’s library starter data](https://github.com/fullstack-hy2020/misc/blob/master/library-backend.js).
