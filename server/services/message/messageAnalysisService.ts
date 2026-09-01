import { MessageAnalysisResult, RiskLevel, ThreatPattern } from '../../../src/domain/message/types';

export const SERVER_THREAT_PATTERNS: ThreatPattern[] = [
  {
    id: 'elec-disconn',
    name: 'Fake Electricity Disconnection Scam',
    regex: /electricity|power.*(cut|disconnect|office)|bill.*(due|pending|update)|officer.*(contact|call)/i,
    category: 'disconnection',
    severity: 'high',
    explanation: 'Scammers impersonate state electricity boards threatening sudden power cuts to induce panic payments.'
  },
  {
    id: 'bank-kyc',
    name: 'Banking KYC & PAN Expiry Phishing',
    regex: /kyc|pan.*card|yono|sbi|hdfc|icici|axis|account.*(block|freeze|deactivat|suspend)/i,
    category: 'impersonation',
    severity: 'high',
    explanation: 'Fake bank compliance alert designed to harvest net-banking credentials and OTPs.'
  },
  {
    id: 'apk-malware',
    name: 'Malicious APK / Screen-Share Payload',
    regex: /\.apk|anydesk|teamviewer|rustdesk|quicksupport|download.*app|install.*link/i,
    category: 'apk_malware',
    severity: 'high',
    explanation: 'Instructs the user to download an untrusted APK or remote control app to intercept OTPs.'
  },
  {
    id: 'lottery-prize',
    name: 'Deceptive Lottery / Prize Trap',
    regex: /lottery|won|winner|kbc|jio.*lucky|cashback.*claim|gift.*card|prize.*money/i,
    category: 'lottery',
    severity: 'high',
    explanation: 'Promises large cash prizes in exchange for processing or registration advance fees.'
  },
  {
    id: 'urgency-pressure',
    name: 'Psychological Coercion & Artificial Urgency',
    regex: /urgent|immediately|tonight|within (5|10|15|30) min|penalty|fine ₹|police/i,
    category: 'urgency',
    severity: 'medium',
    explanation: 'Creates a manufactured time limit so victims act before verifying with official channels.'
  },
  {
    id: 'shortlink-phish',
    name: 'Obfuscated Shortened Link',
    regex: /bit\.ly|tinyurl|is\.gd|cutt\.ly|rb\.gy|wa\.me|t\.me/i,
    category: 'phishing',
    severity: 'medium',
    explanation: 'Masks true destination domain to bypass standard browser security checks.'
  }
];

export function analyzeMessageText(rawText: string): MessageAnalysisResult {
  const text = String(rawText || '').trim();
  const detectedPatterns: ThreatPattern[] = [];
  const signals: string[] = [];

  for (const pattern of SERVER_THREAT_PATTERNS) {
    if (pattern.regex.test(text)) {
      detectedPatterns.push(pattern);
      signals.push(pattern.name);
    }
  }

  const hasHighSeverity = detectedPatterns.some((p) => p.severity === 'high');
  const isHighRisk = hasHighSeverity || detectedPatterns.length >= 2;
  const isModerate = !isHighRisk && detectedPatterns.length > 0;

  let riskLevel: RiskLevel = 'SAFE';
  let recommendation = 'Message contains no common coercive or malicious markers.';

  if (isHighRisk) {
    riskLevel = 'HIGH RISK';
    recommendation =
      'STOP: Do not click any links, call unverified numbers, or download APK files. Legitimate banks and utilities never send APK download links via SMS. Dial 1930 if money was sent.';
  } else if (isModerate) {
    riskLevel = 'MODERATE';
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
