-- Non-recursive identity helpers used by row-level security policies.
-- SECURITY DEFINER lets these functions inspect profiles without triggering a
-- recursive profiles policy. The empty search_path prevents object shadowing.

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
  );
$$;

create or replace function public.current_user_employee_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.employee_id
  from public.profiles as profile
  where profile.id = (select auth.uid());
$$;

revoke all on function public.current_user_is_admin() from public;
revoke all on function public.current_user_employee_id() from public;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_employee_id() to authenticated;

alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.departments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: every user can load their own identity; admins can resolve audit actors.
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_select_admin
on public.profiles
for select
to authenticated
using ((select public.current_user_is_admin()));

-- Employees: admins manage all records; employees can read only their linked row.
create policy employees_select_admin_or_own
on public.employees
for select
to authenticated
using (
  (select public.current_user_is_admin())
  or id = (select public.current_user_employee_id())
);

create policy employees_insert_admin
on public.employees
for insert
to authenticated
with check ((select public.current_user_is_admin()));

create policy employees_update_admin
on public.employees
for update
to authenticated
using ((select public.current_user_is_admin()))
with check ((select public.current_user_is_admin()));

create policy employees_delete_admin
on public.employees
for delete
to authenticated
using ((select public.current_user_is_admin()));

-- Departments: authenticated users read; only admins mutate.
create policy departments_select_authenticated
on public.departments
for select
to authenticated
using (true);

create policy departments_insert_admin
on public.departments
for insert
to authenticated
with check ((select public.current_user_is_admin()));

create policy departments_update_admin
on public.departments
for update
to authenticated
using ((select public.current_user_is_admin()))
with check ((select public.current_user_is_admin()));

create policy departments_delete_admin
on public.departments
for delete
to authenticated
using ((select public.current_user_is_admin()));

-- Notifications are private to the authenticated profile identified by auth.uid().
create policy notifications_select_own
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy notifications_insert_own
on public.notifications
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy notifications_update_own
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy notifications_delete_own
on public.notifications
for delete
to authenticated
using (user_id = (select auth.uid()));

-- Audit entries can be recorded by their authenticated actor. Only admins can
-- read or remove the audit history; there is intentionally no update policy.
create policy audit_logs_select_admin
on public.audit_logs
for select
to authenticated
using ((select public.current_user_is_admin()));

create policy audit_logs_insert_authenticated_actor
on public.audit_logs
for insert
to authenticated
with check (actor_id = (select auth.uid()));

create policy audit_logs_delete_admin
on public.audit_logs
for delete
to authenticated
using ((select public.current_user_is_admin()));

-- PostgREST table privileges; RLS remains the row-level enforcement boundary.
revoke all on public.profiles from anon;
revoke all on public.employees from anon;
revoke all on public.departments from anon;
revoke all on public.notifications from anon;
revoke all on public.audit_logs from anon;

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.employees to authenticated;
grant select, insert, update, delete on public.departments to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, delete on public.audit_logs to authenticated;
