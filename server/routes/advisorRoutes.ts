import { Router } from 'express';
import { advisorController } from '../controllers/advisorController';
import { aiAdvisorLimiter } from '../middleware/rateLimit';

export const advisorRouter = Router();

advisorRouter.post('/ask-qnetra', aiAdvisorLimiter, (req, res) => advisorController.askAdvisor(req, res));
