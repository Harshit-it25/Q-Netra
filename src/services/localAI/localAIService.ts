import { LocalPaymentContext } from '../../domain/payment/types';
import { analyzeContextHeuristically } from './heuristicContextService';
import { classifyWithMobileBert, MobileBertAnalysisResult } from './mobileBertService';
import { detectDeviceCapabilities } from '../device/deviceCapabilityService';
import { modelLoader } from './modelLoader';

/**
 * =========================================================================
 * Q-NETRA LOCAL AI ORCHESTRATION SERVICE
 * =========================================================================
 * Architecture:
 *   PRIMARY:  MobileBERT (25.3M parameter local on-device model)
 *   FALLBACK: Pure Deterministic Heuristic Engine (activates ONLY on failure)
 * =========================================================================
 */

export interface LocalAIOptions {
  forceFallback?: boolean;
  modelOverride?: 'MobileBERT' | 'HEURISTIC';
  timeoutMs?: number;
}

export function analyzeContextLocally(
  rawText: string,
  options: LocalAIOptions = {}
): LocalPaymentContext {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(rawText || '').trim();

  // If fallback is explicitly forced or requested
  if (options.forceFallback || options.modelOverride === 'HEURISTIC' || modelLoader.getState() === 'FALLBACK_ONLY') {
    return analyzeContextHeuristically(text);
  }

  try {
    // 1. PRIMARY PATH: Execute MobileBERT On-Device Model
    const bertResult: MobileBertAnalysisResult = classifyWithMobileBert(text);

    // Validation check on MobileBERT output
    if (!bertResult || !bertResult.signals || typeof bertResult.signals.fraud !== 'number' || isNaN(bertResult.signals.fraud)) {
      throw new Error('MobileBERT returned malformed context signals');
    }

    // Check timeout constraint if configured (default 500ms)
    const midTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = midTime - startTime;
    if (options.timeoutMs && elapsed > options.timeoutMs) {
      throw new Error(`MobileBERT inference exceeded timeout threshold (${elapsed}ms > ${options.timeoutMs}ms)`);
    }

    // Extract basic transaction tokens (VPA & Amount)
    let extractedVpa: string | undefined;
    const vpaMatch = text.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}/);
    if (vpaMatch) extractedVpa = vpaMatch[0];

    let extractedAmount: number | undefined;
    const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (amountMatch) {
      extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Pure MobileBERT contextual indicators (NO heuristic overriding in normal operation)
    const isPaymentRequest = bertResult.signals.payment_request >= 0.40;
    const isUrgency = bertResult.signals.urgency >= 0.40;
    const isPaymentPressure = bertResult.signals.payment_pressure >= 0.40;
    const isAuthorityClaim = bertResult.signals.authority_impersonation >= 0.40;

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const totalLatency = Math.max(1, Math.round(endTime - startTime));
    const capabilities = detectDeviceCapabilities();

    // Record last measured latency in model loader for dynamic UI display
    modelLoader.recordLatency(totalLatency);

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
      inference_engine: `MobileBERT (25.3M INT8) on ${capabilities.isSnapdragon ? 'Snapdragon Platform' : 'Client JIT'}`,
      hardware_platform: capabilities.isSnapdragon ? 'Snapdragon platform detected' : 'Standard CPU Platform',
      execution_runtime: capabilities.isSnapdragon ? 'On-device V8/JIT (CPU)' : 'On-device V8/JIT',
      latency_ms: totalLatency,
      offline_ready: true,
      model_type: 'MobileBERT',
      execution_backend: capabilities.isSnapdragon ? 'CPU' : 'V8_JIT',
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
      fallback_used: false,
      inference_breakdown: {
        tokenizerMs: bertResult.latencyBreakdown.tokenizerMs,
        inferenceMs: bertResult.latencyBreakdown.inferenceMs,
        totalMs: totalLatency
      }
    };
  } catch (err) {
    // 2. FALLBACK PATH: Deterministic Heuristic Safety Fallback activates ONLY on failure
    console.warn('[LocalAIService] MobileBERT failure/timeout detected. Engaging local heuristic safety fallback:', err);
    return analyzeContextHeuristically(text);
  }
}

export { analyzeContextLocally as analyzePaymentContextLocally };
