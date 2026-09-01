import { RecipientIdentity } from '../../src/domain/identity/types';
import { SEEDED_KNOWN_ENTITIES } from '../data/demo/seededEntities';

export class EntityRepository {
  /**
   * Looks up an entity by normalized VPA handle in the repository.
   */
  findByVpa(vpa: string): RecipientIdentity | null {
    const normalized = String(vpa || '').trim().toLowerCase();
    return SEEDED_KNOWN_ENTITIES[normalized] || null;
  }

  /**
   * Returns all known entities for directory listing.
   */
  getAll(): RecipientIdentity[] {
    return Object.values(SEEDED_KNOWN_ENTITIES);
  }
}

export const entityRepository = new EntityRepository();
