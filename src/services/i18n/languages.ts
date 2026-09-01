/**
 * Supported Languages and Speech Synthesis BCP-47 Configuration for Q-NETRA AI.
 */

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te' | 'kn' | 'gu';

export interface LanguageInfo {
  code: SupportedLanguage;
  bcp47: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    bcp47: 'en-IN',
    name: 'English',
    nativeName: 'English (India)',
    flag: '🇮🇳'
  },
  hi: {
    code: 'hi',
    bcp47: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳'
  },
  mr: {
    code: 'mr',
    bcp47: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳'
  },
  bn: {
    code: 'bn',
    bcp47: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳'
  },
  ta: {
    code: 'ta',
    bcp47: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳'
  },
  te: {
    code: 'te',
    bcp47: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳'
  },
  kn: {
    code: 'kn',
    bcp47: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳'
  },
  gu: {
    code: 'gu',
    bcp47: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳'
  }
};

export const LANGUAGE_LIST = Object.values(SUPPORTED_LANGUAGES);

const LANG_STORAGE_KEY = 'qnetra_preferred_language';
const VOICE_ALERTS_STORAGE_KEY = 'qnetra_voice_alerts_enabled';

export function getSavedLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage | null;
    if (saved && saved in SUPPORTED_LANGUAGES) {
      return saved;
    }
  } catch {}
  return 'en';
}

export function savePreferredLanguage(lang: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {}
}

export function getSavedVoiceAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem(VOICE_ALERTS_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {}
  return true;
}

export function saveVoiceAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_ALERTS_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {}
}
