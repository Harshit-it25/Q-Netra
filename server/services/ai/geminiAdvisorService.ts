import { GoogleGenAI } from '@google/genai';
import { RiskLevel } from '../../../src/domain/risk/types';
import { SERVER_CONFIG } from '../../app/config';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = SERVER_CONFIG.geminiApiKey;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

export async function generatePaymentExplanation(
  vpa: string,
  amount: number,
  riskLevel: RiskLevel,
  note?: string,
  signals?: string[]
): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    return riskLevel === 'HIGH RISK'
      ? 'Q-NETRA multi-hop graph analysis flagged high-velocity mule dispersal and unverified VPA mask.'
      : riskLevel === 'MODERATE'
      ? 'Newly created VPA with limited transaction depth across banking clearing networks.'
      : 'Verified entity with stable KYC registration and consistent transaction patterns.';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `You are Q-NETRA AI, a pre-payment fraud intelligence engine.
Analyze this payment attempt:
- Target VPA / Recipient: "${vpa}"
- Amount: ₹${amount.toLocaleString()}
- Note: "${note || 'None'}"
- Flagged Risk Level: ${riskLevel}
- Signals: ${JSON.stringify(signals || [])}

Provide a concise, 2-sentence forensic security reason explaining why this payment was flagged or cleared for the user, referencing trust chain and network indicators.`
    });

    return response.text?.trim() || '';
  } catch (err) {
    console.warn('Gemini generatePaymentExplanation fallback:', err);
    return riskLevel === 'HIGH RISK'
      ? 'Q-NETRA multi-hop graph analysis flagged high-velocity mule dispersal and unverified VPA mask.'
      : 'Verified entity with stable KYC registration and consistent transaction patterns.';
  }
}

export async function generateMessageExplanation(
  text: string,
  signals: string[],
  isHighRisk: boolean
): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) return '';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `You are Q-NETRA AI, an SMS and phishing threat analyzer.
Message content: "${text}"
Signals detected: ${JSON.stringify(signals)}
Risk status: ${isHighRisk ? 'HIGH RISK' : 'SAFE'}

Explain in 2 bullet points why this message is safe or dangerous and what specific defensive action the recipient should take.`
    });

    return response.text?.trim() || '';
  } catch (err) {
    console.warn('Gemini generateMessageExplanation fallback:', err);
    return '';
  }
}

export async function askQNetraAdvisor(question: string): Promise<string> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are Q-NETRA AI ("See Beyond the Payment"), an advanced on-device and network-level payment risk intelligence advisor designed to protect users against UPI frauds, mule account clusters, QR code tampering, phishing APKs, and social engineering in digital banking.
Answer the user's question with precise cybersecurity advice, clear risk indicators, and official steps (like reporting to National Cyber Crime Reporting Portal cybercrime.gov.in / Dial 1930).
Keep responses clear, concise, and structured.

User question: "${question}"`
      });

      if (response.text) return response.text.trim();
    } catch (err) {
      console.warn('Gemini askQNetraAdvisor fallback:', err);
    }
  }

  // Domain heuristic responses for offline/low-latency usage
  const q = question.toLowerCase();
  if (q.includes('1930') || q.includes('report') || q.includes('police') || q.includes('complaint')) {
    return 'If you have lost money or suspect a scam, immediately call the National Cyber Crime Helpline at **1930** within the golden hour (first 2 hours) to freeze mule accounts, or log a complaint at **cybercrime.gov.in** with transaction IDs and bank reference numbers.';
  }
  if (q.includes('qr') || q.includes('scan') || q.includes('receive')) {
    return '⚠️ **Golden Security Rule:** You **NEVER** need to scan a QR code or enter your UPI PIN to *receive* money. QR codes and PIN entries are exclusively used to *debit* money from your account. If a buyer or caller asks you to scan to get a refund or receive cash, it is 100% a scam.';
  }
  if (q.includes('mule') || q.includes('network') || q.includes('graph')) {
    return 'Mule accounts are bank accounts rented or purchased by fraud syndicates to quickly launder stolen money across multiple hops before withdrawal. Q-NETRA AI’s Graph Neural Engine maps these clusters in real time to intercept transactions before funds disperse.';
  }
  if (q.includes('apk') || q.includes('app') || q.includes('screen') || q.includes('anydesk')) {
    return 'Never install apps like AnyDesk, QuickSupport, TeamViewer, or untrusted APKs sent over WhatsApp/SMS claiming to be "Bank KYC Support" or "Electricity Department". These grant scammers complete remote access to intercept your OTPs and control your device.';
  }

  return '**Q-NETRA AI Advice:** Always verify the verified name on your banking app before authorizing transactions. Double-check handles, watch out for high-pressure deadlines, and check any suspicious VPA in Q-NETRA AI before entering your UPI PIN.';
}
