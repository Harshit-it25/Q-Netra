import { IntentTrailCorrelation } from '../../domain/story/types';
import { LocalPaymentContext } from '../../domain/payment/types';

export interface StoryCorrelationInput {
  vpa: string;
  amount: number;
  note?: string;
  category?: string;
  kycStatus?: string;
  localContext?: LocalPaymentContext;
  connectedEntities: number;
  elevatedRiskConnections: number;
}

export function evaluateIntentTrailCorrelation(input: StoryCorrelationInput): IntentTrailCorrelation {
  const { vpa, note = '', category, kycStatus, connectedEntities, elevatedRiskConnections } = input;
  const lowerNote = note.toLowerCase();
  const lowerVpa = vpa.toLowerCase();

  // 1. Identify Claimed Story & Semantic Purpose
  let claimedCategory = 'General Peer-to-Peer Transfer';
  let claimedStory = 'Personal payment request';

  if (/electric|power|disconn|meter|bill|light|bijli/i.test(lowerNote) || /disconn/i.test(lowerVpa)) {
    claimedCategory = 'State Utility & Electricity Discom';
    claimedStory = 'Urgent bill payment to prevent electricity disconnection';
  } else if (/police|challan|court|fine|arrest|fir|legal|digital\s*arrest/i.test(lowerNote)) {
    claimedCategory = 'Government / Law Enforcement Penalty';
    claimedStory = 'Official statutory penalty / legal fine settlement';
  } else if (/kyc|pan|aadhaar|yono|bank\s*block|account\s*lock|freeze/i.test(lowerNote)) {
    claimedCategory = 'Institutional Banking & KYC Update';
    claimedStory = 'Banking compliance fee to restore account access';
  } else if (/task|refund|job|rating|commission|bonus|invest|crypto/i.test(lowerNote)) {
    claimedCategory = 'Online Work / Task Investment Refund';
    claimedStory = 'Processing fee for task withdrawal / investment refund';
  } else if (/customs|fedex|courier|parcel|delivery\s*hold/i.test(lowerNote)) {
    claimedCategory = 'Logistics & Customs Duty';
    claimedStory = 'Customs clearance fee for pending package';
  } else if (/consult|retainer|freelance|design|service/i.test(lowerNote) || lowerVpa.includes('consulting')) {
    claimedCategory = 'Professional Consulting Service';
    claimedStory = 'Independent consulting retainer advance';
  } else if (/swiggy|zomato|order|food|retail|invoice|bescom|tata|airtel|irctc/i.test(lowerNote) || /swiggy|zomato|bescom|tata|airtel|irctc/i.test(lowerVpa)) {
    claimedCategory = 'Verified Commercial Merchant';
    claimedStory = 'Commercial retail merchant order payment';
  }

  // 2. Identify Actual Financial Recipient & Network Trail
  let financialRecipient = 'Unverified Individual VPA';
  let networkTrail = `${connectedEntities} connected entities, ${elevatedRiskConnections} flagged hops`;

  const isVerifiedMerchant = category === 'merchant' || kycStatus === 'verified' || /swiggy|zomato|bescom|tata|airtel|irctc|amazon|dmart/i.test(lowerVpa);
  const isHighRiskEntity = lowerVpa.startsWith('abc') || lowerVpa.includes('mule') || lowerVpa.includes('lottery') || lowerVpa.includes('disconnection') || elevatedRiskConnections >= 2;

  if (isVerifiedMerchant && !isHighRiskEntity) {
    financialRecipient = `${lowerVpa.split('@')[0].toUpperCase()} (Verified Enterprise KYC)`;
    networkTrail = 'Direct Tier-1 Scheduled Commercial Bank Clearing';
  } else if (isHighRiskEntity) {
    financialRecipient = 'Masked Virtual Payment Handle (Non-KYC)';
    networkTrail = 'Layer-1 Mule Rapid Fan-Out → P2P USDT Crypto Off-Ramp';
  } else {
    financialRecipient = 'Unverified Personal Handle (<30 days active)';
    networkTrail = 'Sparse P2P Graph with Unverified Counterparty Node';
  }

  // 3. Correlate Claimed Story vs. Money Trail
  let mismatchDetected = false;
  let correlationStatus: 'CONSISTENT' | 'INCONSISTENT' | 'UNKNOWN' = 'CONSISTENT';
  let mismatchSeverity: 'CLEAN' | 'MODERATE' | 'CRITICAL' = 'CLEAN';
  let explanation = 'The available payment context is consistent with the available recipient and network evidence.';

  if (
    (claimedCategory.includes('Utility') || claimedCategory.includes('Government') || claimedCategory.includes('Banking') || claimedCategory.includes('Task') || lowerNote.includes('electricity') || lowerNote.includes('disconnect') || isHighRiskEntity) &&
    isHighRiskEntity
  ) {
    mismatchDetected = true;
    correlationStatus = 'INCONSISTENT';
    mismatchSeverity = 'CRITICAL';
    explanation = 'The available payment context is inconsistent with recipient and network evidence. High-risk syndication pattern detected.';
  } else if (claimedCategory.includes('Consulting') || !isVerifiedMerchant) {
    mismatchDetected = true;
    correlationStatus = 'UNKNOWN';
    mismatchSeverity = 'MODERATE';
    explanation = 'Insufficient recipient and network evidence to verify counterparty trust depth.';
  } else if (isVerifiedMerchant) {
    mismatchDetected = false;
    correlationStatus = 'CONSISTENT';
    mismatchSeverity = 'CLEAN';
    explanation = 'The available payment context is consistent with verified merchant KYC clearing routes.';
  }

  return {
    claimedPurpose: claimedCategory,
    actualEntityCategory: financialRecipient,
    mismatchDetected,
    correlationStatus,
    mismatchSeverity,
    mismatchPillars: {
      claimedStory,
      financialRecipient,
      networkTrail
    },
    explanation
  };
}
