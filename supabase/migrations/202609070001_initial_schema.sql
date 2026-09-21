-- Baseline schema for a fresh HR Supabase project.
-- This migration intentionally does not create Supabase Auth users.

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  description text,
  status text not null default 'Active',
  manager_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint departments_name_key unique (name),
  constraint departments_code_key unique (code),
  constraint departments_status_check check (status in ('Active', 'Inactive'))
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null,
  name text not null,
  email text not null,
  position text not null,
  department_id uuid not null,
  status text not null default 'Active',
  joined_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_employee_code_key unique (employee_code),
  constraint employees_email_key unique (email),
  constraint employees_status_check check (
    status in ('Active', 'On Leave', 'Inactive')
  ),
  constraint employees_department_id_fkey
    foreign key (department_id)
    references public.departments (id)
    on delete restrict
);

alter table public.departments
  add constraint departments_manager_fk
  foreign key (manager_id)
  references public.employees (id)
  on delete set null;

create table public.profiles (
  id uuid primary key,
  email text not null,
  role text not null,
  employee_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_id_fkey
    foreign key (id)
    references auth.users (id)
    on delete cascade,
  constraint profiles_email_key unique (email),
  constraint profiles_employee_id_key unique (employee_id),
  constraint profiles_employee_id_fkey
    foreign key (employee_id)
    references public.employees (id)
    on delete set null,
  constraint profiles_role_check check (role in ('admin', 'employee')),
  constraint profiles_employee_link_check check (
    (role = 'admin' and employee_id is null)
    or (role = 'employee' and employee_id is not null)
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now(),
  constraint notifications_user_id_fkey
    foreign key (user_id)
    references public.profiles (id)
    on delete cascade,
  constraint notifications_type_check check (
    type in ('success', 'warning', 'info', 'error')
  )
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_actor_id_fkey
    foreign key (actor_id)
    references public.profiles (id)
    on delete set null,
  constraint audit_logs_action_check check (
    action in (
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'STATUS_CHANGE'
    )
  ),
  constraint audit_logs_entity_type_check check (
    entity_type in ('Employee', 'Department', 'User', 'Report', 'System')
  )
);

-- Foreign-key and sort indexes used by the application's current queries.
create index employees_department_id_idx
  on public.employees (department_id);

create index departments_manager_id_idx
  on public.departments (manager_id);

create index notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

create index audit_logs_actor_id_idx
  on public.audit_logs (actor_id);

create index audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

-- updated_at is written explicitly by the current employee and department services.
-- No update trigger is added so the migration preserves that application behavior.
