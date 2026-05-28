import { Router } from 'express';
import { TenantService } from '../services/tenantService';

export const tenantRouter = Router();

tenantRouter.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const tenant = await TenantService.createTenant({ name, description });
    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
});

tenantRouter.get('/:id', async (req, res, next) => {
  try {
    const tenant = await TenantService.getTenant(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    next(error);
  }
});
