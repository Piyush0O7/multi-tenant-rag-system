import express from 'express';
import { json } from 'body-parser';
import { tenantRouter } from './api/tenant';
import { documentRouter } from './api/document';
import { queryRouter } from './api/query';
import { authRouter } from './api/auth';
import { healthRouter } from './api/health';
import { errorHandler } from './middleware/errorHandler';
import { migrate } from './services/dbService';

export const app = express();
app.use(json({ limit: '5mb' }));

app.use('/auth', authRouter);
app.use('/tenant', tenantRouter);
app.use('/tenant', documentRouter);
app.use('/tenant', queryRouter);
app.use('/health', healthRouter);

app.use(errorHandler);

migrate().catch((error) => {
  console.error('Database migration failed:', error);
  process.exit(1);
});
