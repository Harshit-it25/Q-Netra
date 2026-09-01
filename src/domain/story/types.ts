export interface IntentTrailCorrelation {
  claimedPurpose: string;
  actualEntityCategory: string;
  mismatchDetected: boolean;
  correlationStatus: 'CONSISTENT' | 'INCONSISTENT' | 'UNKNOWN';
  mismatchSeverity: 'CLEAN' | 'MODERATE' | 'CRITICAL';
  mismatchPillars: {
    claimedStory: string;
    financialRecipient: string;
    networkTrail: string;
  };
  explanation: string;
}
