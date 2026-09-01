import { apiRequest } from './apiClient';
import { NetworkGraphData } from '../../domain/network/types';
import { RiskLevel } from '../../domain/risk/types';

export interface NetworkGraphResponse extends NetworkGraphData {
  success: boolean;
  vpa: string;
  error?: string;
}

export interface InvestigationDossierResponse {
  success: boolean;
  dossier: {
    targetVpa: string;
    identifiedSyndicate: string;
    totalRiskHops: number;
    flaggedMuleNodes: string[];
    cryptoOffRamp: string;
    recommendedAction: string;
    telemetryTimestamp: string;
  };
  error?: string;
}

export const networkApi = {
  /**
   * Fetches the dynamic multi-hop graph topology for a given VPA.
   */
  async getGraph(vpa: string, riskLevel: RiskLevel): Promise<NetworkGraphResponse> {
    const encodedVpa = encodeURIComponent(vpa);
    const encodedRisk = encodeURIComponent(riskLevel);
    return apiRequest<NetworkGraphResponse>(
      `/api/network-graph?vpa=${encodedVpa}&risk=${encodedRisk}`
    );
  },

  /**
   * Generates a forensic investigation summary dossier for desktop handover.
   */
  async getInvestigationDossier(vpa: string): Promise<InvestigationDossierResponse> {
    return apiRequest<InvestigationDossierResponse>('/api/office-kit/investigate', {
      method: 'POST',
      body: JSON.stringify({ vpa })
    });
  }
};
