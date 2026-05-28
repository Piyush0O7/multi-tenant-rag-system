import { db, vectorFactory } from './dbService';
import { chunkText, ChunkedText } from '../rag/chunker';
import { EmbeddingService } from './llmService';
import { TenantService } from './tenantService';
import { extractTextFromUpload } from './fileService';

export interface DocumentUploadPayload {
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  source?: string;
}

export interface CreatedDocument {
  id: string;
  title: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export class DocumentService {
  static async uploadDocuments(tenantId: string, documents: DocumentUploadPayload[]) {
    const tenant = await TenantService.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const createdDocuments: CreatedDocument[] = [];

      for (const document of documents) {
        const inserted = await client.query(
          'INSERT INTO documents (tenant_id, title, content, metadata) VALUES ($1, $2, $3, $4) RETURNING id, title, metadata, created_at',
          [tenantId, document.title, document.content, document.metadata ?? {}]
        );
        const documentRow = inserted.rows[0];
        const chunks: ChunkedText[] = chunkText(document.content);
        const embeddings: number[][] = await EmbeddingService.embedTexts(chunks.map((chunk) => chunk.text));

        for (let index = 0; index < chunks.length; index += 1) {
          const chunk = chunks[index];
          const vector = embeddings[index];
          await client.query(
            'INSERT INTO embeddings (document_id, tenant_id, text_chunk, vector, source) VALUES ($1, $2, $3, $4::vector, $5)',
            [documentRow.id, tenantId, chunk.text, vectorFactory.toSql(vector), document.source ?? document.title]
          );
        }

        createdDocuments.push({ id: documentRow.id, title: documentRow.title, metadata: documentRow.metadata, created_at: documentRow.created_at });
      }

      await client.query('COMMIT');
      return createdDocuments;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async uploadFileDocuments(tenantId: string, files: Express.Multer.File[]): Promise<CreatedDocument[]> {
    const documents: DocumentUploadPayload[] = await Promise.all(
      files.map(async (file) => ({
        title: file.originalname,
        content: await extractTextFromUpload(file),
        metadata: { mimeType: file.mimetype },
        source: file.originalname,
      }))
    );
    return DocumentService.uploadDocuments(tenantId, documents);
  }

  static async listDocuments(tenantId: string) {
    const result = await db.query(
      'SELECT id, title, metadata, created_at FROM documents WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows;
  }

  static async deleteDocument(tenantId: string, documentId: string) {
    const result = await db.query('DELETE FROM documents WHERE id = $1 AND tenant_id = $2', [documentId, tenantId]);
    if (result.rowCount === 0) {
      throw new Error('Document not found for tenant');
    }
  }
}
