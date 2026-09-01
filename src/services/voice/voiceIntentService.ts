import { VoiceIntentType } from '../../domain/voice/types';
import { SupportedLanguage } from '../i18n/languages';
import { getTranslation } from '../i18n/translations';
import { advisorApi } from '../api/advisorApi';

/**
 * Domain voice intent classifier and localized response resolver.
 */

export interface VoiceAnswerResult {
  intent: VoiceIntentType;
  answer: string;
  isOfflineFallback: boolean;
}

export function classifyVoiceIntent(question: string): VoiceIntentType {
  const q = question.toLowerCase().trim();

  // 1930 / Police / Helpline
  if (
    q.includes('1930') ||
    q.includes('report') ||
    q.includes('police') ||
    q.includes('complaint') ||
    q.includes('हेल्पलाइन') ||
    q.includes('तक्रार') ||
    q.includes('शिकायत') ||
    q.includes('புகார்') ||
    q.includes('ఫిర్యాదు') ||
    q.includes('ದೂರು') ||
    q.includes('ફરિયાદ') ||
    q.includes('অভিযোগ')
  ) {
    return 'REPORT_1930';
  }

  // QR / PIN / Receive safety
  if (
    q.includes('qr') ||
    q.includes('scan') ||
    q.includes('receive') ||
    q.includes('pin') ||
    q.includes('पैसे मिळणे') ||
    q.includes('पैसे प्राप्त') ||
    q.includes('ஸ்கேன்') ||
    q.includes('స్కాన్') ||
    q.includes('ಸ್ಕ್ಯಾನ್') ||
    q.includes('સ્કેન')
  ) {
    return 'QR_SAFETY';
  }

  // Mule / Network / Money trail
  if (
    q.includes('mule') ||
    q.includes('network') ||
    q.includes('graph') ||
    q.includes('trail') ||
    q.includes('पैसे कुठे जातात') ||
    q.includes('पैसे कहाँ जाते') ||
    q.includes('பணம் எங்கே') ||
    q.includes('డబ్బు ఎక్కడికి') ||
    q.includes('ಹಣ ಎಲ್ಲಿಗೆ') ||
    q.includes('પૈસા ક્યાં') ||
    q.includes('টাকা কোথায়')
  ) {
    return 'MULE_NETWORK';
  }

  // APK / Malware / AnyDesk
  if (
    q.includes('apk') ||
    q.includes('app') ||
    q.includes('screen') ||
    q.includes('anydesk') ||
    q.includes('malware') ||
    q.includes('virus') ||
    q.includes('डाउनलोड') ||
    q.includes('इंस्टॉल')
  ) {
    return 'APK_MALWARE';
  }

  // Why / Flagged / Stop reason (Multilingual: "का?", "क्यों?", "ஏன்?", "ఎందుకు?", "ಏಕೆ?", "કેમ?", "কেন?")
  if (
    q.includes('why') ||
    q.includes('stop') ||
    q.includes('flagged') ||
    q === 'का' ||
    q.includes('का?') ||
    q.includes('का थांबवले') ||
    q.includes('का थांबवला') ||
    q === 'क्यों' ||
    q.includes('क्यों?') ||
    q.includes('क्यों रोका') ||
    q.includes('रोक क्यों') ||
    q.includes('safe') ||
    q.includes('सुरक्षित') ||
    q.includes('ஏன்') ||
    q.includes('நிறுத்தப்பட்டது') ||
    q.includes('ఎందుకు') ||
    q.includes('ఆపబడింది') ||
    q.includes('ಏಕೆ') ||
    q.includes('ನಿಲ್ಲಿಸಲಾಗಿದೆ') ||
    q.includes('કેમ') ||
    q.includes('રોકવામાં') ||
    q.includes('কেন') ||
    q.includes('থামানো')
  ) {
    return 'WHY_FLAGGED';
  }

  return 'GENERAL_CYBER_ADVICE';
}

export function getOfflineVoiceAnswer(intent: VoiceIntentType, lang: SupportedLanguage = 'en'): string {
  const t = getTranslation(lang).qaAnswers;
  switch (intent) {
    case 'REPORT_1930':
      return t.report1930;
    case 'QR_SAFETY':
      return t.qrSafety;
    case 'MULE_NETWORK':
      return t.muleNetwork;
    case 'APK_MALWARE':
      return t.apkMalware;
    case 'WHY_FLAGGED':
      return t.whyFlaggedStop(10, 'abc123@upi');
    default:
      return t.generalAdvice;
  }
}

export async function resolveVoiceQuery(
  question: string,
  lang: SupportedLanguage = 'en'
): Promise<VoiceAnswerResult> {
  const intent = classifyVoiceIntent(question);

  try {
    const apiRes = await advisorApi.askAdvisor(question);
    if (apiRes.success && apiRes.answer) {
      return {
        intent,
        answer: apiRes.answer,
        isOfflineFallback: false
      };
    }
  } catch (err) {
    console.warn('Voice API fallback to localized heuristic:', err);
  }

  return {
    intent,
    answer: getOfflineVoiceAnswer(intent, lang),
    isOfflineFallback: true
  };
}

export function generateVoiceAnswer(
  question: string,
  activeCheck?: any,
  lang: SupportedLanguage = 'en'
): { text: string; intent: VoiceIntentType } {
  const intent = classifyVoiceIntent(question);
  const t = getTranslation(lang).qaAnswers;

  if (intent === 'WHY_FLAGGED' && activeCheck) {
    if (activeCheck.stopDecision || activeCheck.riskLevel === 'HIGH RISK') {
      return {
        text: t.whyFlaggedStop(activeCheck.amount, activeCheck.recipient, activeCheck.stopReason),
        intent
      };
    }
    if (activeCheck.riskLevel === 'MODERATE') {
      return {
        text: t.whyFlaggedVerify(activeCheck.amount, activeCheck.recipient, activeCheck.headline),
        intent
      };
    }
    return {
      text: t.whyFlaggedProceed(activeCheck.amount, activeCheck.recipient),
      intent
    };
  }

  return {
    text: getOfflineVoiceAnswer(intent, lang),
    intent
  };
}
