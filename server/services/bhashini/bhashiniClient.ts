import { getBhashiniConfig, resolveBhashiniLanguage } from './bhashiniConfig';

export interface SynthesizeTtsRequest {
  text: string;
  language: string; // e.g. 'mr-IN' or 'mr'
  gender?: 'female' | 'male';
}

export interface SynthesizeTtsResponse {
  success: boolean;
  audioContentBase64?: string;
  audioFormat?: string;
  latencyMs: number;
  language: string;
  error?: string;
  errorCode?: string;
}

export interface TranscribeAsrRequest {
  audioBase64: string;
  language: string;
  audioFormat?: string;
}

export interface TranscribeAsrResponse {
  success: boolean;
  transcript?: string;
  latencyMs: number;
  language: string;
  error?: string;
  errorCode?: string;
}

export class BhashiniClient {
  /**
   * Request Text-to-Speech synthesis from Bhashini Pipeline.
   */
  async synthesizeTts(req: SynthesizeTtsRequest): Promise<SynthesizeTtsResponse> {
    const startTime = Date.now();
    const config = getBhashiniConfig();
    const langInfo = resolveBhashiniLanguage(req.language);

    if (!config.apiKey || !config.userId) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        language: langInfo.code,
        error: 'BHASHINI credentials (API Key / User ID) not configured on backend.',
        errorCode: 'BHASHINI_UNCONFIGURED'
      };
    }

    const payload = {
      pipelineTasks: [
        {
          taskType: 'tts',
          config: {
            language: {
              sourceLanguage: langInfo.bhashiniCode
            },
            gender: req.gender || langInfo.defaultGender,
            samplingRate: 16000
          }
        }
      ],
      inputData: {
        input: [
          {
            source: req.text
          }
        ]
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: config.apiKey,
        'User-Id': config.userId,
        userID: config.userId,
        ulcaApiKey: config.apiKey
      };
      if (config.pipelineId) {
        headers['pipelineId'] = config.pipelineId;
      }

      const response = await fetch(config.inferenceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        let errDetail = `HTTP ${response.status} ${response.statusText}`;
        if (response.status === 401 || response.status === 403) {
          errDetail = 'Invalid or expired BHASHINI API authorization.';
        } else if (response.status === 429) {
          errDetail = 'BHASHINI quota exceeded or rate limited.';
        } else if (response.status >= 500) {
          errDetail = 'BHASHINI upstream service temporarily unavailable.';
        }

        return {
          success: false,
          latencyMs,
          language: langInfo.code,
          error: errDetail,
          errorCode: `HTTP_${response.status}`
        };
      }

      const data: any = await response.json();
      const audioBase64 =
        data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent ||
        data?.audio?.[0]?.audioContent;

      if (!audioBase64) {
        return {
          success: false,
          latencyMs,
          language: langInfo.code,
          error: 'BHASHINI returned response without audio payload.',
          errorCode: 'EMPTY_AUDIO_PAYLOAD'
        };
      }

      return {
        success: true,
        audioContentBase64: audioBase64,
        audioFormat: 'wav',
        latencyMs,
        language: langInfo.code
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';

      return {
        success: false,
        latencyMs,
        language: langInfo.code,
        error: isTimeout
          ? `BHASHINI request timed out after ${config.timeoutMs}ms.`
          : (err.message || 'BHASHINI network connection failed.'),
        errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Request Speech-to-Text transcription from Bhashini Pipeline.
   */
  async transcribeAsr(req: TranscribeAsrRequest): Promise<TranscribeAsrResponse> {
    const startTime = Date.now();
    const config = getBhashiniConfig();
    const langInfo = resolveBhashiniLanguage(req.language);

    if (!config.apiKey || !config.userId) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        language: langInfo.code,
        error: 'BHASHINI credentials (API Key / User ID) not configured on backend.',
        errorCode: 'BHASHINI_UNCONFIGURED'
      };
    }

    const payload = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: {
              sourceLanguage: langInfo.bhashiniCode
            },
            audioFormat: req.audioFormat || 'wav',
            samplingRate: 16000
          }
        }
      ],
      inputData: {
        audio: [
          {
            audioContent: req.audioBase64
          }
        ]
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: config.apiKey,
        'User-Id': config.userId,
        userID: config.userId,
        ulcaApiKey: config.apiKey
      };
      if (config.pipelineId) {
        headers['pipelineId'] = config.pipelineId;
      }

      const response = await fetch(config.inferenceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        let errDetail = `HTTP ${response.status} ${response.statusText}`;
        if (response.status === 401 || response.status === 403) {
          errDetail = 'Invalid or expired BHASHINI API authorization.';
        } else if (response.status === 429) {
          errDetail = 'BHASHINI quota exceeded or rate limited.';
        } else if (response.status >= 500) {
          errDetail = 'BHASHINI upstream service temporarily unavailable.';
        }

        return {
          success: false,
          latencyMs,
          language: langInfo.code,
          error: errDetail,
          errorCode: `HTTP_${response.status}`
        };
      }

      const data: any = await response.json();
      const transcript =
        data?.pipelineResponse?.[0]?.output?.[0]?.source ||
        data?.output?.[0]?.source;

      if (!transcript && transcript !== '') {
        return {
          success: false,
          latencyMs,
          language: langInfo.code,
          error: 'BHASHINI returned response without transcript.',
          errorCode: 'EMPTY_TRANSCRIPT'
        };
      }

      return {
        success: true,
        transcript: transcript.trim(),
        latencyMs,
        language: langInfo.code
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';

      return {
        success: false,
        latencyMs,
        language: langInfo.code,
        error: isTimeout
          ? `BHASHINI request timed out after ${config.timeoutMs}ms.`
          : (err.message || 'BHASHINI network connection failed.'),
        errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
      };
    }
  }
}

export const bhashiniClient = new BhashiniClient();
