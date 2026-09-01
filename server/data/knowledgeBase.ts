import { SEEDED_KNOWN_ENTITIES, SEEDED_HIGH_RISK_GRAPH } from './demo/seededEntities';

export const KNOWN_ENTITIES = SEEDED_KNOWN_ENTITIES;
export const DEFAULT_HIGH_RISK_GRAPH = SEEDED_HIGH_RISK_GRAPH;
export type EntityRecord = import('../../src/domain/identity/types').RecipientIdentity;
