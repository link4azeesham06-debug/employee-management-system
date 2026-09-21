# HR

**HR Management System**

A portfolio HR dashboard built with Next.js. It provides employee and department management, workforce reports, audit history, notifications, profiles, and role-based navigation for administrator and employee accounts.

## Features

- Administrator employee CRUD, searching, filtering, sorting, pagination, bulk actions, and CSV export
- Administrator department management, reports, audit logs, notifications, profile, and settings
- Employee leave requests with transactional administrator review, notification, and audit history
- Employee self-service view restricted to the authenticated employee record
- Role-protected administrator routes and permission-aware navigation
- Supabase authentication and PostgreSQL persistence for employees, departments, leave requests, audit logs, and notifications
- Row-level security for administrator and employee data access

## Roles

Administrators can access every application module and manage employee, department, and leave-review workflows. Employees can access Dashboard, Employees, Leave Management, Notifications, and Profile, with employee and leave data limited to their linked identity.

## Tech stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL
- Recharts

## Demo credentials

```text
Admin
Email: admin@hr.com
Password: admin123

Employee
Email: employee@hrpro.demo
Password: employee123
```

These credentials are intentionally public and are only for the portfolio demo.

## Local installation

```bash
npm install
```

Start the Next.js application:

```bash
npm run dev
```

The web application runs at `http://localhost:3000`.

## Production checks

```bash
npm run lint
npm run build
npm run start
```

`npm run start` serves the Next.js production build.

## Automated testing

Run the Vitest unit and component suite once:

```bash
npm run test:run
```

Use `npm test` or `npm run test:watch` during development. The focused suite covers validation, normalized errors, RBAC, utilities and report calculations, mocked service behavior, and selected form behavior.

## Continuous integration

Continuous integration (CI) automatically verifies changes pushed to `main` and pull requests targeting `main`. The GitHub Actions workflow installs the locked dependencies with `npm ci`, then runs linting, the Vitest suite, and the production build.

The build requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be configured as GitHub repository Actions variables. No private Supabase keys or user credentials are used by CI.

## Observability

Sentry provides optional production error monitoring for unexpected application, database, and network failures. Expected validation, authorization, authentication, not-found, and conflict outcomes are not reported as critical exceptions.

Set `NEXT_PUBLIC_SENTRY_DSN` for browser monitoring and `SENTRY_DSN` for server monitoring. Both DSNs are project configuration values. Reports intentionally exclude passwords, tokens, cookies, session objects, request bodies, authorization headers, query strings, and full user records.

Source-map upload is optional. Configure `SENTRY_ORG`, `SENTRY_PROJECT`, and the private deployment secret `SENTRY_AUTH_TOKEN` in Vercel only when source maps are required. Builds and CI remain functional without these values.

## Database setup

For a new Supabase project:

1. Apply the SQL files in `supabase/migrations/` in filename order.
2. Run `supabase/seed.sql` to add the five departments and thirteen fictional employees.
3. Create `admin@hr.com` and `employee@hrpro.demo` in Supabase Authentication using the Dashboard or a trusted server-side Admin API process. Passwords do not belong in SQL seed files.
4. Run `supabase/link_demo_profiles.sql`. It resolves the generated Auth UUIDs, creates the two profile rows, and links the employee profile to the seeded employee without hardcoded Auth IDs.
5. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, then run `npm install` and `npm run dev`.

The migration preserves the application-managed `updated_at` strategy: employee and department updates set the timestamp through their existing services. The baseline migration is intended for a fresh project; do not run it against the populated portfolio database where these tables already exist.

## Architecture

The App Router UI uses React contexts and route-local state, validates runtime input with Zod, and reaches Supabase through typed service modules. Supabase Auth provides sessions, while PostgreSQL constraints and RLS provide final data integrity and authorization. Leave decisions use a trusted database transaction so the status, employee notification, and audit event succeed or fail together.

Detailed documentation:

- [Architecture overview](docs/ARCHITECTURE.md)
- [Authentication and RBAC](docs/AUTH_AND_RBAC.md)
- [Database and ERD](docs/DATABASE.md)
- [Architecture decisions](docs/DECISIONS.md)

## Screenshots

Add portfolio screenshots here before publishing the repository showcase.

## Deployment

The application uses the standard Next.js build and can be deployed directly from GitHub to Vercel. No local API process, JSON server, or writable runtime filesystem is required.

Required Vercel environment variables:

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL used by the browser client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | RLS-restricted Supabase anon/publishable key |

Optional monitoring variables:

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Browser error reporting |
| `SENTRY_DSN` | Server-only | Server and Edge error reporting |
| `SENTRY_ORG` | Server/build-only | Sentry organization used for source-map upload |
| `SENTRY_PROJECT` | Server/build-only | Sentry project used for source-map upload |
| `SENTRY_AUTH_TOKEN` | Private secret | Optional source-map upload authorization |

Never add a Supabase service-role key to the browser application or to a `NEXT_PUBLIC_*` variable. The current application does not require a service-role key at runtime.

For the first deployment:

1. Commit and push the completed source, documentation, and SQL migrations to GitHub.
2. Import the repository in Vercel and keep the detected Next.js framework, `npm install`/`npm ci` dependency installation, `npm run build` build command, and default output settings.
3. Add the two required Supabase variables to the Vercel Production environment. Add them to Preview as well only if preview deployments should connect to this demo database.
4. Deploy, then set the Supabase Authentication **Site URL** to the final HTTPS Vercel domain. Password login does not currently require an OAuth callback route, but the production domain should also be added to the allowed redirect URLs before enabling email links or third-party OAuth.
5. Verify both demo roles, protected/admin-only routes, session refresh, leave review, notifications, and logout on the deployed URL.

Sentry remains disabled when its DSNs are absent, and source-map upload remains disabled unless all three source-map variables are configured. A missing `SENTRY_AUTH_TOKEN` does not block the build.

## Known demo limitations

- Authentication and business data use Supabase; authorization is enforced by database row-level security.
- Current employee and department mutation notifications are delivered to the administrator performing the action. Cross-user delivery would require a trusted server-side path if added later.
- Leave decisions, audit events, and employee notifications are committed together through a trusted database operation.
