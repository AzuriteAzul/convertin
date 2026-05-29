"use client";

import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  selected: string;
  onSelect: (language: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export function LanguageSelector({
  selected,
  onSelect,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-zinc-500" />
        <h2 className="text-lg font-semibold text-zinc-900">Output Language</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        The AI will translate all content to this language.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {LANGUAGES.map(({ code, name, flag }) => {
          const isSelected = selected === code;
          return (
            <button
              key={code}
              onClick={() => onSelect(code)}
              disabled={disabled}
              className={`inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span className="text-base">{flag}</span>
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
