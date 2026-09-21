-- Standalone Leave Management migration.
-- Safe for both a fresh migration chain and the existing portfolio database,
-- where the Phase 6 baseline migrations were documented but never executed.

begin;

-- Leave-specific SECURITY DEFINER helpers avoid depending on baseline-only
-- functions and avoid recursive profiles RLS evaluation.
create or replace function public.leave_current_user_is_admin()
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

create or replace function public.leave_current_user_employee_id()
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

revoke all on function public.leave_current_user_is_admin() from public;
revoke all on function public.leave_current_user_employee_id() from public;
grant execute on function public.leave_current_user_is_admin() to authenticated;
grant execute on function public.leave_current_user_employee_id() to authenticated;

-- IF NOT EXISTS makes rerunning safe when the previous SQL Editor attempt
-- committed statements before reaching the missing-helper error.
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status text not null default 'Pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_requests_employee_id_fkey
    foreign key (employee_id)
    references public.employees (id)
    on delete restrict,
  constraint leave_requests_reviewed_by_fkey
    foreign key (reviewed_by)
    references public.profiles (id)
    on delete restrict,
  constraint leave_requests_leave_type_check check (
    leave_type in ('Annual', 'Sick', 'Personal', 'Unpaid')
  ),
  constraint leave_requests_status_check check (
    status in ('Pending', 'Approved', 'Rejected')
  ),
  constraint leave_requests_date_check check (end_date >= start_date),
  constraint leave_requests_review_check check (
    (
      status = 'Pending'
      and reviewed_by is null
      and reviewed_at is null
    )
    or (
      status in ('Approved', 'Rejected')
      and reviewed_by is not null
      and reviewed_at is not null
    )
  )
);

create index if not exists leave_requests_employee_created_at_idx
  on public.leave_requests (employee_id, created_at desc);

create index if not exists leave_requests_status_created_at_idx
  on public.leave_requests (status, created_at desc);

-- The browser may only make the two supported decisions on a pending request.
-- Request ownership and request details remain immutable after insertion.
create or replace function public.enforce_leave_request_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.employee_id is distinct from old.employee_id
    or new.leave_type is distinct from old.leave_type
    or new.start_date is distinct from old.start_date
    or new.end_date is distinct from old.end_date
    or new.reason is distinct from old.reason
    or new.created_at is distinct from old.created_at then
    raise exception 'Leave request details cannot be changed after submission.'
      using errcode = '23514';
  end if;

  if old.status <> 'Pending'
    or new.status not in ('Approved', 'Rejected')
    or new.reviewed_by is distinct from (select auth.uid())
    or new.reviewed_at is null then
    raise exception 'Only pending leave requests can be reviewed.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

do $migration$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.leave_requests'::regclass
      and tgname = 'enforce_leave_request_transition_before_update'
      and not tgisinternal
  ) then
    execute $trigger$
      create trigger enforce_leave_request_transition_before_update
      before update on public.leave_requests
      for each row
      execute function public.enforce_leave_request_transition()
    $trigger$;
  end if;
end;
$migration$;

alter table public.leave_requests enable row level security;

-- Create only missing Leave Management policies. Existing policies on all
-- established application tables are left untouched.
do $migration$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'leave_requests'
      and policyname = 'leave_requests_select_admin_or_own'
  ) then
    execute $policy$
      create policy leave_requests_select_admin_or_own
      on public.leave_requests
      for select
      to authenticated
      using (
        (select public.leave_current_user_is_admin())
        or employee_id = (select public.leave_current_user_employee_id())
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'leave_requests'
      and policyname = 'leave_requests_insert_own_pending'
  ) then
    execute $policy$
      create policy leave_requests_insert_own_pending
      on public.leave_requests
      for insert
      to authenticated
      with check (
        not (select public.leave_current_user_is_admin())
        and employee_id = (select public.leave_current_user_employee_id())
        and status = 'Pending'
        and reviewed_by is null
        and reviewed_at is null
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'leave_requests'
      and policyname = 'leave_requests_update_admin'
  ) then
    execute $policy$
      create policy leave_requests_update_admin
      on public.leave_requests
      for update
      to authenticated
      using ((select public.leave_current_user_is_admin()))
      with check ((select public.leave_current_user_is_admin()))
    $policy$;
  end if;
end;
$migration$;

-- Remove any broad default grants on this new table, then grant only the
-- columns required by the employee submission and admin review workflows.
revoke all on public.leave_requests from anon;
revoke all on public.leave_requests from authenticated;
grant select on public.leave_requests to authenticated;
grant insert (
  employee_id,
  leave_type,
  start_date,
  end_date,
  reason
) on public.leave_requests to authenticated;
grant update (
  status,
  reviewed_by,
  reviewed_at,
  updated_at
) on public.leave_requests to authenticated;

-- Extend whichever current entity_type check constraint protects audit_logs.
-- No audit policy or existing application policy is changed.
do $migration$
declare
  entity_constraint record;
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.audit_logs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%entity_type%'
      and pg_get_constraintdef(oid) ilike '%Leave Request%'
  ) then
    for entity_constraint in
      select conname
      from pg_constraint
      where conrelid = 'public.audit_logs'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%entity_type%'
    loop
      execute format(
        'alter table public.audit_logs drop constraint %I',
        entity_constraint.conname
      );
    end loop;

    alter table public.audit_logs
      add constraint audit_logs_entity_type_check check (
        entity_type in (
          'Employee',
          'Department',
          'User',
          'Report',
          'System',
          'Leave Request'
        )
      );
  end if;
end;
$migration$;

commit;
