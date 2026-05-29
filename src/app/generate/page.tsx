"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, FileText } from "lucide-react";
import Link from "next/link";
import { ProfileEditor } from "@/components/ProfileEditor";
import { RoleSelector } from "@/components/RoleSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { PhotoUploader } from "@/components/PhotoUploader";
import { ColorPicker } from "@/components/ColorPicker";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { Profile } from "@/types";

const TEMPLATE_NAMES: Record<string, string> = {
  modern: "Modern Creative",
  professional: "Professional",
  harvard: "Harvard",
  simple: "Simple",
};

function GeneratePageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<GeneratePageLoading />}>
      <GeneratePageContent />
    </Suspense>
  );
}

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedCvId, setGeneratedCvId] = useState<string | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [template, setTemplate] = useState("modern");
  const [accentColor, setAccentColor] = useState("#1a365d");
  const [language, setLanguage] = useState("en");
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || "");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/profiles/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject("expired")))
      .then((d) => {
        setProfile(d.profile);
        setPhotoUrl(d.profile.photoUrl || "");
      })
      .catch(() => {
        setError("Profile not found or expired");
        toast.error("Link may have expired");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handlePdfUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/profiles/pdf", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Upload failed");
      }
      const data = await res.json();
      // Fetch the newly created profile
      const profileRes = await fetch(`/api/profiles/${data.token}`);
      if (!profileRes.ok) throw new Error("Could not load profile");
      const profileData = await profileRes.json();
      setProfile(profileData.profile);
      setPhotoUrl(profileData.profile.photoUrl || "");
      // Update URL with token
      window.history.replaceState(null, "", `/generate?token=${data.token}`);
      // Update token for generation
      (window as any).__profileToken = data.token;
      toast.success("Profile extracted! Review and edit below.");
    } catch (err: any) {
      toast.error(err.message || "Failed to process PDF");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleGenerate = useCallback(
    async (targetRole: string) => {
      const t = token || (window as any).__profileToken;
      if (!t) {
        toast.error("No profile loaded");
        return;
      }
      setGenerating(true);
      try {
        // Save the profile first so the latest edits are persisted
        const saveRes = await fetch(`/api/profiles/${t}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: profile?.fullName,
            headline: profile?.headline,
            about: profile?.about,
            location: profile?.location,
            email: profile?.email,
            phone: profile?.phone,
            linkedinUrl: profile?.linkedinUrl,
            experience: profile?.experience,
            education: profile?.education,
            skills: profile?.skills,
            certifications: profile?.certifications,
            languages: profile?.languages,
          }),
        });
        if (saveRes.ok) {
          const saveData = await saveRes.json();
          setProfile(saveData.profile);
        }

        const res = await fetch("/api/cv/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileToken: t,
            targetRole,
            template,
            accentColor,
            language,
            email: profile?.email || "",
            phone: profile?.phone || "",
            linkedinUrl: profile?.linkedinUrl || "",
            photoUrl: photoUrl || "",
          }),
        });
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error || "Failed");
        }
        const data = await res.json();
        setGeneratedCvId(data.cvId);
        setGeneratedTemplate(template);
        toast.success("CV generated! Scroll down to preview.");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setGenerating(false);
      }
    },
    [token, template, accentColor, language, profile, photoUrl],
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  // No profile yet - show PDF upload
  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to home
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-zinc-900">
          Upload Your LinkedIn PDF
        </h1>
        <p className="mt-3 text-zinc-500">
          On LinkedIn, go to your profile → click <strong>"More..."</strong> →{" "}
          <strong>"Save to PDF"</strong>. Upload that file here.
        </p>

        <div className="mt-8">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePdfUpload(f);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-zinc-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Extracting profile data with AI...
              </>
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="font-medium">
                  Click to upload your LinkedIn PDF
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Profile loaded - show editor
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
        ← Back to home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        Generate Your Tailored CV
      </h1>

      {/* Photo upload */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Profile Photo</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add a professional photo to your CV.
        </p>
        <div className="mt-4">
          <PhotoUploader
            token={token || (window as any).__profileToken || ""}
            photoUrl={photoUrl}
            onPhotoChange={(url) => setPhotoUrl(url)}
          />
        </div>
      </div>

      <div className="mt-6">
        <ProfileEditor
          profile={profile}
          token={token || (window as any).__profileToken || ""}
          onUpdate={(u) => setProfile(u)}
        />
      </div>
      <div className="mt-6">
        <TemplateSelector
          selected={template}
          onSelect={setTemplate}
          disabled={generating}
        />
      </div>
      <div className="mt-6">
        <ColorPicker
          selected={accentColor}
          onSelect={setAccentColor}
          disabled={generating}
        />
      </div>
      <div className="mt-6">
        <LanguageSelector
          selected={language}
          onSelect={setLanguage}
          disabled={generating}
        />
      </div>
      <div className="mt-6">
        <RoleSelector onGenerate={handleGenerate} generating={generating} />
      </div>
      {generating && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" /> AI is crafting your CV...
          (~10-20 seconds)
        </div>
      )}
      {generatedCvId && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">
              Generated with the{" "}
              <span className="font-semibold">
                {TEMPLATE_NAMES[generatedTemplate || "modern"]}
              </span>{" "}
              template
            </p>
          </div>
          <iframe
            src={`/api/cv/${generatedCvId}/pdf`}
            className="h-[800px] w-full rounded-lg border border-zinc-200"
            title="CV Preview"
          />
          <div className="mt-4 flex justify-center gap-4">
            <a
              href={`/api/cv/${generatedCvId}/pdf?download=1`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-700"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
