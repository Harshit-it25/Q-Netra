/**
 * Web Speech API text-to-speech synthesis service with multilingual voice selection,
 * duplicate speech protection, and graceful failure handling.
 */

import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/languages';

export interface SpeakOptions {
  lang?: SupportedLanguage;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  forceReplay?: boolean;
  decisionKey?: string;
}

export class SpeechSynthesisService {
  private lastSpokenKey: string | null = null;
  private isCurrentlySpeaking = false;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    try {
      return window.speechSynthesis.getVoices() || [];
    } catch {
      return [];
    }
  }

  /**
   * Find the most suitable voice for the requested language.
   */
  findVoiceForLanguage(lang: SupportedLanguage = 'en'): SpeechSynthesisVoice | null {
    if (!this.isSupported()) return null;
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const langInfo = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.en;
    const targetBcp47 = langInfo.bcp47.toLowerCase();
    const targetBase = lang.toLowerCase();

    // Priority 1: Exact BCP-47 match (e.g. "mr-IN" or "hi-IN")
    let match = voices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-') === targetBcp47);
    if (match) return match;

    // Priority 2: Matches language prefix (e.g. starts with "mr" or "hi")
    match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(targetBase));
    if (match) return match;

    // Priority 3: Voice name contains language name
    match = voices.find((v) => v.name && v.name.toLowerCase().includes(langInfo.name.toLowerCase()));
    if (match) return match;

    // Priority 4: Indian English voice fallback
    match = voices.find((v) => v.lang && v.lang.toLowerCase().includes('en-in'));
    if (match) return match;

    // Priority 5: Any English voice fallback
    match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (match) return match;

    return voices[0] || null;
  }

  /**
   * Checks if TTS is available for the given language on this browser/device.
   */
  hasVoiceForLanguage(lang: SupportedLanguage = 'en'): boolean {
    if (!this.isSupported()) return false;
    const voice = this.findVoiceForLanguage(lang);
    return Boolean(voice);
  }

  /**
   * Speaks text in the specified language.
   * Prevents duplicate automatic plays using decisionKey.
   */
  speak(text: string, options: SpeakOptions = {}): boolean {
    const { lang = 'en', onStart, onEnd, onError, forceReplay = false, decisionKey } = options;

    if (!this.isSupported()) {
      if (onError) onError('Speech synthesis not supported on this device/browser.');
      if (onEnd) onEnd();
      return false;
    }

    // Duplicate speech prevention for automatic decisions
    if (decisionKey && !forceReplay) {
      const fullKey = `${decisionKey}_${lang}`;
      if (this.lastSpokenKey === fullKey) {
        return false; // Already spoken automatically
      }
      this.lastSpokenKey = fullKey;
    }

    // Cancel any previous speech
    this.stop();

    try {
      const cleanText = text.replace(/[*_#`~🔴⚠️❌✓]/g, '').trim();
      if (!cleanText) {
        if (onEnd) onEnd();
        return false;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langInfo = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.en;
      utterance.lang = langInfo.bcp47;
      utterance.rate = 0.95; // Clear natural pacing for safety warnings
      utterance.pitch = 1.0;

      const voice = this.findVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isCurrentlySpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isCurrentlySpeaking = false;
        // Don't crash on cancel or interrupted errors
        if (onError) onError(e);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Speech synthesis execution failed:', err);
      this.isCurrentlySpeaking = false;
      if (onError) onError(err);
      if (onEnd) onEnd();
      return false;
    }
  }

  stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isCurrentlySpeaking = false;
  }

  isSpeaking(): boolean {
    if (!this.isSupported()) return false;
    try {
      return this.isCurrentlySpeaking || window.speechSynthesis.speaking;
    } catch {
      return false;
    }
  }

  resetSpokenCache(): void {
    this.lastSpokenKey = null;
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
