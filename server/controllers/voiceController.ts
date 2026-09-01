import { Request, Response } from 'express';
import { bhashiniPipeline } from '../services/bhashini/bhashiniPipeline';

export async function synthesizeVoiceHandler(req: Request, res: Response): Promise<void> {
  const { text, language, gender } = req.body;

  if (!text || typeof text !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing required field "text".'
    });
    return;
  }

  const result = await bhashiniPipeline.processTts({
    text,
    language: language || 'en-IN',
    gender
  });

  if (!result.success) {
    let statusCode = 502;
    if (result.errorCode === 'TIMEOUT') {
      statusCode = 504;
    } else if (
      result.errorCode === 'TEXT_TOO_LONG' ||
      result.errorCode === 'INVALID_TEXT' ||
      result.errorCode === 'EMPTY_AUDIO' ||
      result.errorCode === 'AUDIO_TOO_LARGE'
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: result.error || 'Speech synthesis failed.',
      errorCode: result.errorCode,
      latencyMs: result.latencyMs,
      language: result.language,
      fallbackRequired: true
    });
    return;
  }

  res.json({
    success: true,
    audioContentBase64: result.audioContentBase64,
    audioFormat: result.audioFormat || 'wav',
    latencyMs: result.latencyMs,
    language: result.language,
    provider: 'BHASHINI'
  });
}

export async function transcribeVoiceHandler(req: Request, res: Response): Promise<void> {
  const { audioBase64, language, audioFormat } = req.body;

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing required field "audioBase64".',
      errorCode: 'EMPTY_AUDIO'
    });
    return;
  }

  const result = await bhashiniPipeline.processAsr({
    audioBase64,
    language: language || 'en-IN',
    audioFormat
  });

  if (!result.success) {
    let statusCode = 502;
    if (result.errorCode === 'TIMEOUT') {
      statusCode = 504;
    } else if (
      result.errorCode === 'TEXT_TOO_LONG' ||
      result.errorCode === 'INVALID_TEXT' ||
      result.errorCode === 'EMPTY_AUDIO' ||
      result.errorCode === 'AUDIO_TOO_LARGE'
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: result.error || 'Speech recognition failed.',
      errorCode: result.errorCode,
      latencyMs: result.latencyMs,
      language: result.language,
      fallbackRequired: true
    });
    return;
  }

  res.json({
    success: true,
    transcript: result.transcript,
    latencyMs: result.latencyMs,
    language: result.language,
    provider: 'BHASHINI'
  });
}

export function voiceStatusHandler(_req: Request, res: Response): void {
  const health = bhashiniPipeline.getPipelineHealth();
  res.json({
    success: true,
    status: health
  });
}
