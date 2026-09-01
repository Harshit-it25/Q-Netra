import { bhashiniClient, SynthesizeTtsResponse, TranscribeAsrResponse } from './bhashiniClient';
import { getBhashiniConfig, resolveBhashiniLanguage, isBhashiniConfigured } from './bhashiniConfig';

export interface SynthesizePayload {
  text: string;
  language: string;
  gender?: 'female' | 'male';
}

export interface TranscribePayload {
  audioBase64: string;
  language: string;
  audioFormat?: string;
}

export class BhashiniPipeline {
  /**
   * Validate and synthesize speech using Bhashini TTS.
   */
  async processTts(payload: SynthesizePayload): Promise<SynthesizeTtsResponse> {
    const startTime = Date.now();
    const config = getBhashiniConfig();

    if (!payload.text || typeof payload.text !== 'string' || !payload.text.trim()) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        language: payload.language || 'en-IN',
        error: 'Text payload is empty or invalid.',
        errorCode: 'INVALID_TEXT'
      };
    }

    if (payload.text.length > 2000) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        language: payload.language || 'en-IN',
        error: 'Text payload exceeds 2000 character safety limit.',
        errorCode: 'TEXT_TOO_LONG'
      };
    }

    const cleanText = payload.text.replace(/[*_#`~🔴⚠️❌✓]/g, '').trim();
    const langInfo = resolveBhashiniLanguage(payload.language || 'en-IN');

    return bhashiniClient.synthesizeTts({
      text: cleanText,
      language: langInfo.code,
      gender: payload.gender || langInfo.defaultGender
    });
  }

  /**
   * Validate and transcribe speech using Bhashini ASR.
   */
  async processAsr(payload: TranscribePayload): Promise<TranscribeAsrResponse> {
    const startTime = Date.now();
    const config = getBhashiniConfig();

    if (!payload.audioBase64 || typeof payload.audioBase64 !== 'string' || !payload.audioBase64.trim()) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        language: payload.language || 'en-IN',
        error: 'Audio payload is empty or missing.',
        errorCode: 'EMPTY_AUDIO'
      };
    }

    // Check payload size limit (max 2MB base64)
    if (payload.audioBase64.length > config.maxAudioSizeBytes) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        language: payload.language || 'en-IN',
        error: 'Audio payload exceeds maximum size limit (2MB).',
        errorCode: 'AUDIO_TOO_LARGE'
      };
    }

    const langInfo = resolveBhashiniLanguage(payload.language || 'en-IN');

    return bhashiniClient.transcribeAsr({
      audioBase64: payload.audioBase64,
      language: langInfo.code,
      audioFormat: payload.audioFormat || 'wav'
    });
  }

  getPipelineHealth() {
    return {
      configured: isBhashiniConfigured(),
      supportedLanguages: ['en-IN', 'hi-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN', 'kn-IN', 'gu-IN'],
      provider: 'BHASHINI (Government of India NLTM)'
    };
  }
}

export const bhashiniPipeline = new BhashiniPipeline();
