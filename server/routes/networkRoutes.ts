import { Router } from 'express';
import { networkController } from '../controllers/networkController';

export const networkRouter = Router();

networkRouter.get('/network-graph', (req, res) => networkController.getNetworkGraph(req, res));
networkRouter.post('/office-kit/investigate', (req, res) => networkController.investigateEntity(req, res));
