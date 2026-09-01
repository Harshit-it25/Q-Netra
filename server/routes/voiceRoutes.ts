import { Router } from 'express';
import {
  synthesizeVoiceHandler,
  transcribeVoiceHandler,
  voiceStatusHandler
} from '../controllers/voiceController';
import { voiceApiLimiter } from '../middleware/rateLimit';

export const voiceRouter = Router();

// Rate limit voice synthesis and transcription
voiceRouter.post('/voice/synthesize', voiceApiLimiter, synthesizeVoiceHandler);
voiceRouter.post('/voice/transcribe', voiceApiLimiter, transcribeVoiceHandler);
voiceRouter.get('/voice/status', voiceStatusHandler);
