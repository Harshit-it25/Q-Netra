import { RiskLevel } from '../risk/types';
import { IntentTrailCorrelation } from '../story/types';
import { TrustChainStep } from '../trust/types';

export type { RiskLevel };

export interface PaymentCheck {
  id: string;
  recipient: string;
  amount: number;
  date: string;
  timestamp: number;
  riskLevel: RiskLevel;
  stopDecision: boolean;
  headline: string;
  stopReason: string;
  connectedEntities: number;
  elevatedRiskConnections: number;
  riskTags: string[];
  note?: string;
  localContext?: LocalPaymentContext;
  storyCorrelation?: IntentTrailCorrelation;
  trustChain: TrustChainStep[];
  aiExplanation?: string;
}

export interface LocalPaymentContext {
  payment_request: boolean;
  urgency: boolean;
  payment_pressure: boolean;
  authority_claim: boolean;
  signalStrength: 'STRONG' | 'MODERATE' | 'CLEAN';
  heuristicScore: number;
  confidence?: number;
  threat_indicators: string[];
  extracted_vpa?: string;
  extracted_amount?: number;
  inference_engine: string;
  hardware_platform?: string;
  execution_runtime?: string;
  latency_ms: number;
  offline_ready: boolean;
  model_type?: 'MobileBERT' | 'HEURISTIC' | 'ENSEMBLE';
  execution_backend?: 'CPU' | 'GPU' | 'NPU (QNN)' | 'V8_JIT' | 'LOCAL';
  multi_label_scores?: Record<string, number>;
  predicted_labels?: string[];
  fallback_used?: boolean;
  inference_breakdown?: {
    tokenizerMs: number;
    inferenceMs: number;
    totalMs: number;
  };
}

export interface PaymentAnalysisRequest {
  recipient: string;
  amount: number;
  source?: string;
  note?: string;
  context?: LocalPaymentContext;
}

export interface PaymentAnalysisResponse extends PaymentCheck {
  success: boolean;
  error?: string;
  graphSummary?: any;
}
