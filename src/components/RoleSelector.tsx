"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface RoleSelectorProps {
  onGenerate: (role: string) => void;
  generating: boolean;
}

const SUGGESTED_ROLES = [
  "Software Engineer",
  "Cloud Engineer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Engineering Manager",
];

export function RoleSelector({ onGenerate, generating }: RoleSelectorProps) {
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = role.trim();
    if (target) onGenerate(target);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setRole(suggestion);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        What job are you targeting?
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        The AI will tailor your CV to highlight the most relevant experience for
        this role.
      </p>

      {/* Quick suggestions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED_ROLES.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={generating}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              role === suggestion
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Role input + generate button */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Solutions Architect"
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!role.trim() || generating}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate"}
        </button>
      </form>
    </div>
  );
}
