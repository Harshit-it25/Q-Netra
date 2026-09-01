import { normalizeVpa, sanitizeAmount } from '../../domain/payment/paymentRules';

export interface ParsedUpiData {
  vpa: string;
  amount: number;
  note?: string;
  payeeName?: string;
  merchantCode?: string;
  transactionRef?: string;
  isUpi: boolean;
  rawPayload: string;
}

/**
 * Pure UPI URI parser supporting upi://pay standards.
 */
export function parseUpiUri(rawPayload: string): ParsedUpiData {
  const payload = String(rawPayload || '').trim();

  if (payload.toLowerCase().startsWith('upi://pay')) {
    try {
      const url = new URL(payload.replace(/&amp;/g, '&'));
      const params = url.searchParams;

      const pa = params.get('pa') || '';
      const pn = params.get('pn') || '';
      const am = params.get('am') || '0';
      const tn = params.get('tn') || '';
      const mc = params.get('mc') || '';
      const tr = params.get('tr') || '';

      return {
        vpa: normalizeVpa(pa),
        amount: sanitizeAmount(am),
        note: tn || undefined,
        payeeName: pn || undefined,
        merchantCode: mc || undefined,
        transactionRef: tr || undefined,
        isUpi: true,
        rawPayload: payload
      };
    } catch {
      // Fallback regex parameter extraction
      const paMatch = payload.match(/[?&]pa=([^&]+)/i);
      const amMatch = payload.match(/[?&]am=([^&]+)/i);
      const tnMatch = payload.match(/[?&]tn=([^&]+)/i);
      const pnMatch = payload.match(/[?&]pn=([^&]+)/i);

      return {
        vpa: normalizeVpa(paMatch ? decodeURIComponent(paMatch[1]) : ''),
        amount: sanitizeAmount(amMatch ? decodeURIComponent(amMatch[1]) : 0),
        note: tnMatch ? decodeURIComponent(tnMatch[1]) : undefined,
        payeeName: pnMatch ? decodeURIComponent(pnMatch[1]) : undefined,
        isUpi: true,
        rawPayload: payload
      };
    }
  }

  // Handle plain VPA strings
  const vpaMatch = payload.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}/);
  if (vpaMatch) {
    return {
      vpa: normalizeVpa(vpaMatch[0]),
      amount: 0,
      isUpi: false,
      rawPayload: payload
    };
  }

  return {
    vpa: 'unknown@upi',
    amount: 0,
    isUpi: false,
    rawPayload: payload
  };
}
