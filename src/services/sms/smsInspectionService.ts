import { analyzePaymentContextLocally } from '../ai/onDeviceContextService';
import { evaluateLinkSafety } from './linkSafetyService';
import {
  MessageAnalysisResult,
  RiskLevel,
  SmsPermissionState,
  SmsAnalysisItem
} from '../../domain/message/types';
import { localStorageService } from '../storage/localStorageService';

export type { SmsPermissionState, SmsAnalysisItem };

const SMS_PERM_KEY = 'qnetra_sms_permission';
const SMS_HISTORY_KEY = 'qnetra_sms_history';

export function getSmsPermissionState(): SmsPermissionState {
  return localStorageService.getItem<SmsPermissionState>(
    SMS_PERM_KEY,
    'SMS_PERMISSION_PROMPT'
  );
}

export function setSmsPermissionState(state: SmsPermissionState): void {
  localStorageService.setItem(SMS_PERM_KEY, state);
}

export function inspectSmsLocally(messageText: string): MessageAnalysisResult {
  const text = String(messageText || '').trim();
  const context = analyzePaymentContextLocally(text);
  const linkSafety = evaluateLinkSafety(text);

  const signals: string[] = [...context.threat_indicators];
  if (linkSafety.isApkDownload) {
    signals.push('Malicious APK / App Download');
  }
  if (linkSafety.isShortLink) {
    signals.push('Obfuscated Shortlink');
  }

  const isHighRisk =
    context.payment_pressure ||
    linkSafety.isApkDownload ||
    (context.authority_claim && (context.urgency || linkSafety.isShortLink)) ||
    context.heuristicScore >= 1.0;

  const isModerate = !isHighRisk && (context.urgency || linkSafety.isShortLink || context.heuristicScore >= 0.4);

  const riskLevel: RiskLevel = isHighRisk ? 'HIGH RISK' : isModerate ? 'MODERATE' : 'SAFE';

  let recommendation = 'Message contains no common coercive or malicious markers.';
  if (isHighRisk) {
    recommendation =
      'STOP: Do not click any links, call unverified numbers, or download APK files. Legitimate banks and utilities never send APK download links via SMS. Dial 1930 if money was sent.';
  } else if (isModerate) {
    recommendation =
      'VERIFY: Message contains urgency or shortened links. Verify directly through official customer care or app before taking action.';
  }

  return {
    text,
    isHighRisk,
    riskLevel,
    signals: signals.length > 0 ? signals : ['Standard informational notification pattern'],
    recommendation
  };
}

export function analyzeSmsLocally(
  body: string,
  sender: string = 'UNKNOWN',
  id?: string,
  timestamp?: number
): SmsAnalysisItem {
  const result = inspectSmsLocally(body);
  const context = analyzePaymentContextLocally(body);
  const linkSafety = evaluateLinkSafety(body);

  return {
    id: id || `sms-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    sender,
    body,
    timestamp: timestamp || Date.now(),
    dateStr: 'Just now',
    riskLevel: result.riskLevel,
    isHighRisk: result.isHighRisk,
    signals: result.signals,
    recommendation: result.recommendation || '',
    extractedVpa: context.extracted_vpa,
    extractedAmount: context.extracted_amount,
    hasApk: linkSafety.isApkDownload,
    hasShortlink: linkSafety.isShortLink,
    hasUrgency: context.urgency,
    threatDescription: linkSafety.threatDescription
  };
}

export function getSmsAnalysisHistory(): SmsAnalysisItem[] {
  return localStorageService.getItem<SmsAnalysisItem[]>(SMS_HISTORY_KEY, []);
}

export function saveSmsAnalysisHistory(items: SmsAnalysisItem[]): void {
  localStorageService.setItem(SMS_HISTORY_KEY, items);
}

export function deleteSmsAnalysisById(id: string): SmsAnalysisItem[] {
  const current = getSmsAnalysisHistory();
  const filtered = current.filter((item) => item.id !== id);
  saveSmsAnalysisHistory(filtered);
  return filtered;
}

export function clearAllSmsAnalysisHistory(): void {
  localStorageService.removeItem(SMS_HISTORY_KEY);
}
