import { Pool } from 'pg';
import { toSql } from 'pgvector';
import { pgConfig } from '../config';

export const db = new Pool(pgConfig);
export const vectorFactory = { toSql };

export async function migrate() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (extensionError: any) {
      if (extensionError.code === '0A000' || extensionError.message?.includes('extension "vector" is not available')) {
        throw new Error(
          'PostgreSQL pgvector extension is not installed on this server. Install pgvector, restart PostgreSQL, and rerun the app. On Windows, install the extension or use a pgvector-enabled Postgres image such as ankane/pgvector.'
        );
      }
      throw extensionError;
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text,
        created_at timestamptz DEFAULT now()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        role text NOT NULL DEFAULT 'user',
        created_at timestamptz DEFAULT now()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        title text NOT NULL,
        content text NOT NULL,
        metadata jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        tenant_id uuid NOT NULL,
        text_chunk text NOT NULL,
        vector vector(1536) NOT NULL,
        source text,
        created_at timestamptz DEFAULT now()
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_embeddings_tenant_id ON embeddings(tenant_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat(vector) WITH (lists = 64)');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
