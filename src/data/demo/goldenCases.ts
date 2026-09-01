import { PaymentCheck } from '../../types';

/**
 * =========================================================================
 * Q-NETRA AI — GOLDEN DEMO CASES (STRICT DEMO FIXTURES)
 * =========================================================================
 * These fixtures demonstrate Q-NETRA's 3-Pillar Story Correlation, Trust Chain,
 * and pre-payment decision matrix during live presentations.
 * They are NOT real-world production bank feeds or research datasets.
 */
export const GOLDEN_CASES: PaymentCheck[] = [
  // 1. GOLDEN HERO CASE C — STOP (Electricity Disconnection Scam)
  {
    id: 'chk-golden-c',
    recipient: 'abc123@upi',
    amount: 10,
    date: 'Today, Just now',
    timestamp: Date.now(),
    riskLevel: 'HIGH RISK',
    stopDecision: true,
    headline: "The payment looks normal. The network behind it doesn't.",
    stopReason: 'The available payment context is inconsistent with recipient and network evidence. Do not proceed.',
    connectedEntities: 7,
    elevatedRiskConnections: 3,
    riskTags: ['Payment pressure detected', '7 connected entities', 'Suspicious cluster detected', 'Story-Trail Inconsistency'],
    note: 'Pay ₹10 immediately to prevent electricity disconnection tonight.',
    localContext: {
      payment_request: true,
      urgency: true,
      payment_pressure: true,
      authority_claim: true,
      signalStrength: 'STRONG',
      heuristicScore: 1.75,
      confidence: 0.96,
      threat_indicators: ['Power Disconnection Threat', 'Artificial Time Urgency', 'Electricity Office Claim'],
      inference_engine: 'Local CPU/JIT execution (Snapdragon Platform)',
      hardware_platform: 'Snapdragon platform detected',
      execution_runtime: 'On-device V8/JIT',
      latency_ms: 3,
      offline_ready: true
    },
    storyCorrelation: {
      claimedPurpose: 'State Utility & Electricity Discom',
      actualEntityCategory: 'Masked Virtual Payment Handle (Non-KYC)',
      mismatchDetected: true,
      correlationStatus: 'INCONSISTENT',
      mismatchSeverity: 'CRITICAL',
      mismatchPillars: {
        claimedStory: 'Electricity disconnection payment (prevent power cut tonight)',
        financialRecipient: 'Unverified/high-risk recipient (abc123@upi)',
        networkTrail: 'Suspicious connected entities (7 nodes, 3-hop mule ring)'
      },
      explanation: 'The available payment context is inconsistent with recipient and network evidence.'
    },
    trustChain: [
      {
        stage: 'Payment Context',
        status: 'Payment pressure detected',
        level: 'error',
        icon: 'warning',
        detail: 'Local Analysis (Client JIT, 3ms): Detected power disconnection urgency & penalty coercion.'
      },
      {
        stage: 'Recipient',
        status: 'Elevated risk indicators found',
        level: 'warning',
        icon: 'person',
        detail: 'VPA active 4 days on non-KYC handle abc123@upi with masked account identity.'
      },
      {
        stage: 'Network Trail',
        status: '7 connected entities (3 flagged hops)',
        level: 'error',
        icon: 'hub',
        detail: 'Immediate hops trace into layer-1 mule dispersal and P2P crypto off-ramp.'
      },
      {
        stage: 'Story Correlation',
        status: 'Critical Intent-to-Trail Inconsistency',
        level: 'error',
        icon: 'compare_arrows',
        detail: 'Utility authority claim contradicts individual mule destination handle.'
      }
    ],
    aiExplanation: 'The requested payment of ₹10 appears harmless, but the recipient VPA connects to a high-velocity mule cluster and the payment purpose contradicts the recipient identity.'
  },

  // 2. GOLDEN CASE B — VERIFY (Independent Consulting Advance)
  {
    id: 'chk-golden-b',
    recipient: 'priya.consulting@okhdfcbank',
    amount: 4500,
    date: 'Today, 2:15 PM',
    timestamp: Date.now() - 3600000 * 2,
    riskLevel: 'MODERATE',
    stopDecision: false,
    headline: 'Unverified recipient. Proceed with caution.',
    stopReason: 'Recipient handle is recently created with limited transaction depth across banking clearing networks. Verify identity directly before sending funds.',
    connectedEntities: 4,
    elevatedRiskConnections: 1,
    riskTags: ['Unverified Recipient', '4 connected entities', 'First-time transfer', 'Commercial Intent'],
    note: 'Consulting retainer advance',
    localContext: {
      payment_request: true,
      urgency: false,
      payment_pressure: false,
      authority_claim: false,
      signalStrength: 'MODERATE',
      heuristicScore: 0.55,
      confidence: 0.72,
      threat_indicators: ['Advance Fee Pattern'],
      inference_engine: 'Local CPU/JIT execution (Snapdragon Platform)',
      hardware_platform: 'Snapdragon platform detected',
      execution_runtime: 'On-device V8/JIT',
      latency_ms: 2,
      offline_ready: true
    },
    storyCorrelation: {
      claimedPurpose: 'Professional Consulting Service',
      actualEntityCategory: 'Unverified Personal Handle (<30 days active)',
      mismatchDetected: true,
      correlationStatus: 'UNKNOWN',
      mismatchSeverity: 'MODERATE',
      mismatchPillars: {
        claimedStory: 'Independent consulting retainer advance',
        financialRecipient: 'Unverified Individual VPA (priya.consulting@okhdfcbank)',
        networkTrail: 'Sparse P2P Graph with Unverified Aggregator Node'
      },
      explanation: 'Insufficient recipient and network evidence to establish that the payment context is consistent.'
    },
    trustChain: [
      {
        stage: 'Payment Context',
        status: 'Clean organic request',
        level: 'safe',
        icon: 'check_circle',
        detail: 'Local Analysis (Client JIT, 2ms): No coercive patterns or artificial time pressure.'
      },
      {
        stage: 'Recipient',
        status: 'Unverified individual VPA',
        level: 'warning',
        icon: 'person',
        detail: 'Handle created 16 days ago. No prior direct peer transaction history.'
      },
      {
        stage: 'Network Trail',
        status: '4 connected entities',
        level: 'warning',
        icon: 'hub',
        detail: 'Sparse transaction graph with limited established counterparties in commercial clearing.'
      },
      {
        stage: 'Story Correlation',
        status: 'Unverified Commercial Intent',
        level: 'warning',
        icon: 'compare_arrows',
        detail: 'Claimed consulting purpose lacks verified corporate enterprise banking settlement.'
      }
    ],
    aiExplanation: 'Newly registered recipient handle with limited network depth. Verify directly with the consultant before transferring ₹4,500.'
  },

  // 3. GOLDEN CASE A — PROCEED (Swiggy / Bundl Technologies)
  {
    id: 'chk-golden-a',
    recipient: 'swiggy@icici',
    amount: 850,
    date: 'Yesterday, 8:45 PM',
    timestamp: Date.now() - 3600000 * 24,
    riskLevel: 'SAFE',
    stopDecision: false,
    headline: 'Payment cleared by Q-NETRA shield.',
    stopReason: 'Verified enterprise merchant with stable KYC history and direct tier-1 banking clearing routes.',
    connectedEntities: 2,
    elevatedRiskConnections: 0,
    riskTags: ['Verified VPA', 'Clean Velocity', 'Direct Bank Route', '100% Story Alignment'],
    note: 'Swiggy Food Order #49281',
    localContext: {
      payment_request: true,
      urgency: false,
      payment_pressure: false,
      authority_claim: false,
      signalStrength: 'CLEAN',
      heuristicScore: 0.15,
      confidence: 0.98,
      threat_indicators: [],
      inference_engine: 'Local CPU/JIT execution (Snapdragon Platform)',
      hardware_platform: 'Snapdragon platform detected',
      execution_runtime: 'On-device V8/JIT',
      latency_ms: 1,
      offline_ready: true
    },
    storyCorrelation: {
      claimedPurpose: 'Verified Commercial Merchant',
      actualEntityCategory: 'Bundl Technologies Pvt Ltd (Swiggy)',
      mismatchDetected: false,
      correlationStatus: 'CONSISTENT',
      mismatchSeverity: 'CLEAN',
      mismatchPillars: {
        claimedStory: 'Commercial retail merchant order payment',
        financialRecipient: 'Bundl Technologies Pvt Ltd (Verified Enterprise KYC)',
        networkTrail: 'Direct Tier-1 Scheduled Commercial Bank Clearing (ICICI)'
      },
      explanation: 'The available payment context is consistent with the available recipient and network evidence.'
    },
    trustChain: [
      {
        stage: 'Payment Context',
        status: 'Standard organic request',
        level: 'safe',
        icon: 'check_circle',
        detail: 'Local Analysis (Client JIT, 1ms): Clean organic food order payment intent.'
      },
      {
        stage: 'Recipient',
        status: 'Bundl Technologies Pvt Ltd',
        level: 'safe',
        icon: 'person',
        detail: 'Verified banking KYC, enterprise merchant active across 2,450+ days.'
      },
      {
        stage: 'Network Trail',
        status: '2 connected entities (Primary Bank)',
        level: 'safe',
        icon: 'hub',
        detail: 'Direct route to tier-1 scheduled commercial bank with zero mule links.'
      },
      {
        stage: 'Story Correlation',
        status: '100% Intent-to-Trail Alignment',
        level: 'safe',
        icon: 'compare_arrows',
        detail: 'Claimed merchant purpose aligns with verified corporate banking recipient and direct settlement.'
      }
    ],
    aiExplanation: 'Verified merchant handle with direct NPCI banking clearance. Safe to proceed.'
  }
];
