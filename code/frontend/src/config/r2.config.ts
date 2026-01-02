/**
 * R2 Configuration Management
 *
 * Parameterized configuration for R2 access with environment variable support
 */

import type { R2Config } from "@/types/r2.types";

/**
 * Create R2 configuration with optional overrides
 *
 * Environment variables (set in Vercel or .env.local):
 * - VITE_R2_BASE_URL: Custom domain URL (e.g., https://media.yourdomain.com)
 * - VITE_R2_BUCKET_NAME: Bucket name (e.g., fakeout-videos-dev)
 *
 * @param overrides - Optional configuration overrides for testing
 * @returns R2 configuration object
 */
export function createR2Config(overrides?: Partial<R2Config>): R2Config {
  const defaultConfig: R2Config = {
    baseUrl: import.meta.env.VITE_R2_BASE_URL || "/files",
    bucketName: import.meta.env.VITE_R2_BUCKET_NAME || "fakeout-videos-dev",
    cdnCacheTtl: 3600, // 1 hour
  };

  return {
    ...defaultConfig,
    ...overrides,
  };
}

/**
 * Default R2 configuration instance
 * Uses environment variables for production deployment
 */
export const r2Config = createR2Config();
