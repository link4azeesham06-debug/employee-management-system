# Architecture Overview

## System shape

HR is a Next.js App Router application backed directly by Supabase Auth and PostgreSQL. It does not contain a separate custom API server.

## Brand identity

The product brand is **HR**, and its category descriptor is **HR Management System**. A shared geometric H/R monogram and wordmark are reused across public, login, and authenticated surfaces. Indigo and slate provide a calm, trustworthy core; the UI retains the existing system-native sans-serif stack for readable controls, tables, and numeric data. A connected modular grid is the single decorative motif, used sparingly behind high-level brand moments. Product-interface panels, restrained transparency, perspective, and soft shadows provide depth without a separate 3D rendering library.

The semantic brand tokens are defined in `app/globals.css`: primary `#4F46E5`, primary hover `#4338CA`, primary soft `#EEF2FF`, surface `#FFFFFF`, subtle surface `#F8FAFC`, primary text `#0F172A`, secondary text `#64748B`, border `#E2E8F0`, success `#059669`, warning `#D97706`, and danger `#DC2626`. Components should use these roles consistently instead of introducing page-specific brand colors.

```text
Next.js pages and components
            ↓
React contexts, hooks, and route-local state
            ↓
Zod validation and service functions
            ↓
Supabase browser client
            ↓
Supabase Auth + PostgreSQL constraints/RLS
```

The browser handles presentation and interaction. Services translate frontend models to database rows and normalize failures. PostgreSQL constraints and row-level security (RLS) remain the final data-integrity and authorization boundaries.

## Application layers

| Area | Responsibility |
| --- | --- |
| `app/` | App Router pages, layouts, route-level loading/error UI, and route protection composition |
| `components/` | Reusable forms, tables, charts, navigation, and feature UI |
| `context/` | Shared authenticated-session, employee, department, notification, and audit state |
| `hooks/` | Small typed accessors for contexts and derived permissions |
| `services/` | Supabase queries, row/domain mapping, service-boundary validation, and error normalization |
| `lib/validation/` | Zod schemas and normalized field-validation errors |
| `lib/errors/` | `AppError`, low-level error normalization, and centralized monitoring policy |
| `types/` | Frontend domain types |
| `utils/` | Pure filtering, sorting, statistics, export, permission, and leave-transition logic |
| `supabase/` | Reproducible schema, RLS, seed/linking SQL, and later feature migrations |
| `tests/` | Vitest unit and Testing Library component tests |

## Routing and application state

The public landing page is `/`, and `/login` is the authentication entry point. Authenticated workspace routes use `AppShell`, `Navbar`, and `Sidebar`.

- Shared state lives in providers mounted by `app/layout.tsx`: authentication, notifications, audit data, employees, and departments.
- `useAuth`, `useEmployees`, and `usePermissions` expose typed access to shared state.
- Leave Management keeps its request list and UI state in `/leave` because that state is currently needed only by that route.
- Services remain the persistence boundary; components do not embed raw database row mapping.

## Security model

Security is layered:

1. `ProtectedRoute`, `RoleGuard`, sidebar visibility, and permission checks prevent confusing or inappropriate UI access.
2. Services derive identity from the authenticated Supabase session instead of trusting user-entered ownership IDs.
3. PostgreSQL RLS controls which rows an authenticated user may read or mutate.
4. Database constraints enforce relationships, uniqueness, allowed statuses, and valid state combinations.
5. The leave-review RPC performs its own admin check even though it is `SECURITY DEFINER`.

Client-side checks improve the user experience; they are not the backend security boundary. See [Authentication and RBAC](./AUTH_AND_RBAC.md).

## Validation and data integrity

```text
Form feedback → Zod schema → service operation → PostgreSQL constraints
```

Forms provide fast feedback. The same Zod schemas validate runtime inputs at service boundaries through `parseValidated()`. The database then enforces final guarantees such as foreign keys, uniqueness, allowed status values, and valid leave dates. This division keeps malformed input out of services while protecting the database from every client, not only this UI.

## Error handling and observability

```text
Supabase/network/validation failure
              ↓
        normalizeError()
              ↓
           AppError
              ↓
        safe UI message

AppError or unexpected error → reportError() → Sentry (when configured)
```

`AppError` separates a safe user message from technical context. Expected validation, authorization, authentication, not-found, and conflict outcomes are normally not reported as critical events. Unexpected database, network, and unknown failures are reportable. Monitoring metadata is sanitized, duplicate reports are suppressed, and the application continues to work when no Sentry DSN is configured.

## Leave decision transaction

Employee submissions are inserted as `Pending` and owned through the employee ID linked to the authenticated profile. Admin decisions call `review_leave_request()` with only the request ID and `Approved` or `Rejected`.

The function locks the request, derives the reviewer from `auth.uid()`, verifies the admin role and pending state, resolves the employee recipient, and writes the decision, notification, and audit event in one database transaction. Any failed write rolls back the whole operation. See [Database](./DATABASE.md) and [Architecture Decisions](./DECISIONS.md).

## Testing and CI

Vitest covers validation, errors, permissions, pure utilities, mocked service behavior, leave transitions, observability, and selected forms through Testing Library. The current inspected suite contains 62 tests in 10 files. Browser E2E testing is intentionally deferred.

GitHub Actions runs on pushes to `main` and pull requests targeting `main`:

```text
npm ci → npm run lint → npm run test:run → npm run build
```

`npm ci` installs the exact lockfile dependency graph and fails when `package.json` and `package-lock.json` disagree, making CI more reproducible than an unconstrained install.

## Related documents

- [Authentication and RBAC](./AUTH_AND_RBAC.md)
- [Database and ERD](./DATABASE.md)
- [Architecture Decisions](./DECISIONS.md)
