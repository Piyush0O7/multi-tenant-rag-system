import { Router } from 'express';
import { db } from '../services/dbService';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});
