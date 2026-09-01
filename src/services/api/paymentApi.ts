import { apiRequest } from './apiClient';
import { PaymentAnalysisRequest, PaymentAnalysisResponse } from '../../domain/payment/types';

export const paymentApi = {
  /**
   * Evaluates payment risk via the backend Graph Neural & Story Correlation Engine.
   */
  async analyzePayment(request: PaymentAnalysisRequest): Promise<PaymentAnalysisResponse> {
    return apiRequest<PaymentAnalysisResponse>('/api/analyze-payment', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
};
