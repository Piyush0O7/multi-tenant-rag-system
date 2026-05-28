import { Router } from 'express';
import { RagService } from '../services/ragService';
import { authMiddleware } from '../middleware/authMiddleware';

export const queryRouter = Router();

queryRouter.use('/:tenantId/query', authMiddleware);

queryRouter.post('/:tenantId/query', async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    const { question } = req.body;
    const answer = await RagService.queryTenantKnowledge(tenantId, question);
    res.json(answer);
  } catch (error) {
    next(error);
  }
});
