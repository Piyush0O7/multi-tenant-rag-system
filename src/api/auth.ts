import { Router } from 'express';
import { AuthService } from '../services/authService';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { tenantId, email, password } = req.body;
    const token = await AuthService.register({ tenantId, email, password });
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await AuthService.login({ email, password });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});
