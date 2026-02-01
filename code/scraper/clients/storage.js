import { R2StorageClient } from "./s3.js";
import { SupabaseStorageClient } from "./supabase-storage.js";

/**
 * Factory function to create storage client based on provider
 * @param {string} provider - Storage provider: "r2" or "supabase"
 * @param {Object} config - Provider-specific configuration
 * @param {string} [config.endpoint] - R2 endpoint (for R2 provider)
 * @param {string} [config.accessKeyId] - R2 access key ID (for R2 provider)
 * @param {string} [config.secretAccessKey] - R2 secret access key (for R2 provider)
 * @param {string} [config.url] - Supabase project URL (for Supabase provider)
 * @param {string} [config.serviceRoleKey] - Supabase service role key (for Supabase provider)
 * @returns {R2StorageClient|SupabaseStorageClient}
 */
export function createStorageClient(provider, config) {
  if (provider === "supabase") {
    console.log("Initializing Supabase Storage client");
    return new SupabaseStorageClient(config);
  } else {
    console.log("Initializing R2 Storage client");
    return new R2StorageClient(config);
  }
}
