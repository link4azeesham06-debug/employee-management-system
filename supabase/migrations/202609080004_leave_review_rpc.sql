-- Trusted, transactional leave review workflow.
-- Apply this migration after 202609070003_leave_management.sql. It does not
-- recreate tables, policies, or baseline objects in an existing project.

begin;

create or replace function public.review_leave_request(
  p_leave_request_id uuid,
  p_decision text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_actor_email text;
  v_employee_name text;
  v_recipient_user_id uuid;
  v_reviewed_at timestamptz := now();
  v_request public.leave_requests%rowtype;
  v_updated_request public.leave_requests%rowtype;
begin
  if v_actor_id is null then
    raise exception using
      errcode = '42501',
      message = 'LEAVE_AUTH_REQUIRED';
  end if;

  if not public.leave_current_user_is_admin() then
    raise exception using
      errcode = '42501',
      message = 'LEAVE_REVIEW_FORBIDDEN';
  end if;

  if p_decision is null or p_decision not in ('Approved', 'Rejected') then
    raise exception using
      errcode = '22023',
      message = 'LEAVE_INVALID_DECISION';
  end if;

  -- The row lock makes concurrent decisions serialize. The second reviewer
  -- sees the committed non-Pending status and receives a conflict.
  select leave_request.*
  into v_request
  from public.leave_requests as leave_request
  where leave_request.id = p_leave_request_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'LEAVE_REQUEST_NOT_FOUND';
  end if;

  if v_request.status <> 'Pending' then
    raise exception using
      errcode = 'P0001',
      message = 'LEAVE_ALREADY_REVIEWED';
  end if;

  select profile.email
  into v_actor_email
  from public.profiles as profile
  where profile.id = v_actor_id
    and profile.role = 'admin';

  select profile.id, employee.name
  into v_recipient_user_id, v_employee_name
  from public.profiles as profile
  join public.employees as employee
    on employee.id = profile.employee_id
  where profile.employee_id = v_request.employee_id
    and profile.role = 'employee';

  if v_recipient_user_id is null then
    raise exception using
      errcode = 'P0002',
      message = 'LEAVE_RECIPIENT_NOT_FOUND';
  end if;

  update public.leave_requests as leave_request
  set
    status = p_decision,
    reviewed_by = v_actor_id,
    reviewed_at = v_reviewed_at,
    updated_at = v_reviewed_at
  where leave_request.id = v_request.id
  returning leave_request.* into v_updated_request;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    read,
    link,
    created_at
  )
  values (
    v_recipient_user_id,
    format('Leave Request %s', p_decision),
    format(
      'Your %s leave request has been %s.',
      v_request.leave_type,
      lower(p_decision)
    ),
    case when p_decision = 'Approved' then 'success' else 'warning' end,
    false,
    '/leave',
    v_reviewed_at
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    description,
    metadata,
    created_at
  )
  values (
    v_actor_id,
    'STATUS_CHANGE',
    'Leave Request',
    v_request.id,
    format(
      '%s %s %s''s %s leave request.',
      coalesce(v_actor_email, 'Administrator'),
      lower(p_decision),
      coalesce(v_employee_name, 'employee'),
      v_request.leave_type
    ),
    jsonb_build_object(
      'decision', p_decision,
      'employeeId', v_request.employee_id,
      'leaveType', v_request.leave_type,
      'performedBy', coalesce(v_actor_email, 'Administrator'),
      'performedByRole', 'admin'
    ),
    v_reviewed_at
  );

  return to_jsonb(v_updated_request);
end;
$$;

revoke all on function public.review_leave_request(uuid, text) from public;
revoke all on function public.review_leave_request(uuid, text) from anon;
grant execute on function public.review_leave_request(uuid, text) to authenticated;

commit;
