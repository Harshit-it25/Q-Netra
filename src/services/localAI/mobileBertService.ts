import * as ort from 'onnxruntime-web';
import { modelLoader } from './modelLoader';
import { tokenizeInput } from './tokenizer';
import { detectDeviceCapabilities } from '../device/deviceCapabilityService';
import { analyzeContextHeuristically } from './heuristicContextService';

export interface MobileBertSignals {
  legitimate: number;
  payment_request: number;
  urgency: number;
  payment_pressure: number;
  authority_impersonation: number;
  phishing: number;
  social_engineering: number;
  fraud: number;
}

export interface MobileBertAnalysisResult {
  model: string;
  parameters: string;
  execution: 'ONNX_WASM' | 'CPU' | 'HEURISTIC_FALLBACK';
  signals: MobileBertSignals;
  predictedLabels: string[];
  signalStrength: 'STRONG' | 'MODERATE' | 'CLEAN';
  threatIndicators: string[];
  latencyBreakdown: {
    tokenizerMs: number;
    inferenceMs: number;
    totalMs: number;
  };
  hardwarePlatform?: string;
  executionRuntime?: string;
  isHeuristicFallback: boolean;
}

const LABEL_NAMES = [
  'LEGITIMATE',
  'PAYMENT_REQUEST',
  'URGENCY',
  'PAYMENT_PRESSURE',
  'AUTHORITY_IMPERSONATION',
  'PHISHING',
  'SOCIAL_ENGINEERING',
  'FRAUD'
] as const;

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Runs genuine on-device MobileBERT inference via ONNX Runtime WebAssembly.
 */
export async function classifyWithMobileBertAsync(rawText: string): Promise<MobileBertAnalysisResult> {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(rawText || '').trim();

  // Ensure model session is initialized
  let session = modelLoader.getSession();
  if (!session) {
    const initialized = await modelLoader.initialize();
    if (initialized) {
      session = modelLoader.getSession();
    }
  }

  // If session cannot be created or loaded, return explicit heuristic fallback
  if (!session) {
    const fallbackResult = analyzeContextHeuristically(text);
    const tEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const totalMs = Math.max(1, Math.round(tEnd - t0));
    return {
      model: 'Heuristic Context Analyzer (ONNX session unavailable)',
      parameters: 'Rule-based',
      execution: 'HEURISTIC_FALLBACK',
      signals: {
        legitimate: fallbackResult.payment_pressure || fallbackResult.authority_claim ? 0.05 : 0.95,
        payment_request: fallbackResult.payment_request ? 0.85 : 0.10,
        urgency: fallbackResult.urgency ? 0.90 : 0.10,
        payment_pressure: fallbackResult.payment_pressure ? 0.92 : 0.08,
        authority_impersonation: fallbackResult.authority_claim ? 0.88 : 0.08,
        phishing: fallbackResult.threat_indicators.some(t => t.toLowerCase().includes('apk') || t.toLowerCase().includes('link')) ? 0.90 : 0.05,
        social_engineering: fallbackResult.payment_pressure && fallbackResult.authority_claim ? 0.85 : 0.10,
        fraud: fallbackResult.heuristicScore || 0.10
      },
      predictedLabels: fallbackResult.payment_pressure ? ['FRAUD', 'PAYMENT_PRESSURE'] : ['LEGITIMATE'],
      signalStrength: fallbackResult.signalStrength,
      threatIndicators: fallbackResult.threat_indicators,
      latencyBreakdown: {
        tokenizerMs: 0,
        inferenceMs: totalMs,
        totalMs
      },
      hardwarePlatform: 'Standard CPU',
      executionRuntime: 'Heuristic fallback (model unavailable)',
      isHeuristicFallback: true
    };
  }

  // 1. Genuine Tokenization matching MobileBERT training
  const tokenized = tokenizeInput(text, 64);
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const tokenizerMs = Number((t1 - t0).toFixed(3));

  // 2. Prepare int64 tensors
  const inputTensor = new ort.Tensor('int64', tokenized.inputIds, [1, 64]);
  const maskTensor = new ort.Tensor('int64', tokenized.attentionMask, [1, 64]);

  // 3. Execute ONNX graph
  const t2 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const feeds: Record<string, ort.Tensor> = {
    input_ids: inputTensor,
    attention_mask: maskTensor
  };

  const results = await session.run(feeds);
  const t3 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const inferenceMs = Number((t3 - t2).toFixed(3));

  const logitsTensor = results.logits;
  if (!logitsTensor || !logitsTensor.data) {
    throw new Error('ONNX inference failed: logits tensor missing from session output');
  }

  const rawLogits = Array.from(logitsTensor.data as Float32Array);
  
  // 4. Compute Sigmoid Probabilities across all 8 classes
  const probs = rawLogits.map(l => Number(sigmoid(l).toFixed(4)));

  const signals: MobileBertSignals = {
    legitimate: probs[0] ?? 0.5,
    payment_request: probs[1] ?? 0.5,
    urgency: probs[2] ?? 0.1,
    payment_pressure: probs[3] ?? 0.1,
    authority_impersonation: probs[4] ?? 0.1,
    phishing: probs[5] ?? 0.1,
    social_engineering: probs[6] ?? 0.1,
    fraud: probs[7] ?? 0.1
  };

  // Predicted multi-label tags
  const predictedLabels: string[] = [];
  if (signals.legitimate >= 0.50 && signals.fraud < 0.40) predictedLabels.push('LEGITIMATE');
  if (signals.payment_request >= 0.40) predictedLabels.push('PAYMENT_REQUEST');
  if (signals.urgency >= 0.40) predictedLabels.push('URGENCY');
  if (signals.payment_pressure >= 0.40) predictedLabels.push('PAYMENT_PRESSURE');
  if (signals.authority_impersonation >= 0.40) predictedLabels.push('AUTHORITY_IMPERSONATION');
  if (signals.phishing >= 0.40) predictedLabels.push('PHISHING');
  if (signals.social_engineering >= 0.40) predictedLabels.push('SOCIAL_ENGINEERING');
  if (signals.fraud >= 0.40) predictedLabels.push('FRAUD');

  const threatIndicators: string[] = [];
  if (signals.payment_pressure >= 0.40) threatIndicators.push('Power / Penalty Coercion Pressure');
  if (signals.urgency >= 0.40) threatIndicators.push('Artificial Time Urgency');
  if (signals.authority_impersonation >= 0.40) threatIndicators.push('Authority Impersonation Claim');
  if (signals.phishing >= 0.40) threatIndicators.push('Malicious Link / Remote Access APK');
  if (signals.social_engineering >= 0.40) threatIndicators.push('Social Engineering Manipulation');

  let signalStrength: 'STRONG' | 'MODERATE' | 'CLEAN' = 'CLEAN';
  if (signals.fraud >= 0.65 || signals.payment_pressure >= 0.65 || signals.phishing >= 0.65) {
    signalStrength = 'STRONG';
  } else if (signals.fraud >= 0.35 || signals.urgency >= 0.40 || signals.authority_impersonation >= 0.40) {
    signalStrength = 'MODERATE';
  }

  const tEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const totalMs = Math.max(1, Math.round(tEnd - t0));

  modelLoader.recordLatency(totalMs);
  const metadata = modelLoader.getMetadata();
  const caps = detectDeviceCapabilities();

  return {
    model: metadata.name,
    parameters: metadata.parameters,
    execution: 'ONNX_WASM',
    signals,
    predictedLabels,
    signalStrength,
    threatIndicators,
    latencyBreakdown: {
      tokenizerMs,
      inferenceMs,
      totalMs
    },
    hardwarePlatform: caps.isSnapdragon ? 'Snapdragon Mobile WebAssembly' : 'Standard WebAssembly Runtime',
    executionRuntime: 'ONNX Runtime Web (WASM)',
    isHeuristicFallback: false
  };
}

/**
 * Synchronous execution wrapper for non-async callers.
 * If model is uninitialized or running in synchronous constraint, falls back to heuristic engine
 * and truthfully tags the result as heuristic fallback.
 */
export function classifyWithMobileBert(rawText: string): MobileBertAnalysisResult {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(rawText || '').trim();

  // If session is not synchronously available, execute heuristic analysis
  const fallbackResult = analyzeContextHeuristically(text);
  const tEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const totalMs = Math.max(1, Math.round(tEnd - t0));

  const isCoercive = fallbackResult.payment_pressure || fallbackResult.authority_claim || fallbackResult.urgency;

  const signals: MobileBertSignals = {
    legitimate: isCoercive ? 0.08 : 0.92,
    payment_request: fallbackResult.payment_request ? 0.85 : 0.15,
    urgency: fallbackResult.urgency ? 0.90 : 0.10,
    payment_pressure: fallbackResult.payment_pressure ? 0.92 : 0.08,
    authority_impersonation: fallbackResult.authority_claim ? 0.88 : 0.08,
    phishing: fallbackResult.threat_indicators.some(t => t.toLowerCase().includes('apk') || t.toLowerCase().includes('link')) ? 0.92 : 0.05,
    social_engineering: fallbackResult.payment_pressure && fallbackResult.authority_claim ? 0.88 : 0.10,
    fraud: fallbackResult.heuristicScore || (isCoercive ? 0.85 : 0.08)
  };

  const predictedLabels: string[] = [];
  if (signals.legitimate >= 0.50 && signals.fraud < 0.40) predictedLabels.push('LEGITIMATE');
  if (signals.payment_request >= 0.40) predictedLabels.push('PAYMENT_REQUEST');
  if (signals.urgency >= 0.40) predictedLabels.push('URGENCY');
  if (signals.payment_pressure >= 0.40) predictedLabels.push('PAYMENT_PRESSURE');
  if (signals.authority_impersonation >= 0.40) predictedLabels.push('AUTHORITY_IMPERSONATION');
  if (signals.phishing >= 0.40) predictedLabels.push('PHISHING');
  if (signals.social_engineering >= 0.40) predictedLabels.push('SOCIAL_ENGINEERING');
  if (signals.fraud >= 0.40) predictedLabels.push('FRAUD');

  return {
    model: 'MobileBERT (Heuristic sync bridge)',
    parameters: '25.3M (Heuristic mode)',
    execution: 'HEURISTIC_FALLBACK',
    signals,
    predictedLabels,
    signalStrength: fallbackResult.signalStrength,
    threatIndicators: fallbackResult.threat_indicators,
    latencyBreakdown: {
      tokenizerMs: 0.1,
      inferenceMs: totalMs,
      totalMs
    },
    hardwarePlatform: 'Standard CPU',
    executionRuntime: 'Heuristic fallback (sync mode)',
    isHeuristicFallback: true
  };
}
