# Working on ValueIt

Use the Node version in `.node-version` and the pnpm version in `package.json`.
On a fresh checkout, run `pnpm install --frozen-lockfile` and `pnpm exec playwright install chromium`.
`pnpm dev` starts the app. `pnpm check` runs the same checks as CI, including a browser test against a production build.

- Keep the UI and server code in one Next.js App Router app. Call OpenAI from the server with its official `openai` SDK and the Responses API (`store: false`). Keep Vercel's AI SDK and AI Gateway out of this path. [App decision](docs/adr/0001-one-nextjs-app-no-separate-backend.md)
- Pin exact package versions and commit the pnpm lockfile. Keep the A2UI React renderer, web core, agent and Zod 3 pins together. [A2UI decision](docs/adr/0003-widgets-built-live-with-official-a2ui.md)
- Define tables in `src/db/schema.ts`. Run `pnpm db:generate` and commit Drizzle Kit's generated SQL and metadata. Apply generated migrations with `pnpm db:migrate` using the environment's pooled Neon `DATABASE_URL`.
- Keep keys in Vercel project settings. Use the test copy for local work and CI. The scaffold checks run without credentials.
