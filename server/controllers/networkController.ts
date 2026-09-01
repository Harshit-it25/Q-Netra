import { Request, Response } from 'express';
import { buildGraphForEntity } from '../services/network/riskGraphService';
import { investigateEntityForOfficeKit } from '../services/officeKit/officeKitService';

export class NetworkController {
  getNetworkGraph(req: Request, res: Response) {
    try {
      const rawVpa = req.query.vpa;
      const rawRisk = req.query.risk;

      const vpa = typeof rawVpa === 'string' ? rawVpa.slice(0, 256).trim() : 'abc123@upi';
      const riskParam = typeof rawRisk === 'string' && ['SAFE', 'MODERATE', 'HIGH RISK'].includes(rawRisk.toUpperCase())
        ? rawRisk.toUpperCase()
        : 'HIGH RISK';

      const graphData = buildGraphForEntity(vpa, riskParam as any);

      return res.json({
        success: true,
        vpa,
        ...graphData
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to load network graph safely' });
    }
  }

  investigateEntity(req: Request, res: Response) {
    try {
      const { vpa } = req.body;
      const target = typeof vpa === 'string' ? vpa.slice(0, 256).trim() : 'abc123@upi';
      const dossier = investigateEntityForOfficeKit(target);

      return res.json({
        success: true,
        dossier
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to generate investigation summary' });
    }
  }
}

export const networkController = new NetworkController();
