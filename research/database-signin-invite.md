# Database, Google sign-in and the invite gate with the fewest vendors

Research for ticket #5. Checked on 2026-11-27 against the vendors' own documentation. Nothing was installed, created or changed in any account: this is reading only, so the setup still needs a short hands-on test before it is trusted.

## The answer

**Use Neon for both the database and the sign-in, installed from the Vercel Marketplace.**

Neon is no longer only a database. It now ships a sign-in service of its own, which Neon calls "Managed Better Auth" (it was called "Neon Auth" until recently). So one vendor covers the database and Google sign-in, and that vendor is reached and paid through Vercel: no separate Neon login, no separate Neon bill.

The invite gate and the usage count are not bought from anyone. They are two small tables in that same database, with a small admin page inside ValueIt.

### What this means for ValueIt

- **Vendors added: one.** Neon, on the Vercel invoice. A free Google Cloud project is also needed, but every option needs that, because Google will only show "Sign in with Google" under ValueIt's name to an app registered with Google.
- **Secrets set by hand: two.** One random secret in Vercel, and the Google client ID and secret pasted into Neon. Two settings go with them: one address pasted into Google, and ValueIt's own web address added to Neon's trusted list. Every database key is set by the integration.
- **Sign-in:** a Student clicks "Sign in with Google". Neon's service checks with Google and tells ValueIt who the person is. Neon runs and upgrades that service; a fault in it is Neon's to fix.
- **The gate:** signing in does not let anyone in. ValueIt looks the person up in its own table. If the owner has not approved them, they see a "waiting for approval" page and nothing else. The admin page lists people with two buttons: approve, remove.
- **Usage count:** a table in the same database, for example one row per Student per day. ValueIt adds to it after every AI call and checks it before the next one.
- **It narrows the choice of base app.** Neon's sign-in supports Next.js and a few React setups today, and nothing else.
- **Cost at invite-only scale:** nothing on Neon's free plan, or a few dollars a month on its pay-as-you-go plan. About $19 a month if the database is kept awake all the time (see "Speed" below).
- **If the project moves to another Vercel team:** Neon says the database and its keys move with it. That is the failure the earlier attempts kept hitting.

### The options in plain words

| Option | What it is | Vendors added | Verdict |
|---|---|---|---|
| **Neon + Neon's sign-in** | Database and sign-in from one vendor, through Vercel | 1 | **Recommended** |
| Supabase | Database and sign-in from one vendor, through Vercel | 1 | Not simpler. Free plan stops the project after a quiet week; every table is public unless locked by hand |
| Neon + Clerk | Clerk is a separate sign-in vendor | 2 | Best ready-made approval screen, but one more vendor, and its live keys are tied to a domain. This is the setup that broke before |
| Neon + Better Auth run by us | Sign-in is code inside ValueIt | 1 | All keys in one place, but a sign-in fault is ours to fix. Keep as the fallback |
| Neon + Auth.js | Older sign-in code library | 1 | Its own maintainers now tell new projects to use Better Auth |
| Vercel's own | Sign in with Vercel, Passport | 0 | Neither fits: one needs every Student to have a Vercel account, the other is Enterprise-only and meant for staff |

### What the owner clicks through by hand

1. **Vercel, about 5 minutes.** Marketplace, Neon, Install, "Create New Neon Account". Choose a region (it cannot be changed later), leave "Auth" switched on, choose a plan, connect it to the ValueIt project. An agent can do most of this from the command line.
2. **Google Cloud, about 15 minutes, once.** Create a project, fill in the app name and a support email, create a "Web application" sign-in client, paste in one address that Neon shows, copy the client ID and secret, and press "Publish app". Every option needs these same steps. I found no documented way for an agent to do it without a browser.
3. **Neon, about 5 minutes.** Open Neon from inside Vercel (no separate login). Paste the Google client ID and secret. Add ValueIt's web address to the list of trusted addresses. After signing in once, mark yourself as admin.
4. **One secret in Vercel.** A random string named `NEON_AUTH_COOKIE_SECRET`. An agent can generate and set it.

### Every key and account, and where each lives

**Accounts**

| Account | Who signs in | What it holds |
|---|---|---|
| Vercel team (Pro) | The owner | The ValueIt project, all the app's keys, the Neon integration, the Neon bill |
| Neon | Nobody separately. Created by the integration, opened with "Open in Neon" from Vercel | The database, the sign-in service and its settings, the Google client ID and secret, the list of people who have signed in |
| Google Cloud project | The owner's Google account | The sign-in client (ID and secret), the app name shown to Students, the list of allowed return addresses |
| GitHub | The owner | The code. A Neon key only if the optional branch clean-up below is adopted |
| OpenAI | The owner | Covered by its own ticket |

**Keys**

| Key | Made by | Lives in | Set by hand? |
|---|---|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`, `NEON_PROJECT_ID` | Neon integration | Vercel project settings | No |
| `NEON_AUTH_BASE_URL` (the address of the sign-in service) | Neon integration | Vercel project settings; each preview gets its own | No |
| `NEON_AUTH_COOKIE_SECRET` (signs the Student's session cookie) | Generated once, any random 32+ characters | Vercel project settings | **Yes** |
| Google client ID and client secret | Google Cloud | Pasted into Neon's sign-in settings. Not in Vercel, not in the code | **Yes** |
| Return address for Google (`<sign-in address>/callback/google`) | Shown by Neon | Pasted into the Google Cloud client | **Yes**, once per long-lived database branch |
| Trusted addresses (ValueIt's own web address) | The owner or an agent | Neon's sign-in settings | **Yes** |
| Neon API key | Neon | Only where needed: an agent's own settings, or a GitHub secret | Optional. Start without it |

Two more entries, `VITE_NEON_AUTH_URL` and the old-style `POSTGRES_*` names, are also set by the integration and can be ignored.

### What tends to go wrong with Neon, honestly

These are the ways a solo owner who does not read code gets stuck. Each is taken from Neon's or Vercel's own pages, or from a dated user report.

1. **Three ways to connect Neon to Vercel, and the two automatic ones cannot be mixed.** One is run through Vercel (the one recommended here). The others keep a separate Neon account, login and bill, and the manual one also means hand-copied keys, which is how the earlier attempts broke. If an old Neon account exists under the same email, the new database appears in a second organisation named "Vercel: (team)", and it is easy to look in the wrong one.
2. **Keys that local tools cannot read.** By default the integration marks the keys "Sensitive" and gives them to live and preview builds only. An agent working on its own machine then finds no database key, and the tempting fix is to copy one by hand into a file. That copying is what goes stale. It has to be decided once, at connect time, where agents get a database to develop against.
3. **Preview copies pile up.** Every code branch gets its own copy of the database. Neon only deletes a copy when Vercel deletes the preview, which by default is six months later, and for a small project possibly never. Ten branches are included per project, counting the main one. On the free plan the next one fails. One user reported in November 2026 that after hitting the limit every preview build failed until they re-saved the Neon connection in Vercel. Agents open many branches, so this will happen without a clean-up routine.
4. **The database goes to sleep.** After five minutes with no visitors it switches off, and the next visitor waits while it wakes. On the free plan this cannot be turned off. With a handful of Students it will usually be asleep when one arrives.
5. **The free plan can run out.** When the month's free compute is used up, the database stays off until the next month or until the plan is upgraded. Preview copies spend from the same allowance.
6. **Two buttons delete everything.** Uninstalling the Neon integration from Vercel deletes the databases with it. Deleting the database in Vercel deletes it in Neon, with seven days to recover it.
7. **`neon login` does not work** for a Neon account that Vercel created. Neon's command-line tool then needs an API key. An agent told to "log in to Neon" gets stuck here, and the key is one more secret in one more place.
8. **Two database addresses.** One for the running app, one for changing the table layout. Using the wrong one for the wrong job fails in confusing ways.
9. **The names keep changing.** The sign-in service was "Neon Auth" built on one product, was rebuilt on another, and is now "Managed Better Auth"; its code package was renamed too. The database itself is now labelled "Lakebase Postgres" after Neon's owner, Databricks. An agent working from memory writes the old names. Agents must read today's Neon documentation first.
10. **Outages happen.** Neon reported one in May 2026 that hit about 13% of databases in one US region. The free plan comes with community help only.

### Is Supabase simpler?

No. Supabase used to be the one vendor that bundled a database with sign-in. Neon now does the same, so the count is level. Supabase then loses on three points that matter for this owner:

- **Its free plan stops the whole project after about a week of low activity**, and someone must press "Resume" in its dashboard. An invite-only Course with a few Students will go quiet for a week. Avoiding that costs from $25 a month. Neon sleeps too, but wakes by itself.
- **Every table is reachable from the public internet unless it is locked**, and tables created by code (the way agents create them) are not locked automatically. An owner who cannot read the code cannot see that a lock is missing. Neon has the same kind of public door, but it is switched off unless someone turns it on.
- **The Google Cloud steps and the preview problem are the same.**

In Supabase's favour: its database is always awake, so there is no wake-up wait, and agents know it well.

### Preview deployments

- **Database: yes, with no hand setup.** Tick one box when connecting, and every code branch gets its own copy of the database with its own keys.
- **Sign-in: not without one arrangement.** Each copy of the database gets its own sign-in address. Google only returns people to addresses listed one by one in Google Cloud, and does not accept patterns. So with ValueIt's own Google client, Google sign-in on a fresh preview fails until someone adds that preview's address in Google Cloud by hand.

Three ways through. This needs a short test, not more reading:

- **A. Previews share the live database.** One address in Google and one trusted-address entry that covers preview addresses, nothing per preview. But a preview then reads and changes real Student data. Fine while there are no real Students.
- **B. Previews use Neon's shared Google client.** Neon lends a ready-made Google client for testing that needs no Google Cloud setup. If the live database is kept as its own branch with ValueIt's Google client, and previews are copied from a second branch that still uses Neon's shared one, previews should sign in with Google with no hand steps. Neon's pages support each piece of this; I could not confirm the whole chain.
- **C. Previews skip sign-in.** Vercel can lock preview addresses to the owner's own Vercel login, and recommends doing so. Behind that lock, a preview could show the Lesson as a fixed test Student.

I would run A during the build and test B before the first real Student.

### Speed

- **Sign-in checks are quick.** After the first check, who the Student is travels in a signed cookie for five minutes, so most page loads do not call the sign-in service.
- **The gate check needs the database**, so the first page after a quiet spell waits for the database to wake. Neon says a few hundred milliseconds in normal conditions.
- **Two ways to remove the wait:** move to Neon's pay-as-you-go plan and keep the database awake (about $19 a month, my arithmetic), or build the Lesson page so that it does not wait on the database.

### The fallback

If the hands-on test shows Neon's sign-in cannot do something ValueIt needs, the fallback is the same sign-in software, Better Auth, run inside ValueIt instead of by Neon. Neon says both use the same Better Auth calls, so I expect the change to be contained, though I did not test it. The price is that sign-in becomes ValueIt's own code to keep working. Vercel bought Better Auth in July 2026 and says it stays open source.

---

## Evidence

Each claim links to the page it came from. "Updated" is the date printed on that page.

### Neon and its Vercel integration

- There are three ways to connect: Vercel-Managed, Neon-Managed and manual. Vercel-Managed creates the Neon account through Vercel and bills through Vercel. Both managed kinds create a database branch per preview and support the sign-in service. [Neon: Integrating Neon with Vercel](https://neon.com/docs/guides/vercel-overview) (updated 2026-11-18)
- Installing creates a Neon account and project, or for an existing Neon user adds an organisation named `Vercel: <team-name>`. "Auth" is on by default in the install screen. [Neon: Vercel-Managed integration](https://neon.com/docs/guides/vercel-managed-integration) (updated 2026-11-18)
- Variables set by the integration: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PGHOST`, `PGHOST_UNPOOLED`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`, legacy `POSTGRES_*`, `NEON_PROJECT_ID`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`. Same page.
- When connecting, Production and Preview are ticked by default, Development is not, and "Sensitive" is on by default, which means the values "can't be read back from the Vercel dashboard or CLI". Same page.
- Vercel's rule: "Integration connections that include Development cannot enable Sensitive." [Vercel: Config and Secret environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables)
- Preview branching: a branch `preview/<git-branch>` per Git branch, with connection values injected at deploy time and not visible in project settings. If the sign-in service is on for production, it is provisioned on preview branches too and each preview receives its own `NEON_AUTH_BASE_URL`. Same Neon page.
- The production branch can be a different branch from the default branch, and "Preview branches are always created from the default branch." Same page.
- Moving a Vercel project to another team moves the linked Neon project, and "Environment variables and settings transfer with it." Same page.
- Uninstalling the integration "deletes the `Vercel: <team-name>` organization in Neon, including every project and all of its data." A deleted database can be recovered for 7 days. Same page.
- "`neon login` command won't work since the account is Vercel-managed"; the CLI needs an API key. Same page, Limitations.
- Plan, compute size and scale-to-zero for a Vercel-managed database are changed only in the Vercel dashboard. Same page.
- The integration can be installed from the command line: `vercel install neon`, which "installs the integration, connects it to the linked project, and pulls credentials into .env.local". [Vercel: Storage](https://vercel.com/docs/storage), [Vercel CLI: integration](https://vercel.com/docs/cli/integration)
- Vercel integration users have had Neon's current Free, Launch and Scale plans since November 2025. [Neon changelog 2025-11-07](https://neon.com/docs/changelog/2025-11-07)

### Neon plans, sleeping and limits

- Free: $0, 100 compute-hours per project per month, 1 GB storage per project, 10 branches per project, sleeps after 5 minutes and this cannot be disabled, sign-in service up to 60,000 monthly users. Launch: pay for use with no monthly minimum, $0.106 per compute-hour, $0.35 per GB-month, 10 branches included then $1.50 per branch-month, sleep can be disabled, sign-in up to 1 million monthly users. Invoices under $0.50 are not collected. [Neon plans](https://neon.com/docs/introduction/plans) (updated 2026-11-24)
- On Free, when compute-hours run out "your compute is suspended until the next billing period or until you upgrade"; branch creation fails at 10 branches. Same page.
- Keeping the smallest compute (0.25 units) awake all month: 0.25 × about 730 hours × $0.106 = about $19. This is my arithmetic from the published rate, not a Neon figure.
- Neon's own light-use example on Launch (10 compute-hours, 3 GB) comes to $2.31 a month. [Neon plans](https://neon.com/docs/introduction/plans)
- Waking from sleep "takes a few hundred milliseconds under normal conditions". [Neon: Compute lifecycle](https://neon.com/docs/introduction/compute-lifecycle)
- Preview branch clean-up follows Vercel's deployment retention, 180 days for previews on Pro, and "a project with fewer than about 20 preview deployments may never auto-delete any preview branch". The reliable fix Neon gives is a GitHub Action that needs a Neon API key stored as a GitHub secret. [Neon: Managing Vercel preview branch cleanup](https://neon.com/docs/guides/vercel-branch-cleanup) (updated 2026-11-18)
- User report, 2026-11-10: after a project hit its branch limit, every preview build failed with "Resource provisioning timed out" until the Neon connection was re-saved in Vercel. This is one user's account, not a vendor statement. [Vercel Community thread](https://community.vercel.com/t/ercel-managed-neon-integration-preview-provisioning-times-out-after-branch-creation-succeeds/1000000165)
- The app should use the pooled address and schema changes the direct one. [Neon: Connection pooling](https://neon.com/docs/connect/connection-pooling), [Neon: Drizzle guide](https://neon.com/docs/guides/drizzle)
- A project's region cannot be changed after it is created. [Neon: Regions](https://neon.com/docs/introduction/regions)
- Neon's public REST door onto the database (the Data API) has to be switched on. [Neon: Data API get started](https://neon.com/docs/data-api/get-started)
- Neon's own account of a May 8, 2026 incident in one AWS region, affecting about 13% of databases there, with monthly availability figures for 2026. [Neon blog, 2026-05-27](https://neon.com/blog/resilience-to-failures-in-agentic-era)
- Support by plan: Free community, Launch billing only, Scale standard. Uptime agreement on Scale only. [Neon plans](https://neon.com/docs/introduction/plans)
- The database is now described as "Lakebase Postgres", available on Neon and on Databricks. [Neon and Lakebase](https://neon.com/docs/introduction/neon-and-lakebase)

### Neon's sign-in service (Managed Better Auth)

- It is a managed service built on Better Auth, running Better Auth 1.7.12, storing users and sessions in the `neon_auth` schema of the project's own database. Included in every plan. AWS regions only. The older Neon Auth built on Stack Auth is called legacy, and the code package moved from `@neondatabase/auth` to `@neon/auth`, with migration guides for both changes. [Neon: About Managed Better Auth](https://neon.com/docs/auth/about) (updated 2026-11-26)
- Neon's comparison with running Better Auth yourself: Neon runs and upgrades the server and its tables; the self-run version needs "a secret, a base URL, and a database connection" in the app and supports any plugin, where the managed one supports a subset. Same page.
- Supported today: Next.js, Vite + React, React Router, TanStack Router. A separate frontend and backend is "not yet supported". Supported plugins include Admin; multi-factor sign-in is "coming soon". [Neon: Managed Better Auth roadmap](https://neon.com/docs/auth/roadmap) (updated 2026-11-09)
- Google works at once with shared credentials that Neon owns, meant for development and testing: "Google shows them Neon's name and logo, not your app's". For production, add your own Google client ID and secret. [Neon: Set up OAuth](https://neon.com/docs/auth/guides/setup-oauth) (updated 2026-11-13)
- The address to register with Google is `{NEON_AUTH_BASE_URL}/callback/google`, on a Neon host, not on the app's address. "Each branch has its own `NEON_AUTH_BASE_URL`. Register `{NEON_AUTH_BASE_URL}/callback/google` ... for every branch you test against". Same page.
- With your own Google client, Google's screen says "Continue to" followed by the host of that address, "typically the Neon-managed host". Same page, Google OAuth branding.
- The Google ID and secret are entered in the Neon console under the branch's Settings, Auth, OAuth providers, or by CLI, API or Neon's MCP tools. Same page.
- A new branch gets a copy of the parent's users, configuration and "OAuth providers (same credentials)", and a unique sign-in address. [Neon: Branching authentication](https://neon.com/docs/auth/branching-authentication) (updated 2026-09-16)
- The service only returns people to trusted addresses. Localhost is trusted by default. A wildcard entry is supported for preview hosts, with the one example `https://*.my-app-preview.vercel.app`. [Neon: Configure trusted domains](https://neon.com/docs/auth/guides/configure-domains) (updated 2026-11-10)
- Before launch: add trusted domains, set the app name, use your own Google credentials, turn off "Allow Localhost". [Neon: Auth production checklist](https://neon.com/docs/auth/production-checklist) (updated 2026-11-09)
- The Next.js package needs two variables: `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` (32+ characters, generated with `openssl rand -base64 32`). The integration sets only the first. Session data is cached in a signed cookie, 5 minutes by default, which Neon says cuts calls to the sign-in server "by 95-99%". [Neon: Next.js Server SDK](https://neon.com/docs/auth/reference/nextjs-server) (updated 2026-10-09)
- Admin functions: list users, set role, ban and unban, revoke sessions. A user is made admin in the Neon console under Auth, Users, "Make admin". [Neon: Admin plugin](https://neon.com/docs/auth/guides/plugins/admin) (updated 2026-10-09)
- A blocking `user.before_create` webhook can refuse a sign-up before the account is written. It fails closed: "If your webhook endpoint is unreachable, all signups fail." It must be a public HTTPS address, and there are no test events, logs or redelivery. [Neon: Webhooks](https://neon.com/docs/auth/guides/webhooks) (updated 2026-11-26)
- Email-and-password sign-in has its own settings endpoint, separate from Google. [Neon: Manage Auth via the API](https://neon.com/docs/auth/guides/manage-auth-api) (updated 2026-11-27)
- Common failures listed by Neon: missing cookie secret; `redirect_uri_mismatch` when the app points at one branch's sign-in address while Google lists another's; Google app still in "Testing". [Neon: Auth troubleshooting](https://neon.com/docs/auth/troubleshooting) (updated 2026-11-26)

### Why the gate should be ValueIt's own table

This is my reasoning from the facts above, not a vendor recommendation.

- The webhook route fails closed, must be publicly reachable, and has no test tooling. When Vercel's recommended protection is on, an outside service cannot reach preview addresses without a bypass (see Vercel's own offerings below). An in-app check has none of those moving parts.
- An in-app check holds even if another sign-in method is left switched on by mistake.
- The session cookie is cached for 5 minutes, so removing a Student at the sign-in level may not bite at once. A check against ValueIt's own table on each request does.
- The usage count needs a table in the same database anyway.

### Google Cloud, needed by every option

- An app in "Testing" is limited to 100 listed test users, with one exception: "If the app only requests basic identity scopes (`openid`, `email`, `profile`), any user can access without being on the allowlist." A published but unverified app is open to any Google user, but "the app's name and logo are not displayed on the consent screen" until brand verification. [Google: OAuth app state overview](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) (updated 2026-05-22)
- Apps that use only non-sensitive scopes do not have to complete verification; showing a name and logo needs the lighter "brand verification". [Google: OAuth App Verification](https://support.google.com/cloud/answer/13463073)
- In "Testing", a test user's authorisation expires after seven days. [Google: Manage App Audience](https://support.google.com/cloud/answer/15549945)
- Return addresses must use HTTPS (localhost excepted) and cannot contain wildcard characters. [Google: Redirect URI validation rules](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation) (updated 2026-11-19)

### Vercel's own offerings

- **Passport** puts a sign-in wall from your own identity provider in front of deployments. "Passport is available as an Enterprise feature." [Vercel: Passport](https://vercel.com/docs/passport) (updated 2026-09-21), [changelog 2026-07-31](https://vercel.com/changelog/vercel-passport-generally-available)
- **Sign in with Vercel** "lets people use their Vercel account to log in"; users "must have a Vercel account". [Vercel: Sign in with Vercel](https://vercel.com/docs/sign-in-with-vercel)
- **Vercel Authentication** limits protected addresses to Vercel team and project members and people granted access. "Standard Protection" protects every address except production domains and is "the recommended option for most projects". "Deployment Protection requires authentication for all requests". I did not confirm whether it is switched on by default for a new project. [Vercel: Deployment Protection](https://vercel.com/docs/deployment-protection) (updated 2026-09-15), [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- **Vercel Connect** stores credentials for outside services and hands out tokens, billed on Pro at "$3.00 per 1,000 token requests". It is not a sign-in system by itself. [Vercel: Connect](https://vercel.com/docs/connect)
- **Better Auth** joined Vercel on July 7, 2026 and stays an open-source library. I found no hosted sign-in product from Vercel built on it. [Better Auth: joining Vercel](https://better-auth.com/blog/better-auth-joins-vercel)
- Sign-in products on the Vercel Marketplace as native integrations: Clerk, Supabase, Neon, Auth0, Descope. [Vercel Marketplace: Authentication](https://vercel.com/marketplace/category/authentication)

### Clerk

- Free "Hobby" plan covers 50,000 monthly retained users per app; Pro is $25 a month. "Waitlist mode" is listed as included in every plan. [Clerk pricing](https://clerk.com/pricing)
- Three access modes: Open, Invite-only, Waitlist. In Waitlist mode people ask to join and the owner approves them in Clerk's dashboard. The separate "Allowlist" feature "requires a paid plan for production use". [Clerk: Restricting access](https://clerk.com/docs/guides/secure/restricting-access)
- The Marketplace integration syncs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, mapping Clerk's development instance to Vercel's development and preview environments and its production instance to production. [Clerk: Vercel Marketplace](https://clerk.com/docs/guides/development/integrations/platforms/vercel-marketplace)
- Going live needs a domain you own, DNS records on it, and your own Google credentials; "you cannot use a `*.vercel.app` domain for production". [Clerk: Deploy to production](https://clerk.com/docs/guides/development/deployment/production), [Clerk: Deploying to Vercel](https://clerk.com/docs/guides/development/deployment/vercel) (updated 2026-11-12)
- In development Clerk supplies shared Google credentials with nothing to set up; production needs custom ones. [Clerk: Google](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google)
- "It is currently not possible to use Clerk production API keys with your host's provided preview domain." Development instances are capped at 100 users. [Clerk: Instances and environments](https://clerk.com/docs/guides/development/managing-environments)

### Better Auth run by us

- Google is configured in code with a client ID and secret; the return address is on the app itself, `/api/auth/callback/google` by default. [Better Auth: OAuth](https://better-auth.com/docs/concepts/oauth)
- Refusing people who are not allowed: `user.validateUserInfo`, or a `databaseHooks.user.create.before` hook. [Better Auth: OAuth](https://better-auth.com/docs/concepts/oauth), [Better Auth: Database](https://better-auth.com/docs/concepts/database)
- Admin plugin: ban, unban, roles, list users. [Better Auth: Admin](https://better-auth.com/docs/plugins/admin)
- Previews: the OAuth Proxy plugin lets previews reuse the production return address. It needs one shared secret on every environment and the same Better Auth version on all of them. [Better Auth: OAuth Proxy](https://better-auth.com/docs/plugins/oauth-proxy). A GitHub issue reports it failing on Vercel previews; I did not check whether it is fixed. [better-auth issue 4953](https://github.com/better-auth/better-auth/issues/4953)

### Auth.js

- "The Auth.js project is now part of Better Auth", and "if you're starting a new project ... we strongly recommend using Better Auth." Security fixes continue. [Auth.js: Migrating to Better Auth](https://authjs.dev/getting-started/migrate-to-better-auth), [Better Auth: Auth.js joins](https://better-auth.com/blog/authjs-joins-better-auth) (2025-09-22)
- Previews need a stable deployment acting as a go-between, with the same secret everywhere. [Auth.js: Deployment](https://authjs.dev/getting-started/deployment)

### Supabase

- The Marketplace integration bills through Vercel, signs you in to Supabase with your Vercel account, and syncs 13 variables including `SUPABASE_SECRET_KEY` and `SUPABASE_JWT_SECRET`. [Supabase: Vercel Marketplace](https://supabase.com/docs/guides/integrations/vercel-marketplace)
- Free: 50,000 monthly users, and "Free projects are paused after 1 week of inactivity." Pro from $25 a month, not paused. [Supabase pricing](https://supabase.com/pricing)
- A paused project is restored by pressing "Resume project" in the dashboard. Upgrading is the way to prevent it. [Supabase: Project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- "A table in the `public` schema is reachable through the Data API. Until you enable row level security and write a policy, anyone holding your project's publishable key can read and write every row in it." The dashboard's table editor turns the lock on; "When you create a table with SQL, enable it yourself." [Supabase: Tables](https://supabase.com/docs/guides/database/tables)
- Google needs the same Google Cloud steps, with the return address on the Supabase project. [Supabase: Sign in with Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- Previews: add a wildcard for Vercel preview addresses to the redirect allow-list. A database copy per preview needs Supabase Branching, which is on Pro and above. [Supabase: Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Supabase: Preview branches on Vercel](https://supabase.com/docs/guides/integrations/vercel-preview-branches) (2026-10-30), [Supabase pricing](https://supabase.com/pricing)
- A "Before User Created" hook can refuse a sign-up. [Supabase: Before User Created hook](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)

### Side by side

| | Sign-in vendors added on top of the database | Google Cloud by hand | Other hand setup | The gate | Cost here | Previews | For AI agents |
|---|---|---|---|---|---|---|---|
| **Neon's sign-in** | 0 | None for testing. For launch: one client, paste into Neon | One cookie secret; trusted addresses | Own table (recommended), or blocking webhook; admin functions built in | $0 | Database automatic; Google needs an arrangement | Neon MCP tools, CLI and skills; names changed often |
| Clerk | 1 | None for testing. For launch: one client, paste into Clerk | Own domain and DNS records | Built-in waitlist with approval in Clerk's dashboard | $0 | Works by itself on a separate test user pool | Very well known; MCP and CLI |
| Better Auth, self-run | 0 | Always one client; keys into Vercel | Three or four secrets in Vercel; sign-in tables | Code hook; admin plugin | $0 | Proxy plugin, one shared secret | Well documented; agents own all the code |
| Auth.js | 0 | Same as Better Auth | Same | Code | $0 | Go-between deployment | Widely known, but in maintenance |
| Supabase Auth | 0, but Supabase replaces Neon | One client, paste into Supabase | Table locks on every table | Hook or own table | $0 with pausing, else $25 a month | Wildcard allow-list; copies per preview on paid plan | Very well known; table locks are a trap |
| Vercel Passport | 0 | n/a | Enterprise plan | n/a | Enterprise only | n/a | n/a |

---

## Open questions and what I could not confirm

Nothing here was run. These are the points where the documentation stops.

1. **Preview sign-in.** That a preview branch copied from a branch on Neon's shared Google client signs in with Google with no hand steps (arrangement B). Each piece is documented; the chain is my inference.
2. **The wildcard for preview addresses.** Neon shows one example pattern. Vercel's preview addresses have the form `project-git-branch-team.vercel.app`, a single label. I could not confirm whether Neon accepts a pattern inside a label. A pattern as wide as `*.vercel.app` would trust every site on Vercel and should not be used.
3. **Where agents develop.** Whether the "Development" environment in the Vercel-managed integration points at the live database (my reading), and so where a coding agent gets a safe database of its own.
4. **Neon's agent tools with a Vercel-created account.** The docs say the CLI needs an API key. I could not confirm how Neon's MCP server signs in to such an account.
5. **The admin role in the app.** That the role set by "Make admin" is readable from the session in Neon's Next.js package. If not, an `is_admin` column in ValueIt's own table does the same job.
6. **After a move between Vercel teams.** That the sign-in address stays the same, so the address registered with Google keeps working.
7. **What Students see on Google's screen.** With the return address on a Neon host, whether Google's brand verification can be completed so that "ValueIt" shows instead of a Neon host name.
8. **Free or pay-as-you-go.** How long the wake-up wait really is for a Student, measured, and so whether the database should be kept awake.
9. **Smaller gaps:** whether Clerk's Invite-only mode is free in production (Waitlist is); which Supabase plans include the Before User Created hook; whether a Google sign-in client can be created without a browser; the price of Vercel's custom preview address feature on Pro.

## How this was researched

Neon's documentation search, Vercel's documentation search, Context7 (Better Auth, Clerk, Supabase), and web search and page reads through Parallel, Octen and Firecrawl. Tavily was not connected as a tool in this session; its command-line client was used for one search. Parallel refused one page read with a rate limit, and that page was read through Firecrawl instead. No account was read or changed.
