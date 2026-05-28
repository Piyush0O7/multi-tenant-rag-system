export interface ChunkedText {
  text: string;
  start: number;
  end: number;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): ChunkedText[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks: ChunkedText[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const end = Math.min(cursor + CHUNK_SIZE, normalized.length);
    const chunkText = normalized.slice(cursor, end).trim();
    if (chunkText.length === 0) break;
    chunks.push({ text: chunkText, start: cursor, end });
    cursor = end - CHUNK_OVERLAP;
    if (cursor < 0) cursor = 0;
  }

  return chunks;
}
