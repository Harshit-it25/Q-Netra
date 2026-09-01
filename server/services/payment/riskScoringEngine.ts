import { RecipientIdentity } from '../../../src/domain/identity/types';
import { LocalPaymentContext, PaymentCheck } from '../../../src/domain/payment/types';
import { RiskLevel } from '../../../src/domain/risk/types';
import { entityRepository } from '../../repositories/entityRepository';
import { identifyBankFromVpa } from '../../../src/services/qr/upiParserService';
import { analyzeMessageText } from '../message/messageAnalysisService';

export interface RiskFeatureBreakdown {
  entityTrustScore: number;
  historyScore: number;
  amountAnomalyScore: number;
  coercionScore: number;
  combinedRiskScore: number;
  riskLevel: RiskLevel;
  stopDecision: boolean;
  contributingFactors: string[];
  riskTags: string[];
  headline: string;
  stopReason: string;
}

export interface RiskEvaluationInput {
  vpa: string;
  amount: number;
  note?: string;
  localContext?: LocalPaymentContext;
  priorHistory?: PaymentCheck[];
}

/**
 * Computes risk scores and decisions from concrete features.
 */
export function computeRiskScore(input: RiskEvaluationInput): RiskFeatureBreakdown {
  const vpa = String(input.vpa || 'unknown@upi').trim().toLowerCase();
  const amount = Math.max(0, Number(input.amount) || 0);
  const note = String(input.note || '').trim();
  const known = entityRepository.findByVpa(vpa);
  const bankName = identifyBankFromVpa(vpa);
  const localContext = input.localContext;
  const history = Array.isArray(input.priorHistory) ? input.priorHistory : [];

  const contributingFactors: string[] = [];
  const riskTags: string[] = [];

  // Recipient VPA Suspicion Checks
  const isVpaSuspicious = /\b(?:mule|scam|scammer|fake|officer|police|challan|lottery|prizewin|disconnection|arrest|fine)\b/i.test(vpa) ||
    vpa.includes('scammer') || vpa.includes('mule') || vpa.includes('fake_') || vpa.startsWith('abc123') || vpa.startsWith('abc@');

  // ==========================================
  // 1. Entity Trust Feature (0 to 100)
  // ==========================================
  let entityTrustScore = 30; // Default baseline for unknown handle

  if (known) {
    if (known.isKnownMule) {
      entityTrustScore = 95;
      contributingFactors.push('Recipient VPA is flagged as a mule account in fraud repository');
      riskTags.push('Mule Account Flagged');
    } else if (known.kycStatus === 'flagged') {
      entityTrustScore = Math.max(known.baseRiskScore || 88, 85);
      contributingFactors.push('Recipient identity KYC status is flagged');
      riskTags.push('Flagged KYC');
    } else if (known.kycStatus === 'unverified') {
      entityTrustScore = Math.max(known.baseRiskScore || 54, 54);
      contributingFactors.push('Recipient identity has unverified KYC status');
      riskTags.push('Unverified KYC');
    } else if (known.kycStatus === 'verified') {
      entityTrustScore = known.category === 'merchant' ? 2 : 10;
      riskTags.push(known.category === 'merchant' ? 'Verified Merchant' : 'Verified Individual');
    }

    // Account age damping
    if (known.accountAgeDays !== undefined) {
      if (known.accountAgeDays < 7) {
        entityTrustScore = Math.min(100, entityTrustScore + 20);
        contributingFactors.push(`Recently created account (${known.accountAgeDays} days old)`);
        riskTags.push('New Account (<7d)');
      } else if (known.accountAgeDays > 365 && known.kycStatus === 'verified') {
        entityTrustScore = Math.max(1, entityTrustScore - 10);
        riskTags.push('Established Account');
      }
    }

    // 1930 NCRP reports
    if (known.reportCount1930 && known.reportCount1930 > 0) {
      const penalty = Math.min(30, known.reportCount1930 * 4);
      entityTrustScore = Math.min(100, entityTrustScore + penalty);
      contributingFactors.push(`${known.reportCount1930} complaints lodged against this VPA on NCRP 1930`);
      riskTags.push(`${known.reportCount1930} NCRP Reports`);
    }
  } else {
    // Unknown VPA
    if (isVpaSuspicious) {
      entityTrustScore = 85;
      contributingFactors.push('Recipient handle contains high-risk threat signature');
      riskTags.push('Suspicious Handle');
    } else if (bankName) {
      entityTrustScore = 20; // Known bank handle
      riskTags.push('Recognized Bank Handle');
    } else {
      entityTrustScore = 48; // Unindexed PSP handle
      contributingFactors.push('Recipient handle is on an unindexed payment gateway');
      riskTags.push('Unindexed VPA');
    }
  }

  // ==========================================
  // 2. User Relationship & History Depth (0 to 100)
  // ==========================================
  let historyScore = 35;
  const priorPaymentsToRecipient = history.filter(
    (h) => h.recipient && h.recipient.toLowerCase() === vpa
  );
  const priorTxCount = priorPaymentsToRecipient.length;

  if (priorTxCount >= 5) {
    historyScore = 0;
    riskTags.push('Frequent Recipient');
  } else if (priorTxCount >= 1) {
    historyScore = 12;
    riskTags.push('Prior Relationship');
  } else {
    // First time paying this VPA
    if (known && known.kycStatus === 'verified') {
      historyScore = 8;
      riskTags.push('First-Time Transfer');
    } else {
      historyScore = 45;
      contributingFactors.push('First-time transaction to unverified peer counterparty');
      riskTags.push('First-Time Recipient');
    }
  }

  // ==========================================
  // 3. Amount Deviation & Anomaly (0 to 100)
  // ==========================================
  let amountAnomalyScore = 10;
  const validHistoryAmounts = history.map((h) => Number(h.amount) || 0).filter((a) => a > 0);
  const avgAmount = validHistoryAmounts.length > 0
    ? validHistoryAmounts.reduce((a, b) => a + b, 0) / validHistoryAmounts.length
    : 1000;

  const amountRatio = amount / Math.max(100, avgAmount);

  if (amount >= 50000 && (!known || known.kycStatus !== 'verified')) {
    amountAnomalyScore = 85;
    contributingFactors.push(`High-value transfer (₹${amount.toLocaleString('en-IN')}) to unverified recipient`);
    riskTags.push('Large Amount Anomaly');
  } else if (amountRatio >= 6 && amount >= 10000 && (!known || known.category !== 'merchant')) {
    amountAnomalyScore = 60;
    contributingFactors.push(`Amount exceeds user historical average by ${amountRatio.toFixed(1)}x`);
    riskTags.push('Velocity Anomaly');
  } else if (amount > 0) {
    amountAnomalyScore = Math.min(30, Math.max(2, Math.round(Math.log10(amount) * 6)));
  }

  // ==========================================
  // 4. Note & Coercion Signals (0 to 100)
  // ==========================================
  let coercionScore = 5;
  const serverMsgAnalysis = note ? analyzeMessageText(note) : { isHighRisk: false, signals: [] };
  const isCoerciveText = serverMsgAnalysis.isHighRisk ||
    /\b(?:disconnect|disconnection|power\s*cut|cut|freeze|block(?:ed)?|arrest|penalty|digital\s*arrest|challan|court|fine|apk|lottery|winner|kyc|cashback|deposit|telegram|rating\s*job|task|urgent|urgently|immediately)\b/i.test(note);
  
  if (localContext) {
    let ctxSum = 0;
    if (localContext.payment_pressure) ctxSum += 40;
    if (localContext.urgency) ctxSum += 25;
    if (localContext.authority_claim) ctxSum += 30;
    if (localContext.heuristicScore && localContext.heuristicScore > 0.5) {
      ctxSum += Math.round(localContext.heuristicScore * 30);
    }
    coercionScore = Math.min(100, Math.max(coercionScore, ctxSum));
  }

  if (isCoerciveText) {
    coercionScore = Math.max(coercionScore, 80);
    contributingFactors.push('Urgency or coercive pressure pattern identified in transaction context');
    riskTags.push('Coercive Pattern');
  }

  // ==========================================
  // 5. Composite Weighted Score
  // ==========================================
  let combinedRiskScore = Math.round(
    0.45 * entityTrustScore +
    0.20 * historyScore +
    0.15 * amountAnomalyScore +
    0.20 * coercionScore
  );

  // Critical Overrides
  if (known?.isKnownMule || isVpaSuspicious || (isCoerciveText && entityTrustScore >= 35)) {
    combinedRiskScore = Math.max(combinedRiskScore, 88);
  }

  if (known?.category === 'merchant' && known.kycStatus === 'verified' && !isCoerciveText && coercionScore < 20) {
    combinedRiskScore = Math.min(combinedRiskScore, 10);
  }

  combinedRiskScore = Math.max(1, Math.min(99, combinedRiskScore));

  let riskLevel: RiskLevel = 'SAFE';
  let stopDecision = false;
  let headline = 'Payment cleared by Q-NETRA shield.';
  let stopReason = 'Verified recipient with stable clearing route.';

  if (combinedRiskScore >= 70) {
    riskLevel = 'HIGH RISK';
    stopDecision = true;
    headline = "The payment looks normal. The network behind it doesn't.";
    stopReason = contributingFactors.length > 0
      ? contributingFactors.join('. ') + '.'
      : 'The available payment context is inconsistent with recipient and network evidence. Do not proceed.';
  } else if (combinedRiskScore >= 35) {
    riskLevel = 'MODERATE';
    stopDecision = false;
    headline = 'Unverified recipient. Proceed with caution.';
    stopReason = contributingFactors.length > 0
      ? contributingFactors.join('. ') + '.'
      : 'Recipient handle is on an unindexed routing gateway. Verify identity directly before sending funds.';
  } else {
    riskLevel = 'SAFE';
    stopDecision = false;
    headline = 'Payment cleared by Q-NETRA shield.';
    stopReason = known?.kycStatus === 'verified'
      ? 'Verified enterprise merchant with stable KYC history and direct tier-1 banking clearing routes.'
      : `Verified ${bankName || 'bank'} account with direct tier-1 clearing settlement route.`;
  }

  return {
    entityTrustScore,
    historyScore,
    amountAnomalyScore,
    coercionScore,
    combinedRiskScore,
    riskLevel,
    stopDecision,
    contributingFactors,
    riskTags: Array.from(new Set(riskTags)),
    headline,
    stopReason
  };
}
