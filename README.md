# ConvertIn

**LinkedIn Profile → Polished One-Page CV in 60 Seconds**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) [![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3) [![OpenAI SDK](https://img.shields.io/badge/LLM-OpenAI%20SDK-412991?logo=openai&logoColor=white)](https://github.com/openai/openai-node)

---

## Overview

**ConvertIn** is a self-hosted web app that turns a LinkedIn PDF export into a tailored, ATS-friendly one-page CV. Upload your profile, edit the extracted data, pick a template and accent color, and download a professional PDF — no sign-up, no login, no cloud dependencies.

An LLM (OpenAI, DeepSeek, or any OpenAI-compatible API) reads your LinkedIn PDF, extracts your experience, education, and skills, then generates a CV optimized for your target role and language. Four built-in templates auto-scale fonts to always fit one page.

> **No accounts.** Profiles are accessed by UUID token in the URL and expire after 24 hours.

---

## Features

- **LinkedIn PDF Parsing** — Upload your exported LinkedIn PDF; an LLM extracts name, headline, experience, education, skills, certifications, and languages.
- **Profile Editor** — Fine-tune every field before generating your CV. Update email, phone, location, and LinkedIn URL separately from the main profile.
- **AI CV Generation** — Specify a target role and language; the LLM curates the most relevant experience and writes tailored bullet points.
- **4 CV Templates** — Modern (two-column with accent color), Professional (single-column), Harvard (classic format), and Simple (minimal text-focused).
- **Smart Font Scaling** — All templates auto-scale text (0.82×–1.55×) based on content density to guarantee a one-page fit.
- **Photo Upload** — Add a headshot (PNG/JPEG/WebP, up to 5 MB) stored locally and embedded in the PDF.
- **Configurable LLM** — Works with OpenAI, DeepSeek, or any OpenAI-compatible endpoint via `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`.
- **Zero Cloud Dependencies** — SQLite database, local file storage, no external services required beyond the LLM API.
- **Privacy-First** — No auth, no accounts. Profiles expire after 24 hours and are cleaned up automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, API Routes) |
| Language | TypeScript 5 |
| Database | SQLite via `better-sqlite3` (WAL mode, auto-migration) |
| LLM | OpenAI SDK (configurable provider) |
| PDF | `@react-pdf/renderer` (server-side, 4 templates) |
| Styling | Tailwind CSS v4 + shadcn/ui patterns |
| Validation | Zod |
| Testing | Vitest + jsdom |

---

## Getting Started

### Prerequisites

- **Node.js 20+** (tested on 26)
- **Build tools for native modules** — Xcode Command Line Tools on macOS, `build-essential` on Linux
- **An LLM API key** — OpenAI, DeepSeek, or any OpenAI-compatible provider

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AzuriteAzul/convertin.git
   cd convertin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your LLM credentials:

   ```env
   LLM_API_KEY=sk-your-api-key
   LLM_BASE_URL=https://api.openai.com/v1
   LLM_MODEL=gpt-4o
   ```

   For DeepSeek:

   ```env
   LLM_API_KEY=your-deepseek-key
   LLM_BASE_URL=https://api.deepseek.com/v1
   LLM_MODEL=deepseek-v4-pro
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build (always verify with this) |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint with `next/core-web-vitals` + `next/typescript` |
| `npm run test` | Vitest single run |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage |

---

## Project Structure

```
convertin/
├── public/fonts/                # Inter font files for PDF templates
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── profiles/        # Profile CRUD + PDF upload
│   │   │   ├── cv/              # CV generation + PDF download
│   │   │   └── photos/          # Photo serving from local disk
│   │   ├── generate/            # Upload & edit page
│   │   ├── preview/             # CV preview page
│   │   ├── install/             # Install prompt page
│   │   ├── layout.tsx           # Root layout (Geist font, metadata)
│   │   └── page.tsx             # Landing page
│   ├── components/              # React components
│   │   ├── ProfileEditor.tsx    # Edit extracted profile data
│   │   ├── TemplateSelector.tsx # Choose CV template
│   │   ├── ColorPicker.tsx      # Accent color picker
│   │   ├── LanguageSelector.tsx # CV output language
│   │   ├── RoleSelector.tsx     # Target role input
│   │   ├── PhotoUploader.tsx    # Headshot upload
│   │   ├── CvTemplateModern.tsx
│   │   ├── CvTemplateProfessional.tsx
│   │   ├── CvTemplateHarvard.tsx
│   │   └── CvTemplateSimple.tsx
│   ├── lib/
│   │   ├── db.ts               # SQLite database (better-sqlite3, WAL)
│   │   ├── llm.ts               # LLM client (configurable provider)
│   │   ├── pdf.ts               # PDF rendering + font scaling
│   │   ├── storage.ts           # Local filesystem photo storage
│   │   ├── cv-helpers.ts        # Shared CV template utilities
│   │   └── utils.ts             # dbToProfile, cn(), generateToken
│   └── types/                   # Zod schemas & TypeScript types
├── test/                        # Vitest tests
├── data/                         # SQLite DB + photo uploads (gitignored)
├── .env.example                 # Environment variable template
├── next.config.ts               # Next.js config (serverExternalPackages)
├── vitest.config.ts             # Vitest configuration
└── AGENTS.md                    # AI agent instructions
```

---

## CV Templates

| Template | Layout | Description |
|----------|--------|-------------|
| **Modern** | Two-column | Clean layout with configurable accent color sidebar |
| **Professional** | Single-column | Traditional format, emphasis on content hierarchy |
| **Harvard** | Single-column | Classic Harvard Business School résumé format |
| **Simple** | Single-column | Minimal, text-focused layout |

All templates use **smart font scaling** — `calculateFontScale()` in `src/lib/pdf.ts` adjusts text size from 0.82× to 1.55× based on content density, ensuring every CV fits on exactly one page.

---

## Key Conventions

- **No authentication.** Profiles are accessed by UUID session token in query params. Share the URL, share access.
- **24-hour expiry.** Profiles and their data are automatically deleted after 24 hours. Cleanup runs on DB init.
- **Snake_case in DB, camelCase in TypeScript.** Always use `dbToProfile()` from `src/lib/utils.ts` at the database boundary.
- **`raw_data` JSON column.** Email, phone, and LinkedIn URL are stored in a JSON column on `profiles`, not as separate columns. Always extract via `dbToProfile()`.
- **Contact override.** `POST /api/cv/generate` overwrites the LLM's `contact` section with the user's actual email/phone/location/linkedinUrl to prevent stale data.
- **PDF uses `React.createElement`.** JSX doesn't work server-side with `@react-pdf/renderer`. Templates use `React.createElement` directly.
- **`serverExternalPackages`.** Both `pdfjs-dist` and `better-sqlite3` must stay in `next.config.ts`'s `serverExternalPackages` — removing either breaks the build.
- **Singleton clients.** LLM and DB use module-level singletons. `resetLlmClient()` and `resetDb()` exports exist for tests.
- **Photo URLs** are stored as `/api/photos/<token>` (no file extension). The photo route finds files by token prefix.
- **Headline trimming.** The PDF route strips text after `@`, `|`, `-`, `—`, `·` and locale-specific employer suffixes to extract just the job title.

---

## Deployment

ConvertIn is designed for self-hosting. Since it uses SQLite and local file storage, it runs on any Node.js server:

1. Push your code to GitHub.
2. Clone on your server and install dependencies.
3. Configure `.env.local` with your LLM credentials.
4. Run `npm run build && npm run start`.

> **Note:** The `data/` directory (SQLite database + uploaded photos) must persist between deployments. Do not mount it as ephemeral storage.

For Docker or reverse-proxy setups, ensure the `data/uploads/photos/` directory exists and is writable by the Node process.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes and ensure `npm run lint` and `npm run test` pass.
4. Open a pull request with a clear description of what changed and why.

If you are adding new CV templates, remember to:

- Add the template component in `src/components/`.
- Register it in `src/lib/pdf.ts`'s template map.
- Add shared utilities to `src/lib/cv-helpers.ts` (don't duplicate `parseBullets` or `hasItems` locally).
- Update the `CvJsonSchema` metadata type in `src/types/index.ts` if the template introduces new options.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

Built for job seekers who deserve better than LinkedIn's default PDF.