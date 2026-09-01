export interface NetworkNode {
  id: string;
  label: string;
  type: 'target' | 'mule' | 'exchange' | 'merchant' | 'safe';
  risk: 'high' | 'medium' | 'safe';
  riskScore: number;
  x: number;
  y: number;
  subtext: string;
  transactionsLast24h: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  amount: string;
  isSuspicious: boolean;
  label?: string;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  totalConnectedEntities?: number;
  elevatedRiskConnections?: number;
  clusterType?: string;
  fanoutVelocityScore?: number;
  layer1MuleAccounts?: string[];
  cryptoOffRamps?: string[];
  sharedDeviceFingerprint?: string;
  summary?: string;
  topologySource?: 'SEEDED DEMO TOPOLOGY' | 'REAL LOCAL DATA';
}
