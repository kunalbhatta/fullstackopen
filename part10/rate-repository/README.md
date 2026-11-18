# Part 10 — Rate Repository

Exercises 10.1–10.27 cover a React Native repository list, Formik and Yup, Apollo Client, persistent login, user registration, repository details, reviews, sorting, search, and cursor-based review pagination.

## Run

1. Start [Helsinki’s Rate Repository API](https://github.com/fullstack-hy2020/rate-repository-api). Its current GraphQL server defaults to `http://localhost:4000/`.
2. In this directory run `npm ci`, then copy `.env.example` to `.env`. Point `EXPO_PUBLIC_APOLLO_URI` at your GraphQL server. Use `http://10.0.2.2:4000/` for an Android emulator or your computer’s LAN address for a physical device.
3. Use `npm start` and select a platform in Expo. For web, use `npm start -- --web`.

## Check

Run `npm run lint` and `npm test`. `npx expo export --platform all --max-workers 2` makes the web, iOS, and Android bundles.

The web checks exercised the official GraphQL API and SQLite with local fixtures for GitHub metadata. The native bundles were built separately.
