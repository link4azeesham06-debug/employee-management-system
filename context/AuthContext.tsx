"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";
import { reportError } from "@/lib/errors/reportError";
import {
  type AuthUser,
  getAuthErrorMessage,
  getSessionUser,
  loadAuthUser,
  loginUser,
  logoutUser,
} from "@/services/authService";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function restoreSession() {
      const currentRequest = ++requestId;

      try {
        const restoredUser = await getSessionUser();

        if (active && currentRequest === requestId) {
          setUser(restoredUser);
          setError(null);
        }
      } catch (sessionError) {
        reportError(sessionError, {
          scope: "AuthContext.restoreSession",
          operation: "restore-session",
        });
        if (active && currentRequest === requestId) {
          setUser(null);
          setError(getAuthErrorMessage(sessionError));
        }
      } finally {
        if (active && currentRequest === requestId) {
          setLoading(false);
        }
      }
    }

    async function synchronizeUser(
      authUser: Parameters<typeof loadAuthUser>[0]
    ) {
      const currentRequest = ++requestId;

      try {
        const synchronizedUser = await loadAuthUser(authUser);

        if (active && currentRequest === requestId) {
          setUser(synchronizedUser);
          setError(null);
        }
      } catch (sessionError) {
        reportError(sessionError, {
          scope: "AuthContext.synchronizeUser",
          operation: "synchronize-user",
        });
        if (active && currentRequest === requestId) {
          setUser(null);
          setError(getAuthErrorMessage(sessionError));
        }
      } finally {
        if (active && currentRequest === requestId) {
          setLoading(false);
        }
      }
    }

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        requestId += 1;
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setLoading(true);
        window.setTimeout(() => {
          if (active) {
            void synchronizeUser(session.user);
          }
        }, 0);
      }
    });

    return () => {
      active = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    setError(null);

    try {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);
      return true;
    } catch (loginError) {
      reportError(loginError, {
        scope: "AuthContext.login",
        operation: "login",
      });
      setUser(null);
      setError(getAuthErrorMessage(loginError));
      return false;
    }
  }

  async function logout(): Promise<void> {
    setLoading(true);

    try {
      await logoutUser();
      setUser(null);
      setError(null);
    } catch (logoutError) {
      reportError(logoutError, {
        scope: "AuthContext.logout",
        operation: "logout",
      });
      setError(getAuthErrorMessage(logoutError));
      throw logoutError;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
