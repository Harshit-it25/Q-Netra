export interface RecipientIdentity {
  vpa: string;
  name: string;
  category: 'merchant' | 'individual' | 'mule' | 'exchange' | 'suspicious';
  kycStatus: 'verified' | 'unverified' | 'flagged' | 'dormant_reawakened';
  accountAgeDays: number;
  baseRiskScore: number;
  reportCount1930: number;
  isKnownMule: boolean;
  clusterId?: string;
  deviceFingerprint: string;
  ipLocation: string;
  avgDailyVolume: number;
}
