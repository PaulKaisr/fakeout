/**
 * R2 Type Definitions
 *
 * TypeScript interfaces for R2 storage structure and metadata
 */

/**
 * Pexels image metadata from scraper
 * Based on code/scraper/index.js metadata structure
 */
export interface PexelsImageMetadata {
  id: string
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  liked: boolean
  alt: string
}

/**
 * Extended metadata with AI description from describe-and-generate
 * Includes ai_description and ai_description_timestamp added by the Lambda
 */
export interface R2ImageMetadata extends PexelsImageMetadata {
  ai_description?: string
  ai_description_timestamp?: string
}

/**
 * Generated image metadata from DALL-E 3
 * Based on code/describe-and-generate/main.py generated metadata structure
 */
export interface R2GeneratedImageMetadata {
  original_image_id: string
  original_image_key: string
  generation_prompt: string
  revised_prompt: string
  generated_at: string
  model: string
}

/**
 * Image resource from R2
 * Unified representation of both real and AI-generated images
 */
export interface R2Image {
  key: string
  url: string
  metadata?: R2ImageMetadata | R2GeneratedImageMetadata
  type: 'pexels_raw' | 'openai_generated'
}

/**
 * R2 configuration for parameterized testing
 */
export interface R2Config {
  baseUrl: string
  bucketName: string
  cdnCacheTtl?: number
}

/**
 * Options for querying images from R2
 */
export interface R2ImageQueryOptions {
  datePrefix: string
  type?: 'pexels_raw' | 'openai_generated' | 'both'
  limit?: number
  includeMetadata?: boolean
}

/**
 * Type guard to check if metadata is from a Pexels image
 */
export function isPexelsImageMetadata(
  metadata: R2ImageMetadata | R2GeneratedImageMetadata
): metadata is R2ImageMetadata {
  return 'photographer' in metadata
}

/**
 * Type guard to check if metadata is from a generated image
 */
export function isGeneratedImageMetadata(
  metadata: R2ImageMetadata | R2GeneratedImageMetadata
): metadata is R2GeneratedImageMetadata {
  return 'original_image_id' in metadata && 'generation_prompt' in metadata
}
