/**
 * Q-NETRA AI — Zero-Network Diagnostics Monitor
 * Tracks all outbound network requests to assert 0 network requests during core offline flow.
 */

export interface NetworkRequestLog {
  url: string;
  method: string;
  timestamp: number;
  isCoreFlow: boolean;
}

export class NetworkActivityTracker {
  private static instance: NetworkActivityTracker;
  private logs: NetworkRequestLog[] = [];
  private coreDecisionCallCount = 0;
  private isHooked = false;

  public static getInstance(): NetworkActivityTracker {
    if (!NetworkActivityTracker.instance) {
      NetworkActivityTracker.instance = new NetworkActivityTracker();
    }
    return NetworkActivityTracker.instance;
  }

  public init(): void {
    if (this.isHooked || typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || 'unknown';
      const method = (args[1]?.method || 'GET').toUpperCase();

      const isCoreRiskDecision = url.includes('/api/checks') || url.includes('/api/risk');

      if (isCoreRiskDecision) {
        this.coreDecisionCallCount++;
      }

      this.logs.push({
        url,
        method,
        timestamp: Date.now(),
        isCoreFlow: isCoreRiskDecision
      });

      return originalFetch.apply(window, args);
    };

    this.isHooked = true;
  }

  public getCoreDecisionCallCount(): number {
    return this.coreDecisionCallCount;
  }

  public getLogs(): NetworkRequestLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.coreDecisionCallCount = 0;
  }

  public isZeroNetworkAsserted(): boolean {
    return this.coreDecisionCallCount === 0;
  }
}

export const networkTracker = NetworkActivityTracker.getInstance();
