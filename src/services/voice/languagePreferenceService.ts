/**
 * Centralized Language Preference and Bhashini Locale Service for Q-NETRA AI.
 */

export type LanguageCode =
  | 'en-IN'
  | 'hi-IN'
  | 'mr-IN'
  | 'bn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'kn-IN'
  | 'gu-IN';

export interface LanguageDefinition {
  code: LanguageCode;
  displayName: string;
  nativeName: string;
  locale: string;
  bhashiniCode: string;
  fallbackLocale: LanguageCode;
  flag: string;
}

export const LANGUAGE_REGISTRY: Record<LanguageCode, LanguageDefinition> = {
  'en-IN': {
    code: 'en-IN',
    displayName: 'English',
    nativeName: 'English (India)',
    locale: 'en-IN',
    bhashiniCode: 'en',
    fallbackLocale: 'en-IN',
    flag: '🇮🇳'
  },
  'hi-IN': {
    code: 'hi-IN',
    displayName: 'Hindi',
    nativeName: 'हिन्दी',
    locale: 'hi-IN',
    bhashiniCode: 'hi',
    fallbackLocale: 'en-IN',
    flag: '🇮🇳'
  },
  'mr-IN': {
    code: 'mr-IN',
    displayName: 'Marathi',
    nativeName: 'मराठी',
    locale: 'mr-IN',
    bhashiniCode: 'mr',
    fallbackLocale: 'hi-IN',
    flag: '🇮🇳'
  },
  'bn-IN': {
    code: 'bn-IN',
    displayName: 'Bengali',
    nativeName: 'বাংলা',
    locale: 'bn-IN',
    bhashiniCode: 'bn',
    fallbackLocale: 'en-IN',
    flag: '🇮🇳'
  },
  'ta-IN': {
    code: 'ta-IN',
    displayName: 'Tamil',
    nativeName: 'தமிழ்',
    locale: 'ta-IN',
    bhashiniCode: 'ta',
    fallbackLocale: 'en-IN',
    flag: '🇮🇳'
  },
  'te-IN': {
    code: 'te-IN',
    displayName: 'Telugu',
    nativeName: 'తెలుగు',
    locale: 'te-IN',
    bhashiniCode: 'te',
    fallbackLocale: 'en-IN',
    flag: '🇮🇳'
  },
  'kn-IN': {
    code: 'kn-IN',
    displayName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    locale: 'kn-IN',
    bhashiniCode: 'kn',
    fallbackLocale: 'en-IN',
    flag: '🇮🇳'
  },
  'gu-IN': {
    code: 'gu-IN',
    displayName: 'Gujarati',
    nativeName: 'ગુજરાતી',
    locale: 'gu-IN',
    bhashiniCode: 'gu',
    fallbackLocale: 'hi-IN',
    flag: '🇮🇳'
  }
};

export const ALL_SUPPORTED_LANGUAGES = Object.values(LANGUAGE_REGISTRY);

const STORAGE_KEY_LANG = 'qnetra_preferred_language';
const STORAGE_KEY_VOICE = 'qnetra_voice_alerts_enabled';

export class LanguagePreferenceService {
  private currentLanguage: LanguageCode = 'en-IN';

  constructor() {
    this.currentLanguage = this.loadSavedPreference();
  }

  private loadSavedPreference(): LanguageCode {
    if (typeof window === 'undefined') return 'en-IN';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && saved in LANGUAGE_REGISTRY) {
        return saved as LanguageCode;
      }
      // Handle legacy short code migration (e.g. 'mr' -> 'mr-IN')
      if (saved) {
        const matching = Object.values(LANGUAGE_REGISTRY).find(
          (l) => l.bhashiniCode === saved || l.code.startsWith(saved)
        );
        if (matching) return matching.code;
      }
    } catch {}
    return 'en-IN';
  }

  getLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  getLanguageDefinition(code?: LanguageCode): LanguageDefinition {
    const target = code || this.currentLanguage;
    return LANGUAGE_REGISTRY[target] || LANGUAGE_REGISTRY['en-IN'];
  }

  setLanguage(code: LanguageCode): void {
    if (code in LANGUAGE_REGISTRY) {
      this.currentLanguage = code;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_LANG, code);
        } catch {}
      }
    }
  }

  isVoiceAlertsEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOICE);
      return saved !== 'false';
    } catch {
      return true;
    }
  }

  setVoiceAlertsEnabled(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_VOICE, enabled ? 'true' : 'false');
      } catch {}
    }
  }
}

export const languagePreferenceService = new LanguagePreferenceService();
