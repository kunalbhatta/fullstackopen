# Part 11 — Continuous integration

- [Pokedex exercise and discussion](pokedex/exercise1.md)
- [Pokedex CI/CD](../.github/workflows/part11-pokedex.yml)
- [Scheduled health check](../.github/workflows/part11-pokedex-health.yml)
- [Blog List CI/CD](../.github/workflows/part11-bloglist.yml)

The Pokedex is based on [Helsinki’s starter](https://github.com/fullstack-hy2020/full-stack-open-pokedex/tree/b2c23a880051a016e8a27582e1d7507911e72456). Its baseline lint checks reported missing Node globals and a debug log. The starter test also reproduced a Next link that navigated to the previous Pokémon. The source fixes keep the starter tests intact.

In `part11/pokedex`, run `npm ci`, `npm run eslint`, `npm run build`, and `npm test -- --runInBand`. Then install Chromium with `npx playwright install chromium` and run `npm run test:e2e`.

## Hosted exercises

For the Pokedex on Render, set the root directory to `part11/pokedex`, use `npm ci && npm run build` to build and `npm run start-prod` to start. Use `/health` for the health check. Disable Render auto-deploy when testing the GitHub deployment hook. The separate Blog List service can use the repo root, build with `npm --prefix part7/bloglist ci && npm --prefix part7/bloglist run build`, and start with `npm --prefix part7/bloglist start`. Configure its MongoDB connection and JWT secret on the service.

On the repository you use to practice releases, configure GitHub Variables `POKEDEX_RELEASE_ENABLED` and `BLOGLIST_RELEASE_ENABLED` as `true` for the services you want to deploy. Store the deploy hooks as `POKEDEX_RENDER_DEPLOY_HOOK` and `BLOGLIST_RENDER_DEPLOY_HOOK` in GitHub Secrets. The scheduled check uses `POKEDEX_HEALTH_URL`, and notifications use `POKEDEX_DISCORD_WEBHOOK` for the channel you choose. PRs only run verification, and a commit message containing `#skip` skips deployment and tagging.

Practice branch protection in a dedicated repository. Require the verification check and an approving review before merge, including administrators for the second pipeline. Open a test pull request to see the protection apply. Render deploys, webhook delivery, and protection depend on your hosted services and repository settings.
