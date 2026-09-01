import { NetworkNode, NetworkLink, NetworkGraphData } from '../../../src/domain/network/types';
import { RiskLevel } from '../../../src/domain/risk/types';
import { entityRepository } from '../../repositories/entityRepository';
import { graphRepository } from '../../repositories/graphRepository';

export function buildGraphForEntity(vpa: string, riskLevel: RiskLevel): NetworkGraphData {
  const normalizedVpa = String(vpa || 'unknown@upi').trim().toLowerCase();
  const known = entityRepository.findByVpa(normalizedVpa);

  if (riskLevel === 'HIGH RISK' || normalizedVpa.includes('abc') || normalizedVpa.includes('mule') || normalizedVpa.includes('lottery')) {
    const defaultGraph = graphRepository.getDefaultHighRiskGraph();
    const nodes: NetworkNode[] = defaultGraph.nodes.map((n) => {
      if (n.id === 'target') {
        return {
          ...n,
          label: normalizedVpa,
          riskScore: known?.baseRiskScore || 94
        };
      }
      return { ...n };
    });

    return {
      nodes,
      links: defaultGraph.links,
      totalConnectedEntities: 7,
      elevatedRiskConnections: 3,
      clusterType: 'Mule Ring Fan-Out (Layer-1 to P2P Crypto)',
      fanoutVelocityScore: 92,
      layer1MuleAccounts: ['mule_781@axis', 'quick_pay88@sbi'],
      cryptoOffRamps: ['P2P_Exch_Wallet#9'],
      sharedDeviceFingerprint: known?.deviceFingerprint || 'IMEI:864209118942',
      summary: 'Target is the entry funnel into a 7-node syndicate with 3 elevated-risk mule nodes and rapid crypto off-ramp.'
    };
  }

  if (riskLevel === 'MODERATE') {
    const nodes: NetworkNode[] = [
      {
        id: 'target',
        label: normalizedVpa,
        type: 'target',
        risk: 'medium',
        riskScore: 58,
        x: 320,
        y: 200,
        subtext: 'Target Merchant VPA (Low History)',
        transactionsLast24h: 12
      },
      {
        id: 'node-bank',
        label: 'Commercial Bank Gateway',
        type: 'safe',
        risk: 'safe',
        riskScore: 12,
        x: 200,
        y: 130,
        subtext: 'Standard clearing settlement',
        transactionsLast24h: 1500
      },
      {
        id: 'node-aggregator',
        label: 'Payment Gateway Partner',
        type: 'safe',
        risk: 'safe',
        riskScore: 20,
        x: 440,
        y: 130,
        subtext: 'Recently registered sub-merchant ID',
        transactionsLast24h: 88
      },
      {
        id: 'node-device',
        label: 'Merchant POS Terminal',
        type: 'safe',
        risk: 'medium',
        riskScore: 45,
        x: 320,
        y: 310,
        subtext: 'Device ID active for 14 days',
        transactionsLast24h: 12
      }
    ];

    const links: NetworkLink[] = [
      { source: 'target', target: 'node-bank', amount: 'Settlement', isSuspicious: false, label: 'Settlement' },
      { source: 'target', target: 'node-aggregator', amount: 'Routing', isSuspicious: false, label: 'Gateway' },
      { source: 'node-device', target: 'target', amount: 'Terminal', isSuspicious: false, label: 'Origin POS' }
    ];

    return {
      nodes,
      links,
      totalConnectedEntities: 4,
      elevatedRiskConnections: 1,
      clusterType: 'New Merchant Terminal (Sparse History)',
      fanoutVelocityScore: 35,
      layer1MuleAccounts: [],
      cryptoOffRamps: [],
      summary: 'Isolated merchant account with limited peer transaction depth (14 days active).'
    };
  }

  // Safe / Clean Graph
  const nodes: NetworkNode[] = [
    {
      id: 'target',
      label: normalizedVpa,
      type: 'target',
      risk: 'safe',
      riskScore: 6,
      x: 320,
      y: 200,
      subtext: 'Verified Individual / Whitelisted Merchant',
      transactionsLast24h: 3
    },
    {
      id: 'node-bank-direct',
      label: 'Scheduled Commercial Bank Core',
      type: 'safe',
      risk: 'safe',
      riskScore: 2,
      x: 320,
      y: 110,
      subtext: 'Direct NPCI / UPI Tier-1 Route',
      transactionsLast24h: 24000
    }
  ];

  const links: NetworkLink[] = [
    { source: 'target', target: 'node-bank-direct', amount: 'Direct Credit', isSuspicious: false, label: 'Direct Clearing' }
  ];

  return {
    nodes,
    links,
    totalConnectedEntities: 2,
    elevatedRiskConnections: 0,
    clusterType: 'Direct Peer-to-Bank (Clean Topology)',
    fanoutVelocityScore: 5,
    layer1MuleAccounts: [],
    cryptoOffRamps: [],
    summary: 'Direct connection to verified tier-1 banking infrastructure with zero anomalous fan-out.'
  };
}
