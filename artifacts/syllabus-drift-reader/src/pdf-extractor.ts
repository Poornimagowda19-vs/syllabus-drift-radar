import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export type ExtractedSyllabus = {
  fileName: string;
  text: string;
  pageCount: number;
};

type ProgressCallback = (progress: number) => void;

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const PDF_MIME_TYPES = new Set(['application/pdf', 'application/octet-stream', '']);

export async function extractSyllabusPdf(
  file: File,
  onProgress: ProgressCallback = () => undefined,
): Promise<ExtractedSyllabus> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'pdf' || !PDF_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error('Choose a PDF syllabus. This prototype does not support DOCX or image files.');
  }
  if (file.size === 0) throw new Error('This PDF is empty. Choose a file that contains syllabus text.');
  if (file.size > MAX_FILE_BYTES) throw new Error('This PDF is larger than 25 MB. Compress it or export only the syllabus pages.');

  onProgress(3);
  let pdf: { numPages: number; getPage: (page: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }>; destroy: () => Promise<void> } | undefined;

  try {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const lineMap = new Map<number, string[]>();

      for (const rawItem of content.items) {
        if (!rawItem || typeof rawItem !== 'object' || !('str' in rawItem)) continue;
        const item = rawItem as { str: string; transform?: number[] };
        if (!item.str.trim()) continue;
        const y = Math.round((item.transform?.[5] ?? 0) / 3) * 3;
        const chunks = lineMap.get(y) ?? [];
        chunks.push(item.str);
        lineMap.set(y, chunks);
      }

      const pageLines = [...lineMap.entries()]
        .sort((left, right) => right[0] - left[0])
        .map(([, chunks]) => chunks.join(' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      pages.push(pageLines.join('\n'));
      onProgress(5 + Math.round((pageNo / Math.max(pdf.numPages, 1)) * 90));
    }

    const text = pages.join('\n').trim();
    if (!text) {
      throw new Error('No selectable text was found. The PDF may be scanned or image-only; OCR is not included in this prototype.');
    }
    return { fileName: file.name, text, pageCount: pdf.numPages };
  } catch (error) {
    if (error instanceof Error && /No selectable text/.test(error.message)) throw error;
    throw new Error('We couldn’t read this PDF. It may be damaged or password-protected. Try a fresh, unlocked PDF.');
  } finally {
    await pdf?.destroy().catch(() => undefined);
    onProgress(100);
  }
}
