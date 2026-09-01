import { bhashiniClient, SynthesizeTtsResponse, TranscribeAsrResponse } from './bhashiniClient';
import { getBhashiniConfig, resolveBhashiniLanguage, isBhashiniConfigured, BHASHINI_LANGUAGES } from './bhashiniConfig';

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
   * Maps locale code to Bhashini standard language code.
   */
  mapLanguageToBhashiniCode(locale: string): string {
    return resolveBhashiniLanguage(locale).bhashiniCode;
  }

  /**
   * Returns pipeline health and provider metadata.
   */
  getPipelineHealth() {
    return {
      provider: 'BHASHINI (Government of India NLTM)',
      configured: isBhashiniConfigured(),
      supportedLanguages: Object.values(BHASHINI_LANGUAGES).map(l => ({
        code: l.code,
        name: l.name,
        nativeName: l.nativeName
      }))
    };
  }

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
        errorCode: 'EMPTY_TEXT'
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
        transcript: '',
        error: 'Audio payload is empty or invalid.',
        errorCode: 'EMPTY_AUDIO'
      };
    }

    const cleanBase64 = payload.audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');
    const langInfo = resolveBhashiniLanguage(payload.language || 'en-IN');

    return bhashiniClient.transcribeAsr({
      audioBase64: cleanBase64,
      language: langInfo.code,
      audioFormat: payload.audioFormat || 'wav'
    });
  }
}

export const bhashiniPipeline = new BhashiniPipeline();
