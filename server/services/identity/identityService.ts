import { RecipientIdentity } from '../../../src/domain/identity/types';
import { entityRepository } from '../../repositories/entityRepository';

export class IdentityService {
  /**
   * Resolves recipient identity from database, or generates unverified profile for unknown handles.
   */
  resolveIdentity(rawVpa: string): RecipientIdentity {
    const vpa = String(rawVpa || '').trim().toLowerCase();
    const known = entityRepository.findByVpa(vpa);

    if (known) {
      return known;
    }

    // Default profile for unknown VPAs
    const isMaskedOrSuspicious = vpa.startsWith('abc') || vpa.includes('refund') || vpa.includes('lottery') || vpa.includes('disconnection');

    return {
      vpa,
      name: isMaskedOrSuspicious ? 'Unverified / Masked Handle' : 'Individual Account',
      category: isMaskedOrSuspicious ? 'suspicious' : 'individual',
      kycStatus: 'unverified',
      accountAgeDays: 14,
      baseRiskScore: isMaskedOrSuspicious ? 88 : 25,
      reportCount1930: 0,
      isKnownMule: isMaskedOrSuspicious,
      deviceFingerprint: 'UNKNOWN_DEVICE',
      ipLocation: 'India (Standard IP)',
      avgDailyVolume: 5000
    };
  }
}

export const identityService = new IdentityService();
