import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Storage Client
 */
export class SupabaseStorageClient {
  constructor(config) {
    const { url, serviceRoleKey } = config;

    if (!url || !serviceRoleKey) {
      throw new Error(
        "SupabaseStorageClient requires url and serviceRoleKey in config"
      );
    }

    this.supabase = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Upload a file to Supabase Storage bucket
   * @param {Object} params - Upload parameters
   * @param {string} params.bucketName - Name of the Supabase bucket
   * @param {string} params.key - Object key (path) in the bucket
   * @param {Buffer|string|Blob} params.body - File content to upload
   * @param {string} [params.contentType] - MIME type of the file
   * @returns {Promise<Object>} Upload result
   */
  async putObject({ bucketName, key, body, contentType }) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(key, body, {
          contentType: contentType || "application/octet-stream",
          upsert: true, // Allow overwriting existing files
          cacheControl: "3600", // 1 hour cache
        });

      if (error) {
        console.error(
          `Failed to upload object to ${bucketName}/${key}:`,
          error
        );
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(bucketName).getPublicUrl(key);

      return {
        success: true,
        key: data.path,
        url: publicUrl,
        etag: data.id || null, // Supabase doesn't return ETag directly
      };
    } catch (error) {
      console.error(`Failed to upload object to ${bucketName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Upload a file from the filesystem to Supabase Storage bucket
   * Note: This method is included for API compatibility but not typically used in Lambda
   * @param {Object} params - Upload parameters
   * @param {string} params.bucketName - Name of the Supabase bucket
   * @param {string} params.key - Object key (path) in the bucket
   * @param {string} params.filePath - Local file path to upload
   * @param {string} [params.contentType] - MIME type of the file
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile({ bucketName, key, filePath, contentType }) {
    const fs = await import("fs");
    const fileContent = fs.readFileSync(filePath);

    if (!contentType) {
      const ext = filePath.split(".").pop().toLowerCase();
      const mimeTypes = {
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        webm: "video/webm",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        json: "application/json",
        txt: "text/plain",
      };
      contentType = mimeTypes[ext] || "application/octet-stream";
    }

    return this.putObject({
      bucketName,
      key,
      body: fileContent,
      contentType,
    });
  }
}
