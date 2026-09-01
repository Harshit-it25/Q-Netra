import { apiRequest } from './apiClient';
import { MessageAnalysisResult } from '../../domain/message/types';

export interface AnalyzeMessageResponse extends MessageAnalysisResult {
  success: boolean;
  error?: string;
}

export const messageApi = {
  /**
   * Evaluates an SMS text string or phishing link for fraud markers and generates an AI summary.
   */
  async analyzeMessage(text: string): Promise<AnalyzeMessageResponse> {
    return apiRequest<AnalyzeMessageResponse>('/api/analyze-message', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }
};
