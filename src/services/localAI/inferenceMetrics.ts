/**
 * Q-NETRA Local AI Inference Metrics & Telemetry
 * Provides rigorous, un-manipulated timing, memory, and backend telemetry.
 */

export interface LatencyBreakdown {
  tokenizationMs: number;
  inferenceMs: number;
  postProcessingMs: number;
  totalMs: number;
}

export interface BenchmarkReport {
  runs: number;
  coldStartMs: number;
  warmLatencies: number[];
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
  avgMs: number;
  executionBackend: 'CPU' | 'GPU' | 'NPU (QNN)' | 'V8_JIT' | 'LOCAL';
  deviceInfo: {
    platform: string;
    isSnapdragon: boolean;
    runtime: string;
  };
}

export function computePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    Math.floor((percentile / 100) * sorted.length),
    sorted.length - 1
  );
  return Number(sorted[index].toFixed(2));
}

export function benchmarkInferenceRun(
  fn: () => any,
  runs: number = 30,
  deviceInfo: { platform: string; isSnapdragon: boolean; runtime: string } = {
    platform: 'Standard CPU',
    isSnapdragon: false,
    runtime: 'On-device V8/JIT'
  }
): BenchmarkReport {
  // Cold start run
  const coldStartStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  fn();
  const coldStartEnd = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const coldStartMs = Number((coldStartEnd - coldStartStart).toFixed(2));

  // Warm runs
  const warmLatencies: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    fn();
    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    warmLatencies.push(Number((t1 - t0).toFixed(2)));
  }

  const p50 = computePercentile(warmLatencies, 50);
  const p95 = computePercentile(warmLatencies, 95);
  const p99 = computePercentile(warmLatencies, 99);
  const max = Math.max(...warmLatencies);
  const avg = Number((warmLatencies.reduce((a, b) => a + b, 0) / warmLatencies.length).toFixed(2));

  return {
    runs,
    coldStartMs,
    warmLatencies,
    p50Ms: p50,
    p95Ms: p95,
    p99Ms: p99,
    maxMs: max,
    avgMs: avg,
    executionBackend: deviceInfo.isSnapdragon ? 'CPU' : 'LOCAL',
    deviceInfo
  };
}
