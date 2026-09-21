-- Non-sensitive, deterministic demo data for a fresh database.
-- Auth users and profiles are deliberately created in a separate step.

begin;

insert into public.departments (
  id,
  name,
  code,
  description,
  status,
  manager_id,
  created_at,
  updated_at
)
values
  ('10000000-0000-4000-8000-000000000001', 'Information Technology', 'IT', 'Builds and supports the company technology platform.', 'Active', null, '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('10000000-0000-4000-8000-000000000002', 'Human Resources', 'HR', 'Supports people operations, hiring, and workplace programs.', 'Active', null, '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('10000000-0000-4000-8000-000000000003', 'Operations', 'OPS', 'Coordinates daily business operations and delivery.', 'Active', null, '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('10000000-0000-4000-8000-000000000004', 'Finance', 'FIN', 'Manages planning, accounting, and financial controls.', 'Active', null, '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('10000000-0000-4000-8000-000000000005', 'Customer Success', 'CS', 'Helps customers adopt the product and achieve outcomes.', 'Active', null, '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  description = excluded.description,
  status = excluded.status,
  updated_at = excluded.updated_at;

insert into public.employees (
  id,
  employee_code,
  name,
  email,
  position,
  department_id,
  status,
  joined_date,
  created_at,
  updated_at
)
values
  ('20000000-0000-4000-8000-000000000001', 'HRP-001', 'Amina Rahman', 'employee@hrpro.demo', 'Engineering Manager', '10000000-0000-4000-8000-000000000001', 'Active', '2021-03-15', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000002', 'HRP-002', 'Noah Bennett', 'noah.bennett@hrpro.demo', 'Senior Software Engineer', '10000000-0000-4000-8000-000000000001', 'Active', '2022-06-06', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000003', 'HRP-003', 'Maya Chen', 'maya.chen@hrpro.demo', 'Product Designer', '10000000-0000-4000-8000-000000000001', 'On Leave', '2023-02-20', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000004', 'HRP-004', 'Sofia Malik', 'sofia.malik@hrpro.demo', 'People Operations Manager', '10000000-0000-4000-8000-000000000002', 'Active', '2020-09-01', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000005', 'HRP-005', 'Ethan Brooks', 'ethan.brooks@hrpro.demo', 'Talent Partner', '10000000-0000-4000-8000-000000000002', 'Inactive', '2022-11-14', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000006', 'HRP-006', 'Lucas Silva', 'lucas.silva@hrpro.demo', 'Operations Manager', '10000000-0000-4000-8000-000000000003', 'Active', '2019-07-08', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000007', 'HRP-007', 'Zara Khan', 'zara.khan@hrpro.demo', 'Operations Analyst', '10000000-0000-4000-8000-000000000003', 'Active', '2023-08-21', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000008', 'HRP-008', 'Oliver Grant', 'oliver.grant@hrpro.demo', 'Workplace Coordinator', '10000000-0000-4000-8000-000000000003', 'On Leave', '2024-01-12', '2024-01-12T09:00:00Z', '2024-01-12T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000009', 'HRP-009', 'Priya Shah', 'priya.shah@hrpro.demo', 'Finance Manager', '10000000-0000-4000-8000-000000000004', 'Active', '2020-04-27', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000010', 'HRP-010', 'Daniel Kim', 'daniel.kim@hrpro.demo', 'Financial Analyst', '10000000-0000-4000-8000-000000000004', 'Active', '2023-05-09', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000011', 'HRP-011', 'Leila Haddad', 'leila.haddad@hrpro.demo', 'Customer Success Manager', '10000000-0000-4000-8000-000000000005', 'Active', '2021-10-18', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000012', 'HRP-012', 'Mateo Rivera', 'mateo.rivera@hrpro.demo', 'Implementation Specialist', '10000000-0000-4000-8000-000000000005', 'Active', '2022-12-05', '2024-01-02T09:00:00Z', '2024-01-02T09:00:00Z'),
  ('20000000-0000-4000-8000-000000000013', 'HRP-013', 'Grace Wilson', 'grace.wilson@hrpro.demo', 'Customer Success Associate', '10000000-0000-4000-8000-000000000005', 'Inactive', '2024-03-04', '2024-03-04T09:00:00Z', '2024-03-04T09:00:00Z')
on conflict (id) do update set
  employee_code = excluded.employee_code,
  name = excluded.name,
  email = excluded.email,
  position = excluded.position,
  department_id = excluded.department_id,
  status = excluded.status,
  joined_date = excluded.joined_date,
  updated_at = excluded.updated_at;

update public.departments
set manager_id = manager.employee_id,
    updated_at = '2024-01-02T09:00:00Z'
from (
  values
    ('10000000-0000-4000-8000-000000000001'::uuid, '20000000-0000-4000-8000-000000000001'::uuid),
    ('10000000-0000-4000-8000-000000000002'::uuid, '20000000-0000-4000-8000-000000000004'::uuid),
    ('10000000-0000-4000-8000-000000000003'::uuid, '20000000-0000-4000-8000-000000000006'::uuid),
    ('10000000-0000-4000-8000-000000000004'::uuid, '20000000-0000-4000-8000-000000000009'::uuid),
    ('10000000-0000-4000-8000-000000000005'::uuid, '20000000-0000-4000-8000-000000000011'::uuid)
) as manager(department_id, employee_id)
where departments.id = manager.department_id;

commit;
