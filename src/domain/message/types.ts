import { RiskLevel } from '../risk/types';

export type { RiskLevel };

export type SmsPermissionState = 
  | 'SMS_PERMISSION_PROMPT'
  | 'SMS_PERMISSION_GRANTED'
  | 'SMS_PERMISSION_REVOKED';

export interface ThreatPattern {
  id: string;
  name: string;
  regex: RegExp;
  category: 'phishing' | 'apk_malware' | 'urgency' | 'lottery' | 'disconnection' | 'impersonation';
  severity: 'high' | 'medium';
  explanation: string;
}

export interface MessageAnalysisResult {
  text: string;
  isHighRisk: boolean;
  riskLevel: RiskLevel;
  signals: string[];
  recommendation?: string;
  aiExplanation?: string;
}

export interface SmsAnalysisItem {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
  dateStr: string;
  riskLevel: RiskLevel;
  isHighRisk: boolean;
  signals: string[];
  recommendation: string;
  extractedVpa?: string;
  extractedAmount?: number;
  hasApk: boolean;
  hasShortlink: boolean;
  hasUrgency: boolean;
  threatDescription?: string;
}
