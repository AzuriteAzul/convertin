import Link from "next/link";
import { ArrowRight, FileText, Sparkles, Download, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8">
          <Sparkles className="h-4 w-4" />
          AI-Powered CV Generator
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          Turn Your LinkedIn Into a{" "}
          <span className="text-blue-600">Job-Winning CV</span> in 60 Seconds
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-500">
          Export your LinkedIn profile as PDF, upload it here, and our AI
          generates a beautiful, tailored one-page CV for your target role.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            Upload LinkedIn PDF
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          Don't have a PDF? On LinkedIn, go to your profile → "More..." → "Save
          to PDF"
        </p>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-zinc-900">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <StepCard
              step="1"
              icon={<FileText className="h-6 w-6" />}
              title="Export LinkedIn PDF"
              description="Go to your LinkedIn profile, click 'More...' and 'Save to PDF'. Upload it here."
            />
            <StepCard
              step="2"
              icon={<Sparkles className="h-6 w-6" />}
              title="AI Extracts & Tailors"
              description="AI reads your profile and curates the most relevant experience for your target role."
            />
            <StepCard
              step="3"
              icon={<Download className="h-6 w-6" />}
              title="Download Your CV"
              description="Get a clean, professional, Western-style one-page CV as PDF. Ready to send to recruiters."
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-zinc-900">
          Ready to land your next job?
        </h2>
        <p className="mt-3 max-w-md text-zinc-500">
          No sign-up. No login. Just your LinkedIn PDF and a target role.
        </p>
        <Link
          href="/generate"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-zinc-800"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-zinc-100 px-4 py-8 text-center text-sm text-zinc-400">
        ConvertIn — AI-powered CVs from your LinkedIn profile. No data stored
        permanently.
      </footer>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-500">
        Step {step}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}
