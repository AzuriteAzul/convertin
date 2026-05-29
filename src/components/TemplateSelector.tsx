"use client";

import { Palette, Briefcase, GraduationCap, Minus } from "lucide-react";

interface TemplateSelectorProps {
  selected: string;
  onSelect: (template: string) => void;
  disabled?: boolean;
}

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Creative",
    description: "Canva-like",
    icon: Palette,
    colors: ["#6366f1", "#8b5cf6", "#a78bfa"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Consulting",
    icon: Briefcase,
    colors: ["#2563eb", "#3b82f6", "#60a5fa"],
  },
  {
    id: "harvard",
    name: "Harvard",
    description: "Academic",
    icon: GraduationCap,
    colors: ["#7c3aed", "#8b5cf6", "#a78bfa"],
  },
  {
    id: "simple",
    name: "Simple",
    description: "Minimal",
    icon: Minus,
    colors: ["#52525b", "#71717a", "#a1a1aa"],
  },
];

export function TemplateSelector({
  selected,
  onSelect,
  disabled = false,
}: TemplateSelectorProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        Choose a Template
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Pick a style for your CV layout.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selected === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              disabled={disabled}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {/* Color preview bar */}
              <div className="flex h-12 w-full overflow-hidden rounded-lg">
                {template.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <Icon
                className={`h-5 w-5 ${
                  isSelected ? "text-blue-600" : "text-zinc-400"
                }`}
              />

              <div>
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-blue-700" : "text-zinc-800"
                  }`}
                >
                  {template.name}
                </p>
                <p className="text-xs text-zinc-400">{template.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
