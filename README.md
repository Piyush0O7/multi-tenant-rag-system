# multi-tenant-rag-system

A secure and scalable Multi-Tenant RAG system built with Node.js, TypeScript, PostgreSQL, and pgvector that allows organizations to upload documents and query their own AI-powered knowledge base with strict tenant isolation and intelligent guardrails.

## Features

- Tenant creation and lookup
- Document upload with text extraction, chunking, and vector storage
- Tenant-scoped vector search using PostgreSQL + pgvector
- Secure query route returning answer + source documents
- Guardrails against prompt injection, cross-tenant leakage, and low-confidence answers
- Docker Compose setup for Postgres + app

## API Endpoints

- `POST /tenant` - create a tenant
- `GET /tenant/:id` - get tenant details
- `POST /auth/register` - register a tenant user and receive JWT
- `POST /auth/login` - authenticate and receive JWT
- `POST /tenant/:tenantId/documents/upload` - upload PDF/text files for a tenant
- `POST /tenant/:tenantId/documents` - add documents for a tenant using JSON
- `GET /tenant/:tenantId/documents` - list tenant documents
- `DELETE /tenant/:tenantId/documents/:documentId` - delete one document
- `POST /tenant/:tenantId/query` - ask a question against tenant knowledge
- `GET /health` - health check

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` with the following values:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/ragdb
   OPENAI_API_KEY=your-openai-key
   JWT_SECRET=your-jwt-secret
   ```

3. Initialize the database and run migrations:
   - Use the Docker Compose setup or your preferred Postgres instance.
   - The application will create required tables on startup.
   - PostgreSQL must have the `pgvector` extension installed before starting the app. The default Windows Postgres installer does not include this extension.
   - On Windows, install the `pgvector` extension manually or use the `ankane/pgvector` Docker image for Postgres.

4. Start the server:
   ```bash
   npm run dev
   ```

## Architecture Notes

### Authentication and Authorization

- JWT tokens are issued via `/auth/login` and `/auth/register`.
- Document uploads and query endpoints are protected and require `Authorization: Bearer <token>`.
- Tenant-scoped JWT claims ensure requests are limited to the tenant the user belongs to.

### File Upload

- `POST /tenant/:tenantId/documents/upload` accepts PDF and plain text files.
- Uploaded files are parsed into text before chunking, embedding, and storage.

## Development Notes

### Multi-Tenant Isolation

- Every document and embedding row stores `tenant_id`.
- Retrieval filters by `tenant_id` in every query.
- Deletion and document listing are scoped to the tenant path parameter.
- No tenant data is shared across requests.

### RAG Flow

1. Document upload receives tenant content.
2. Text is chunked into smaller text blocks.
3. Each chunk is embedded and stored in `embeddings` with tenant metadata.
4. Querying generates an embedding and searches only within tenant vectors.
5. Retrieved chunks are used to build a prompt for the LLM.

### Guardrails

- Prompt injection detection rejects suspicious phrases.
- Low confidence fallback is returned when retrieval cannot match tenant data.
- Answer generation is constrained to tenant documents only.
- Cross-tenant leakage is prevented via database filtering.

## Docker

Start services with:

```bash
docker-compose up --build
```

The app will be available at `http://localhost:4000`.
