import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  FileClock,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import BrandGrid from "@/components/brand/BrandGrid";
import BrandLogo from "@/components/brand/BrandLogo";
import PublicNavbar from "@/components/landing/PublicNavbar";

const workflowSteps = [
  { label: "Employee", detail: "Submits dates and reason", tone: "slate" },
  { label: "Pending", detail: "Request waits for review", tone: "amber" },
  { label: "Admin review", detail: "Approve or reject once", tone: "indigo" },
  { label: "Decision", detail: "Status becomes final", tone: "emerald" },
];

const permissionRows = [
  { capability: "Employee records", admin: "All", employee: "Own record" },
  { capability: "Leave", admin: "Review", employee: "Request" },
  { capability: "Departments", admin: "Manage", employee: false },
  { capability: "Reports", admin: "View", employee: false },
  { capability: "Audit", admin: "View", employee: false },
  { capability: "Settings", admin: "Manage", employee: false },
];

const footerGroups = [
  { title: "Product", links: [["Overview", "#product"], ["Leave management", "#workflow"], ["Analytics", "#insights"], ["Security", "#security"]] },
  { title: "Access", links: [["Explore HR", "/login"], ["Sign in", "/login"]] },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white text-slate-950">
      <PublicNavbar />
      <main>
        <section className="relative isolate overflow-hidden border-b border-indigo-950 bg-slate-950 text-white" aria-labelledby="hero-title">
          <BrandGrid className="-z-10 opacity-25" />
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_16%,rgba(129,140,248,0.3),transparent_31%),radial-gradient(circle_at_88%_26%,rgba(99,102,241,0.36),transparent_34%),linear-gradient(122deg,#0f172a_0%,#1e1b4b_46%,#3730a3_100%)]" aria-hidden="true" />\n          <div className="absolute -right-24 top-0 -z-10 h-full w-1/2 skew-x-[-10deg] border-l border-white/10 bg-white/[0.025]" aria-hidden="true" />
          <div className="mx-auto grid w-full max-w-[90rem] items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[minmax(0,0.76fr)_minmax(36rem,1.24fr)] lg:gap-8 lg:px-8 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <p className="inline-flex items-center gap-2 border-l-2 border-indigo-300 pl-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">People operations, made legible</p>
              <h1 id="hero-title" className="mt-7 text-[clamp(2.8rem,6.6vw,5.9rem)] font-extrabold leading-[0.96] tracking-[-0.065em] text-white">Run every people decision from one clear system.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Employees, leave, departments, permissions, analytics, and audit history stay connected—so the next action is always clear.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-indigo-800 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900">Explore HR <ArrowRight size={17} aria-hidden="true" /></Link>
                <Link href="#product" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-6 text-sm font-bold text-white backdrop-blur transition hover:border-white/35 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200">View capabilities <ChevronRight size={17} aria-hidden="true" /></Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-xs font-semibold text-slate-300" aria-label="Product foundations">
                {["Supabase authentication", "Role-aware workspace", "Traceable workflows"].map((item) => <span key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300" aria-hidden="true" />{item}</span>)}
              </div>
            </div>
            <HeroComposition />
          </div>
        </section>

        <section id="product" className="scroll-mt-24 overflow-hidden bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-24">
              <div>
                <SectionLabel>One operating picture</SectionLabel>
                <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">Records become useful when the relationships stay visible.</h2>
                <p className="mt-6 text-base leading-7 text-slate-600">HR keeps identity, department, position, employment status, and role together. Administrators work across the organization; employees see the record that belongs to them.</p>
                <dl className="mt-9 border-y border-slate-200">
                  {[["Structured", "Employee and department records share one model"], ["Current", "Status changes appear throughout the workspace"], ["Role-aware", "Each account gets the right operational view"]].map(([term, detail]) => <div key={term} className="grid gap-1 border-b border-slate-200 py-4 last:border-b-0 sm:grid-cols-[7rem_1fr]"><dt className="text-sm font-bold text-slate-950">{term}</dt><dd className="text-sm leading-6 text-slate-500">{detail}</dd></div>)}
                </dl>
              </div>
              <PeopleOperationsVisual />
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24 border-y border-slate-200 bg-slate-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <SectionLabel>Controlled leave workflow</SectionLabel>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">A request moves forward. Its history stays behind.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">Employees submit leave for review. Administrators make a final decision, and HR records the result in both the notification stream and audit history.</p>
            </div>
            <LeaveWorkflow />
          </div>
        </section>

        <section id="security" className="scroll-mt-24 bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20 lg:px-8">
            <div>
              <SectionLabel>Access with boundaries</SectionLabel>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">The interface guides. The database enforces.</h2>
              <p className="mt-6 text-base leading-7 text-slate-600">Role-aware navigation keeps the workspace focused. Supabase Row Level Security remains the final boundary for workforce data.</p>
              <div className="mt-8 flex items-start gap-4 border-l-2 border-indigo-200 pl-5"><LockKeyhole className="mt-0.5 shrink-0 text-indigo-600" size={20} aria-hidden="true" /><p className="text-sm leading-6 text-slate-600">Employee accounts can work with their own record, leave requests, and notifications without exposing administrator-only operations.</p></div>
            </div>
            <PermissionMatrix />
          </div>
        </section>

        <section id="insights" className="scroll-mt-24 overflow-hidden bg-[#f4f5f9] py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:px-8">
            <div>
              <SectionLabel>Workforce reporting</SectionLabel>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-5xl">Read the workforce as it is now.</h2>
              <p className="mt-6 text-base leading-7 text-slate-600">Headcount, department coverage, employment status, and hiring activity are calculated from current records—not marketing estimates.</p>
              <ul className="mt-8 space-y-3 text-sm font-medium text-slate-700">{["Filter the reporting view", "Compare workforce categories", "Export the visible result as CSV"].map((item) => <li key={item} className="flex items-center gap-3"><CheckCircle2 size={17} className="text-emerald-600" aria-hidden="true" />{item}</li>)}</ul>
            </div>
            <AnalyticsCanvas />
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-slate-950 py-20 text-white sm:py-28">
          <BrandGrid className="-z-10 opacity-25" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-24">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Operational visibility</p><h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">Important actions leave a useful trace.</h2><p className="mt-6 text-base leading-7 text-slate-300">Decisions do not disappear after a save. The audit timeline records the action, while the right account receives a persistent notification.</p></div>
              <OperationalFlow />
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-indigo-600 px-6 py-14 text-white shadow-2xl shadow-indigo-950/20 sm:px-12 lg:px-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(125deg,transparent_40%,rgba(49,46,129,0.45))]" aria-hidden="true" />
            <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">The working portfolio experience</p><h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">Explore the product from either side of the workflow.</h2><p className="mt-5 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Sign in as an administrator or employee using the role options provided on the login screen.</p></div><Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600">Explore HR <ArrowRight size={17} aria-hidden="true" /></Link></div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

function HeroComposition() {
  return (
    <div className="relative mx-auto w-full max-w-[50rem] pb-20 pt-8 sm:pb-24 lg:min-h-[38rem] lg:py-10" aria-label="Layered preview of the HR workspace">
      <div className="absolute left-[4%] top-[8%] h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" aria-hidden="true" />
      <div className="absolute right-[5%] top-[18%] h-80 w-80 rounded-full bg-violet-300/15 blur-3xl" aria-hidden="true" />
      <div className="brand-depth-drift relative ml-auto mt-5 w-[97%] origin-center overflow-hidden rounded-2xl border border-white/40 bg-white shadow-[0_42px_110px_rgba(8,15,40,0.48)] sm:mt-8 sm:w-[90%] lg:[transform:perspective(1400px)_rotateY(-4deg)_rotateX(1deg)]">
        <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-white/95 px-4"><BrandLogo markSize={24} decorative wordmarkClassName="text-sm" /><span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Workspace live</span></div>
        <div className="grid min-h-[21rem] grid-cols-[3.25rem_1fr] bg-slate-50 sm:min-h-[25rem] sm:grid-cols-[8rem_1fr]">
          <div className="bg-slate-950 p-2.5 sm:p-3"><div className="space-y-2 pt-4">{[LayoutDashboard, Users, CalendarCheck2, BarChart3].map((Icon, index) => <div key={index} className={`flex h-8 items-center gap-2 rounded-lg px-2 ${index === 0 ? "bg-indigo-600 text-white" : "text-slate-500"}`}><Icon size={13} aria-hidden="true" /><span className="hidden h-1.5 w-12 rounded bg-current opacity-40 sm:block" /></div>)}</div></div>
          <div className="min-w-0 p-3 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-600">Dashboard</p><div className="mt-1 flex items-end justify-between"><p className="text-base font-extrabold text-slate-900 sm:text-lg">Workforce overview</p><CircleUserRound size={22} className="text-indigo-600" aria-hidden="true" /></div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{["Employees", "Departments", "Positions", "Active status"].map((label, index) => <div key={label} className="border-t-2 border-indigo-500 bg-white p-2.5 shadow-sm"><p className="text-[9px] font-semibold text-slate-400">{label}</p><p className="mt-2 text-xs font-extrabold text-slate-800">{index === 3 ? "Current" : "Live"}</p></div>)}</div>
            <div className="mt-3 hidden gap-3 sm:grid sm:grid-cols-[1.3fr_0.7fr]"><div className="bg-white p-3 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-bold text-slate-700">Hiring activity</p><span className="text-[8px] text-slate-400">From records</span></div><div className="mt-5 flex h-28 items-end gap-2 border-b border-l border-slate-100 px-2">{[38, 62, 48, 82, 58, 72].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-indigo-500/75" style={{ height: `${height}%` }} />)}</div></div><div className="bg-white p-3 shadow-sm"><p className="text-[10px] font-bold text-slate-700">Status view</p><div className="mt-5 space-y-4">{["Active", "On leave", "Inactive"].map((label, index) => <div key={label}><div className="flex justify-between text-[8px] text-slate-500"><span>{label}</span><span>Live</span></div><div className="mt-1 h-1.5 bg-slate-100"><div className={`h-full ${index === 0 ? "w-4/5 bg-emerald-500" : index === 1 ? "w-2/5 bg-amber-500" : "w-1/4 bg-slate-400"}`} /></div></div>)}</div></div></div>
            <div className="mt-3 space-y-2 sm:hidden">{["Leave request awaiting review", "Notification delivered"].map((item, index) => <div key={item} className="flex items-center gap-2 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 shadow-sm"><span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-amber-500" : "bg-indigo-500"}`} />{item}</div>)}</div>
          </div>
        </div>
      </div>
      <div className="brand-float-delayed absolute right-0 top-0 z-20 hidden w-[13.5rem] rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur md:block"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">AK</span><div><p className="text-xs font-extrabold text-slate-900">Employee profile</p><p className="mt-1 text-[10px] text-slate-500">Product Design · Active</p></div></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[9px]"><span className="text-slate-400">Own-record access</span><span className="font-bold text-emerald-600">Verified</span></div></div>
      <div className="brand-float-slow absolute -left-1 bottom-1 z-20 w-[12.5rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:left-0 sm:w-[15rem]"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><CalendarCheck2 size={18} aria-hidden="true" /></span><div><p className="text-xs font-extrabold text-slate-900">Annual leave request</p><p className="mt-1 text-[10px] text-slate-500">Awaiting administrator review</p></div></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase text-amber-700">Pending</span><span className="text-[10px] font-bold text-indigo-600">Review →</span></div></div>
      <div className="brand-float-delayed absolute -right-1 bottom-5 z-20 hidden w-[13.5rem] rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-2xl backdrop-blur sm:block"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"><Bell size={17} aria-hidden="true" /></span><div><p className="text-xs font-extrabold text-slate-900">Decision recorded</p><p className="mt-1 text-[10px] text-slate-500">Notification and audit updated</p></div></div></div>
    </div>
  );
}

function PeopleOperationsVisual() {
  const people = [["Nadia Khan", "Product Design", "Active"], ["Omar Farooq", "Engineering", "On Leave"], ["Ayesha Malik", "People Operations", "Active"]];
  return <div className="relative min-h-[31rem]"><div className="absolute inset-x-0 top-0 overflow-hidden border border-slate-200 bg-slate-50 shadow-[0_25px_70px_rgba(15,23,42,0.12)] sm:left-8"><div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><div><p className="text-sm font-extrabold text-slate-950">People directory</p><p className="mt-1 text-xs text-slate-500">Identity connected to structure</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Users size={18} aria-hidden="true" /></span></div><div className="divide-y divide-slate-200 px-4 sm:px-6">{people.map(([name, department, status], index) => <div key={name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4 sm:gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-700">{name.split(" ").map((part) => part[0]).join("")}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{department}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${index === 1 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{status}</span></div>)}</div></div><div className="absolute bottom-0 left-0 w-[82%] border border-indigo-100 bg-white p-5 shadow-xl sm:w-[68%]"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><Building2 size={19} aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Department relationship</p><p className="mt-1 text-sm font-extrabold text-slate-950">People Operations</p></div></div><div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs"><div><p className="text-slate-400">Record status</p><p className="mt-1 font-bold text-slate-800">Current</p></div><div><p className="text-slate-400">Access</p><p className="mt-1 font-bold text-slate-800">Role-aware</p></div></div></div></div>;
}

function LeaveWorkflow() {
  return <div className="mt-12 overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"><div className="grid lg:grid-cols-[1.12fr_0.88fr]"><div className="p-5 sm:p-8 lg:p-10"><div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Leave request</p><h3 className="mt-2 text-2xl font-extrabold text-slate-950">Annual leave</h3><p className="mt-1 text-sm text-slate-500">Submitted by an authenticated employee</p></div><span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Pending review</span></div><div className="grid gap-6 py-7 sm:grid-cols-3">{["Start date", "End date", "Reason"].map((label) => <div key={label}><p className="text-xs font-semibold text-slate-400">{label}</p><div className="mt-2 h-2.5 w-4/5 rounded bg-slate-200" aria-hidden="true" /></div>)}</div><div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row"><span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white"><Check size={17} aria-hidden="true" />Approve</span><span className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700">Reject with reason</span></div></div><div className="border-t border-slate-200 bg-slate-950 p-5 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Decision path</p><ol className="mt-7 space-y-0">{workflowSteps.map((step, index) => <li key={step.label} className="relative flex gap-4 pb-7 last:pb-0">{index < workflowSteps.length - 1 && <span className="absolute left-[0.7rem] top-6 h-full w-px bg-slate-700" aria-hidden="true" />}<span className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-4 border-slate-950 ${step.tone === "amber" ? "bg-amber-400" : step.tone === "indigo" ? "bg-indigo-400" : step.tone === "emerald" ? "bg-emerald-400" : "bg-slate-400"}`} /><div><p className="text-sm font-bold">{step.label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{step.detail}</p></div></li>)}</ol><div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-800 pt-6"><div className="bg-white/[0.06] p-3"><Bell size={16} className="text-indigo-300" aria-hidden="true" /><p className="mt-3 text-xs font-bold">Notification</p></div><div className="bg-white/[0.06] p-3"><FileClock size={16} className="text-indigo-300" aria-hidden="true" /><p className="mt-3 text-xs font-bold">Audit entry</p></div></div></div></div></div>;
}

function PermissionMatrix() {
  return <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.1)]"><div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-slate-200 bg-slate-950 px-4 py-4 text-xs font-bold uppercase tracking-wide text-white sm:px-6"><span>Capability</span><span>Admin</span><span>Employee</span></div><div className="divide-y divide-slate-200">{permissionRows.map((row) => <div key={row.capability} className="grid min-h-14 grid-cols-[1.2fr_0.8fr_0.8fr] items-center px-4 text-xs sm:px-6 sm:text-sm"><span className="font-semibold text-slate-800">{row.capability}</span><PermissionValue value={row.admin} /><PermissionValue value={row.employee} /></div>)}</div><div className="flex items-start gap-3 border-t border-indigo-100 bg-indigo-50 px-5 py-4 text-xs leading-5 text-indigo-900 sm:px-6"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" /><span><strong>Two layers:</strong> interface permissions shape the experience; database policies enforce access.</span></div></div>;
}

function PermissionValue({ value }: { value: string | boolean }) {
  return value ? <span className="flex items-center gap-1.5 font-semibold text-slate-700"><Check size={14} className="text-emerald-600" aria-hidden="true" />{typeof value === "string" ? value : "Allowed"}</span> : <span className="text-slate-400">—</span>;
}

function AnalyticsCanvas() {
  return <div className="relative p-3 sm:p-6" aria-label="Illustrative preview of the workforce analytics interface"><div className="absolute inset-0 -rotate-2 bg-indigo-200/55" aria-hidden="true" /><div className="relative border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-6"><div className="flex items-center justify-between border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Reports</p><p className="mt-1 text-lg font-extrabold text-slate-950">Workforce composition</p></div><span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">Interface preview</span></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{["Employees", "Active", "Departments", "Positions"].map((label) => <div key={label} className="bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-400">{label}</p><p className="mt-2 text-sm font-extrabold text-slate-800">Current records</p></div>)}</div><div className="mt-4 grid gap-4 sm:grid-cols-[1.25fr_0.75fr]"><div className="border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-800">Hiring activity</p><span className="text-[10px] text-slate-400">Joined date</span></div><div className="mt-6 flex h-36 items-end gap-3 border-b border-l border-slate-100 px-3">{[44, 68, 50, 76, 58, 88, 70].map((height, index) => <span key={index} className="flex-1 bg-indigo-500/80" style={{ height: `${height}%` }} />)}</div></div><div className="border border-slate-200 p-4"><p className="text-xs font-bold text-slate-800">Status distribution</p><div className="mt-6 flex aspect-square items-center justify-center rounded-full bg-[conic-gradient(#059669_0_64%,#d97706_64%_82%,#94a3b8_82%)] p-7"><div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center text-[10px] font-bold text-slate-500">Current<br />workforce</div></div></div></div></div></div>;
}

function OperationalFlow() {
  const stages = [{ icon: UserCheck, label: "Decision", detail: "Admin reviews leave", tone: "text-emerald-300" }, { icon: FileClock, label: "Audit record", detail: "Actor and time preserved", tone: "text-indigo-300" }, { icon: Bell, label: "Notification", detail: "Employee receives the result", tone: "text-amber-300" }];
  return <ol className="grid gap-3 sm:grid-cols-3">{stages.map(({ icon: Icon, label, detail, tone }, index) => <li key={label} className="relative border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:min-h-48 sm:p-6"><div className="flex items-center justify-between"><Icon size={22} className={tone} aria-hidden="true" /><span className="font-mono text-xs text-slate-500">0{index + 1}</span></div><p className="mt-10 text-base font-extrabold">{label}</p><p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>{index < stages.length - 1 && <ArrowRight className="absolute -right-5 top-1/2 z-10 hidden text-slate-600 sm:block" size={18} aria-hidden="true" />}</li>)}</ol>;
}

function LandingFooter() {
  return <footer className="border-t border-slate-800 bg-[#090f1d] text-slate-300"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"><div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]"><div><Link href="/" className="inline-flex" aria-label="HR home"><BrandLogo variant="inverse" showDescriptor decorative markClassName="text-indigo-500" /></Link><p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">A focused HR management system for connected records, controlled decisions, and visible outcomes.</p></div>{footerGroups.map((group) => <div key={group.title}><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{group.title}</p><ul className="mt-5 space-y-3 text-sm">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="transition hover:text-white">{label}</Link></li>)}</ul></div>)}<div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Technology</p><ul className="mt-5 space-y-3 text-sm text-slate-300"><li>Next.js + TypeScript</li><li>Supabase Auth</li><li>PostgreSQL + RLS</li></ul></div></div><div className="mt-14 flex flex-col gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 HR. Portfolio HR Management System.</p><div className="flex gap-5"><a href="https://github.com/link4azeesham06-debug/employee-management-system" target="_blank" rel="noreferrer" className="transition hover:text-white">GitHub<span className="sr-only"> (opens in a new tab)</span></a><a href="https://github.com/link4azeesham06-debug/employee-management-system#readme" target="_blank" rel="noreferrer" className="transition hover:text-white">Documentation<span className="sr-only"> (opens in a new tab)</span></a></div></div></div></footer>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{children}</p>;
}
