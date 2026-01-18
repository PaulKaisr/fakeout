/**
 * R2 Configuration Composable
 *
 * Manages R2 configuration with runtime updates for testing
 */

import { readonly, ref } from "vue";
import type { R2Config } from "@/types/r2.types";
import { createR2Config } from "@/config/r2.config";

/**
 * Composable for managing R2 configuration
 * Allows runtime configuration updates for testing
 *
 * @returns Configuration management interface
 */
export function useR2Config() {
  const config = ref<R2Config>(createR2Config());

  /**
   * Update configuration (useful for testing)
   *
   * @param overrides - Partial configuration to merge with defaults
   */
  function updateConfig(overrides: Partial<R2Config>): void {
    config.value = createR2Config(overrides);
  }

  /**
   * Reset to default configuration from environment variables
   */
  function resetConfig(): void {
    config.value = createR2Config();
  }

  return {
    config: readonly(config),
    updateConfig,
    resetConfig,
  };
}
