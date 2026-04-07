import type { Metadata } from "next";
import Link from "next/link";
import {
  Database,
  Zap,
  Shield,
  Search,
  BarChart3,
  GitBranch,
  Terminal,
  Layers,
  ChevronRight,
  Star,
  CheckCircle2,
  ArrowRight,
  Globe,
  Lock,
  Cpu,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Metadata is re-exported from layout – page-level override          */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: {
    absolute:
      "DBOrbit – Multi-Database Admin Panel | MongoDB · PostgreSQL · MySQL",
  },
  description:
    "DBOrbit is a production-grade, open-source web GUI for MongoDB, PostgreSQL and MySQL. Explore databases, run queries, manage schemas and indexes – all from one beautiful dashboard.",
  keywords: [
    "database admin panel",
    "mongodb gui",
    "postgresql admin",
    "mysql admin",
    "database management tool",
    "open source database ui",
    "next.js database dashboard",
    "db orbit",
    "dbadmin",
    "sql client web",
  ],
  openGraph: {
    title: "DBOrbit – Multi-Database Admin Panel",
    description:
      "Production-grade web GUI for MongoDB, PostgreSQL, and MySQL. Explorer, CRUD, query builder, schema viewer & index management in one place.",
    type: "website",
    url: "https://dborbit.app",
    siteName: "DBOrbit",
  },
  twitter: {
    card: "summary_large_image",
    title: "DBOrbit – Multi-Database Admin Panel",
    description:
      "Production-grade web GUI for MongoDB, PostgreSQL, and MySQL.",
  },
  alternates: { canonical: "https://dborbit.app" },
};

/* ------------------------------------------------------------------ */
/*  Static data                                                         */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Database,
    title: "Multi-Database Support",
    description:
      "Connect to MongoDB, PostgreSQL, and MySQL from a single unified interface. Switch between databases effortlessly.",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
  },
  {
    icon: Terminal,
    title: "Visual Query Builder",
    description:
      "Build complex queries visually without writing raw SQL or MQL. Filter, sort, project, and paginate with ease.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    icon: Layers,
    title: "Schema & Index Viewer",
    description:
      "Inspect collection schemas, view field types and indexes in real-time. Understand your data structure at a glance.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: BarChart3,
    title: "Aggregation Builder",
    description:
      "Compose MongoDB aggregation pipelines visually, preview results, and export pipeline code instantly.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    icon: Zap,
    title: "Lightning-Fast CRUD",
    description:
      "Create, read, update, and delete records at speed. Inline editing, JSON view, and bulk operations included.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: Shield,
    title: "Secure Connections",
    description:
      "Credentials stay in your browser via local storage. No data ever touches a third-party server.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
];

const databases = [
  {
    name: "MongoDB",
    description: "NoSQL document database",
    badge: "Full Support",
    gradient: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/30",
    dot: "bg-green-400",
    features: ["Collections", "Aggregation", "Indexes", "Schema"],
  },
  {
    name: "PostgreSQL",
    description: "Advanced open-source RDBMS",
    badge: "Full Support",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
    features: ["Tables", "SQL Queries", "Indexes", "Schema"],
  },
  {
    name: "MySQL",
    description: "World's most popular RDBMS",
    badge: "Full Support",
    gradient: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
    features: ["Tables", "SQL Queries", "Indexes", "Schema"],
  },
];

const steps = [
  {
    number: "01",
    title: "Add a Connection",
    description:
      "Enter your database URI, host, port, and credentials. Everything is encrypted and stored locally.",
    icon: Globe,
  },
  {
    number: "02",
    title: "Explore Your Data",
    description:
      "Browse databases, collections and tables in the sidebar tree. Click any resource to open it instantly.",
    icon: Search,
  },
  {
    number: "03",
    title: "Query & Manage",
    description:
      "Use the visual query builder, write raw queries, edit records inline, manage indexes and schemas.",
    icon: Cpu,
  },
];

const stats = [
  { value: "3+", label: "Databases Supported" },
  { value: "10+", label: "Built-in Features" },
  { value: "100%", label: "Open Source" },
  { value: "0", label: "Data Sent to Servers" },
];

/* ------------------------------------------------------------------ */
/*  Components                                                          */
/* ------------------------------------------------------------------ */

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[hsl(219,42%,7%)]/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 border border-teal-500/30 group-hover:bg-teal-500/30 transition-colors">
            <Database className="h-4 w-4 text-teal-400" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            DB<span className="text-teal-400">Orbit</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <li>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
          </li>
          <li>
            <a href="#databases" className="hover:text-white transition-colors">
              Databases
            </a>
          </li>
          <li>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
          </li>
        </ul>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-400 transition-colors"
        >
          Open Dashboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-blue-600/8 blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-medium text-teal-400">
          <Star className="h-3 w-3 fill-teal-400" />
          Open-Source · Production-Ready · Privacy-First
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          The Database GUI{" "}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Built for Developers
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Manage <strong className="text-white">MongoDB</strong>,{" "}
          <strong className="text-white">PostgreSQL</strong>, and{" "}
          <strong className="text-white">MySQL</strong> from one beautiful
          interface. Visual query builder, schema viewer, CRUD operations, and
          aggregation pipelines – all in your browser.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-teal-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-teal-500/30 hover:bg-teal-400 transition-all hover:shadow-teal-400/40 hover:-translate-y-0.5"
          >
            Start for Free
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/10 transition-all hover:-translate-y-0.5"
          >
            Explore Features
          </a>
        </div>

        {/* Trust points */}
        <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
          {["No credit card required", "No signup needed", "Self-hosted"].map(
            (t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                {t}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Dashboard preview mockup */}
      <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-white/10 bg-[hsl(219,42%,10%)] p-2 shadow-2xl shadow-black/60 ring-1 ring-white/5">
          {/* Fake window chrome */}
          <div className="mb-2 flex items-center gap-2 px-2 pt-1">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-slate-600">
              DBOrbit Dashboard
            </span>
          </div>
          {/* Mockup content */}
          <div className="rounded-xl border border-white/5 bg-[hsl(219,42%,7%)] p-4 min-h-[280px] sm:min-h-[340px] overflow-hidden">
            <div className="flex h-full gap-3">
              {/* Sidebar */}
              <div className="w-48 shrink-0 hidden sm:block rounded-lg border border-white/5 bg-white/3 p-3 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">
                  Connections
                </div>
                {["production-db", "staging-db", "local-dev"].map((c, i) => (
                  <div
                    key={c}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                      i === 0
                        ? "bg-teal-500/15 text-teal-400"
                        : "text-slate-500"
                    }`}
                  >
                    <Database className="h-3 w-3" />
                    {c}
                  </div>
                ))}
                <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  Collections
                </div>
                {["users", "products", "orders", "logs"].map((c, i) => (
                  <div
                    key={c}
                    className={`ml-2 flex items-center gap-1.5 rounded px-2 py-1 text-xs ${
                      i === 0 ? "text-teal-400" : "text-slate-600"
                    }`}
                  >
                    <GitBranch className="h-2.5 w-2.5" />
                    {c}
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div className="flex-1 space-y-3">
                {/* Tab bar */}
                <div className="flex gap-2">
                  {["Records", "Query", "Schema", "Indexes"].map((t, i) => (
                    <div
                      key={t}
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        i === 0
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                          : "text-slate-600 border border-transparent"
                      }`}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                {/* Table header */}
                <div className="rounded-lg border border-white/5 overflow-hidden">
                  <div className="grid grid-cols-4 border-b border-white/5 bg-white/3 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    <span>_id</span>
                    <span>name</span>
                    <span>email</span>
                    <span>createdAt</span>
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 px-3 py-2 text-[10px] text-slate-500 border-b border-white/3 hover:bg-white/3"
                    >
                      <span className="text-teal-600 font-mono">64f3a…</span>
                      <span>User {i + 1}</span>
                      <span>user{i + 1}@email.com</span>
                      <span className="text-slate-600">2024-0{i + 1}-15</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Glow under mockup */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 h-32 w-2/3 rounded-full bg-teal-500/10 blur-3xl -z-10"
        />
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section
      aria-label="Key statistics"
      className="border-y border-white/5 bg-white/2 py-10"
    >
      <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-y-8 px-4 sm:grid-cols-4 sm:px-6">
        {stats.map(({ value, label }) => (
          <li key={label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-b from-white to-slate-400 bg-clip-text">
              {value}
            </span>
            <span className="text-sm text-slate-500">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-3">
            Everything you need
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Powerful features,{" "}
            <span className="text-slate-400">zero complexity</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            DBOrbit packs professional database management tools into a clean,
            intuitive interface that gets out of your way.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, color, bg, border }) => (
            <article
              key={title}
              className={`rounded-2xl border ${border} ${bg} p-6 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30`}
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} border ${border}`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DatabasesSection() {
  return (
    <section
      id="databases"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,hsl(168,89%,47%,0.06)_0%,transparent_70%)]"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-3">
            Supported databases
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            One tool,{" "}
            <span className="text-slate-400">every database</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Whether you use a document store, a relational database, or both –
            DBOrbit has you covered.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {databases.map(({ name, description, badge, gradient, border, dot, features: dbFeatures }) => (
            <article
              key={name}
              className={`rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-6 backdrop-blur transition-all hover:-translate-y-1`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${dot} shadow-lg`} />
                  <h3 className="text-xl font-bold text-white">{name}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                  {badge}
                </span>
              </div>
              <p className="mb-5 text-sm text-slate-400">{description}</p>
              <ul className="space-y-2">
                {dbFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-3">
            Get started in minutes
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            How it works
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            aria-hidden
            className="absolute top-12 left-[calc(50%-1px)] hidden h-[calc(100%-6rem)] w-px bg-gradient-to-b from-teal-500/50 via-cyan-500/30 to-transparent lg:block"
          />

          <div className="space-y-12">
            {steps.map(({ number, title, description, icon: Icon }, idx) => (
              <div
                key={number}
                className={`flex flex-col sm:flex-row items-center gap-6 ${
                  idx % 2 === 1 ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className="flex-1 rounded-2xl border border-white/8 bg-white/3 p-6 backdrop-blur">
                  <div className="mb-3 text-xs font-bold tracking-widest text-teal-500">
                    STEP {number}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {description}
                  </p>
                </div>

                {/* Icon node */}
                <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 shadow-lg shadow-teal-500/10">
                  <Icon className="h-8 w-8 text-teal-400" />
                </div>

                {/* Spacer */}
                <div className="flex-1 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-green-500/30 bg-green-500/10">
            <Lock className="h-7 w-7 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Your data never leaves your browser
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              DBOrbit connects directly from your browser to your database.
              Credentials are saved in local storage only – no back-end proxy,
              no analytics, no telemetry. Your connection strings and data stay{" "}
              <strong className="text-white">100% private</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(168,89%,47%,0.12)_0%,transparent_65%)]" />
      </div>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Ready to orbit your{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            databases?
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          No signup, no credit card. Open the dashboard and connect your first
          database in under 60 seconds.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-teal-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-teal-500/30 hover:bg-teal-400 transition-all hover:-translate-y-1"
          >
            Launch Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 border border-teal-500/30">
              <Database className="h-3.5 w-3.5 text-teal-400" />
            </span>
            <span className="text-sm font-bold text-white">
              DB<span className="text-teal-400">Orbit</span>
            </span>
          </Link>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#databases" className="hover:text-white transition-colors">
                  Databases
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} DBOrbit. Open-source & free.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(219,42%,7%)] text-white">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <DatabasesSection />
        <HowItWorksSection />
        <PrivacySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

