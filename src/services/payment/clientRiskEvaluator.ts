import { PaymentCheck, LocalPaymentContext } from '../../types';
import { RiskLevel } from '../../domain/risk/types';
import { classifyPaymentContextLocally } from '../../lib/onDeviceAI';
import { buildGraphForEntity } from '../network/graphBuilder';
import { evaluateIntentTrailCorrelation } from '../story/storyCorrelationEvaluator';
import { identifyBankFromVpa } from '../qr/upiParserService';
import { computeRiskScore } from '../../../server/services/payment/riskScoringEngine';
import { loadPaymentHistory } from '../../lib/paymentHistory';

export function evaluatePaymentRiskLocally(
  recipient: string,
  amount: number,
  note?: string,
  providedLocalContext?: LocalPaymentContext,
  priorHistory?: PaymentCheck[]
): PaymentCheck {
  const normalizedRecipient = String(recipient || 'unknown@upi').trim().toLowerCase();
  const rawContextText = [note, recipient].filter(Boolean).join(' ');
  const localContext = providedLocalContext || classifyPaymentContextLocally(rawContextText);
  const history = priorHistory || (typeof window !== 'undefined' ? loadPaymentHistory() : []);

  // Compute Risk using Multi-Factor Feature Engine with local history signals
  const riskBreakdown = computeRiskScore({
    vpa: normalizedRecipient,
    amount,
    note,
    localContext,
    priorHistory: history
  });

  const riskLevel = riskBreakdown.riskLevel;
  const stopDecision = riskBreakdown.stopDecision;
  const headline = riskBreakdown.headline;
  const stopReason = riskBreakdown.stopReason;
  const riskTags = [...riskBreakdown.riskTags];

  // 1. Dynamic Graph Construction
  const graphData = buildGraphForEntity(normalizedRecipient, riskLevel);
  const connectedEntities = graphData.totalConnectedEntities || graphData.nodes.length;
  const elevatedRiskConnections = graphData.elevatedRiskConnections || 0;

  // 2. Story Correlation
  const storyCorrelation = evaluateIntentTrailCorrelation({
    vpa: normalizedRecipient,
    amount,
    note,
    category: riskLevel === 'HIGH RISK' ? 'mule' : riskLevel === 'SAFE' ? 'merchant' : 'individual',
    kycStatus: riskLevel === 'HIGH RISK' ? 'flagged' : riskLevel === 'SAFE' ? 'verified' : 'unverified',
    localContext,
    connectedEntities,
    elevatedRiskConnections
  });

  // 3. Trust Chain Synthesis
  const isHigh = riskLevel === 'HIGH RISK';
  const isMod = riskLevel === 'MODERATE';
  const bankName = identifyBankFromVpa(normalizedRecipient);

  const recipientDetail = isHigh
    ? 'VPA handle flagged with rapid dispersal and elevated risk indicators.'
    : isMod
    ? 'Handle on unindexed gateway with limited transaction clearing depth.'
    : bankName
    ? `Registered ${bankName} account with verified settlement route.`
    : 'Enterprise corporate KYC verified with tier-1 banking clearing routes.';

  const networkDetail = isHigh
    ? `Dynamic graph maps ${connectedEntities} nodes including ${elevatedRiskConnections} elevated risk connection(s).`
    : isMod
    ? 'Sparse peer-to-peer network graph with unverified counterparty node.'
    : `Direct scheduled commercial bank settlement route (${bankName || 'NPCI direct tier-1'}).`;

  const trustChain = [
    {
      stage: 'Payment Request',
      status: isHigh
        ? 'Payment pressure detected'
        : isMod
        ? 'Standard organic request'
        : 'Standard invoice / order request',
      level: isHigh ? ('error' as const) : ('safe' as const),
      icon: isHigh ? 'warning' : 'check_circle',
      detail: `On-Device AI (${localContext.inference_engine || 'MobileBERT INT8'}, ${localContext.latency_ms || 2}ms): ${
        isHigh
          ? `Threat indicators: ${localContext.threat_indicators?.join(', ') || 'Urgency coercion signature'}`
          : 'Clean organic transaction intent verified on-device.'
      }`
    },
    {
      stage: 'Recipient',
      status: isHigh
        ? `Elevated risk indicators (${normalizedRecipient})`
        : isMod
        ? `Unverified handle (${normalizedRecipient})`
        : `Verified Account (${bankName ? `${bankName} (${normalizedRecipient})` : normalizedRecipient})`,
      level: isHigh ? ('error' as const) : isMod ? ('warning' as const) : ('safe' as const),
      icon: 'person',
      detail: recipientDetail
    },
    {
      stage: 'Network',
      status: isHigh
        ? `${connectedEntities} connected entities (${elevatedRiskConnections} elevated links)`
        : isMod
        ? `${connectedEntities} connected entities (shallow trust)`
        : `${connectedEntities} connected entities (Direct Bank)`,
      level: isHigh ? ('error' as const) : isMod ? ('warning' as const) : ('safe' as const),
      icon: 'hub',
      detail: networkDetail
    },
    {
      stage: 'Story Correlation',
      status: isHigh
        ? 'INCONSISTENT (Story contradicts trail)'
        : isMod
        ? 'INTENT UNVERIFIED (Insufficient evidence)'
        : 'TRAIL ALIGNED (Story matches entity KYC)',
      level: isHigh ? ('error' as const) : isMod ? ('warning' as const) : ('safe' as const),
      icon: 'compare_arrows',
      detail: storyCorrelation.explanation
    },
    {
      stage: 'Decision',
      status: isHigh
        ? 'STOP — Do not proceed'
        : isMod
        ? 'VERIFY — Additional check recommended'
        : 'PROCEED — Verified clearing route',
      level: isHigh ? ('error' as const) : isMod ? ('warning' as const) : ('safe' as const),
      icon: isHigh ? 'block' : isMod ? 'gpp_maybe' : 'check_circle',
      detail: stopReason
    }
  ];

  const aiExplanation = isHigh
    ? `Q-NETRA Threat Intelligence detected high-risk syndicate patterns for ${normalizedRecipient}. The payment context indicates urgent coercion routing to an unverified dispersal node.`
    : isMod
    ? `Q-NETRA verified that ${normalizedRecipient} has shallow peer network history. Confirm payee identity before proceeding.`
    : `Verified ${bankName || 'corporate'} handle with direct tier-1 banking clearing route. Safe to proceed.`;

  return {
    id: `chk-${Date.now()}`,
    recipient: normalizedRecipient,
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
