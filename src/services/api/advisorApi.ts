import { apiRequest } from './apiClient';

export interface AskQNetraResponse {
  success: boolean;
  answer: string;
  error?: string;
}

export const advisorApi = {
  /**
   * Queries the Q-NETRA Cybersecurity Advisor with user questions.
   */
  async askAdvisor(question: string): Promise<AskQNetraResponse> {
    return apiRequest<AskQNetraResponse>('/api/ask-qnetra', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  }
};
