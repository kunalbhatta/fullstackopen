# Part 6 — State management

| App | Exercises | Where the state lives |
| --- | --- | --- |
| [Unicafe](unicafe) | 6.1 | Feedback counts live in a Zustand store. |
| [Anecdotes](anecdotes) | 6.2–6.15 | Zustand keeps the list, filter and notification. Fetch sends changes to JSON Server. |
| [Query Anecdotes](query-anecdotes) | 6.16–6.22 | TanStack Query caches the server data, and React Context manages notifications. |

Run `npm ci` and `npm run dev` inside an app. For either anecdotes app, also run `npm run server` from the same directory in another terminal. Both backends use port 3001.

Run `npm run build` and `npm run lint` in each app. The Zustand Anecdotes app also has `npm test`.

The app scaffolds, fixtures, and Query Anecdotes validation server came from [Helsinki’s state management starter](https://github.com/fullstack-hy2020/fs-statemanagement/tree/676919a2766f4dd52ecee027924ffe385f236bc8). The current exercise set uses Zustand. The course’s legacy Redux material is a separate variant.
