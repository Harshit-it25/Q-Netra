/**
 * Pure domain rules for payment validation and normalization.
 * Zero UI or React dependencies.
 */

export function normalizeVpa(rawVpa: string): string {
  if (!rawVpa || typeof rawVpa !== 'string') {
    return 'unknown@upi';
  }
  return rawVpa.trim().toLowerCase().slice(0, 256);
}

export function sanitizeAmount(rawAmount: any): number {
  const num = Number(rawAmount);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    return 0;
  }
  if (num > 100000000) {
    return 100000000;
  }
  return Math.round(num * 100) / 100;
}

export function isValidVpaFormat(vpa: string): boolean {
  if (!vpa || typeof vpa !== 'string') return false;
  // Standard UPI VPA format: alphanumeric/dots/dashes/underscores @ bank/psp handle
  const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
  return vpaRegex.test(vpa.trim());
}
