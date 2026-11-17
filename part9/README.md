# Part 9 — TypeScript

| Exercises | App |
| --- | --- |
| 9.1–9.7 | [BMI and exercise calculators](calculators) with CLI and Express endpoints |
| 9.8–9.14 | [Patientor API](health-api) with Zod validation |
| 9.15–9.16 | [Course Information](course-info) with a discriminated union |
| 9.17–9.20 | [Flight Diary](flight-diary) with date and radio inputs |
| 9.21–9.30 | [Patientor](patientor) with patient details, diagnoses, and all three entry forms |

Run `npm ci` from this directory. Run `npm run build`, `npm run lint`, and `npm test` to check it.

Try the CLI with `npm run calculateBmi --workspace calculators -- 180 74` or `npm run calculateExercises --workspace calculators -- 2 1 0 2 3`. The calculator API runs on port 3003 with `npm run dev --workspace calculators`.

Start the sample-data API on port 3001 with `npm run dev --workspace health-api`. In another terminal run `npm run dev --workspace patientor` or `npm run dev --workspace flight-diary`. For the standalone Course Information app, use `npm run dev --workspace course-info`.

The sample-data API keeps its changes in memory until it restarts. Patient, diagnosis and diary fixtures are from [Helsinki’s course data](https://github.com/fullstack-hy2020/misc).
