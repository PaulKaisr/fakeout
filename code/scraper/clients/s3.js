import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

/**
 * R2 Storage Client using S3-compatible API
 */
export class R2StorageClient {
  constructor(config) {
    const { endpoint, accessKeyId, secretAccessKey } = config;

    this.client = new S3Client({
      region: "auto",
      endpoint: endpoint || process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: accessKeyId || process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: secretAccessKey || process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Upload a file to R2 bucket
   * @param {Object} params - Upload parameters
   * @param {string} params.bucketName - Name of the R2 bucket
   * @param {string} params.key - Object key (path) in the bucket
   * @param {Buffer|string|ReadableStream} params.body - File content to upload
   * @param {string} [params.contentType] - MIME type of the file
   * @returns {Promise<Object>} Upload result
   */
  async putObject({ bucketName, key, body, contentType }) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    try {
      const response = await this.client.send(command);
      return {
        success: true,
        etag: response.ETag,
        versionId: response.VersionId,
        key: key,
      };
    } catch (error) {
      console.error(`Failed to upload object to ${bucketName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Upload a file from the filesystem to R2 bucket
   * @param {Object} params - Upload parameters
   * @param {string} params.bucketName - Name of the R2 bucket
   * @param {string} params.key - Object key (path) in the bucket
   * @param {string} params.filePath - Local file path to upload
   * @param {string} [params.contentType] - MIME type of the file (auto-detected if not provided)
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile({ bucketName, key, filePath, contentType }) {
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

// Backward compatibility: export legacy functions
const defaultClient = new R2StorageClient({});
export async function putObject(params) {
  return defaultClient.putObject(params);
}
export async function uploadFile(params) {
  return defaultClient.uploadFile(params);
}
