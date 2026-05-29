"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";

interface CvData {
  id: string;
  targetRole: string;
}

export default function PreviewPage() {
  const params = useParams();
  const cvId = params.cvId as string;
  const [cv, setCv] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/cv/${cvId}`)
      .then((res) => {
        if (!res.ok) throw new Error("CV not found");
        return res.json();
      })
      .then((data) => setCv(data.cv))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cvId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-zinc-500">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-zinc-600">{error || "CV not found"}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-blue-600 underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">
            Your CV — {cv.targetRole}
          </h1>
          <a
            href={`/api/cv/${cvId}/pdf?download=1`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
          <iframe
            src={`/api/cv/${cvId}/pdf`}
            className="h-[900px] w-full"
            title="CV Preview"
          />
        </div>
      </div>
    </div>
  );
}
