/**
 * Split a description string into bullet-point items.
 *
 * Handles bullet characters (•, ·, -, *) and long prose that should be
 * split into sentences.
 */
export function parseBullets(description: string): string[] {
  const lines = description
    .split(/\n/)
    .flatMap((line) => line.split(/[•·]\s?/))
    .flatMap((segment) => segment.split(/(?:^|\s)[\-\*]\s/))
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length > 1) return lines;

  if (description.length > 200 && /\.(?=\s+[A-Z])/.test(description)) {
    const sentences = description
      .split(/\.(?=\s+[A-Z])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    if (sentences.length > 1) {
      return sentences.map((s) => (s.endsWith(".") ? s : s + "."));
    }
  }

  return [description.trim()].filter(Boolean);
}

/**
 * Type guard: returns true if the value looks like a section object
 * with a non-empty `items` array.
 */
export function hasItems(
  section: unknown,
): section is { items: unknown[]; heading?: string } {
  if (!section) return false;
  const s = section as { items?: unknown[] };
  return Array.isArray(s.items) && s.items.length > 0;
}
