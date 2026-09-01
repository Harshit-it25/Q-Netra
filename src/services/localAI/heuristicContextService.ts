import { LocalPaymentContext } from '../../domain/payment/types';
import { detectDeviceCapabilities } from '../device/deviceCapabilityService';

/**
 * =========================================================================
 * Q-NETRA LOCAL SAFETY FALLBACK (Deterministic Lexical Heuristic Engine)
 * =========================================================================
 * Preserves the deterministic rule-based classifier as an uncompromised
 * zero-dependency local safety fallback (Execution latency <3ms).
 */

const TOKEN_PATTERNS = {
  payment_request: [
    { regex: /\b(pay|send|transfer|deposit|fee|charge|bill|recharge|cashback|claim|upi|pin|bhejo|bhare|payment)\b/i, weight: 0.35 },
    { regex: /(₹|rs\.?|inr)\s*\d+/i, weight: 0.4 },
    { regex: /\b(scan\s*(qr|code)|enter\s*pin|click\s*link\s*to\s*pay)\b/i, weight: 0.45 },
    { regex: /\b(advance|processing\s*fee|registration\s*amount)\b/i, weight: 0.4 }
  ],
  urgency: [
    { regex: /\b(immediately|urgent|urgently|tonight|today|asap|instant|fast|hurry|now|jaldi|turant|aaj\s*raat)\b/i, weight: 0.4 },
    { regex: /\b(within\s*(?:5|10|15|30|60)\s*(?:mins?|minutes?|hours?))\b/i, weight: 0.5 },
    { regex: /\b(last\s*chance|expires?\s*soon|final\s*warning|deadline|aakhri\s*mauka)\b/i, weight: 0.45 }
  ],
  payment_pressure: [
    { regex: /\b(block(?:ed)?|freeze|frozen|suspend(?:ed)?|deactivat(?:ed|e)|cut|disconnect(?:ed|ion)|kat\s*hoga|kaat\s*diya|band\s*hoga)\b/i, weight: 0.45 },
    { regex: /\b(penalty|fine|police|legal\s*action|arrest|court|fir|notice|jurmana|giraftari|challan)\b/i, weight: 0.5 },
    { regex: /\b(power\s*cut|electricity\s*cut|sim\s*block|account\s*lock|bijli\s*kat)\b/i, weight: 0.55 },
    { regex: /\b(to\s*(?:avoid|prevent|reactivate|unblock))\b/i, weight: 0.35 }
  ],
  authority_claim: [
    { regex: /\b(kyc|pan\s*card|aadhaar|yono|sbi|hdfc|icici|axis|pnb|bob|kotak|rbi|npci)\b/i, weight: 0.45 },
    { regex: /\b(electricity\s*office|officer|manager|customs|cyber\s*cell|telecom|trai|power\s*office|bijli\s*office)\b/i, weight: 0.45 },
    { regex: /\b(kbc|lottery\s*department|official\s*support|customer\s*care)\b/i, weight: 0.4 }
  ]
};

export function analyzeContextHeuristically(rawText: string): LocalPaymentContext {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(rawText || '').trim();

  // Normalize spaced characters (e.g., 'u r g e n t' -> 'urgent')
  const collapsedText = text.replace(/([a-zA-Z])\s+([a-zA-Z])\s+([a-zA-Z])/g, '$1$2$3');
  const targetText = `${text} ${collapsedText}`;

  let prScore = 0;
  let urgScore = 0;
  let ppScore = 0;
  let authScore = 0;
  const threatIndicators: string[] = [];

  for (const item of TOKEN_PATTERNS.payment_request) {
    if (item.regex.test(targetText)) prScore += item.weight;
  }
  for (const item of TOKEN_PATTERNS.urgency) {
    if (item.regex.test(targetText)) {
      urgScore += item.weight;
      if (!threatIndicators.includes('Artificial Time Urgency')) {
        threatIndicators.push('Artificial Time Urgency');
      }
    }
  }
  for (const item of TOKEN_PATTERNS.payment_pressure) {
    if (item.regex.test(targetText)) {
      ppScore += item.weight;
      if (!threatIndicators.includes('Penalty / Disconnection Threat')) {
        threatIndicators.push('Penalty / Disconnection Threat');
      }
    }
  }
  for (const item of TOKEN_PATTERNS.authority_claim) {
    if (item.regex.test(targetText)) {
      authScore += item.weight;
      if (!threatIndicators.includes('Authority / Discom Impersonation')) {
        threatIndicators.push('Authority / Discom Impersonation');
      }
    }
  }

  const isPaymentRequest = prScore >= 0.3;
  const isUrgency = urgScore >= 0.35;
  const isPaymentPressure = ppScore >= 0.35;
  const isAuthorityClaim = authScore >= 0.35;

  const totalScore = prScore + urgScore + ppScore + authScore;

  let signalStrength: 'STRONG' | 'MODERATE' | 'CLEAN' = 'CLEAN';
  if (totalScore > 1.2 || isPaymentPressure) {
    signalStrength = 'STRONG';
  } else if (totalScore > 0.4 || isUrgency || isAuthorityClaim) {
    signalStrength = 'MODERATE';
  }

  // Extract VPA
  let extractedVpa: string | undefined;
  const vpaMatch = text.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}/);
  if (vpaMatch) extractedVpa = vpaMatch[0];

  // Extract Amount
  let extractedAmount: number | undefined;
  const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (amountMatch) {
    extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const latency = Math.max(1, Math.round(endTime - startTime));
  const capabilities = detectDeviceCapabilities();

  return {
    payment_request: isPaymentRequest,
    urgency: isUrgency,
    payment_pressure: isPaymentPressure,
    authority_claim: isAuthorityClaim,
    signalStrength,
    heuristicScore: Number(totalScore.toFixed(2)),
    threat_indicators: threatIndicators,
    extracted_vpa: extractedVpa,
    extracted_amount: extractedAmount,
    inference_engine: capabilities.executionEngine,
    hardware_platform: capabilities.isSnapdragon ? 'Snapdragon platform detected' : undefined,
    execution_runtime: capabilities.isSnapdragon ? 'On-device V8/JIT' : undefined,
    latency_ms: latency,
    offline_ready: true,
    model_type: 'HEURISTIC',
    execution_backend: 'V8_JIT',
    multi_label_scores: {
      legitimate: isPaymentPressure || isUrgency ? 0.05 : 0.90,
      payment_request: Math.min(1, prScore),
      urgency: Math.min(1, urgScore),
      payment_pressure: Math.min(1, ppScore),
      authority_impersonation: Math.min(1, authScore),
      phishing: /http|\.apk/i.test(text) ? 0.85 : 0.05,
      social_engineering: isPaymentPressure && isAuthorityClaim ? 0.95 : (isPaymentPressure || isUrgency ? 0.65 : 0.10),
      fraud: isPaymentPressure || (isAuthorityClaim && isUrgency) ? 0.92 : 0.08
    },
    predicted_labels: [
      ...(isPaymentRequest ? ['PAYMENT_REQUEST'] : []),
      ...(isUrgency ? ['URGENCY'] : []),
      ...(isPaymentPressure ? ['PAYMENT_PRESSURE'] : []),
      ...(isAuthorityClaim ? ['AUTHORITY_IMPERSONATION'] : []),
      ...(totalScore < 0.3 ? ['LEGITIMATE'] : ['FRAUD'])
    ],
    fallback_used: true,
    inference_breakdown: {
      tokenizerMs: 0,
      inferenceMs: latency,
      totalMs: latency
    }
  };
}
