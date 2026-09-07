"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createAuditLog,
  deleteAuditLog,
  getAuditLogs,
  clearAuditLogs,
} from "@/services/auditService";

import {
  AuditAction,
  AuditEntity,
  AuditLog,
} from "@/types/audit";
import { useAuth } from "@/hooks/useAuth";
import { logAppError } from "@/lib/errors/normalizeError";

type AuditContextType = {
  logs: AuditLog[];
  loading: boolean;

  addLog: (data: {
    action: AuditAction;
    entity: AuditEntity;
    entityId?: string;
    description: string;
    performedBy: string;
    performedByRole: "admin" | "employee";
    metadata?: Record<string, unknown>;
  }) => Promise<AuditLog>;

  removeLog: (id: string) => Promise<void>;

  clearLogs: () => Promise<void>;

  refreshLogs: () => Promise<void>;
};

const AuditContext =
  createContext<AuditContextType | null>(null);

export function AuditProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [logs, setLogs] = useState<AuditLog[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);
  const { user } = useAuth();

  const refreshLogs = useCallback(async () => {
    try {
      setLoading(true);

      if (user?.role !== "admin") {
        setLogs([]);
        return;
      }

      setLogs(await getAuditLogs());
    } catch (error) {
      logAppError("AuditContext.refreshLogs", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshLogs();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshLogs]);

  const addLog = useCallback(
    (data: {
      action: AuditAction;
      entity: AuditEntity;
      entityId?: string;
      description: string;
      performedBy: string;
      performedByRole:
        | "admin"
        | "employee";
      metadata?: Record<string, unknown>;
    }) => {
      return createAuditLog(data).then((log) => {
        setLogs((current) => [
          log,
          ...current,
        ]);

        return log;
      });
    },
    []
  );

  const removeLog = useCallback(
    async (id: string) => {
      await deleteAuditLog(id);
      setLogs((current) => current.filter((log) => log.id !== id));
    },
    []
  );

  const clearLogs = useCallback(async () => {
    await clearAuditLogs();
    setLogs([]);
  }, []);

  return (
    <AuditContext.Provider
      value={{
        logs,
        loading,
        addLog,
        removeLog,
        clearLogs,
        refreshLogs,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context =
    useContext(AuditContext);

  if (!context) {
    throw new Error(
      "useAudit must be used inside AuditProvider"
    );
  }

  return context;
}
