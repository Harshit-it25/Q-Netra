import { LocalPaymentContext } from '../../domain/payment/types';
import { analyzeContextHeuristically } from './heuristicContextService';
import { classifyWithMobileBert, classifyWithMobileBertAsync, MobileBertAnalysisResult } from './mobileBertService';
import { detectDeviceCapabilities } from '../device/deviceCapabilityService';
import { modelLoader } from './modelLoader';

export interface LocalAIOptions {
  forceFallback?: boolean;
  modelOverride?: 'MobileBERT' | 'HEURISTIC';
  timeoutMs?: number;
}

function buildPaymentContextFromResult(
  text: string,
  bertResult: MobileBertAnalysisResult,
  startTime: number
): LocalPaymentContext {
  let extractedVpa: string | undefined;
  const vpaMatch = text.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}/);
  if (vpaMatch) extractedVpa = vpaMatch[0];

  let extractedAmount: number | undefined;
  const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (amountMatch) {
    extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  const isPaymentRequest = bertResult.signals.payment_request >= 0.40;
  const isUrgency = bertResult.signals.urgency >= 0.40;
  const isPaymentPressure = bertResult.signals.payment_pressure >= 0.40;
  const isAuthorityClaim = bertResult.signals.authority_impersonation >= 0.40;

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const totalLatency = Math.max(1, Math.round(endTime - startTime));
  const capabilities = detectDeviceCapabilities();

  return {
    payment_request: isPaymentRequest,
    urgency: isUrgency,
    payment_pressure: isPaymentPressure,
    authority_claim: isAuthorityClaim,
    signalStrength: bertResult.signalStrength,
    heuristicScore: Number(bertResult.signals.fraud.toFixed(2)),
    confidence: Number(bertResult.signals.fraud.toFixed(2)),
    threat_indicators: bertResult.threatIndicators,
    extracted_vpa: extractedVpa,
    extracted_amount: extractedAmount,
    inference_engine: bertResult.isHeuristicFallback
      ? 'Heuristic Rule Engine (Fallback)'
      : `MobileBERT (25.3M INT8 ONNX) on WebAssembly/CPU`,
    hardware_platform: bertResult.hardwarePlatform || 'Standard CPU Platform',
    execution_runtime: bertResult.executionRuntime || 'ONNX Runtime Web (WASM)',
    latency_ms: totalLatency,
    offline_ready: true,
    model_type: bertResult.isHeuristicFallback ? 'HEURISTIC' : 'MobileBERT',
    execution_backend: bertResult.isHeuristicFallback ? 'V8_JIT' : 'CPU',
    multi_label_scores: {
      legitimate: bertResult.signals.legitimate,
      payment_request: bertResult.signals.payment_request,
      urgency: bertResult.signals.urgency,
      payment_pressure: bertResult.signals.payment_pressure,
      authority_impersonation: bertResult.signals.authority_impersonation,
      phishing: bertResult.signals.phishing,
      social_engineering: bertResult.signals.social_engineering,
      fraud: bertResult.signals.fraud
    },
    predicted_labels: bertResult.predictedLabels,
    fallback_used: bertResult.isHeuristicFallback,
    inference_breakdown: {
      tokenizerMs: bertResult.latencyBreakdown.tokenizerMs,
      inferenceMs: bertResult.latencyBreakdown.inferenceMs,
      totalMs: totalLatency
    }
  };
}

/**
 * Primary asynchronous context classification utilizing the genuine ONNX WebAssembly session.
 */
export async function analyzeContextLocallyAsync(
  rawText: string,
  options: LocalAIOptions = {}
): Promise<LocalPaymentContext> {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(rawText || '').trim();

  if (options.forceFallback || options.modelOverride === 'HEURISTIC' || modelLoader.getState() === 'FALLBACK_ONLY') {
    return analyzeContextHeuristically(text);
  }

  try {
    const bertResult = await classifyWithMobileBertAsync(text);
    return buildPaymentContextFromResult(text, bertResult, startTime);
  } catch (err) {
    console.warn('[LocalAIService] MobileBERT async inference failed, using heuristic fallback:', err);
    return analyzeContextHeuristically(text);
  }
}

/**
 * Synchronous context classification interface for synchronous payment flows.
 */
export function analyzeContextLocally(
  rawText: string,
  options: LocalAIOptions = {}
): LocalPaymentContext {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(rawText || '').trim();

  if (options.forceFallback || options.modelOverride === 'HEURISTIC' || modelLoader.getState() === 'FALLBACK_ONLY') {
    return analyzeContextHeuristically(text);
  }

  try {
    const bertResult = classifyWithMobileBert(text);
    return buildPaymentContextFromResult(text, bertResult, startTime);
  } catch (err) {
    console.warn('[LocalAIService] MobileBERT sync evaluation failed, falling back to heuristic engine:', err);
    return analyzeContextHeuristically(text);
  }
}

export { analyzeContextLocally as analyzePaymentContextLocally };
export { analyzeContextLocallyAsync as analyzePaymentContextLocallyAsync };
