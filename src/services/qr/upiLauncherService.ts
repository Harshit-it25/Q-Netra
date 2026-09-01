/**
 * UPI Launcher & Deep Link Service
 * Handles generating standard NPCI-compliant UPI URIs, launching payment apps,
 * and managing fallback clipboard/intent operations.
 */

export interface UpiPaymentDetails {
  recipient: string;
  amount: number;
  note?: string;
  merchantName?: string;
  transactionRef?: string;
}

export interface UpiAppOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  schemePrefix?: string;
  packageId?: string;
}

export const POPULAR_UPI_APPS: UpiAppOption[] = [
  {
    id: 'default',
    name: 'Default UPI App',
    icon: 'account_balance_wallet',
    color: '#abd600',
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    icon: 'payments',
    color: '#4285F4',
    packageId: 'com.google.android.apps.nbu.paisa.user',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: 'smartphone',
    color: '#5f259f',
    packageId: 'com.phonepe.app',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: 'account_balance',
    color: '#00b9f5',
    packageId: 'net.one97.paytm',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    icon: 'security',
    color: '#005a9c',
    packageId: 'in.org.npci.upiapp',
  },
  {
    id: 'cred',
    name: 'CRED Pay',
    icon: 'credit_card',
    color: '#ffffff',
    packageId: 'com.dreamplug.androidapp',
  }
];

/**
 * Builds standard NPCI upi://pay URI
 */
export function generateUpiPayUri(details: UpiPaymentDetails): string {
  const pa = details.recipient.trim();
  const pn = details.merchantName?.trim() || pa.split('@')[0] || 'Recipient';
  const am = details.amount > 0 ? Number(details.amount).toFixed(2) : '';
  const tn = details.note?.trim() || 'Payment via Q-NETRA';
  const tr = details.transactionRef?.trim() || `QN${Date.now()}`;

  const params = new URLSearchParams();
  params.set('pa', pa);
  params.set('pn', pn);
  if (am) {
    params.set('am', am);
  }
  params.set('cu', 'INR');
  params.set('tn', tn);
  params.set('tr', tr);

  return `upi://pay?${params.toString()}`;
}

/**
 * Copies text safely to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Navigator clipboard failed, attempting execCommand fallback:', err);
  }

  // Fallback for older browsers or restricted contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Launches the UPI payment on the device
 */
export function launchUpiPayment(details: UpiPaymentDetails): { success: boolean; uri: string } {
  const uri = generateUpiPayUri(details);
  try {
    // Attempt standard scheme launch
    window.location.href = uri;
    return { success: true, uri };
  } catch (err) {
    console.warn('Failed to launch UPI URI:', err);
    return { success: false, uri };
  }
}
