"use client";

import { Check } from "lucide-react";

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  { color: "#1a365d", name: "Navy" },
  { color: "#2563eb", name: "Blue" },
  { color: "#4f46e5", name: "Indigo" },
  { color: "#6c5ce7", name: "Violet" },
  { color: "#7c3aed", name: "Purple" },
  { color: "#0d9488", name: "Teal" },
  { color: "#059669", name: "Emerald" },
  { color: "#475569", name: "Slate" },
  { color: "#b45309", name: "Amber" },
  { color: "#dc2626", name: "Red" },
];

export function ColorPicker({
  selected,
  onSelect,
  disabled = false,
}: ColorPickerProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Accent Color</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Choose a color to personalize your CV.
      </p>

      {/* Custom color input */}
      <div className="mt-4 flex items-center gap-3">
        <input
          type="color"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled}
          className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 p-1"
        />
        <span className="text-sm font-mono text-zinc-500">{selected}</span>
      </div>

      {/* Preset swatches */}
      <div className="mt-4 flex flex-wrap gap-3">
        {PRESET_COLORS.map(({ color, name }) => {
          const isSelected = selected === color;
          return (
            <button
              key={color}
              onClick={() => onSelect(color)}
              disabled={disabled}
              title={name}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                isSelected
                  ? "border-zinc-800 shadow-md scale-110"
                  : "border-transparent hover:scale-105 hover:shadow-sm"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              style={{ backgroundColor: color }}
            >
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
