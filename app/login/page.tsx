"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import BrandGrid from "@/components/brand/BrandGrid";
import BrandLogo from "@/components/brand/BrandLogo";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validation/auth";
import {
  normalizeValidationError,
  type ValidationFieldErrors,
} from "@/lib/validation/errors";
import { DEMO_EMPLOYEE_EMAIL } from "@/services/authService";

const demoRoles = [
  {
    label: "Admin workspace",
    detail: "Manage records, reviews, reports, and settings",
    email: "admin@hr.com",
    password: "admin123",
    icon: ShieldCheck,
  },
  {
    label: "Employee workspace",
    detail: "View your record, leave, and notifications",
    email: DEMO_EMPLOYEE_EMAIL,
    password: "employee123",
    icon: UserRound,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationFieldErrors>({});

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  function selectDemoRole(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setLoginFailed(false);
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

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

    const success = await login(result.data.email, result.data.password);
    if (success) {
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } else {
      setLoginFailed(true);
    }

    setLoading(false);
  }

  const formError = loginFailed
    ? authError ?? "Unable to sign in. Check your details and try again."
    : null;

  if (authLoading || user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-6">
        <p className="text-sm font-semibold text-slate-500" role="status">
          Loading your workspace…
        </p>
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh overflow-x-clip bg-white lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative isolate hidden min-h-dvh overflow-hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:p-12 xl:p-16" aria-labelledby="login-story-title">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(79,70,229,0.35),transparent_35%),radial-gradient(circle_at_90%_75%,rgba(99,102,241,0.2),transparent_30%)]" />
        <BrandGrid className="-z-10 opacity-30" />
        <Link href="/" className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300" aria-label="Return to HR home">
          <BrandLogo variant="inverse" showDescriptor decorative markSize={42} />
        </Link>

        <div className="my-auto max-w-xl py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Your operating workspace</p>
          <h1 id="login-story-title" className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] xl:text-6xl">One identity. The right view. Every action connected.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Sign in to work with employee records, leave decisions, reporting, and the activity tied to your role.</p>

          <div className="relative mt-12 min-h-[18rem]">
            <div className="absolute inset-x-8 top-0 rotate-2 border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-sm xl:left-16">
              <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-indigo-300">Workforce overview</p><BarChart3 size={18} className="text-indigo-300" aria-hidden="true" /></div>
              <div className="mt-5 grid grid-cols-3 gap-3">{["Employees", "Departments", "Status"].map((item) => <div key={item} className="border-t border-white/20 bg-white/[0.04] p-3"><p className="text-[10px] text-slate-400">{item}</p><p className="mt-3 text-xs font-bold">Current</p></div>)}</div>
            </div>
            <div className="brand-float-slow absolute bottom-3 left-0 w-64 border border-white/10 bg-slate-900/95 p-4 shadow-2xl">
              <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300"><CalendarCheck2 size={18} aria-hidden="true" /></span><div><p className="text-xs font-bold">Leave request</p><p className="mt-1 text-[10px] text-slate-400">Pending review</p></div></div>
            </div>
            <div className="brand-float-delayed absolute bottom-0 right-0 w-60 border border-indigo-300/15 bg-white p-4 text-slate-900 shadow-2xl">
              <div className="flex items-center gap-3"><CheckCircle2 size={20} className="text-emerald-600" aria-hidden="true" /><div><p className="text-xs font-bold">Role verified</p><p className="mt-1 text-[10px] text-slate-500">Workspace access ready</p></div></div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">Secure authentication powered by Supabase</p>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-8 lg:px-12" aria-labelledby="sign-in-title">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Return to HR home"><BrandLogo decorative markSize={38} /></Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-indigo-600"><ArrowLeft size={14} aria-hidden="true" />Home</Link>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
          <h2 id="sign-in-title" className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">Sign in to HR</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Choose a portfolio role or enter your account details.</p>

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Explore a role</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {demoRoles.map(({ label, detail, email: demoEmail, password: demoPassword, icon: Icon }) => {
                const selected = email === demoEmail && password === demoPassword;
                return (
                  <button key={label} type="button" onClick={() => selectDemoRole(demoEmail, demoPassword)} aria-pressed={selected} className={`min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selected ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
                    <Icon size={18} className={selected ? "text-indigo-600" : "text-slate-500"} aria-hidden="true" />
                    <span className="mt-3 block text-xs font-extrabold text-slate-900">{label}</span>
                    <span className="mt-1 block text-[10px] leading-4 text-slate-500">{detail}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>Account details</span><span className="h-px flex-1 bg-slate-200" /></div>

          <form onSubmit={handleLogin} noValidate>
            <div>
              <label htmlFor="login-email" className="text-sm font-bold text-slate-800">Email</label>
              <div className={`mt-2 flex h-12 items-center rounded-xl border bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${fieldErrors.email ? "border-red-400" : "border-slate-300"}`}>
                <Mail size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
                <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => { setEmail(event.target.value); if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: "" })); setLoginFailed(false); }} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "login-email-error" : undefined} className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </div>
              <p id="login-email-error" className="mt-1.5 min-h-4 text-xs font-medium text-red-600">{fieldErrors.email ?? ""}</p>
            </div>

            <div className="mt-4">
              <label htmlFor="login-password" className="text-sm font-bold text-slate-800">Password</label>
              <div className={`mt-2 flex h-12 items-center rounded-xl border bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${fieldErrors.password ? "border-red-400" : "border-slate-300"}`}>
                <Lock size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
                <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => { setPassword(event.target.value); if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: "" })); setLoginFailed(false); }} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "login-password-error" : undefined} className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button>
              </div>
              <p id="login-password-error" className="mt-1.5 min-h-4 text-xs font-medium text-red-600">{fieldErrors.password ?? ""}</p>
            </div>

            <div className="min-h-9" aria-live="polite">{formError && <p className="py-2 text-xs font-semibold text-red-700">{formError}</p>}</div>

            <button type="submit" disabled={loading} className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={17} aria-hidden="true" />}
            </button>
          </form>

          <p className="mt-7 text-center text-xs leading-5 text-slate-400">Role options fill the existing demo credentials. Sign-in still requires an explicit action and uses Supabase Auth.</p>
        </div>
      </section>
    </main>
  );
}
