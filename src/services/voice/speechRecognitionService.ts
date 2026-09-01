/**
 * Web Speech API speech-to-text service wrapper with multilingual support.
 */

import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/languages';

export type SpeechResultCallback = (transcript: string) => void;
export type SpeechErrorCallback = (error: string) => void;

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    this.initRecognition('en');
  }

  private initRecognition(lang: SupportedLanguage = 'en'): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          const langInfo = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.en;
          this.recognition.lang = langInfo.bcp47;
        } catch {
          this.recognition = null;
        }
      }
    }
  }

  isSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  setLanguage(lang: SupportedLanguage): void {
    const langInfo = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.en;
    if (this.recognition) {
      this.recognition.lang = langInfo.bcp47;
    }
  }

  startListening(
    onResult: SpeechResultCallback,
    onError: SpeechErrorCallback,
    onEnd?: () => void,
    lang: SupportedLanguage = 'en'
  ): void {
    if (!this.isSupported()) {
      onError('Speech recognition not supported on this browser.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.initRecognition(lang);

    if (!this.recognition) {
      onError('Failed to initialize speech recognition.');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Speech recognition failed.');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || 'Failed to start speech recognition.');
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

export const speechRecognitionService = new SpeechRecognitionService();
