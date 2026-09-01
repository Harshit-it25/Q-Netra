import { RecipientIdentity } from '../../../src/domain/identity/types';
import { NetworkNode, NetworkLink } from '../../../src/domain/network/types';

/**
 * =========================================================================
 * Q-NETRA AI — SEEDED DEMO KNOWLEDGE BASE (STRICT DEMO DATA)
 * =========================================================================
 * Seeded test fixtures used to demonstrate multi-hop graph intelligence,
 * entity KYC lookup, and intent-to-trail story correlation during evaluations.
 */
export const SEEDED_KNOWN_ENTITIES: Record<string, RecipientIdentity> = {
  'abc123@upi': {
    vpa: 'abc123@upi',
    name: 'A. B. Collections (Masked)',
    category: 'mule',
    kycStatus: 'flagged',
    accountAgeDays: 4,
    baseRiskScore: 94,
    reportCount1930: 14,
    isKnownMule: true,
    clusterId: 'cluster-mule-alpha',
    deviceFingerprint: 'IMEI:864209118942',
    ipLocation: 'SE Asia Proxy (Phnom Penh / Cyber Park)',
    avgDailyVolume: 450000
  },
  'abc@upi': {
    vpa: 'abc@upi',
    name: 'Rapid Express Tech (Shell)',
    category: 'mule',
    kycStatus: 'unverified',
    accountAgeDays: 11,
    baseRiskScore: 91,
    reportCount1930: 8,
    isKnownMule: true,
    clusterId: 'cluster-mule-alpha',
    deviceFingerprint: 'IMEI:864209118942',
    ipLocation: 'High-anonymity VPN Node',
    avgDailyVolume: 280000
  },
  'disconnection.desk@upi': {
    vpa: 'disconnection.desk@upi',
    name: 'State Power Bill Helpdesk (Spoofed)',
    category: 'suspicious',
    kycStatus: 'flagged',
    accountAgeDays: 1,
    baseRiskScore: 95,
    reportCount1930: 19,
    isKnownMule: true,
    clusterId: 'cluster-utility-scam',
    deviceFingerprint: 'IMEI:910248102941',
    ipLocation: 'Mewat/Nuh GSM Triangulation',
    avgDailyVolume: 95000
  },
  'lottery-gift@ybl': {
    vpa: 'lottery-gift@ybl',
    name: 'KBC Rewards Gift Hub',
    category: 'suspicious',
    kycStatus: 'unverified',
    accountAgeDays: 2,
    baseRiskScore: 96,
    reportCount1930: 22,
    isKnownMule: true,
    clusterId: 'cluster-lottery-scam',
    deviceFingerprint: 'IMEI:990142388120',
    ipLocation: 'Mewat/Nuh GSM Triangulation',
    avgDailyVolume: 120000
  },
  'priya.consulting@okhdfcbank': {
    vpa: 'priya.consulting@okhdfcbank',
    name: 'Priya Verma (Consultant - Unverified)',
    category: 'individual',
    kycStatus: 'unverified',
    accountAgeDays: 16,
    baseRiskScore: 54,
    reportCount1930: 0,
    isKnownMule: false,
    deviceFingerprint: 'IMEI:489012389104',
    ipLocation: 'Pune, India (Jio 5G)',
    avgDailyVolume: 18000
  },
  'xyz@upi': {
    vpa: 'xyz@upi',
    name: 'Rohit Sharma (Verified Personal)',
    category: 'individual',
    kycStatus: 'verified',
    accountAgeDays: 1140,
    baseRiskScore: 8,
    reportCount1930: 0,
    isKnownMule: false,
    deviceFingerprint: 'IMEI:358901248901',
    ipLocation: 'Bengaluru, India (Airtel 5G)',
    avgDailyVolume: 4200
  },
  'swiggy@icici': {
    vpa: 'swiggy@icici',
    name: 'Bundl Technologies Pvt Ltd (Swiggy)',
    category: 'merchant',
    kycStatus: 'verified',
    accountAgeDays: 2450,
    baseRiskScore: 2,
    reportCount1930: 0,
    isKnownMule: false,
    deviceFingerprint: 'MERCHANT_GATEWAY_CERT_001',
    ipLocation: 'Mumbai Datacenter (NPCI Direct)',
    avgDailyVolume: 85000000
  },
  'zomato@hdfcbank': {
    vpa: 'zomato@hdfcbank',
    name: 'Zomato Limited (Verified Merchant)',
    category: 'merchant',
    kycStatus: 'verified',
    accountAgeDays: 2900,
    baseRiskScore: 1,
    reportCount1930: 0,
    isKnownMule: false,
    deviceFingerprint: 'MERCHANT_GATEWAY_CERT_002',
    ipLocation: 'Gurugram HQ Gateway',
    avgDailyVolume: 92000000
  }
};

export const SEEDED_HIGH_RISK_GRAPH: { nodes: NetworkNode[]; links: NetworkLink[] } = {
  nodes: [
    {
      id: 'target',
      label: 'abc123@upi',
      type: 'target',
      risk: 'high',
      riskScore: 94,
      x: 320,
      y: 200,
      subtext: 'Target Recipient (Mule Entry Node)',
      transactionsLast24h: 47
    },
    {
      id: 'node-mule1',
      label: 'mule_781@axis',
      type: 'mule',
      risk: 'high',
      riskScore: 89,
      x: 180,
      y: 110,
      subtext: 'Layer-1 Rapid Fan-out Account',
      transactionsLast24h: 128
    },
    {
      id: 'node-mule2',
      label: 'quick_pay88@sbi',
      type: 'mule',
      risk: 'high',
      riskScore: 92,
      x: 460,
      y: 110,
      subtext: 'Layer-1 Transit Node (Flagged in 1930 NCRP)',
      transactionsLast24h: 94
    },
    {
      id: 'node-crypto',
      label: 'P2P_Exch_Wallet#9',
      type: 'exchange',
      risk: 'high',
      riskScore: 98,
      x: 480,
      y: 290,
      subtext: 'P2P Crypto Off-Ramp Endpoint (USDT Escrow)',
      transactionsLast24h: 310
    },
    {
      id: 'node-shell',
      label: 'shell_corp_vpa@hdfc',
      type: 'mule',
      risk: 'medium',
      riskScore: 71,
      x: 170,
      y: 290,
      subtext: 'Dormant Account Woken 48h Ago',
      transactionsLast24h: 15
    },
    {
      id: 'node-device',
      label: 'IMEI: 8642...09',
      type: 'mule',
      risk: 'high',
      riskScore: 95,
      x: 320,
      y: 50,
      subtext: 'Device shared across 14 fraudulent VPAs',
      transactionsLast24h: 84
    },
    {
      id: 'node-vpn',
      label: 'VPN Egress (SE Asia)',
      type: 'mule',
      risk: 'medium',
      riskScore: 68,
      x: 320,
      y: 350,
      subtext: 'High-anonymity IP Proxy Node (Cambodia/Myanmar)',
      transactionsLast24h: 520
    }
  ],
  links: [
    { source: 'target', target: 'node-mule1', amount: '₹18,500', isSuspicious: true, label: 'Instant Forward (12s)' },
    { source: 'target', target: 'node-mule2', amount: '₹1,500', isSuspicious: true, label: 'Split Transaction' },
    { source: 'node-mule1', target: 'node-crypto', amount: '₹17,900', isSuspicious: true, label: 'P2P Purchase' },
    { source: 'node-mule2', target: 'node-crypto', amount: '₹1,450', isSuspicious: true, label: 'P2P Conversion' },
    { source: 'target', target: 'node-shell', amount: 'Linked Identity', isSuspicious: true, label: 'Shared Mobile' },
    { source: 'node-device', target: 'target', amount: 'Controls', isSuspicious: true, label: 'Same Rooted APK' },
    { source: 'node-vpn', target: 'target', amount: 'Session Route', isSuspicious: false, label: 'Proxy Tunnel' }
  ]
};
