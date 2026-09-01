/**
 * Link safety analyzer evaluating URLs for shortlink obfuscation,
 * phishing redirects, and suspicious APK downloads.
 */

export interface LinkSafetyResult {
  hasUrl: boolean;
  urlsFound: string[];
  isShortLink: boolean;
  isApkDownload: boolean;
  threatDescription?: string;
}

export function evaluateLinkSafety(text: string): LinkSafetyResult {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];

  const isShortLink = /bit\.ly|tinyurl|is\.gd|cutt\.ly|rb\.gy|wa\.me|t\.me/i.test(text);
  const isApkDownload = /\.apk|download.*app|install.*link/i.test(text);

  let threatDescription: string | undefined;
  if (isApkDownload) {
    threatDescription = 'Malicious APK payload detected. Legitimate entities never distribute APK links via SMS.';
  } else if (isShortLink) {
    threatDescription = 'Obfuscated shortened URL detected masking destination domain.';
  }

  return {
    hasUrl: urls.length > 0 || isShortLink || isApkDownload,
    urlsFound: urls,
    isShortLink,
    isApkDownload,
    threatDescription
  };
}
