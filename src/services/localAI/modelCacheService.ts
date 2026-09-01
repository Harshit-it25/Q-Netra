/**
 * Q-NETRA AI — On-Device MobileBERT Model Cache Manager
 * Uses browser/WebView CacheStorage & IndexedDB to ensure zero-network,
 * high-speed offline access on physical Android/Snapdragon devices.
 */

export interface ModelCacheStatus {
  isCached: boolean;
  modelName: string;
  byteLength: number;
  lastLoadedMs: number;
  storageProvider: 'CacheStorage' | 'IndexedDB' | 'Memory' | 'Fallback';
}

const CACHE_NAME = 'qnetra-model-cache-v1';
const MODEL_URL = '/models/mobilebert_context_int8.onnx';
const MODEL_KEY = 'mobilebert_context_int8';

export class ModelCacheService {
  private static instance: ModelCacheService;
  private cachedBuffer: ArrayBuffer | null = null;
  private status: ModelCacheStatus = {
    isCached: false,
    modelName: 'MobileBERT INT8',
    byteLength: 10708236, // 10.21 MB
    lastLoadedMs: 0,
    storageProvider: 'CacheStorage'
  };

  public static getInstance(): ModelCacheService {
    if (!ModelCacheService.instance) {
      ModelCacheService.instance = new ModelCacheService();
    }
    return ModelCacheService.instance;
  }

  /**
   * Checks whether the MobileBERT model is already cached locally.
   */
  async isModelCached(): Promise<boolean> {
    if (this.cachedBuffer !== null) {
      return true;
    }

    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(MODEL_URL);
        if (match) {
          this.status.isCached = true;
          return true;
        }
      } catch (err) {
        console.warn('[ModelCache] CacheStorage match check failed:', err);
      }
    }

    return false;
  }

  /**
   * Retrieves the model buffer from memory or local cache, or fetches from asset bundle.
   */
  async loadModel(): Promise<{ success: boolean; buffer?: ArrayBuffer; latencyMs: number; fromCache: boolean }> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // 1. Fast path: Memory Cache
    if (this.cachedBuffer) {
      const latencyMs = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0));
      return { success: true, buffer: this.cachedBuffer, latencyMs, fromCache: true };
    }

    // 2. CacheStorage path
    if (typeof caches !== 'undefined') {
      try {
        const cache = await caches.open(CACHE_NAME);
        let response = await cache.match(MODEL_URL);
        let fromCache = true;

        if (!response) {
          fromCache = false;
          // Fetch from static asset bundle
          const fetchRes = await fetch(MODEL_URL);
          if (fetchRes.ok) {
            await cache.put(MODEL_URL, fetchRes.clone());
            response = fetchRes;
          }
        }

        if (response && response.ok) {
          const buf = await response.arrayBuffer();
          this.cachedBuffer = buf;
          this.status.isCached = true;
          this.status.byteLength = buf.byteLength;
          this.status.storageProvider = fromCache ? 'CacheStorage' : 'Memory';
          const latencyMs = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0));
          this.status.lastLoadedMs = latencyMs;
          return { success: true, buffer: buf, latencyMs, fromCache };
        }
      } catch (err) {
        console.warn('[ModelCache] CacheStorage fetch/store failed, falling back:', err);
      }
    }

    // 3. Environment-aware direct loader
    try {
      if (typeof window === 'undefined' && typeof process !== 'undefined') {
        // Node / Testbed environment: read directly from public/models
        const nodeFs = await import('fs');
        const nodePath = await import('path');
        const filePath = nodePath.resolve('public/models/mobilebert_context_int8.onnx');
        if (nodeFs.existsSync(filePath)) {
          const fileBuf = nodeFs.readFileSync(filePath);
          const buf = fileBuf.buffer.slice(fileBuf.byteOffset, fileBuf.byteOffset + fileBuf.byteLength);
          this.cachedBuffer = buf;
          this.status.isCached = true;
          this.status.byteLength = buf.byteLength;
          this.status.storageProvider = 'Memory';
          const latencyMs = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0));
          this.status.lastLoadedMs = latencyMs;
          return { success: true, buffer: buf, latencyMs, fromCache: true };
        }
      } else if (typeof fetch !== 'undefined') {
        const directRes = await fetch(MODEL_URL);
        if (directRes.ok) {
          const buf = await directRes.arrayBuffer();
          this.cachedBuffer = buf;
          this.status.isCached = true;
          this.status.byteLength = buf.byteLength;
          this.status.storageProvider = 'Memory';
          const latencyMs = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0));
          this.status.lastLoadedMs = latencyMs;
          return { success: true, buffer: buf, latencyMs, fromCache: false };
        }
      }
    } catch {
      // Graceful fallback without crashing
    }

    // 4. Return fallback flag
    const latencyMs = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0));
    return {
      success: false,
      latencyMs,
      fromCache: false
    };
  }

  /**
   * Returns current caching and storage status.
   */
  getStatus(): ModelCacheStatus {
    return { ...this.status };
  }

  /**
   * Clears local cache for benchmarking fresh cold starts.
   */
  async clearCache(): Promise<void> {
    this.cachedBuffer = null;
    this.status.isCached = false;
    if (typeof caches !== 'undefined') {
      try {
        await caches.delete(CACHE_NAME);
      } catch {}
    }
  }
}

export const modelCacheService = ModelCacheService.getInstance();
