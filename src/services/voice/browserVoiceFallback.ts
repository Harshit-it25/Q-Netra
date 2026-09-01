/**
 * Browser / Device Web Speech API Fallback Layer.
 * Used automatically whenever BHASHINI cloud service is unreachable or offline.
 */

import { LanguageCode, LANGUAGE_REGISTRY } from './languagePreferenceService';

export interface BrowserVoiceResult {
  success: boolean;
  provider: 'BROWSER';
  latencyMs: number;
  error?: string;
}

export class BrowserVoiceFallback {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListening = false;

  isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isSttSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  /**
   * Speak using browser-native SpeechSynthesis.
   */
  speak(
    text: string,
    language: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void
  ): BrowserVoiceResult {
    const startTime = Date.now();
    this.stopSpeaking();

    if (!this.isTtsSupported()) {
      if (onEnd) onEnd();
      return {
        success: false,
        provider: 'BROWSER',
        latencyMs: 0,
        error: 'SpeechSynthesis unsupported'
      };
    }

    try {
      const cleanText = text.replace(/[*_#`~🔴⚠️❌✓]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langDef = LANGUAGE_REGISTRY[language] || LANGUAGE_REGISTRY['en-IN'];
      utterance.lang = langDef.locale;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices() || [];
      const match = voices.find(
        (v) =>
          v.lang?.toLowerCase().replace('_', '-') === langDef.locale.toLowerCase() ||
          v.lang?.toLowerCase().startsWith(langDef.bhashiniCode)
      );
      if (match) {
        utterance.voice = match;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      return {
        success: true,
        provider: 'BROWSER',
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      if (onEnd) onEnd();
      return {
        success: false,
        provider: 'BROWSER',
        latencyMs: Date.now() - startTime,
        error: err.message || 'SpeechSynthesis failed'
      };
    }
  }

  stopSpeaking(): void {
    if (this.isTtsSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.currentUtterance = null;
  }

  /**
   * Listen using browser-native SpeechRecognition.
   */
  startListening(
    language: LanguageCode,
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.isSttSupported()) {
      onError('SpeechRecognition unsupported');
      return false;
    }

    this.stopListening();

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langDef = LANGUAGE_REGISTRY[language] || LANGUAGE_REGISTRY['en-IN'];
      recognition.lang = langDef.locale;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error || 'Speech recognition error');
      };

      recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition = recognition;
      recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || 'Failed to start recognition');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const browserVoiceFallback = new BrowserVoiceFallback();
