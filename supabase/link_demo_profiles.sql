-- Run only after creating the two demo users through Supabase Auth.
-- This script reads their generated Auth UUIDs instead of hardcoding them.

do $$
declare
  admin_auth_id uuid;
  employee_auth_id uuid;
  linked_employee_id uuid;
begin
  select id into admin_auth_id
  from auth.users
  where lower(email) = 'admin@hr.com';

  if admin_auth_id is null then
    raise exception 'Missing Supabase Auth user: admin@hr.com';
  end if;

  select id into employee_auth_id
  from auth.users
  where lower(email) = 'employee@hrpro.demo';

  if employee_auth_id is null then
    raise exception 'Missing Supabase Auth user: employee@hrpro.demo';
  end if;

  select id into linked_employee_id
  from public.employees
  where lower(email) = 'employee@hrpro.demo';

  if linked_employee_id is null then
    raise exception 'Missing seeded employee: employee@hrpro.demo';
  end if;

  insert into public.profiles (id, email, role, employee_id)
  values (admin_auth_id, 'admin@hr.com', 'admin', null)
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role,
    employee_id = excluded.employee_id,
    updated_at = now();

  insert into public.profiles (id, email, role, employee_id)
  values (
    employee_auth_id,
    'employee@hrpro.demo',
    'employee',
    linked_employee_id
  )
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role,
    employee_id = excluded.employee_id,
    updated_at = now();
end;
$$;
