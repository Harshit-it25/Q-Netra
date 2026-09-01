import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { aiAdvisorLimiter } from '../middleware/rateLimit';

export const messageRouter = Router();

messageRouter.post('/analyze-message', aiAdvisorLimiter, (req, res) => messageController.analyzeMessage(req, res));
