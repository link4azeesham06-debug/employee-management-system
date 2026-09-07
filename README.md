# HR Management System

A portfolio HR dashboard built with Next.js. It provides employee and department management, workforce reports, audit history, notifications, profiles, and role-based navigation for administrator and employee accounts.

## Features

- Administrator employee CRUD, searching, filtering, sorting, pagination, bulk actions, and CSV export
- Administrator department management, reports, audit logs, notifications, profile, and settings
- Employee self-service view restricted to the authenticated employee record
- Role-protected administrator routes and permission-aware navigation
- Supabase authentication and PostgreSQL persistence for employees, departments, audit logs, and notifications
- Row-level security for administrator and employee data access

## Roles

Administrators can access every application module and manage employee and department records. Employees can access Dashboard, Employees, Notifications, and Profile, with the Employees view limited to their own record.

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

## Architecture

- `app/` contains App Router pages.
- `components/` contains shared layout and feature UI.
- `context/` contains authentication, employee, department, notification, and audit state.
- `services/` contains data-access and persistence adapters.
- `hooks/`, `types/`, and `utils/` contain shared application logic.

## Screenshots

Add portfolio screenshots here before publishing the repository showcase.

## Deployment

The application can be deployed to Vercel with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured for the production project.

## Known demo limitations

- Authentication and business data use Supabase; authorization is enforced by database row-level security.
- Current employee and department mutation notifications are delivered to the administrator performing the action. Cross-user delivery would require a trusted server-side path if added later.
