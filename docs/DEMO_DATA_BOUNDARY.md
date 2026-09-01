# Q-NETRA AI — Demo Data & Research Boundary

This document defines the strict segregation between seeded presentation fixtures, production services, and the scientific research evaluation suite.

---

## 1. Demo Data Isolation (`src/data/demo/` & `server/data/demo/`)

All mock and presentation fixtures are isolated into dedicated demo folders:
- `src/data/demo/goldenCases.ts`: The 3 canonical presentation checks (Case C: STOP, Case B: VERIFY, Case A: PROCEED).
- `src/data/demo/demoGraphs.ts`: The 7-node syndicate topology SVG demo graph.
- `src/data/demo/demoSmsInbox.ts`: Simulated SMS inbox for browser demonstration.
- `server/data/demo/seededEntities.ts`: Seeded dictionary of known test entities (e.g. `abc123@upi`, `swiggy@icici`).

**Rule:** Demo fixtures are explicitly marked as `SEEDED DEMO DATA` across UI headers and forensic badges.

---

## 2. Research Data Isolation (`research/`)

- The research datasets (`research/datasets/external/` and `research/datasets/synthetic/`) are **strictly excluded** from frontend and backend production builds.
- No production React code or Express controllers import from `research/`.
- Research metrics and confidence scores are computed by standalone evaluation scripts (`research/scripts/`) and never hardcoded into runtime decision engines.
