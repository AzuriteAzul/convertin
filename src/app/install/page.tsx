import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export default function InstallPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
        ← Back to home
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-zinc-900">
        How to export your LinkedIn profile
      </h1>
      <p className="mt-3 text-zinc-500">
        We use LinkedIn's built-in PDF export — no extension needed.
      </p>

      <div className="mt-10 space-y-8">
        <Step
          num={1}
          title="Go to your LinkedIn profile"
          desc="Visit linkedin.com/in/yourname"
        />
        <Step
          num={2}
          title='Click "More..."'
          desc="Find the More button below your profile picture."
        />
        <Step
          num={3}
          title='Select "Save to PDF"'
          desc="LinkedIn will generate a PDF of your entire profile."
        />
        <Step
          num={4}
          title="Upload it here"
          desc={
            <>
              <Link
                href="/generate"
                className="font-medium text-blue-600 underline"
              >
                Go to the generate page
              </Link>{" "}
              and upload the PDF.
            </>
          }
        />
      </div>

      <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">
            Ready to get started?
          </span>
        </div>
        <Link
          href="/generate"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Upload your LinkedIn PDF <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
        {num}
      </div>
      <div>
        <h3 className="font-semibold text-zinc-900">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}
