import { PaymentCheck, LocalPaymentContext, PaymentAnalysisRequest } from '../../../src/domain/payment/types';
import { RiskLevel } from '../../../src/domain/risk/types';
import { entityRepository } from '../../repositories/entityRepository';
import { buildGraphForEntity } from '../network/riskGraphService';
import { generateTrustChain } from '../trust/trustChainService';
import { generatePaymentExplanation } from '../ai/geminiAdvisorService';
import { analyzeMessageText } from '../message/messageAnalysisService';
import { evaluateIntentTrailCorrelation } from '../story/storyCorrelationService';
import { computeRiskScore } from './riskScoringEngine';

export async function evaluatePaymentRisk(request: PaymentAnalysisRequest): Promise<PaymentCheck & { graphSummary?: any }> {
  // 1. Input Sanitization
  const rawRecipient = String(request.recipient || 'unknown@upi').slice(0, 256).trim();
  const vpa = rawRecipient.toLowerCase();

  let amount = Number(request.amount);
  if (isNaN(amount) || !isFinite(amount) || amount < 0) {
    amount = 0;
  }
  if (amount > 100000000) {
    amount = 100000000;
  }

  const rawNote = request.note ? String(request.note).slice(0, 512).trim() : '';
  const note = rawNote || undefined;
  const localContext = request.context;

  // 2. Server-side message / note analysis
  const serverMsgAnalysis = rawNote ? analyzeMessageText(rawNote) : { isHighRisk: false, signals: [] };

  // 3. Compute Risk via Feature Engine
  const riskBreakdown = computeRiskScore({
    vpa,
    amount,
    note,
    localContext
  });

  const known = entityRepository.findByVpa(vpa);
  let riskLevel = riskBreakdown.riskLevel;
  let stopDecision = riskBreakdown.stopDecision;
  let headline = riskBreakdown.headline;
  let stopReason = riskBreakdown.stopReason;
  let riskTags = [...riskBreakdown.riskTags];

  // 4. Dynamic Network Graph Construction
  const graphData = buildGraphForEntity(vpa, riskLevel);
  const connectedEntities = graphData.totalConnectedEntities || graphData.nodes.length;
  const elevatedRiskConnections = graphData.elevatedRiskConnections || 0;

  // 5. Intent-to-Trail Story Correlation
  const storyCorrelation = evaluateIntentTrailCorrelation({
    vpa,
    amount,
    note,
    knownEntity: known || undefined,
    localContext,
    connectedEntities,
    elevatedRiskConnections
  });

  if (storyCorrelation.mismatchDetected && storyCorrelation.mismatchSeverity === 'CRITICAL') {
    riskLevel = 'HIGH RISK';
    stopDecision = true;
    headline = "The payment looks normal. The network behind it doesn't.";
    stopReason = 'The available payment context is inconsistent with recipient and network evidence. Do not proceed.';
    if (!riskTags.includes('Story-Trail Inconsistency')) {
      riskTags.push('Story-Trail Inconsistency');
    }
  }

  // 6. Trust Chain Synthesis
  const trustChain = generateTrustChain({
    vpa,
    amount,
    note,
    riskLevel,
    stopDecision,
    connectedEntities,
    elevatedRiskConnections,
    urgencyDetected: Boolean(localContext?.urgency || serverMsgAnalysis.isHighRisk),
    localContext
  });

  // 7. AI Forensic Explanation
  const aiExplanation = await generatePaymentExplanation(vpa, amount, riskLevel, note, riskTags);

  return {
    id: `chk-${Date.now()}`,
    recipient: vpa,
    amount,
    date: 'Just now',
    timestamp: Date.now(),
    riskLevel,
    stopDecision,
    headline,
    stopReason,
    connectedEntities,
    elevatedRiskConnections,
    riskTags,
    note,
    localContext,
    storyCorrelation,
    trustChain,
    aiExplanation,
    graphSummary: graphData.summary
  };
}
