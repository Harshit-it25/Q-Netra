import { LocalPaymentContext } from '../../domain/payment/types';
import { detectDeviceCapabilities } from '../device/deviceCapabilityService';
import { analyzeContextLocally } from '../localAI/localAIService';
import { analyzeContextHeuristically } from '../localAI/heuristicContextService';

/**
 * On-Device AI Context Classifier Service (Unified Local AI Entrypoint)
 * Routes to MobileBERT 25.3M local model with deterministic heuristic fallback.
 */

export function analyzePaymentContextLocally(rawText: string): LocalPaymentContext {
  return analyzeContextLocally(rawText);
}

export function analyzePaymentContextHeuristically(rawText: string): LocalPaymentContext {
  return analyzeContextHeuristically(rawText);
}

export function detectHardwareProfile() {
  const cap = detectDeviceCapabilities();
  return {
    isSnapdragon: cap.isSnapdragon,
    deviceModel: cap.platformDescription,
    aiEngine: cap.executionEngine,
    hardwarePlatform: cap.isSnapdragon ? 'Snapdragon platform detected' : 'Standard CPU Platform',
    executionRuntime: cap.isSnapdragon ? 'On-device V8/JIT' : 'On-device V8/JIT',
    runtimeMode: cap.isSnapdragon ? 'V8 JIT (Snapdragon CPU)' : 'V8 JIT (Standard CPU)',
    offlineCapable: true,
    estimatedLatencyMs: 3
  };
}

export { analyzePaymentContextLocally as classifyPaymentContextLocally };

