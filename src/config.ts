import * as dotenv from 'dotenv';
import { PoolConfig } from 'pg';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const PORT = Number(process.env.PORT ?? 4000);
export const DATABASE_URL = required('DATABASE_URL');
export const OPENAI_API_KEY = required('OPENAI_API_KEY');
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-large';
export const JWT_SECRET = required('JWT_SECRET');
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

export const pgConfig: PoolConfig = {
  connectionString: DATABASE_URL,
};
