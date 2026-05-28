import { db, vectorFactory } from './dbService';
import { EmbeddingService, LlmService } from './llmService';
import { isMaliciousPrompt, buildPrompt, isLowConfidence } from '../rag/guardrails';

interface SearchResult {
  source: string;
  text_chunk: string;
  similarity: number;
}

export class RagService {
  static async queryTenantKnowledge(tenantId: string, question: string) {
    if (!question || typeof question !== 'string') {
      throw new Error('Question is required');
    }

    if (isMaliciousPrompt(question)) {
      return {
        answer: 'I cannot answer that request. The question violates our internal safety rules.',
        sources: [],
        safe: true,
      };
    }

    const embedding: number[][] = await EmbeddingService.embedTexts([question]);
    const vector: number[] = embedding[0];

    const searchResults = await RagService.searchTenantVectors(tenantId, vector);
    if (isLowConfidence(searchResults)) {
      return {
        answer: 'I’m sorry, I could not confidently answer that question from this tenant’s knowledge base.',
        sources: [],
        safe: true,
      };
    }

    const prompt = buildPrompt(question, searchResults);
    const answer = await LlmService.generateAnswer(prompt);

    return {
      answer,
      sources: searchResults.map((item) => item.source).filter((value, index, self) => self.indexOf(value) === index),
      safe: false,
    };
  }

  private static async searchTenantVectors(tenantId: string, vector: number[]): Promise<SearchResult[]> {
    const query = `
      SELECT source, text_chunk, 1 - (vector <=> $1::vector) AS similarity
      FROM embeddings
      WHERE tenant_id = $2
      ORDER BY vector <=> $1::vector
      LIMIT 6
    `;
    const result = await db.query(query, [vectorFactory.toSql(vector), tenantId]);
    return result.rows as SearchResult[];
  }
}
