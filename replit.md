# Syllabus Drift Radar by Team VeriNexus

An offline-first prototype that compares college syllabus text with job descriptions across ECE, CSE/CS, AI/ML/Data Science, and custom domains.

## Run & Operate

- `pnpm install` — install workspace dependencies
- `pnpm --filter @workspace/syllabus-drift-reader run dev` — run the web app
- `pnpm --filter @workspace/syllabus-drift-reader run test` — run deterministic analysis tests
- `pnpm --filter @workspace/syllabus-drift-reader run typecheck` — check the app's TypeScript
- `PORT=23384 BASE_PATH=/ pnpm --filter @workspace/syllabus-drift-reader run build` — create a production build
- The radar app does not require the shared API server, a database, or secrets.

## Stack

- pnpm workspace, React, TypeScript, Vite
- PDF text extraction with `pdfjs-dist`
- Client-side deterministic skill matching; no external AI service

## Where things live

- `artifacts/syllabus-drift-reader/src/App.tsx` — upload, job-description input, dashboard, evidence, and recommendations
- `artifacts/syllabus-drift-reader/src/domain-catalog.ts` — domain/role options, curated taxonomies, and illustrative ECE/CSE/AI-ML sample data
- `artifacts/syllabus-drift-reader/src/radar-analysis.ts` — deterministic phrase matching, evidence, status rules, and recommendations
- `artifacts/syllabus-drift-reader/src/pdf-extractor.ts` — local PDF parsing and upload errors
- `artifacts/syllabus-drift-reader/src/index.css` — responsive app styles
- `artifacts/syllabus-drift-reader/README.md` — setup and analysis limitations

## Architecture decisions

- Syllabus PDFs are extracted in the browser; documents and job descriptions are not sent to a server.
- Domain-specific taxonomy phrases found in job descriptions are scored. Each match includes the source sentence as evidence; Other/Custom also supports user-entered phrases.
- Covered means a matching syllabus phrase has a nearby hands-on cue; Partial means the phrase appears without one; Missing means no phrase is found.
- Built-in curricula are illustrative demo text, not institution-verified data. Sample data uses the same analysis function and remains visibly labeled.
- Recommendations are preview-only and do not modify the uploaded or pasted syllabus.

## Product

Users select a domain and role, use a built-in sample syllabus, upload a text-based PDF, or paste syllabus text, then review role-skill coverage, evidence quotes, and proposed topic or lab additions.

## Gotchas

- Scanned or image-only PDFs are not supported; OCR is not included.
- Matching is literal and may miss synonyms. Coverage labels are keyword/cue rules, not judgments of course quality or graduate readiness.
- All built-in syllabi must remain labeled as illustrative unless an actual institutional syllabus is supplied and verified.
- Keep dependencies in the artifact `package.json` and use pnpm for workspace package operations.

## Pointers

- See `.local/skills/pnpm-workspace/SKILL.md` for workspace structure and package conventions.
