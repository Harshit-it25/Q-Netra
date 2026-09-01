export type VoiceIntentType = 
  | 'REPORT_1930'
  | 'QR_SAFETY'
  | 'MULE_NETWORK'
  | 'APK_MALWARE'
  | 'WHY_FLAGGED'
  | 'GENERAL_CYBER_ADVICE';

export interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error?: string;
}
