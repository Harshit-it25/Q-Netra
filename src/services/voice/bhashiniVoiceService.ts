/**
 * Client-Side BHASHINI Speech Transport Service.
 * Communicates with Q-NETRA Backend Proxy to protect API credentials.
 */

import { LanguageCode } from './languagePreferenceService';
import { buildFullApiUrl } from '../api/apiClient';

export interface BhashiniTtsResult {
  success: boolean;
  audioBase64?: string;
  latencyMs: number;
  provider: 'BHASHINI';
  error?: string;
  fallbackRequired: boolean;
}

export interface BhashiniSttResult {
  success: boolean;
  transcript?: string;
  latencyMs: number;
  provider: 'BHASHINI';
  error?: string;
  fallbackRequired: boolean;
}

export class BhashiniVoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  /**
   * Synthesizes speech using the backend Bhashini proxy and plays it via HTML5 Audio.
   */
  async synthesizeAndPlay(
    text: string,
    language: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<BhashiniTtsResult> {
    const startTime = Date.now();
    this.stopAudio();

    try {
      const response = await fetch(buildFullApiUrl('/api/voice/synthesize'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          language
        })
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          latencyMs,
          provider: 'BHASHINI',
          error: `Backend HTTP ${response.status}`,
          fallbackRequired: true
        };
      }

      const data = await response.json();

      if (!data.success || !data.audioContentBase64) {
        return {
          success: false,
          latencyMs,
          provider: 'BHASHINI',
          error: data.error || 'Empty audio content',
          fallbackRequired: true
        };
      }

      // Convert Base64 to audio blob URL and play
      const audioUrl = `data:audio/wav;base64,${data.audioContentBase64}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        if (onStart) onStart();
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      await audio.play();

      return {
        success: true,
        audioBase64: data.audioContentBase64,
        latencyMs: data.latencyMs || latencyMs,
        provider: 'BHASHINI',
        fallbackRequired: false
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        latencyMs,
        provider: 'BHASHINI',
        error: err.message || 'Bhashini proxy request failed',
        fallbackRequired: true
      };
    }
  }

  /**
   * Starts microphone recording using MediaRecorder for Bhashini ASR.
   */
  async startRecording(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      recorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn('Microphone permission or MediaRecorder error:', err);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Stops recording, collects audio chunks, and transcribes via Bhashini ASR.
   */
  async stopRecordingAndTranscribe(language: LanguageCode): Promise<BhashiniSttResult> {
    const startTime = Date.now();

    if (!this.mediaRecorder || !this.isRecording) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        provider: 'BHASHINI',
        error: 'MediaRecorder is not active',
        fallbackRequired: true
      };
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isRecording = false;

        // Stop all audio tracks to release microphone
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }

        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const base64Audio = await this.blobToBase64(audioBlob);

          const response = await fetch(buildFullApiUrl('/api/voice/transcribe'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audioBase64: base64Audio,
              language,
              audioFormat: 'wav'
            })
          });

          const latencyMs = Date.now() - startTime;

          if (!response.ok) {
            resolve({
              success: false,
              latencyMs,
              provider: 'BHASHINI',
              error: `Backend HTTP ${response.status}`,
              fallbackRequired: true
            });
            return;
          }

          const data = await response.json();

          if (!data.success || !data.transcript) {
            resolve({
              success: false,
              latencyMs,
              provider: 'BHASHINI',
              error: data.error || 'No transcript returned',
              fallbackRequired: true
            });
            return;
          }

          resolve({
            success: true,
            transcript: data.transcript,
            latencyMs: data.latencyMs || latencyMs,
            provider: 'BHASHINI',
            fallbackRequired: false
          });
        } catch (err: any) {
          resolve({
            success: false,
            latencyMs: Date.now() - startTime,
            provider: 'BHASHINI',
            error: err.message || 'ASR request failed',
            fallbackRequired: true
          });
        }
      };

      try {
        this.mediaRecorder!.stop();
      } catch {
        this.isRecording = false;
        resolve({
          success: false,
          latencyMs: Date.now() - startTime,
          provider: 'BHASHINI',
          error: 'Recorder stop failed',
          fallbackRequired: true
        });
      }
    });
  }

  stopAudio(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {}
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      }
      this.isRecording = false;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data:audio/wav;base64, header
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const bhashiniVoiceService = new BhashiniVoiceService();
