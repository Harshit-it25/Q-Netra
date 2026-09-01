import { Request, Response } from 'express';
import { evaluatePaymentRisk } from '../services/payment/paymentRiskService';
import { entityRepository } from '../repositories/entityRepository';

export class PaymentController {
  async handlePaymentCheck(req: Request, res: Response) {
    try {
      const recipientInput = req.body.recipient ?? req.body.recipientVpa;
      const noteInput = req.body.note ?? req.body.intentNote ?? req.body.contextNote;
      const amountInput = req.body.amount;
      const sourceInput = req.body.source;
      const contextInput = req.body.context;

      if (!recipientInput || typeof recipientInput !== 'string' || !recipientInput.trim()) {
        return res.status(400).json({ success: false, error: 'Recipient identifier is required (recipient or recipientVpa).' });
      }

      if (noteInput !== undefined && typeof noteInput !== 'string') {
        return res.status(400).json({ success: false, error: 'Note must be a string' });
      }
      if (amountInput !== undefined && typeof amountInput !== 'number' && typeof amountInput !== 'string') {
        return res.status(400).json({ success: false, error: 'Amount must be a numeric value' });
      }

      const cleanRecipient = String(recipientInput).slice(0, 256).trim();
      let parsedAmount = Number(amountInput);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount < 0) {
        parsedAmount = 0;
      }
      if (parsedAmount > 100000000) {
        parsedAmount = 100000000;
      }

      const cleanNote = typeof noteInput === 'string' ? noteInput.slice(0, 512).trim() : undefined;

      const result = await evaluatePaymentRisk({
        recipient: cleanRecipient,
        amount: parsedAmount,
        source: typeof sourceInput === 'string' ? sourceInput.slice(0, 64) : undefined,
        note: cleanNote,
        context: typeof contextInput === 'object' && contextInput !== null ? contextInput : undefined
      });

      const decision = result.riskLevel === 'HIGH RISK' || result.stopDecision
        ? 'STOP'
        : result.riskLevel === 'MODERATE'
        ? 'VERIFY'
        : 'PROCEED';

      const trustScore = result.riskLevel === 'HIGH RISK' ? 12 : result.riskLevel === 'MODERATE' ? 55 : 94;

      return res.json({
        success: true,
        decision,
        trustScore,
        ...result
      });
    } catch (err: any) {
      console.error('Error in payment check:', err);
      res.status(500).json({ success: false, error: 'Failed to evaluate payment risk safely' });
    }
  }

  getEntities(req: Request, res: Response) {
    res.json({
      success: true,
      entities: entityRepository.getAll()
    });
  }
}

export const paymentController = new PaymentController();
