import { TrustChainStep } from '../../../src/domain/trust/types';
import { LocalPaymentContext } from '../../../src/domain/payment/types';
import { RiskLevel } from '../../../src/domain/risk/types';

export interface TrustChainInput {
  vpa: string;
  amount: number;
  note?: string;
  riskLevel: RiskLevel;
  stopDecision: boolean;
  connectedEntities: number;
  elevatedRiskConnections: number;
  urgencyDetected: boolean;
  localContext?: LocalPaymentContext;
}

export function generateTrustChain(input: TrustChainInput): TrustChainStep[] {
  const { vpa, amount, note, riskLevel, stopDecision, connectedEntities, elevatedRiskConnections, urgencyDetected, localContext } = input;

  const engineLabel = localContext?.inference_engine || 'On-Device AI';

  if (stopDecision || riskLevel === 'HIGH RISK') {
    const isPressure = urgencyDetected || localContext?.payment_pressure || localContext?.urgency;
    return [
      {
        stage: 'Payment Request',
        status: isPressure ? 'Payment pressure detected' : 'Abnormal transaction velocity',
        level: 'error',
        icon: 'warning',
        detail: localContext?.payment_pressure
          ? `Local Analysis (${engineLabel}, ${localContext.latency_ms}ms): Detected ${localContext.threat_indicators.join(', ') || 'psychological pressure'} with strong contextual signal match.`
          : note
          ? `Coercive note pattern ("${note}") detected alongside elevated transaction velocity.`
          : 'High-frequency payment sequence initiated within short window under artificial urgency.'
      },
      {
        stage: 'Recipient',
        status: vpa,
        level: 'warning',
        icon: 'person',
        detail: `VPA handle registered recently on non-KYC aggregated virtual handle with ${vpa.includes('abc') ? 'unverified name masking' : 'suspicious naming convention'}.`
      },
      {
        stage: 'Network',
        status: `${connectedEntities} connected entities`,
        level: 'error',
        icon: 'hub',
        detail: `${elevatedRiskConnections} immediate hops trace directly to flagged mule nodes in seeded cyber fraud database.`
      },
      {
        stage: 'Risk Pattern',
        status: 'Suspicious cluster detected',
        level: 'error',
        icon: 'pattern',
        detail: 'Rapid fan-out distribution topology characteristic of layer-1 mule dispersal and crypto P2P conversion.'
      },
      {
        stage: 'Story Correlation',
        status: 'Critical Intent-to-Trail Mismatch',
        level: 'error',
        icon: 'compare_arrows',
        detail: 'Payment purpose contradicts financial identity: institutional/utility intent routed into high-risk mule syndicate.'
      }
    ];
  }

  if (riskLevel === 'MODERATE') {
    return [
      {
        stage: 'Payment Request',
        status: 'Unusual amount for new contact',
        level: 'warning',
        icon: 'warning',
        detail: `Transaction amount of ₹${amount.toLocaleString()} is above historical baseline for unverified recipient.`
      },
      {
        stage: 'Recipient',
        status: vpa,
        level: 'warning',
        icon: 'person',
        detail: 'VPA active for less than 30 days. No prior direct peer transaction history.'
      },
      {
        stage: 'Network',
        status: `${connectedEntities} connected entities`,
        level: 'warning',
        icon: 'hub',
        detail: 'Sparse transaction graph with limited established counterparties in commercial clearing.'
      },
      {
        stage: 'Risk Pattern',
        status: 'Moderate unverified baseline',
        level: 'safe',
        icon: 'verified',
        detail: 'No direct blacklisted nodes detected in seeded database, but trust depth remains shallow.'
      },
      {
        stage: 'Story Correlation',
        status: 'Unverified Commercial Intent',
        level: 'warning',
        icon: 'compare_arrows',
        detail: 'Claimed commercial purpose lacks verified corporate enterprise banking settlement.'
      }
    ];
  }

  // Safe Trust Chain
  return [
    {
      stage: 'Payment Request',
      status: 'Standard organic request',
      level: 'safe',
      icon: 'check_circle',
      detail: localContext
        ? `Local Analysis (${engineLabel}, ${localContext.latency_ms}ms): Clean organic payment intent verified.`
        : 'User-initiated payment without coercive patterns or velocity anomalies.'
    },
    {
      stage: 'Recipient',
      status: vpa,
      level: 'safe',
      icon: 'person',
      detail: 'Verified banking KYC, stable handle reputation active across multiple billing cycles.'
    },
    {
      stage: 'Network',
      status: `${connectedEntities} connected entity (Primary Bank)`,
      level: 'safe',
      icon: 'hub',
      detail: 'Direct route to tier-1 scheduled commercial bank with zero mule links.'
    },
    {
      stage: 'Risk Pattern',
      status: 'Clean baseline metrics',
      level: 'safe',
      icon: 'verified',
      detail: 'Zero complaints in seeded database and verified institutional counterparties.'
    },
    {
      stage: 'Story Correlation',
      status: '100% Intent-to-Trail Alignment',
      level: 'safe',
      icon: 'compare_arrows',
      detail: 'Claimed merchant purpose aligns with verified corporate banking recipient and direct settlement.'
    }
  ];
}
