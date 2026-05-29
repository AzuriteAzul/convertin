# ConvertIn — Agent Instructions

## Commands

All npm commands run from project root:

```bash
npm run dev            # Next.js dev server
npm run build          # production build (always verify with this)
npm run lint           # ESLint (next/core-web-vitals + next/typescript)
npm run test           # Vitest single run
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest with coverage
```

## Next.js 16

This project uses Next.js **16.2.6** (not 14/15). App Router `params` are `Promise<{…}>` — must `await` them. **Always `npm run build` before claiming anything works.**

## Architecture

**Flow:** LinkedIn PDF upload → LLM extracts profile → user edits → LLM generates CV JSON → stored in SQLite → rendered to PDF via `@react-pdf/renderer`.

- **No auth.** Profiles accessed by UUID session token in query params.
- **Profiles expire** after 24 hours. Cleaned up on DB init.
- **LLM** (`src/lib/llm.ts`) — OpenAI SDK, configurable via `LLM_BASE_URL`/`LLM_API_KEY`/`LLM_MODEL`. One `generateCvJson` function; `customUserMessage` param switches between PDF extraction and CV generation.
- **SQLite** (`src/lib/db.ts`) — `better-sqlite3`, local file `data/convertin.db`, WAL mode, auto-migration on first access.
- **Local storage** (`src/lib/storage.ts`) — photos at `data/uploads/photos/`, served via `/api/photos/[token]`.
- **PDF generation** (`src/lib/pdf.ts`) — `renderToBuffer` + `React.createElement` (JSX doesn't work server-side). Templates: `modern`, `professional`, `harvard`, `simple`.

## Database

- Two tables: `profiles`, `cvs`. Auto-created on first `getDb()` call.
- **`raw_data` JSON column** on profiles stores email/phone/linkedinUrl not in main columns. Always use `dbToProfile()` from `src/lib/utils.ts` to extract them.
- **snake_case in DB, camelCase in TypeScript.** Always use `dbToProfile()` or manual mapping at the boundary.
- `cv_json` on `cvs` stores the full AI-generated CV with `metadata.colorAccent`, `metadata.email`, `metadata.phone`, `metadata.photoUrl` injected at generation time.

## Environment

Copy `.env.example` → `.env.local`:

```
LLM_API_KEY=sk-your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

For DeepSeek: `LLM_BASE_URL=https://api.deepseek.com/v1`, `LLM_MODEL=deepseek-v4-pro`.

## Gotchas

- **`serverExternalPackages: ["pdfjs-dist", "better-sqlite3"]`** in `next.config.ts` — required, don't remove either. Build will fail without them.
- **Photo URLs** are stored as `/api/photos/<token>` (no file extension). The `/api/photos/[token]` route finds the file by token prefix. The PDF route's `readPhotoAsDataUrl()` handles both old (`/uploads/photos/...`) and new (`/api/photos/...`) formats.
- **Generate button saves profile first** — `handleGenerate` in `src/app/generate/page.tsx` calls `PUT /api/profiles/[token]` before `POST /api/cv/generate`. If you change this flow, user edits (email, phone, etc.) won't be persisted before CV generation.
- **Contact section override** — `POST /api/cv/generate` overwrites the LLM's `contact` section with the user's actual email/phone/location/linkedinUrl. The LLM often uses stale data from the profile text, so we force-correct it.
- **PDF route email/phone priority** — `GET /api/cv/[id]/pdf` prefers the profile's current `raw_data` email/phone over stale `cv_json.metadata` values. Profile data wins.
- **Font scaling** (`calculateFontScale()` in `src/lib/pdf.ts`) adjusts CV text 0.82x–1.55x based on content density. First place to check if CVs look wrong.
- **Headline trimming** in the PDF route strips after `@`, `|`, `-`, `—`, `·` and locale-specific employer suffixes. Intentional — extracts just the job title.
- **Singleton clients** — LLM and DB use module-level singletons. `resetLlmClient()` and `resetDb()` exports exist for tests.
- **Photo upload** → local filesystem at `data/uploads/photos/`, 5MB max, PNG/JPEG/WebP only.
- **Profile editor updates** merge email/phone/linkedinUrl into `raw_data` JSON column separately from main columns.
- **`parseBullets` and `hasItems`** are shared in `src/lib/cv-helpers.ts` — all 4 CV templates import from there. Don't duplicate locally.
- **LLM bullet truncation** — the LLM sometimes drops the first letter after `•` (e.g. `• ontributed` instead of `• Contributed`). The prompt explicitly instructs against this. If it still happens, `parseBullets` splits on `•` correctly but can't recover a missing character.

## Testing

- **Vitest** with jsdom. Setup: `test/setup.ts`.
- **Path alias:** `@/` → `./src/` in both Vitest config and tsconfig.
- Tests in `test/`: `types.test.ts` (Zod schemas), `utils.test.ts` (token gen, dbToProfile), `package-age-hook.test.ts`.
- No integration or E2E tests.

## Frontend

- **Tailwind CSS v4** — `@tailwindcss/postcss` plugin, not v3 config.
- **shadcn/ui pattern** — `cn()` from `clsx` in `src/lib/utils.ts`.
- **Toasts** via `sonner`. **Icons** from `lucide-react`.
- **App font:** Geist + Geist Mono via `next/font/google`.
- **PDF fonts:** Inter in `public/fonts/` — used by `@react-pdf/renderer` templates only, not the Next.js app.