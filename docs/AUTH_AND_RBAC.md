# Authentication and RBAC

## Identity model

Supabase Auth owns credentials and sessions. Application identity is stored separately:

```text
auth.users.id
      ↓  profiles.id
public.profiles (email, role, employee_id)
      ↓  profiles.employee_id
public.employees
```

`profiles.id` is the Supabase Auth user UUID. An admin profile has role `admin` and no employee link. An employee profile has role `employee` and a linked `employees.id`. The application never identifies an employee by display name.

## Login and session lifecycle

1. The login form validates email and password shape with Zod.
2. `authService` calls `supabase.auth.signInWithPassword()`.
3. The authenticated UUID is used to load the matching `profiles` row.
4. For an employee, `profiles.employee_id` loads that employee row and its department name.
5. The result is mapped to the existing `AuthUser` shape: `id`, `email`, `role`, and optional `employee`.
6. `AuthContext` exposes the user and login/logout operations to the application.

On startup, `getSession()` restores an existing Supabase session. `onAuthStateChange()` synchronizes sign-in, sign-out, token refresh, and user updates. Logout calls `supabase.auth.signOut()` and clears context state. Passwords and session tokens are not manually persisted by application code.

## Roles and application permissions

The application has two roles:

| Capability | Admin | Employee |
| --- | --- | --- |
| View employee directory | All employees | Linked employee only |
| Create/edit/delete employees | Yes | No |
| Manage departments | Yes | No |
| View reports and audit logs | Yes | No |
| Submit leave request | No | Yes |
| Review leave requests | Yes | No |
| Manage own notifications/profile | Yes | Yes |
| Access settings | Yes | No |

Public routes are `/` and `/login`. Shared authenticated routes are `/dashboard`, `/employees`, `/employees/[id]`, `/leave`, `/notifications`, and `/profile`. Admin-only routes are `/departments`, `/reports`, `/audit`, and `/settings`.

`usePermissions()` derives booleans from the current role. The sidebar uses those permissions to hide unavailable navigation. `ProtectedRoute` and `RoleGuard` redirect unauthenticated users to `/login` and users with the wrong role to `/dashboard`.

## Why RLS still matters

Route guards and hidden buttons run in the browser and therefore improve UX rather than provide complete security. A user could still construct a direct request outside the UI.

PostgreSQL RLS is the final enforcement layer:

- Employees can select only the employee row linked through their profile.
- Only admins can mutate employee and department records.
- Notifications are restricted to their owning profile.
- Audit history is readable/deletable only by admins.
- Employees can insert and view only their own leave requests; admins can view and review all requests.

Non-recursive `SECURITY DEFINER` helper functions derive admin role and employee linkage from `auth.uid()`. They use an empty `search_path`, schema-qualified relations, and restricted execution grants. They do not trust role, reviewer, owner, or recipient IDs submitted by the client.

## Trusted leave review

The `review_leave_request()` RPC is callable only by the authenticated database role and performs an explicit admin check internally. It derives `reviewed_by` from `auth.uid()` and resolves the notification recipient through `leave_requests.employee_id → profiles.employee_id`. Its elevated execution context is used only to complete this controlled cross-user transaction; it is not a general service-role interface.
