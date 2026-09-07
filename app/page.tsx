import Link from "next/link";
import PublicNavbar from "@/components/landing/PublicNavbar";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Database,
  FileClock,
  Fingerprint,
  LayoutDashboard,
  LockKeyhole,
  MonitorSmartphone,
  Network,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

const features = [
  { title: "Employee management", description: "Create, update, search, filter, and organize employee records from one focused workspace.", icon: Users, wide: true },
  { title: "Department structure", description: "Maintain departments and keep workforce assignments connected to the organization.", icon: Building2 },
  { title: "Reports and analytics", description: "Understand headcount, employment status, department distribution, and hiring activity.", icon: BarChart3 },
  { title: "Role-based access", description: "Give administrators operational control while employees securely access their own record.", icon: Fingerprint, wide: true },
  { title: "Audit history", description: "Review employee and department changes with performer details and timestamps.", icon: FileClock, wide: true },
  { title: "Persistent notifications", description: "Keep account-specific updates synchronized across the navbar and notification workspace.", icon: Bell },
];

const technologies = ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Row Level Security"];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white text-slate-950">
      <PublicNavbar />
      <main>
        <section className="relative isolate overflow-hidden border-b border-slate-200 bg-slate-950" aria-labelledby="hero-title">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_15%,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(139,92,246,0.18),transparent_30%),linear-gradient(to_bottom,#0f172a,#111827)]" />
          <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden="true" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(34rem,1.12fr)] lg:px-8 lg:pb-28 lg:pt-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3.5 py-2 text-xs font-semibold text-indigo-200 backdrop-blur"><Sparkles size={14} aria-hidden="true" />Secure workforce operations, clearly organized</div>
              <h1 id="hero-title" className="mt-7 text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">Every workforce decision, in one clear view.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">HR Pro brings employee records, departments, reporting, audit history, and account-specific notifications into a secure operational workspace.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Try the demo <ArrowRight size={17} aria-hidden="true" /></Link>
                <Link href="#features" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">Explore features <ChevronRight size={17} aria-hidden="true" /></Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400" aria-label="Product assurances">
                {["Supabase authentication", "Role-aware access", "Responsive workspace"].map((item) => <li key={item} className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" aria-hidden="true" />{item}</li>)}
              </ul>
            </div>
            <HeroProductMockup />
          </div>
        </section>

        <section id="features" className="scroll-mt-24 bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="One connected workspace" title="Built around real HR operations" description="Every capability shown here is part of the application—designed to keep everyday workforce administration clear, traceable, and secure." />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon, wide }, index) => (
                <article key={title} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-7 ${wide ? "lg:col-span-2" : ""}`}>
                  <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-indigo-100/60 blur-2xl transition group-hover:bg-indigo-200/70" aria-hidden="true" />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100"><Icon size={21} aria-hidden="true" /></div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">0{index + 1}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="scroll-mt-24 overflow-hidden bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
            <div>
              <SectionHeading eyebrow="Security by design" title="The right view for every role" description="Authentication, protected routes, and database policies work together so access stays aligned with each account." align="left" />
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <SecurityPoint icon={LockKeyhole} title="Supabase Auth" description="Session-based sign-in and refresh persistence without storing passwords in the application." />
                <SecurityPoint icon={Database} title="Row Level Security" description="Database policies enforce account-level data access beyond the interface layer." />
                <SecurityPoint icon={ShieldCheck} title="Protected routes" description="Administrative workspaces remain unavailable to employee accounts." />
                <SecurityPoint icon={UserCheck} title="Own-record access" description="Employees securely access their linked personal workforce record." />
              </div>
            </div>
            <AccessMatrix />
          </div>
        </section>

        <section id="analytics" className="scroll-mt-24 border-y border-slate-200 bg-slate-950 py-20 text-white sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(32rem,1.2fr)] lg:gap-16 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Workforce intelligence</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Reporting grounded in current records.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">Headcount metrics, department distribution, status insights, and hiring activity are calculated from the workforce data available to the signed-in account.</p>
              <ul className="mt-7 space-y-3 text-sm text-slate-300">{["Filter reports by department, status, and joined date", "Compare active, on-leave, and inactive records", "Export filtered workforce reporting as CSV"].map((item) => <li key={item} className="flex items-start gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />{item}</li>)}</ul>
            </div>
            <AnalyticsPreview />
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Operational awareness" title="Changes stay visible. Updates stay connected." description="Administrative actions feed a persistent audit trail, while user-specific notifications keep relevant activity close at hand." />
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <OperationalCard icon={ClipboardCheck} eyebrow="Audit trail" title="A dependable record of operational change" items={["Employee create, update, status, and delete activity", "Department mutation history", "Performer identity, role, and valid timestamps", "Search, filters, export, and administrative cleanup"]} />
              <OperationalCard icon={Bell} eyebrow="Notifications" title="Account-specific updates that persist" items={["Synchronized navbar unread count", "Mark one or every notification as read", "Refresh-persistent Supabase records", "User-level isolation through database policies"]} />
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-slate-50 py-20 sm:py-24" aria-labelledby="responsive-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"><MonitorSmartphone size={23} aria-hidden="true" /></div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Responsive by default</p>
                <h2 id="responsive-title" className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Work comfortably at every screen size.</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">The workspace adapts from full desktop tables to focused mobile cards, with navigation and controls designed to remain usable across devices.</p>
              </div>
              <ResponsivePreview />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-12" aria-label="Technology architecture">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Built on a modern, typed, policy-aware stack</p>
            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{technologies.map((technology) => <li key={technology} className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-700">{technology}</li>)}</ul>
          </div>
        </section>

        <section id="demo" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-indigo-600 px-5 py-12 text-white shadow-2xl shadow-indigo-950/20 sm:px-10 sm:py-14 lg:px-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_10%_100%,rgba(55,48,163,0.65),transparent_38%)]" aria-hidden="true" />
            <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_auto]">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">Explore the working product</p><h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">See secure HR operations from both sides.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Use the intentionally public portfolio accounts to explore administrative workflows or the restricted employee experience.</p><div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2"><DemoCredential role="Admin demo" email="admin@hr.com" password="admin123" /><DemoCredential role="Employee demo" email="employee@hrpro.demo" password="employee123" /></div></div>
              <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600">Sign in to HR Pro <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8"><Link href="/" className="inline-flex items-center gap-2.5 font-bold text-white" aria-label="HR Pro home"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500"><ShieldCheck size={19} aria-hidden="true" /></span>HR Pro</Link><nav aria-label="Footer navigation"><ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm"><li><Link className="transition hover:text-white" href="#features">Features</Link></li><li><Link className="transition hover:text-white" href="#security">Security</Link></li><li><Link className="transition hover:text-white" href="#analytics">Analytics</Link></li><li><Link className="transition hover:text-white" href="/login">Demo sign in</Link></li></ul></nav><p className="text-xs text-slate-500">HR management portfolio application</p></div>
      </footer>
    </div>
  );
}

function HeroProductMockup() {
  return <div className="relative mx-auto w-full max-w-3xl lg:translate-x-6" aria-label="HR Pro dashboard interface preview"><div className="absolute -inset-6 rounded-[2rem] bg-indigo-500/15 blur-3xl" aria-hidden="true" /><div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-2 shadow-2xl shadow-black/35 backdrop-blur sm:p-3"><div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-white px-3"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><div className="mx-auto h-5 w-40 rounded-md bg-slate-100" /></div><div className="grid min-h-[390px] grid-cols-[3.5rem_1fr] sm:grid-cols-[9rem_1fr]"><div className="bg-slate-950 p-3 text-white"><div className="flex items-center gap-2 text-xs font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600"><ShieldCheck size={14} /></span><span className="hidden sm:inline">HR Pro</span></div><div className="mt-8 space-y-2">{[LayoutDashboard, Users, Building2, BarChart3, Bell].map((Icon, index) => <div key={index} className={`flex h-8 items-center gap-2 rounded-lg px-2 ${index === 0 ? "bg-indigo-600" : "text-slate-500"}`}><Icon size={13} aria-hidden="true" /><span className="hidden h-1.5 w-14 rounded bg-current opacity-40 sm:block" /></div>)}</div></div><div className="min-w-0 p-3 sm:p-5"><div className="flex items-center justify-between"><div><div className="h-2 w-20 rounded bg-indigo-200" /><div className="mt-2 h-4 w-32 rounded bg-slate-800" /></div><div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600"><CircleUserRound size={16} /></div></div><div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4">{[Users, Building2, Network, UserCheck].map((Icon, index) => <div key={index} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Icon size={14} /></div><div className="mt-3 h-2 w-14 rounded bg-slate-200" /><div className="mt-2 h-4 w-8 rounded bg-slate-800" /></div>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-[1.25fr_0.75fr]"><div className="rounded-xl border border-slate-200 bg-white p-3"><div className="h-2.5 w-28 rounded bg-slate-700" /><div className="mt-5 flex h-32 items-end gap-2 border-b border-l border-slate-100 px-2">{[45, 72, 56, 88, 64, 78].map((height, index) => <div key={index} className="flex-1 rounded-t bg-indigo-500/80" style={{ height: `${height}%` }} />)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-3"><div className="h-2.5 w-24 rounded bg-slate-700" /><div className="mt-5 space-y-3">{["bg-emerald-500", "bg-amber-500", "bg-red-500"].map((tone) => <div key={tone} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${tone}`} /><span className="h-2 flex-1 rounded bg-slate-100" /><span className="h-2 w-5 rounded bg-slate-200" /></div>)}</div></div></div></div></div></div></div><div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck size={18} /></span><span><span className="block text-xs font-bold text-slate-900">Policy-aware access</span><span className="block text-[11px] text-slate-500">Protected at the data layer</span></span></div></div>;
}

function SectionHeading({ eyebrow, title, description, align = "center" }: { eyebrow: string; title: string; description: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-xl"}><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2><p className="mt-4 text-base leading-7 text-slate-600">{description}</p></div>;
}

function SecurityPoint({ icon: Icon, title, description }: { icon: typeof ShieldCheck; title: string; description: string }) {
  return <article><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19} aria-hidden="true" /></div><h3 className="mt-4 text-sm font-bold text-slate-950">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p></article>;
}

function AccessMatrix() {
  const rows = [{ feature: "Own profile", admin: true, employee: true }, { feature: "Employee records", admin: true, employee: "Own only" }, { feature: "Departments", admin: true, employee: false }, { feature: "Reports and audit", admin: true, employee: false }, { feature: "Notifications", admin: true, employee: true }];
  return <div className="relative"><div className="absolute -inset-8 rounded-full bg-indigo-100/70 blur-3xl" aria-hidden="true" /><div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/8"><div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4"><div><p className="text-sm font-bold text-slate-950">Access policy</p><p className="mt-0.5 text-xs text-slate-500">Role-based workspace permissions</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Enforced</span></div><div className="grid grid-cols-[1.2fr_0.8fr_0.9fr] border-b border-slate-200 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:px-5"><span>Workspace</span><span>Admin</span><span>Employee</span></div>{rows.map((row) => <div key={row.feature} className="grid min-h-14 grid-cols-[1.2fr_0.8fr_0.9fr] items-center border-b border-slate-100 px-4 text-sm last:border-0 sm:px-5"><span className="font-medium text-slate-700">{row.feature}</span><AccessValue value={row.admin} /><AccessValue value={row.employee} /></div>)}</div></div>;
}

function AccessValue({ value }: { value: boolean | string }) {
  if (value === false) return <span className="font-medium text-slate-400">Restricted</span>;
  return <span className="flex items-center gap-1.5 font-semibold text-emerald-700"><Check size={14} aria-hidden="true" />{value === true ? "Allowed" : value}</span>;
}

function AnalyticsPreview() {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl backdrop-blur sm:p-5"><div className="rounded-xl bg-white p-4 text-slate-950 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold">Workforce analytics</p><p className="mt-1 text-xs text-slate-500">Interface preview · values populate from authenticated records</p></div><span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">Live record data</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold text-slate-600">Department distribution</p><div className="mt-5 flex h-36 items-center justify-center"><div className="relative h-28 w-28 rounded-full bg-[conic-gradient(#4f46e5_0_38%,#818cf8_38%_62%,#059669_62%_82%,#d97706_82%)]"><div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-center text-[10px] font-semibold text-slate-500">Current<br />records</div></div></div></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold text-slate-600">Employment status</p><div className="mt-6 space-y-5">{[["Active", "bg-emerald-500", "w-4/5"], ["On leave", "bg-amber-500", "w-2/5"], ["Inactive", "bg-red-500", "w-1/4"]].map(([label, color, width]) => <div key={label}><div className="mb-1.5 flex justify-between text-[10px] font-medium text-slate-500"><span>{label}</span><span>Calculated live</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color} ${width}`} /></div></div>)}</div></div></div><p className="mt-3 text-center text-[11px] text-slate-400">Visual structure only; no production metrics are represented here.</p></div></div>;
}

function OperationalCard({ icon: Icon, eyebrow, title, items }: { icon: typeof Bell; eyebrow: string; title: string; items: string[] }) {
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50/70 p-6 sm:p-7"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white"><Icon size={21} aria-hidden="true" /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p><h3 className="mt-2 text-xl font-bold text-slate-950">{title}</h3></div><ul className="grid gap-3 p-6 text-sm text-slate-600 sm:p-7">{items.map((item) => <li key={item} className="flex items-start gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{item}</li>)}</ul></article>;
}

function ResponsivePreview() {
  return <div className="relative min-h-[370px] sm:min-h-[440px]" aria-label="Responsive application interface preview"><div className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-2xl border border-slate-300 bg-white p-2 shadow-xl sm:p-3"><div className="flex h-7 items-center gap-1 border-b border-slate-100 px-2"><span className="h-2 w-2 rounded-full bg-slate-200" /><span className="h-2 w-2 rounded-full bg-slate-200" /><span className="h-2 w-2 rounded-full bg-slate-200" /></div><div className="grid h-64 grid-cols-[3.5rem_1fr] sm:h-80 sm:grid-cols-[7rem_1fr]"><div className="bg-slate-950 p-2"><div className="h-6 w-6 rounded-lg bg-indigo-600" /><div className="mt-7 space-y-2">{Array.from({ length: 5 }, (_, index) => <div key={index} className={`h-6 rounded ${index === 0 ? "bg-indigo-600" : "bg-white/5"}`} />)}</div></div><div className="bg-slate-50 p-3 sm:p-5"><div className="h-3 w-28 rounded bg-slate-800" /><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-16 rounded-lg border border-slate-200 bg-white" />)}</div><div className="mt-3 h-32 rounded-lg border border-slate-200 bg-white" /></div></div></div><div className="absolute bottom-0 right-0 w-[38%] min-w-32 overflow-hidden rounded-[1.5rem] border-[5px] border-slate-900 bg-white shadow-2xl"><div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-slate-900" /><div className="p-2.5"><div className="flex items-center justify-between"><div className="h-2.5 w-12 rounded bg-slate-800" /><div className="h-6 w-6 rounded-lg bg-indigo-50" /></div><div className="mt-4 space-y-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-lg border border-slate-200 p-2"><div className="h-2 w-14 rounded bg-slate-300" /><div className="mt-2 h-1.5 w-full rounded bg-slate-100" /><div className="mt-1 h-1.5 w-2/3 rounded bg-slate-100" /></div>)}</div></div></div></div>;
}

function DemoCredential({ role, email, password }: { role: string; email: string; password: string }) {
  return <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur"><p className="text-xs font-bold text-white">{role}</p><p className="mt-1 break-all text-xs text-indigo-100">{email}</p><p className="mt-0.5 text-xs text-indigo-100">Password: {password}</p></div>;
}
