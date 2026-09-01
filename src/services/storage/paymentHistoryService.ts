import { PaymentCheck } from '../../domain/payment/types';
import { GOLDEN_CASES } from '../../data/demo/goldenCases';
import { localStorageService } from './localStorageService';

const STORAGE_KEY = 'qnetra_checks';

export const paymentHistoryService = {
  /**
   * Loads payment history from localStorage, falling back to GOLDEN_CASES demo fixtures.
   */
  loadHistory(): PaymentCheck[] {
    const list = localStorageService.getItem<PaymentCheck[]>(STORAGE_KEY, GOLDEN_CASES);
    return Array.isArray(list) && list.length > 0 ? list : GOLDEN_CASES;
  },

  /**
   * Persists updated payment checks array to localStorage.
   */
  saveHistory(checks: PaymentCheck[]): void {
    localStorageService.setItem(STORAGE_KEY, checks);
  },

  /**
   * Deletes a specific payment check record by its ID.
   */
  deleteById(id: string): {
    success: boolean;
    remainingChecks: PaymentCheck[];
    deletedCheck?: PaymentCheck;
  } {
    if (!id) {
      return { success: false, remainingChecks: this.loadHistory() };
    }

    const current = this.loadHistory();
    const deletedCheck = current.find((c) => c.id === id);
    const remainingChecks = current.filter((c) => c.id !== id);

    this.saveHistory(remainingChecks);

    return {
      success: Boolean(deletedCheck),
      remainingChecks,
      deletedCheck
    };
  },

  /**
   * Restores initial 3 Golden Cases demo fixtures.
   */
  resetDemoState(): PaymentCheck[] {
    this.saveHistory(GOLDEN_CASES);
    return GOLDEN_CASES;
  },

  /**
   * Completely purges all stored checks and clears storage.
   */
  clearAll(): void {
    localStorageService.removeItem(STORAGE_KEY);
  }
};

export const {
  loadHistory: loadPaymentHistory,
  saveHistory: savePaymentHistory,
  deleteById: deletePaymentById,
  resetDemoState: resetPaymentHistory
} = paymentHistoryService;
