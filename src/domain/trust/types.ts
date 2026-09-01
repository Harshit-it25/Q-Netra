export interface TrustChainStep {
  stage: string;
  status: string;
  level: 'safe' | 'warning' | 'error';
  icon: string;
  detail?: string;
}
