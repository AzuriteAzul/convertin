"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { ScrapedProfile, Profile, Experience, Education } from "@/types";

interface ProfileEditorProps {
  profile: Profile | ScrapedProfile;
  token: string;
  onUpdate: (updated: Profile) => void;
}

export function ProfileEditor({
  profile,
  token,
  onUpdate,
}: ProfileEditorProps) {
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [about, setAbout] = useState(profile.about || "");
  const [location, setLocation] = useState(profile.location || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || "");
  const [experiences, setExperiences] = useState<
    (Experience & { id: string })[]
  >((profile.experience || []).map((e, i) => ({ ...e, id: String(i) })));
  const [educations, setEducations] = useState<(Education & { id: string })[]>(
    (profile.education || []).map((e, i) => ({ ...e, id: String(i) })),
  );
  const [skills, setSkills] = useState<string[]>((profile as any).skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [certifications, setCertifications] = useState<string[]>(
    (profile as any).certifications || [],
  );
  const [newCert, setNewCert] = useState("");
  const [languages, setLanguages] = useState<string[]>(
    (profile as any).languages || [],
  );
  const [newLang, setNewLang] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    experience: true,
  });

  const scrapeStatus =
    "sessionToken" in profile ? (profile as Profile).scrapeStatus : "partial";
  const toggle = (s: string) => setExpanded((p) => ({ ...p, [s]: !p[s] }));

  const addExp = () =>
    setExperiences((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        company: "",
        title: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  const updExp = (id: string, f: string, v: string) =>
    setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [f]: v } : e)));
  const delExp = (id: string) =>
    setExperiences((p) => p.filter((e) => e.id !== id));

  const addEdu = () =>
    setEducations((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
      },
    ]);
  const updEdu = (id: string, f: string, v: string) =>
    setEducations((p) => p.map((e) => (e.id === id ? { ...e, [f]: v } : e)));
  const delEdu = (id: string) =>
    setEducations((p) => p.filter((e) => e.id !== id));

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills((p) => [...p, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const delSkill = (i: number) =>
    setSkills((p) => p.filter((_, idx) => idx !== i));
  const addCert = () => {
    if (newCert.trim()) {
      setCertifications((p) => [...p, newCert.trim()]);
      setNewCert("");
    }
  };
  const delCert = (i: number) =>
    setCertifications((p) => p.filter((_, idx) => idx !== i));
  const addLang = () => {
    if (newLang.trim()) {
      setLanguages((p) => [...p, newLang.trim()]);
      setNewLang("");
    }
  };
  const delLang = (i: number) =>
    setLanguages((p) => p.filter((_, idx) => idx !== i));

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          headline,
          about,
          location,
          email,
          phone,
          linkedinUrl,
          experience: experiences,
          education: educations,
          skills,
          certifications,
          languages,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.profile);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [
    fullName,
    headline,
    about,
    location,
    email,
    phone,
    linkedinUrl,
    experiences,
    educations,
    skills,
    certifications,
    languages,
    token,
    onUpdate,
  ]);

  const inputClass =
    "mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-zinc-700";
  const btnClass =
    "rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">Your Profile</h2>
        {scrapeStatus === "partial" && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Partial scrape — complete below
          </span>
        )}
        {scrapeStatus === "full" && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Fully scraped ✓
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className={labelClass}>Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className={inputClass}
            placeholder="Senior Software Engineer"
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            placeholder="Lisbon, Portugal"
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+351 912 345 678"
          />
        </div>
        <div>
          <label className={labelClass}>LinkedIn URL</label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className={inputClass}
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div>
          <label className={labelClass}>About / Summary</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Experienced professional..."
          />
        </div>
      </div>

      {/* EXPERIENCE */}
      <SectionCard
        title="Experience"
        count={experiences.length}
        expanded={expanded.experience}
        onToggle={() => toggle("experience")}
      >
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 space-y-3"
          >
            <div className="flex justify-between">
              <span className="text-sm font-medium text-zinc-600">
                {exp.title || "New position"}
              </span>
              <button
                onClick={() => delExp(exp.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500">Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updExp(exp.id, "title", e.target.value)}
                  className={inputClass}
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updExp(exp.id, "company", e.target.value)}
                  className={inputClass}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Start Date</label>
                <input
                  type="text"
                  value={exp.startDate || ""}
                  onChange={(e) => updExp(exp.id, "startDate", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Jan 2020"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">End Date</label>
                <input
                  type="text"
                  value={exp.endDate || ""}
                  onChange={(e) => updExp(exp.id, "endDate", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Present"
                />
              </div>
        </div>
        <div>
              <label className="text-xs text-zinc-500">Description</label>
              <textarea
                value={exp.description || ""}
                onChange={(e) => updExp(exp.id, "description", e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Key achievements, responsibilities..."
              />
            </div>
          </div>
        ))}
        <button
          onClick={addExp}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" /> Add position
        </button>
      </SectionCard>

      {/* EDUCATION */}
      <SectionCard
        title="Education"
        count={educations.length}
        expanded={expanded.education}
        onToggle={() => toggle("education")}
      >
        {educations.map((edu) => (
          <div
            key={edu.id}
            className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 space-y-3"
          >
            <div className="flex justify-between">
              <span className="text-sm font-medium text-zinc-600">
                {edu.school || "New education"}
              </span>
              <button
                onClick={() => delEdu(edu.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500">School</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updEdu(edu.id, "school", e.target.value)}
                  className={inputClass}
                  placeholder="University name"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Degree</label>
                <input
                  type="text"
                  value={edu.degree || ""}
                  onChange={(e) => updEdu(edu.id, "degree", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Bachelor's"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Field of Study</label>
                <input
                  type="text"
                  value={edu.field || ""}
                  onChange={(e) => updEdu(edu.id, "field", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Start</label>
                <input
                  type="text"
                  value={edu.startDate || ""}
                  onChange={(e) => updEdu(edu.id, "startDate", e.target.value)}
                  className={inputClass}
                  placeholder="2016"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addEdu}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" /> Add education
        </button>
      </SectionCard>

      {/* SKILLS */}
      <SectionCard
        title="Skills"
        count={skills.length}
        expanded={expanded.skills}
        onToggle={() => toggle("skills")}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
            >
              {s}
              <button
                onClick={() => delSkill(i)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            className={inputClass}
            placeholder="Add a skill..."
          />
          <button onClick={addSkill} className={btnClass}>
            Add
          </button>
        </div>
      </SectionCard>

      {/* CERTIFICATIONS */}
      <SectionCard
        title="Certifications & Licenses"
        count={certifications.length}
        expanded={expanded.certs}
        onToggle={() => toggle("certs")}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {certifications.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
            >
              {c}
              <button
                onClick={() => delCert(i)}
                className="text-emerald-400 hover:text-emerald-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCert}
            onChange={(e) => setNewCert(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCert()}
            className={inputClass}
            placeholder="Add certification..."
          />
          <button onClick={addCert} className={btnClass}>
            Add
          </button>
        </div>
      </SectionCard>

      {/* LANGUAGES */}
      <SectionCard
        title="Languages"
        count={languages.length}
        expanded={expanded.languages}
        onToggle={() => toggle("languages")}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {languages.map((l, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700"
            >
              {l}
              <button
                onClick={() => delLang(i)}
                className="text-purple-400 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLang()}
            className={inputClass}
            placeholder="e.g. English, Portuguese..."
          />
          <button onClick={addLang} className={btnClass}>
            Add
          </button>
        </div>
      </SectionCard>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}

function SectionCard({
  title,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-zinc-50"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
          <span className="font-medium text-zinc-900">{title}</span>
          {count > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              {count}
            </span>
          )}
        </div>
      </button>
      {expanded && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}
