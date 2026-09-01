/**
 * Centralized Configuration for Government of India BHASHINI Speech Services.
 */

export interface BhashiniLanguageConfig {
  code: string;               // e.g. 'mr-IN'
  bhashiniCode: string;       // e.g. 'mr'
  name: string;
  nativeName: string;
  defaultGender: 'female' | 'male';
}

export const BHASHINI_LANGUAGES: Record<string, BhashiniLanguageConfig> = {
  'en-IN': {
    code: 'en-IN',
    bhashiniCode: 'en',
    name: 'English',
    nativeName: 'English (India)',
    defaultGender: 'female'
  },
  'hi-IN': {
    code: 'hi-IN',
    bhashiniCode: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    defaultGender: 'female'
  },
  'mr-IN': {
    code: 'mr-IN',
    bhashiniCode: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    defaultGender: 'female'
  },
  'bn-IN': {
    code: 'bn-IN',
    bhashiniCode: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    defaultGender: 'female'
  },
  'ta-IN': {
    code: 'ta-IN',
    bhashiniCode: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    defaultGender: 'female'
  },
  'te-IN': {
    code: 'te-IN',
    bhashiniCode: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    defaultGender: 'female'
  },
  'kn-IN': {
    code: 'kn-IN',
    bhashiniCode: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    defaultGender: 'female'
  },
  'gu-IN': {
    code: 'gu-IN',
    bhashiniCode: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    defaultGender: 'female'
  }
};

export interface BhashiniServerConfig {
  apiKey: string;
  userId: string;
  pipelineId: string;
  inferenceUrl: string;
  ulcaConfigUrl: string;
  timeoutMs: number;
  maxAudioSizeBytes: number;
  maxAudioDurationSeconds: number;
}

export function getBhashiniConfig(): BhashiniServerConfig {
  return {
    apiKey: process.env.BHASHINI_API_KEY || process.env.BHASHINI_INFERENCE_KEY || '',
    userId: process.env.BHASHINI_USER_ID || process.env.BHASHINI_UDYAT_KEY || '',
    pipelineId: process.env.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543d6',
    inferenceUrl:
      process.env.BHASHINI_INFERENCE_URL ||
      'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
    ulcaConfigUrl:
      process.env.BHASHINI_ULCA_CONFIG_URL ||
      'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline',
    timeoutMs: parseInt(process.env.BHASHINI_TIMEOUT_MS || '7500', 10),
    maxAudioSizeBytes: 2 * 1024 * 1024, // 2MB max audio payload
    maxAudioDurationSeconds: 15
  };
}

export function isBhashiniConfigured(): boolean {
  const config = getBhashiniConfig();
  return Boolean(config.apiKey && config.userId);
}

export function resolveBhashiniLanguage(locale: string): BhashiniLanguageConfig {
  const normalized = locale.trim();
  if (BHASHINI_LANGUAGES[normalized]) {
    return BHASHINI_LANGUAGES[normalized];
  }
  // Try matching prefix (e.g. 'mr' from 'mr_IN' or 'mr')
  const prefix = normalized.split(/[-_]/)[0].toLowerCase();
  for (const item of Object.values(BHASHINI_LANGUAGES)) {
    if (item.bhashiniCode === prefix) {
      return item;
    }
  }
  return BHASHINI_LANGUAGES['en-IN'];
}
