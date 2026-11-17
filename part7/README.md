# Part 7 — Full Stack Open extension

- [Routed Anecdotes](routed-anecdotes) covers 7.1–7.6. The field hook keeps DOM props separate from its reset function. Components subscribe to the shared anecdotes context and call its load, create, and delete operations.
- [Blog List](bloglist#readme) covers 7.7–7.20. This solution uses the Zustand option for 7.11–7.14. It includes a routed user directory, anonymous comments, an error boundary, and a production build served by Express.

For Routed Anecdotes, run `npm ci`, then `npm run server` and `npm run dev` in separate terminals from its directory.

The Routed Anecdotes starter and verification suites came from [Helsinki’s Full Stack Open extension repository](https://github.com/fullstack-hy2020/fs-extension/tree/9684b8e1a260fffa7de96326041341916d945375).
