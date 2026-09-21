# Architecture Decisions

These short records explain the current architecture. They describe decisions already implemented rather than future plans.

## 1. Supabase Auth and PostgreSQL

**Context:** The application needs authentication and persistent relational HR data without maintaining a custom backend framework.

**Decision:** Use Supabase Auth, the Supabase browser client, and PostgreSQL.

**Why:** It provides managed sessions, relational constraints, SQL migrations, and direct authenticated data access in a small portfolio architecture.

**Trade-off:** The client and schema are coupled to Supabase APIs and database policy design.

## 2. RLS is the backend authorization boundary

**Context:** Browser route guards and hidden controls can be bypassed.

**Decision:** Enforce row ownership and administrator mutations with PostgreSQL RLS derived from `auth.uid()`.

**Why:** Every database request receives the same enforcement regardless of which UI initiated it.

**Trade-off:** Policies and `SECURITY DEFINER` helpers require careful review to prevent recursion or privilege expansion.

## 3. Zod runtime validation

**Context:** TypeScript types disappear at runtime and cannot validate form or external data.

**Decision:** Use shared Zod schemas at forms and service boundaries.

**Why:** One schema produces normalized values and consistent field errors before persistence.

**Trade-off:** Validation rules must still be kept consistent with PostgreSQL constraints.

## 4. Central `AppError` model

**Context:** Supabase, PostgreSQL, validation, authentication, and network failures have different raw formats.

**Decision:** Normalize them into typed `AppError` codes with separate safe and technical messages.

**Why:** UI code can display consistent messages without exposing backend details.

**Trade-off:** New backend error shapes may require explicit classification or domain mapping.

## 5. Route-local Leave state

**Context:** Leave request list and review UI state are currently consumed only by `/leave`.

**Decision:** Keep that state in the route and use `leaveService` for persistence instead of adding a global leave context.

**Why:** It avoids a provider and API that no other route needs.

**Trade-off:** A future feature needing leave data across several routes may justify a shared cache or context.

## 6. Database RPC for leave review

**Context:** A browser sequence of leave update, cross-user notification, and audit insertion could partially fail and could not safely choose another user's notification ID.

**Decision:** Perform review through `review_leave_request()` as one secured PostgreSQL transaction.

**Why:** The database derives identities, locks state, and commits or rolls back every side effect together.

**Trade-off:** Workflow logic now spans TypeScript and PL/pgSQL and requires database migration testing.

## 7. Focused Vitest suite

**Context:** The project needs fast regression feedback while keeping the learning-stage testing stack understandable.

**Decision:** Use Vitest, jsdom, jest-dom, and Testing Library; defer Playwright/E2E infrastructure.

**Why:** The suite covers core rules, mappings, services, and forms with low setup cost.

**Trade-off:** Full browser navigation and live Supabase integration are still verified manually.

## 8. One GitHub Actions workflow

**Context:** Every push and pull request should receive the same basic quality checks.

**Decision:** Use one workflow with `npm ci`, lint, tests, and production build.

**Why:** It is easy to understand and fails quickly when a quality gate breaks.

**Trade-off:** It does not deploy, run browser tests, or provision an isolated database.

## 9. Optional Sentry observability

**Context:** Production failures need technical visibility without exposing raw details to users or making local/CI builds depend on monitoring.

**Decision:** Report selected unexpected failures through a centralized sanitized Sentry helper when a DSN exists.

**Why:** Error monitoring is available in production while expected business errors stay quiet and missing configuration does not break the app.

**Trade-off:** A Sentry project and optional source-map credentials require separate deployment setup.

## 10. Migration-first changes going forward

**Context:** The original portfolio database predates the formal 001/002 baseline files.

**Decision:** Treat 001/002 as fresh-project reproducibility files, never rerun them on the populated project, and deliver future schema changes as ordered migrations.

**Why:** This preserves existing data while making every new database change reviewable and repeatable.

**Trade-off:** Maintainers must track which baseline state already exists in each environment.
