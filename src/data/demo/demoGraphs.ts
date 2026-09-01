import { NetworkGraphData } from '../../types';

/**
 * Seeded 7-node representative cybercrime syndicate topology
 * Used for live mobile UI graph demonstration.
 */
export const DEFAULT_HIGH_RISK_GRAPH: NetworkGraphData = {
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
