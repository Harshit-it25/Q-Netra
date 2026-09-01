import { NetworkNode, NetworkLink } from '../../src/domain/network/types';
import { SEEDED_HIGH_RISK_GRAPH } from '../data/demo/seededEntities';

export class GraphRepository {
  /**
   * Retrieves the default high-risk graph template.
   */
  getDefaultHighRiskGraph(): { nodes: NetworkNode[]; links: NetworkLink[] } {
    return {
      nodes: SEEDED_HIGH_RISK_GRAPH.nodes.map((n) => ({ ...n })),
      links: SEEDED_HIGH_RISK_GRAPH.links.map((l) => ({ ...l }))
    };
  }
}

export const graphRepository = new GraphRepository();
