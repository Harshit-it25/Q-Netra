import { NetworkNode, NetworkLink, NetworkGraphData } from '../../../src/domain/network/types';
import { RiskLevel } from '../../../src/domain/risk/types';
import { entityRepository } from '../../repositories/entityRepository';
import { identifyBankFromVpa } from '../../../src/services/qr/upiParserService';

/**
 * Builds dynamic network graph topology strictly from entity repository records,
 * device fingerprints, and banking routing gateways.
 */
export function buildGraphForEntity(vpa: string, riskLevel: RiskLevel): NetworkGraphData {
  const normalizedVpa = String(vpa || 'unknown@upi').trim().toLowerCase();
  const known = entityRepository.findByVpa(normalizedVpa);
  const bankName = identifyBankFromVpa(normalizedVpa);

  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];

  // 1. Center Target Node
  const targetRiskScore = known?.baseRiskScore ?? (riskLevel === 'HIGH RISK' ? 88 : riskLevel === 'MODERATE' ? 48 : 4);
  nodes.push({
    id: 'target',
    label: normalizedVpa,
    type: 'target',
    risk: riskLevel === 'HIGH RISK' ? 'high' : riskLevel === 'MODERATE' ? 'medium' : 'safe',
    riskScore: targetRiskScore,
    x: 320,
    y: 200,
    subtext: known?.name || (riskLevel === 'HIGH RISK' ? 'Target Recipient (Flagged Node)' : 'Target Recipient'),
    transactionsLast24h: known?.avgDailyVolume ? Math.max(1, Math.round(known.avgDailyVolume / 20000)) : 5
  });

  // 2. Direct Bank / NPCI Clearing Gateway Node
  const bankLabel = bankName ? `${bankName} Gateway` : 'Commercial Bank Gateway';
  nodes.push({
    id: 'node-bank-gateway',
    label: bankLabel,
    type: 'safe',
    risk: 'safe',
    riskScore: 2,
    x: 180,
    y: 110,
    subtext: 'Direct NPCI / UPI Tier-1 Clearing Route',
    transactionsLast24h: 24000
  });

  links.push({
    source: 'target',
    target: 'node-bank-gateway',
    amount: 'Direct Route',
    isSuspicious: false,
    label: 'Direct Clearing'
  });

  const layer1Mules: string[] = [];
  const cryptoOffRamps: string[] = [];

  // 3. Query Entity Repository for Co-Clustered Entities
  if (known) {
    // If entity is associated with a known cluster or device
    if (known.clusterId) {
      const allEntities = entityRepository.getAll();
      const clusterPeers = allEntities.filter(
        (e) => e.clusterId === known.clusterId && e.vpa.toLowerCase() !== normalizedVpa
      );

      clusterPeers.forEach((peer, idx) => {
        const nodeId = `node-cluster-${idx + 1}`;
        const isPeerHighRisk = (peer.baseRiskScore || 0) >= 70 || peer.isKnownMule;
        if (peer.isKnownMule) {
          layer1Mules.push(peer.vpa);
        }

        const angle = (idx + 1) * (Math.PI / 3) - Math.PI / 6;
        const peerX = Math.round(320 + Math.cos(angle) * 160);
        const peerY = Math.round(200 + Math.sin(angle) * 110);

        nodes.push({
          id: nodeId,
          label: peer.vpa,
          type: peer.category === 'mule' ? 'mule' : peer.category === 'merchant' ? 'merchant' : 'mule',
          risk: isPeerHighRisk ? 'high' : 'medium',
          riskScore: peer.baseRiskScore || 75,
          x: peerX,
          y: peerY,
          subtext: peer.name || 'Co-Clustered Syndicate Node',
          transactionsLast24h: peer.avgDailyVolume ? Math.round(peer.avgDailyVolume / 15000) : 35
        });

        links.push({
          source: 'target',
          target: nodeId,
          amount: 'Cluster Link',
          isSuspicious: isPeerHighRisk,
          label: 'Shared Entity Cluster'
        });
      });
    }

    // Shared Device Fingerprint Node
    if (known.deviceFingerprint) {
      nodes.push({
        id: 'node-device',
        label: known.deviceFingerprint,
        type: known.isKnownMule ? 'mule' : 'safe',
        risk: known.isKnownMule ? 'high' : 'safe',
        riskScore: known.isKnownMule ? 94 : 5,
        x: 320,
        y: 60,
        subtext: known.isKnownMule ? 'Device shared across suspicious identities' : 'Verified Hardware Fingerprint',
        transactionsLast24h: known.isKnownMule ? 48 : 2
      });

      links.push({
        source: 'node-device',
        target: 'target',
        amount: 'Device Bound',
        isSuspicious: Boolean(known.isKnownMule),
        label: 'Hardware Fingerprint'
      });
    }

    // IP Location / Gateway Node
    if (known.ipLocation) {
      nodes.push({
        id: 'node-ip-location',
        label: known.ipLocation,
        type: known.isKnownMule ? 'mule' : 'safe',
        risk: known.isKnownMule ? 'medium' : 'safe',
        riskScore: known.isKnownMule ? 65 : 2,
        x: 320,
        y: 340,
        subtext: 'Origin Network / Location Gateway',
        transactionsLast24h: 120
      });

      links.push({
        source: 'node-ip-location',
        target: 'target',
        amount: 'Session Route',
        isSuspicious: false,
        label: 'Network Origin'
      });
    }
  } else {
    // Unindexed / Unknown VPA
    if (riskLevel === 'MODERATE') {
      nodes.push({
        id: 'node-aggregator',
        label: 'Payment Gateway Partner',
        type: 'safe',
        risk: 'safe',
        riskScore: 18,
        x: 460,
        y: 120,
        subtext: 'Sub-merchant payment routing partner',
        transactionsLast24h: 88
      });

      links.push({
        source: 'target',
        target: 'node-aggregator',
        amount: 'Routing',
        isSuspicious: false,
        label: 'Gateway Route'
      });
    }
  }

  const elevatedCount = nodes.filter(
    (n) => n.id !== 'target' && (n.risk === 'high' || n.risk === 'medium')
  ).length;

  let clusterType = 'Direct Peer-to-Bank (Clean Topology)';
  if (known?.isKnownMule || elevatedCount >= 2) {
    clusterType = `Syndicate Cluster (${known?.clusterId || 'High-Risk Network'})`;
  } else if (riskLevel === 'MODERATE') {
    clusterType = 'Unindexed Counterparty (Sparse Routing Depth)';
  }

  let summary = `Direct commercial clearing route with NPCI settlement for ${normalizedVpa}.`;
  if (elevatedCount > 0) {
    summary = `Target ${normalizedVpa} is connected to ${nodes.length} nodes including ${elevatedCount} elevated-risk entity relation(s).`;
  }

  return {
    nodes,
    links,
    totalConnectedEntities: nodes.length,
    elevatedRiskConnections: elevatedCount,
    clusterType,
    fanoutVelocityScore: known?.isKnownMule ? 85 : riskLevel === 'MODERATE' ? 30 : 5,
    layer1MuleAccounts: layer1Mules,
    cryptoOffRamps,
    sharedDeviceFingerprint: known?.deviceFingerprint,
    summary
  };
}
