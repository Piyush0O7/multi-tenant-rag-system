const injectionPatterns = [
  /ignore instructions/i,
  /forget.*previous/i,
  /override.*system/i,
  /bypass/i,
  /do anything/i,
  /disregard/i,
  /malicious/i,
];

export function isMaliciousPrompt(text: string) {
  return injectionPatterns.some((pattern) => pattern.test(text));
}

export function isLowConfidence(results: Array<{ similarity: number }>) {
  if (!results.length) return true;
  return results[0].similarity < 0.72;
}

export function buildPrompt(question: string, results: Array<{ source: string; text_chunk: string }>) {
  const sourceBlocks = results
    .map((item, index) => `SOURCE ${index + 1}: ${item.text_chunk}`)
    .join('\n\n');

  return `You are a secure tenant-aware assistant. Use only the provided sources from the tenant database. Do not hallucinate or use external knowledge.

${sourceBlocks}

Question: ${question}

Respond with a concise answer and mention only the tenant sources used. If you cannot answer from the sources, say you cannot answer from the tenant knowledge base.`;
}
