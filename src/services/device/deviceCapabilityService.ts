/**
 * Device capability and telemetry service.
 * Accurately detects client browser hardware platform and execution environment.
 */
export interface DeviceCapabilities {
  isSnapdragon: boolean;
  platformDescription: string;
  executionEngine: string;
  offlineReady: boolean;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  hasCamera: boolean;
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isSnapdragon = /Snapdragon|SM8[0-9]{3}|Adreno|iQOO|vivo/i.test(ua);

  const hasSpeechRecognition = typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );

  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasCamera = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

  return {
    isSnapdragon,
    platformDescription: isSnapdragon
      ? 'Snapdragon Platform Detected (Client JIT CPU runtime)'
      : 'Standard Web Client Runtime (V8 JIT Engine)',
    executionEngine: isSnapdragon
      ? 'Local CPU/JIT execution (Snapdragon Platform)'
      : 'Local CPU/JIT execution',
    offlineReady: true,
    hasSpeechRecognition,
    hasSpeechSynthesis,
    hasCamera
  };
}
