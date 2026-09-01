import { Request, Response } from 'express';
import { SERVER_CONFIG } from '../app/config';

export class HealthController {
  getHealth(req: Request, res: Response) {
    res.json({
      status: 'ok',
      service: 'q-netra-ai-backend',
      app: 'Q-NETRA AI',
      version: '3.5.0-rel',
      engine: 'Graph Neural Pre-Payment Shield',
      environment: SERVER_CONFIG.nodeEnv,
      pov: 'A customer sees a UPI ID. A fraud investigator sees a network. Q-NETRA connects the two.',
      time: new Date().toISOString()
    });
  }
}

export const healthController = new HealthController();
