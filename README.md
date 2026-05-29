# ConvertIn

Turn your LinkedIn profile into a polished, ATS-friendly one-page CV in seconds. Upload a LinkedIn PDF, edit the extracted data, pick a template, and download.

**No sign-up. No login. No data stored permanently.** Profiles expire after 24 hours.

## How It Works

1. **Export** your LinkedIn profile as PDF (Profile → More → Save to PDF)
2. **Upload** the PDF — an LLM extracts your experience, education, skills, etc.
3. **Edit** the extracted profile data to fine-tune content
4. **Generate** a tailored CV for your target role and language
5. **Download** as a professionally formatted PDF

## Tech Stack

- **Next.js 16** (App Router, server components, API routes)
- **SQLite** via `better-sqlite3` — local file database, zero cloud deps
- **OpenAI SDK** — configurable LLM provider (OpenAI, DeepSeek, any compatible API)
- **@react-pdf/renderer** — server-side PDF generation with 4 templates
- **Tailwind CSS v4** + **shadcn/ui** patterns
- **Zod** for validation, **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 20+ (tested on 26)
- Build tools for native modules (Xcode CLI on macOS, `build-essential` on Linux)

### Setup

```bash
git clone https://github.com/<you>/convert-in.git
cd convert-in
npm install
cp .env.example .env.local
```

Edit `.env.local` with your LLM credentials:

```
LLM_API_KEY=sk-your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
```

### Run

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── profiles/          # Profile CRUD + PDF upload
│   │   ├── cv/                 # CV generation + PDF download
│   │   └── photos/             # Photo serving from local disk
│   ├── generate/              # Upload & edit page
│   ├── preview/                # CV preview page
│   └── install/                # Install prompt page
├── components/                # React components (editor, templates, UI)
├── lib/
│   ├── db.ts                  # SQLite database (better-sqlite3)
│   ├── llm.ts                 # LLM client (configurable provider)
│   ├── pdf.ts                  # PDF rendering (4 templates)
│   ├── storage.ts              # Local filesystem photo storage
│   ├── cv-helpers.ts           # Shared CV template utilities
│   └── utils.ts                # dbToProfile, cn(), generateToken
└── types/                      # Zod schemas & TypeScript types

test/                           # Vitest tests
data/                           # SQLite DB + photo uploads (gitignored)
public/fonts/                   # Inter font for PDF templates
```

## CV Templates

| Template | Style |
|----------|-------|
| **Modern** | Clean two-column with accent color |
| **Professional** | Traditional single-column |
| **Harvard** | Classic Harvard Business School format |
| **Simple** | Minimal, text-focused layout |

All templates auto-scale fonts based on content density (0.82×–1.55×) to fit one page.

## Architecture Notes

- **No auth.** Profiles are accessed by UUID session token in query params.
- **Profiles expire** after 24 hours. Expired profiles are cleaned up on DB init.
- **Photos** are stored on local disk at `data/uploads/photos/` and served via `/api/photos/[token]`.
- **PDF generation** uses `React.createElement` (not JSX) server-side. The PDF route reads photos directly from disk as base64 data URLs.
- **LLM calls** share one `generateCvJson` function — the `customUserMessage` parameter switches between PDF extraction mode and CV generation mode.
- **`better-sqlite3`** must stay in `serverExternalPackages` in `next.config.ts` — the native module can't be bundled by webpack.

## License

MIT