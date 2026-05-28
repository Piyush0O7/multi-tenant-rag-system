import axios from 'axios';
import { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL, OPENAI_MODEL } from '../config';

const openAiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class EmbeddingService {
  static async embedTexts(texts: string[]) {
    const response = await openAiClient.post('/embeddings', {
      input: texts,
      model: OPENAI_EMBEDDING_MODEL,
    });
    return response.data.data.map((item: any) => item.embedding as number[]);
  }
}

export class LlmService {
  static async generateAnswer(prompt: string) {
    const response = await openAiClient.post('/responses', {
      model: OPENAI_MODEL,
      input: prompt,
      max_tokens: 500,
      temperature: 0.2,
    });
    if (!response.data) {
      throw new Error('LLM did not return a valid answer');
    }

    if (typeof response.data.output_text === 'string' && response.data.output_text.length > 0) {
      return response.data.output_text;
    }

    const output = Array.isArray(response.data.output) ? response.data.output[0] : response.data.output;
    if (!output) {
      throw new Error('LLM did not return a valid answer');
    }

    if (Array.isArray(output.content) && output.content.length > 0) {
      const first = output.content[0];
      if (typeof first === 'string') {
        return first;
      }
      if (typeof first?.text === 'string') {
        return first.text;
      }
    }

    return String(output.text ?? '');
  }
}
