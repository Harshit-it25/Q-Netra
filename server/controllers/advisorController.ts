import { Request, Response } from 'express';
import { askQNetraAdvisor } from '../services/ai/geminiAdvisorService';

export class AdvisorController {
  async askAdvisor(req: Request, res: Response) {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ success: false, error: 'Question must be a string' });
      }

      const boundedQuestion = question.slice(0, 1024).trim();
      const answer = await askQNetraAdvisor(boundedQuestion);
      return res.json({ success: true, answer });
    } catch (err: any) {
      console.error('Error in /api/ask-qnetra:', err);
      res.status(500).json({ success: false, error: 'Failed to process advisor query' });
    }
  }
}

export const advisorController = new AdvisorController();
