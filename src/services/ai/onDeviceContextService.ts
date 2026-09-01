import { LocalPaymentContext } from '../../domain/payment/types';
import { detectDeviceCapabilities } from '../device/deviceCapabilityService';
import { analyzeContextLocally, analyzeContextLocallyAsync, LocalAIOptions } from '../localAI/localAIService';
import { analyzeContextHeuristically } from '../localAI/heuristicContextService';

/**
 * On-Device AI Context Classifier Service (Unified Local AI Entrypoint)
 * Routes to MobileBERT 25.3M local model with deterministic heuristic fallback.
 */

export function analyzePaymentContextLocally(rawText: string, options?: LocalAIOptions): LocalPaymentContext {
  return analyzeContextLocally(rawText, options);
}

export async function analyzePaymentContextLocallyAsync(rawText: string, options?: LocalAIOptions): Promise<LocalPaymentContext> {
  return analyzeContextLocallyAsync(rawText, options);
}

export function analyzePaymentContextHeuristically(rawText: string): LocalPaymentContext {
  return analyzeContextHeuristically(rawText);
}

export function detectHardwareProfile() {
  const cap = detectDeviceCapabilities();
  return {
    isSnapdragon: cap.isSnapdragon,
    deviceModel: cap.platformDescription,
    aiEngine: 'ONNX Runtime Web (WASM/CPU)',
    hardwarePlatform: cap.isSnapdragon ? 'Snapdragon Mobile Platform' : 'Standard CPU Platform',
    executionRuntime: 'WebAssembly Execution Provider',
    runtimeMode: 'ONNX WebAssembly',
    offlineCapable: true,
    estimatedLatencyMs: 4
  };
}

export { analyzePaymentContextLocally as classifyPaymentContextLocally };
export { analyzePaymentContextLocallyAsync as classifyPaymentContextLocallyAsync };
