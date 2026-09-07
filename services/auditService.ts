import { supabase } from "@/lib/supabase/client";
import { AppError } from "@/lib/errors/AppError";
import { normalizeError } from "@/lib/errors/normalizeError";
import type { AuditAction, AuditEntity, AuditLog } from "@/types/audit";

type AuditLogInput = {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  description: string;
  performedBy: string;
  performedByRole: "admin" | "employee";
  metadata?: Record<string, unknown>;
};

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  metadata: unknown;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  role: string;
  employee_id: string | null;
};

type EmployeeNameRow = {
  id: string;
  name: string | null;
};

type ActorIdentity = {
  performedBy: string;
  performedByRole: "admin" | "employee";
};

const AUDIT_ACTIONS: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
  "STATUS_CHANGE",
];

const AUDIT_ENTITIES: AuditEntity[] = [
  "Employee",
  "Department",
  "User",
  "Report",
  "System",
];

function auditError(error: { code?: string; message: string }): AppError {
  return normalizeError(error, {
    fallbackCode: "DATABASE",
    fallbackMessage: "Unable to access audit logs.",
    messages: {
      FORBIDDEN: "You do not have permission to access audit logs.",
      DATABASE: "Unable to access audit logs.",
    },
    metadata: { domain: "audit" },
  });
}

function metadataRecord(metadata: unknown): Record<string, unknown> {
  return metadata !== null && typeof metadata === "object" && !Array.isArray(metadata)
    ? (metadata as Record<string, unknown>)
    : {};
}

function normalizeAction(action: string): AuditAction {
  const normalized = action.trim().toUpperCase() as AuditAction;
  return AUDIT_ACTIONS.includes(normalized) ? normalized : "UPDATE";
}

function normalizeEntity(entity: string): AuditEntity {
  return (
    AUDIT_ENTITIES.find(
      (candidate) => candidate.toLowerCase() === entity.trim().toLowerCase(),
    ) ?? "System"
  );
}

function normalizeRole(role: unknown): "admin" | "employee" {
  return role === "employee" ? "employee" : "admin";
}

function mapAuditRow(row: AuditRow, actor?: ActorIdentity): AuditLog {
  const metadata = metadataRecord(row.metadata);
  const metadataPerformer =
    typeof metadata.performedBy === "string" ? metadata.performedBy : "System User";

  return {
    id: row.id,
    action: normalizeAction(row.action),
    entity: normalizeEntity(row.entity_type),
    entityId: row.entity_id ?? undefined,
    description: row.description,
    performedBy: actor?.performedBy ?? metadataPerformer,
    performedByRole:
      actor?.performedByRole ?? normalizeRole(metadata.performedByRole),
    createdAt: row.created_at,
  };
}

async function getActorIdentity(actorId: string): Promise<ActorIdentity> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, employee_id")
    .eq("id", actorId)
    .single();

  if (error) throw auditError(error);

  const profile = data as ProfileRow;
  let performedBy = profile.email ?? "System User";

  if (profile.employee_id) {
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("name")
      .eq("id", profile.employee_id)
      .single();

    if (employeeError) throw auditError(employeeError);
    performedBy = employee?.name?.trim() || performedBy;
  }

  return {
    performedBy,
    performedByRole: normalizeRole(profile.role),
  };
}

async function getActorMap(rows: AuditRow[]): Promise<Map<string, ActorIdentity>> {
  const actorIds = Array.from(
    new Set(rows.map((row) => row.actor_id).filter((id): id is string => Boolean(id))),
  );
  const actorMap = new Map<string, ActorIdentity>();

  if (!actorIds.length) return actorMap;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, employee_id")
    .in("id", actorIds);

  if (error) throw auditError(error);

  const profiles = (data ?? []) as ProfileRow[];
  const employeeIds = profiles
    .map((profile) => profile.employee_id)
    .filter((id): id is string => Boolean(id));
  const employeeNames = new Map<string, string>();

  if (employeeIds.length) {
    const { data: employees, error: employeeError } = await supabase
      .from("employees")
      .select("id, name")
      .in("id", employeeIds);

    if (employeeError) throw auditError(employeeError);

    ((employees ?? []) as EmployeeNameRow[]).forEach((employee) => {
      if (employee.name) employeeNames.set(employee.id, employee.name);
    });
  }

  profiles.forEach((profile) => {
    actorMap.set(profile.id, {
      performedBy:
        (profile.employee_id ? employeeNames.get(profile.employee_id) : undefined) ??
        profile.email ??
        "System User",
      performedByRole: normalizeRole(profile.role),
    });
  });

  return actorMap;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_id, action, entity_type, entity_id, description, metadata, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw auditError(error);

  const rows = (data ?? []) as AuditRow[];
  const actorMap = await getActorMap(rows);
  return rows.map((row) =>
    mapAuditRow(row, row.actor_id ? actorMap.get(row.actor_id) : undefined),
  );
}

export async function createAuditLog(input: AuditLogInput): Promise<AuditLog> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw normalizeError(userError, {
      fallbackCode: "AUTH",
      fallbackMessage: "Unable to verify your audit session.",
      metadata: { domain: "audit", action: "create" },
    });
  }
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Please sign in before recording audit activity.", {
      metadata: { domain: "audit", action: "create" },
    });
  }

  const actor = await getActorIdentity(user.id);
  const createdAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      actor_id: user.id,
      action: input.action,
      entity_type: input.entity,
      entity_id: input.entityId ?? null,
      description: input.description,
      metadata: {
        ...input.metadata,
        performedBy: actor.performedBy,
        performedByRole: actor.performedByRole,
      },
      created_at: createdAt,
    })
    .select(
      "id, actor_id, action, entity_type, entity_id, description, metadata, created_at",
    )
    .single();

  if (error) throw auditError(error);
  return mapAuditRow(data as AuditRow, actor);
}

export async function deleteAuditLog(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("audit_logs")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw auditError(error);
  if (!data?.length) {
    throw new AppError("NOT_FOUND", "Audit entry was not found or could not be deleted.", {
      metadata: { domain: "audit", action: "delete" },
    });
  }
}

export async function clearAuditLogs(): Promise<void> {
  const { count, error: countError } = await supabase
    .from("audit_logs")
    .select("id", { count: "exact", head: true });

  if (countError) throw auditError(countError);
  if (!count) return;

  const { data, error } = await supabase
    .from("audit_logs")
    .delete()
    .not("id", "is", null)
    .select("id");

  if (error) throw auditError(error);
  if ((data?.length ?? 0) !== count) {
    throw new AppError("FORBIDDEN", "Audit logs could not be cleared with your current permissions.", {
      technicalMessage: "Audit clear returned fewer rows than the pre-delete count.",
      metadata: { domain: "audit", action: "clear", expectedCount: count, deletedCount: data?.length ?? 0 },
    });
  }
}
