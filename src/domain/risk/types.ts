export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH RISK';

export interface RiskEvaluationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  stopDecision: boolean;
  headline: string;
  stopReason: string;
  riskTags: string[];
}
