"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Shield } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validation/auth";
import {
  normalizeValidationError,
  type ValidationFieldErrors,
} from "@/lib/validation/errors";
import { DEMO_EMPLOYEE_EMAIL } from "@/services/authService";

export default function LoginPage() {

  const router = useRouter();

  const { login, error: authError } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loginFailed, setLoginFailed] =
    useState(false);

  const [fieldErrors, setFieldErrors] =
    useState<ValidationFieldErrors>({});

  useEffect(() => {
    if (!loginFailed || !authError) return;

    toast.error(authError);
  }, [authError, loginFailed]);

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const normalized = normalizeValidationError(result.error);
      setFieldErrors(normalized.fieldErrors);
      setLoginFailed(false);
      return;
    }

    setLoginFailed(false);
    setFieldErrors({});
    setLoading(true);

    const success =
      await login(result.data.email, result.data.password);

    if (success) {

      setLoginFailed(false);

      toast.success(
        "Login Successful"
      );

      router.push("/dashboard");

    } else {

      setLoginFailed(true);

    }

    setLoading(false);

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-6">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">

        <div className="flex justify-center mb-6">

          <div className="bg-blue-100 p-5 rounded-full">

            <Shield
              size={42}
              className="text-blue-600"
            />

          </div>

        </div>

        <h1 className="text-3xl font-bold text-center">

          HR Management

        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">

          Login to continue

        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label htmlFor="login-email" className="font-medium">

              Email

            </label>

            <div className="flex items-center border rounded-xl mt-2 px-3">

              <Mail
                size={18}
                className="text-gray-400"
              />

              <input
                id="login-email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e)=> {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                className="w-full p-3 outline-none"
              />

            </div>

            {fieldErrors.email && <p id="login-email-error" className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.email}</p>}

          </div>

          <div>

            <label htmlFor="login-password" className="font-medium">

              Password

            </label>

            <div className="flex items-center border rounded-xl mt-2 px-3">

              <Lock
                size={18}
                className="text-gray-400"
              />

              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e)=> {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: "" }));
                }}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                className="w-full p-3 outline-none"
              />

            </div>

            {fieldErrors.password && <p id="login-password-error" className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.password}</p>}

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >

            {loading
              ? "Signing In..."
              : "Login"}

          </button>

        </form>

        <div className="mt-8 text-sm text-gray-500 border-t pt-5">

          <p className="font-semibold mb-2">

            Demo Accounts

          </p>

          <p>

            <strong>Admin:</strong>

            admin@hr.com / admin123

          </p>

          <p>

            <strong>Employee:</strong>

            {DEMO_EMPLOYEE_EMAIL} / employee123

          </p>

        </div>

      </div>

    </div>

  );

}
