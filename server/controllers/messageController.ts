import { Request, Response } from 'express';
import { analyzeMessageText } from '../services/message/messageAnalysisService';
import { generateMessageExplanation } from '../services/ai/geminiAdvisorService';

export class MessageController {
  async analyzeMessage(req: Request, res: Response) {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid message text is required' });
      }

      const boundedText = text.slice(0, 4096);
      const analysis = analyzeMessageText(boundedText);
      const aiExplanation = await generateMessageExplanation(analysis.text, analysis.signals, analysis.isHighRisk);

      return res.json({
        success: true,
        ...analysis,
        aiExplanation: aiExplanation || undefined
      });
    } catch (err: any) {
      console.error('Error in /api/analyze-message:', err);
      res.status(500).json({ success: false, error: 'Failed to analyze message' });
    }
  }
}

export const messageController = new MessageController();
