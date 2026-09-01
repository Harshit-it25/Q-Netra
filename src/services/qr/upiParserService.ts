import { normalizeVpa, sanitizeAmount } from '../../domain/payment/paymentRules';

export interface ParsedUpiData {
  vpa: string;
  amount: number;
  note?: string;
  payeeName?: string;
  merchantCode?: string;
  transactionRef?: string;
  isUpi: boolean;
  isMerchant?: boolean;
  bankName?: string;
  rawPayload: string;
}

export const RECOGNIZED_BANK_HANDLES: Record<string, string> = {
  kotakbank: 'Kotak Mahindra Bank',
  kotak: 'Kotak Mahindra Bank',
  kmbl: 'Kotak Mahindra Bank',
  okhdfcbank: 'HDFC Bank (Google Pay)',
  hdfcbank: 'HDFC Bank',
  hdfcbankupi: 'HDFC Bank',
  okicici: 'ICICI Bank (Google Pay)',
  icici: 'ICICI Bank',
  eazypay: 'ICICI Bank Merchant',
  oksbi: 'State Bank of India (Google Pay)',
  sbi: 'State Bank of India',
  sbipay: 'State Bank of India',
  okaxis: 'Axis Bank (Google Pay)',
  axisbank: 'Axis Bank',
  axis: 'Axis Bank',
  paytm: 'Paytm Payments Bank',
  pthdfc: 'Paytm / HDFC Bank',
  ptaxis: 'Paytm / Axis Bank',
  ptsbi: 'Paytm / State Bank of India',
  ptyes: 'Paytm / Yes Bank',
  ybl: 'PhonePe (Yes Bank)',
  ibl: 'PhonePe (ICICI Bank)',
  axl: 'PhonePe (Axis Bank)',
  apl: 'Amazon Pay (Axis Bank)',
  rapl: 'Amazon Pay (RBL Bank)',
  barodampay: 'Bank of Baroda',
  bob: 'Bank of Baroda',
  pnb: 'Punjab National Bank',
  punb: 'Punjab National Bank',
  cnrb: 'Canara Bank',
  canarabank: 'Canara Bank',
  indus: 'IndusInd Bank',
  unionbank: 'Union Bank of India',
  uboi: 'Union Bank of India',
  idbi: 'IDBI Bank',
  idbibank: 'IDBI Bank',
  federal: 'Federal Bank',
  idfcbank: 'IDFC FIRST Bank',
  postbank: 'India Post Payments Bank (IPPB)',
  ippb: 'India Post Payments Bank',
  yesbank: 'Yes Bank',
  freecharge: 'Freecharge / Axis Bank',
  airtel: 'Airtel Payments Bank',
  airtelbank: 'Airtel Payments Bank',
  jupiteraxis: 'Jupiter (Axis Bank)',
  fi: 'Fi Money (Federal Bank)',
  timecosmos: 'Cosmos Bank',
  aubank: 'AU Small Finance Bank',
  equitas: 'Equitas Small Finance Bank',
  ujsfb: 'Ujjivan Small Finance Bank'
};

/**
 * Extracts bank name from VPA handle suffix (e.g. 8767717432@kotakbank -> Kotak Mahindra Bank).
 */
export function identifyBankFromVpa(vpa: string): string | null {
  const normalized = String(vpa || '').trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');
  if (atIndex === -1) return null;
  const suffix = normalized.slice(atIndex + 1);
  return RECOGNIZED_BANK_HANDLES[suffix] || null;
}

/**
 * Helper to parse EMVCo / BharatQR Tag-Length-Value (TLV) strings.
 */
function parseEmvCoQr(payload: string): Partial<ParsedUpiData> | null {
  if (!/^000201/i.test(payload)) return null;

  const result: Partial<ParsedUpiData> = {};
  let i = 0;
  while (i < payload.length - 4) {
    const tag = payload.substring(i, i + 2);
    const len = parseInt(payload.substring(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > payload.length) break;
    const value = payload.substring(i + 4, i + 4 + len);
    i += 4 + len;

    if (tag === '59') {
      result.payeeName = value.trim();
    } else if (tag === '54') {
      result.amount = sanitizeAmount(value);
    } else if (tag === '52') {
      result.merchantCode = value.trim();
    } else if (tag === '26' || tag === '27' || tag === '28') {
      // Sub-tag lookup for UPI VPA
      const vpaMatch = value.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}/);
      if (vpaMatch) {
        result.vpa = normalizeVpa(vpaMatch[0]);
      }
    }
  }

  return result.vpa ? result : null;
}

/**
 * Pure UPI URI parser supporting standard upi://pay, BharatQR EMVCo, and intent links.
 */
export function parseUpiUri(rawPayload: string): ParsedUpiData {
  let payload = String(rawPayload || '').trim();

  // Try decoding if percent-encoded
  if (payload.includes('%3A%2F%2F') || payload.includes('%3Fpa%3D') || payload.includes('%40')) {
    try {
      payload = decodeURIComponent(payload);
    } catch {}
  }

  // Check for EMVCo BharatQR (Paytm/PhonePe/BharatPe/GPay merchant stands)
  if (payload.startsWith('000201')) {
    const emv = parseEmvCoQr(payload);
    if (emv && emv.vpa) {
      const bank = identifyBankFromVpa(emv.vpa);
      return {
        vpa: emv.vpa,
        amount: emv.amount || 0,
        note: emv.note,
        payeeName: emv.payeeName,
        merchantCode: emv.merchantCode || '5411',
        isUpi: true,
        isMerchant: true,
        bankName: bank || undefined,
        rawPayload: payload
      };
    }
  }

  // Check standard upi://pay or app intent URLs (e.g. gpay://, phonepe://, paytmmp://, or https://...pa=...)
  const isUpiScheme = /^(upi|gpay|phonepe|paytmmp|bhim|cred|mobikwik):\/\/(upi\/)?pay/i.test(payload) ||
                      (/^[a-z]+:\/\//i.test(payload) && payload.toLowerCase().includes('pa='));

  if (isUpiScheme) {
    try {
      // Standardize scheme to standard URL format for searchParams extraction
      const normalizedUrl = payload.replace(/^[a-z]+:\/\/(upi\/)?pay\?/i, 'http://dummy.com/?').replace(/&amp;/g, '&');
      const url = new URL(normalizedUrl);
      const params = url.searchParams;

      const pa = params.get('pa') || '';
      const pn = params.get('pn') || '';
      const am = params.get('am') || '0';
      const tn = params.get('tn') || '';
      const mc = params.get('mc') || '';
      const tr = params.get('tr') || '';

      const normalizedVpa = normalizeVpa(pa);
      const bank = identifyBankFromVpa(normalizedVpa);
      const isMerchant = Boolean(mc || /store|retail|mart|shop|hotel|restaurant|kirana|services|traders|enterprise|pvt|ltd/i.test(pn));

      return {
        vpa: normalizedVpa,
        amount: sanitizeAmount(am),
        note: tn || undefined,
        payeeName: pn || undefined,
        merchantCode: mc || undefined,
        transactionRef: tr || undefined,
        isUpi: true,
        isMerchant,
        bankName: bank || undefined,
        rawPayload: payload
      };
    } catch {
      // Fallback regex parameter extraction
      const paMatch = payload.match(/[?&]pa=([^&]+)/i);
      const amMatch = payload.match(/[?&]am=([^&]+)/i);
      const tnMatch = payload.match(/[?&]tn=([^&]+)/i);
      const pnMatch = payload.match(/[?&]pn=([^&]+)/i);
      const mcMatch = payload.match(/[?&]mc=([^&]+)/i);

      const vpa = normalizeVpa(paMatch ? decodeURIComponent(paMatch[1]) : '');
      const bank = identifyBankFromVpa(vpa);
      const payee = pnMatch ? decodeURIComponent(pnMatch[1]) : undefined;
      const mc = mcMatch ? decodeURIComponent(mcMatch[1]) : undefined;

      return {
        vpa,
        amount: sanitizeAmount(amMatch ? decodeURIComponent(amMatch[1]) : 0),
        note: tnMatch ? decodeURIComponent(tnMatch[1]) : undefined,
        payeeName: payee,
        merchantCode: mc,
        isUpi: true,
        isMerchant: Boolean(mc || (payee && /store|retail|mart|shop|kirana|traders/i.test(payee))),
        bankName: bank || undefined,
        rawPayload: payload
      };
    }
  }

  // Handle plain VPA strings (e.g. 8767717432@kotakbank)
  const vpaMatch = payload.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}/);
  if (vpaMatch) {
    const vpa = normalizeVpa(vpaMatch[0]);
    const bank = identifyBankFromVpa(vpa);
    return {
      vpa,
      amount: 0,
      isUpi: true,
      bankName: bank || undefined,
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
