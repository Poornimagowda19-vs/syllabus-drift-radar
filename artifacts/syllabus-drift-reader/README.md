# Syllabus Drift Radar

**By Team VeriNexus**

An offline-first curriculum-to-industry skill-gap prototype. Compare syllabus text with job descriptions for ECE, CSE/CS, AI/ML/Data Science, or a custom domain. The app runs in the browser and does not send source documents or job descriptions to a server.

## Try it without a PDF

Choose a domain, then select one of its built-in illustrative demonstrations. The ECE, CSE/CS, and AI/ML examples include a sample syllabus and sample job description. Every sample syllabus is clearly marked as illustrative and **not verified against a real institution**. These examples are demo content, not official college curricula.

You can also select **Paste syllabus text** or upload a text-based PDF. For **Other / Custom Domain**, enter a domain name, custom job title, and optionally custom skill phrases. Paste one or more job descriptions to provide the evidence the radar checks.

## Run locally

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/syllabus-drift-reader run dev
```

Run the deterministic analysis tests and create a production build with:

```bash
pnpm --filter @workspace/syllabus-drift-reader run test
pnpm --filter @workspace/syllabus-drift-reader run typecheck
pnpm --filter @workspace/syllabus-drift-reader run build
```

Dependencies are listed in this artifact's `package.json`.

## How the prototype analyzes text

- PDF text is extracted locally in the browser with `pdfjs-dist`; pasted syllabus text is analyzed directly.
- A curated taxonomy for ECE, CSE/CS, AI/ML/Data Science, and a small transferable/custom skill set matches exact phrases in the supplied job descriptions. Matching sentences are displayed as evidence.
- A skill is **Covered** when a matching phrase appears in syllabus text with a nearby hands-on cue such as a lab, project, or implementation; **Partial** when it appears without a nearby cue; and **Missing** when no phrase matches.
- Overall coverage weights Covered as 1, Partial as 0.5, and Missing as 0. This is a transparent summary of phrase matches, not a quality score.
- Recommendations suggest one topic or lab for a relevant existing subject. They are preview-only and do not change the source text.

This is deterministic keyword matching, not semantic AI, machine learning, or prerequisite analysis. It can miss synonyms and should be reviewed by faculty. Scanned/image-only PDFs, password-protected PDFs, and unsupported formats are not processed; OCR is not included.
