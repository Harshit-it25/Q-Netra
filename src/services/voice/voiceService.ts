/**
 * Unified Voice Service Facade for Q-NETRA AI.
 * Orchestrates BHASHINI Cloud Speech with Browser Web Speech API fallback.
 */

import { bhashiniVoiceService } from './bhashiniVoiceService';
import { browserVoiceFallback } from './browserVoiceFallback';
import {
  languagePreferenceService,
  LanguageCode,
  LANGUAGE_REGISTRY
} from './languagePreferenceService';

export type VoiceEngineType = 'BHASHINI' | 'BROWSER' | 'NONE';

export interface VoiceSpeakOptions {
  language?: LanguageCode;
  decisionKey?: string;
  forceReplay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export interface VoiceListenOptions {
  language?: LanguageCode;
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd?: () => void;
  preferBhashini?: boolean;
}

export interface VoiceTelemetry {
  lastTtsProvider: VoiceEngineType;
  lastSttProvider: VoiceEngineType;
  lastTtsLatencyMs: number;
  lastSttLatencyMs: number;
  isSpeaking: boolean;
  isListening: boolean;
  voiceAlertsEnabled: boolean;
  currentLanguage: LanguageCode;
}

export class VoiceService {
  private lastSpokenDecisionKey: string | null = null;
  private isSpeakingState = false;
  private isListeningState = false;
  private lastTtsProvider: VoiceEngineType = 'NONE';
  private lastSttProvider: VoiceEngineType = 'NONE';
  private lastTtsLatencyMs = 0;
  private lastSttLatencyMs = 0;

  /**
   * Speaks the provided localized text.
   * Enforces 1:1 text-to-voice identity and duplicate speech prevention.
   */
  async speak(text: string, options: VoiceSpeakOptions = {}): Promise<boolean> {
    const {
      language = languagePreferenceService.getLanguage(),
      decisionKey,
      forceReplay = false,
      onStart,
      onEnd,
      onError
    } = options;

    if (!languagePreferenceService.isVoiceAlertsEnabled()) {
      if (onEnd) onEnd();
      return false;
    }

    // Duplicate speech protection for automatic alerts
    if (decisionKey && !forceReplay) {
      const fullKey = `${decisionKey}_${language}`;
      if (this.lastSpokenDecisionKey === fullKey) {
        return false; // Already spoken automatically
      }
      this.lastSpokenDecisionKey = fullKey;
    }

    // Stop any ongoing speech
    this.stop();
    this.isSpeakingState = true;

    const handleStart = () => {
      this.isSpeakingState = true;
      if (onStart) onStart();
    };

    const handleEnd = () => {
      this.isSpeakingState = false;
      if (onEnd) onEnd();
    };

    // Step 1: Attempt BHASHINI Cloud TTS (Production NLTM)
    try {
      const bhashiniRes = await bhashiniVoiceService.synthesizeAndPlay(
        text,
        language,
        handleStart,
        handleEnd
      );

      if (bhashiniRes.success) {
        this.lastTtsProvider = 'BHASHINI';
        this.lastTtsLatencyMs = bhashiniRes.latencyMs;
        return true;
      }
    } catch (err) {
      console.warn('BHASHINI TTS attempt encountered exception, cascading to local fallback:', err);
    }

    // Step 2: Cascading Fallback to Browser / Device SpeechSynthesis
    try {
      const browserRes = browserVoiceFallback.speak(
        text,
        language,
        handleStart,
        handleEnd
      );

      if (browserRes.success) {
        this.lastTtsProvider = 'BROWSER';
        this.lastTtsLatencyMs = browserRes.latencyMs;
        return true;
      }
    } catch (err) {
      console.warn('Browser TTS fallback failed:', err);
    }

    // Step 3: Text-only (no crash)
    this.isSpeakingState = false;
    this.lastTtsProvider = 'NONE';
    if (onError) onError('Voice playback unavailable on this device/network.');
    if (onEnd) onEnd();
    return false;
  }

  /**
   * Listens for speech and returns the transcript.
   * Tries browser recognition first for instant feedback or Bhashini ASR.
   */
  async listen(options: VoiceListenOptions): Promise<boolean> {
    const {
      language = languagePreferenceService.getLanguage(),
      onResult,
      onError,
      onEnd,
      preferBhashini = false
    } = options;

    this.stop();
    this.isListeningState = true;

    const wrappedOnEnd = () => {
      this.isListeningState = false;
      if (onEnd) onEnd();
    };

    // Option A: If preferBhashini is true and MediaRecorder is supported, record & transcribe via Bhashini
    if (preferBhashini) {
      const recorded = await bhashiniVoiceService.startRecording();
      if (recorded) {
        this.lastSttProvider = 'BHASHINI';
        return true;
      }
    }

    // Option B: Native Browser SpeechRecognition fallback
    if (browserVoiceFallback.isSttSupported()) {
      const started = browserVoiceFallback.startListening(
        language,
        (transcript) => {
          this.lastSttProvider = 'BROWSER';
          this.isListeningState = false;
          onResult(transcript);
        },
        (err) => {
          this.isListeningState = false;
          onError(err);
        },
        wrappedOnEnd
      );

      if (started) {
        this.lastSttProvider = 'BROWSER';
        return true;
      }
    }

    this.isListeningState = false;
    onError('Speech recognition unavailable on this device.');
    wrappedOnEnd();
    return false;
  }

  /**
   * Finish Bhashini recording and request transcription.
   */
  async stopBhashiniRecording(language?: LanguageCode) {
    const targetLang = language || languagePreferenceService.getLanguage();
    const result = await bhashiniVoiceService.stopRecordingAndTranscribe(targetLang);
    this.isListeningState = false;
    if (result.success) {
      this.lastSttLatencyMs = result.latencyMs;
      this.lastSttProvider = 'BHASHINI';
    }
    return result;
  }

  /**
   * Stop all active playback and recording.
   */
  stop(): void {
    bhashiniVoiceService.stopAudio();
    bhashiniVoiceService.stopRecording();
    browserVoiceFallback.stopSpeaking();
    browserVoiceFallback.stopListening();
    this.isSpeakingState = false;
    this.isListeningState = false;
  }

  isAvailable(): boolean {
    return browserVoiceFallback.isTtsSupported() || true; // Server proxy always reachable
  }

  isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  isListening(): boolean {
    return this.isListeningState;
  }

  getTelemetry(): VoiceTelemetry {
    return {
      lastTtsProvider: this.lastTtsProvider,
      lastSttProvider: this.lastSttProvider,
      lastTtsLatencyMs: this.lastTtsLatencyMs,
      lastSttLatencyMs: this.lastSttLatencyMs,
      isSpeaking: this.isSpeakingState,
      isListening: this.isListeningState,
      voiceAlertsEnabled: languagePreferenceService.isVoiceAlertsEnabled(),
      currentLanguage: languagePreferenceService.getLanguage()
    };
  }

  resetSpokenCache(): void {
    this.lastSpokenDecisionKey = null;
  }
}

export const voiceService = new VoiceService();
