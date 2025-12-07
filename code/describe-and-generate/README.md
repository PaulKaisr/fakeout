# Describe and Generate Lambda

Python Lambda function that analyzes images stored in Cloudflare R2, adds AI-generated descriptions to their metadata using OpenAI's Vision API, and generates new images using DALL-E 3.

## Overview

This Lambda function supports three operational modes:

### DESCRIBE Mode
1. Lists all images in a specified date prefix (e.g., `2025-12-07/pexel_images_raw/`)
2. Downloads each image and its associated metadata JSON file
3. Analyzes the image using OpenAI's Vision API (GPT-4o-mini) to generate a detailed description
4. Updates the metadata JSON with the description and timestamp
5. Uploads the updated metadata back to R2

### GENERATE Mode
1. Lists all images that already have AI descriptions
2. Uses the existing AI descriptions as prompts for DALL-E 3
3. Generates new images based on the descriptions
4. Uploads generated images to `{date}/openai_generated_images/{image_id}`
5. Creates metadata files for generated images with generation details

### DESCRIBE_AND_GENERATE Mode (Default)
Performs both DESCRIBE and GENERATE operations in sequence for each image

## Project Structure

```
describe-and-generate/
├── main.py                    # Lambda handler and main logic
├── clients/
│   ├── r2.py                  # Cloudflare R2 client wrapper
│   └── openai_vision.py       # OpenAI Vision API client
├── pyproject.toml             # Python project configuration and dependencies
├── .env.example               # Environment variables template
├── build-lambda.sh            # Lambda deployment package builder
└── README.md                  # This file
```

## Setup

### 1. Install Dependencies

This project uses `uv` for dependency management:

```bash
uv sync
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `R2_ENDPOINT`: Cloudflare R2 endpoint URL
- `R2_ACCESS_KEY_ID`: R2 access key ID
- `R2_SECRET_ACCESS_KEY`: R2 secret access key
- `OPENAI_API_KEY`: OpenAI API key

### 3. Local Testing

The project includes a comprehensive test script with multiple test modes:

```bash
# Run default test (DESCRIBE mode, 2 images)
uv run python test_local.py

# Test DESCRIBE mode only
uv run python test_local.py describe

# Test GENERATE mode only (requires existing descriptions)
uv run python test_local.py generate

# Test DESCRIBE_AND_GENERATE mode (both operations, 1 image - can be expensive!)
uv run python test_local.py both

# Test with all images in the bucket
uv run python test_local.py full
```

All tests use today's date and the `fakeout-videos-dev` bucket by default. The `n` parameter is set to limit API costs during testing.

## Lambda Deployment

### 1. Build the Deployment Package

The build script uses `uv` to export dependencies and create the Lambda package:

```bash
./build-lambda.sh
```

This creates `lambda.zip` with all dependencies.

### 2. Deploy with Terraform

The Lambda function is provisioned as part of the main Terraform configuration:

```bash
cd ../terraform
terraform apply
```

The Terraform configuration will:
- Create an IAM role with R2 access permissions
- Deploy the Lambda function with the necessary environment variables
- Configure the function with 512MB memory and 300s timeout

### 3. Update the OpenAI API Key

Add the following to your `terraform.tfvars`:

```hcl
openai_api_key = "your-openai-api-key"
```

## Usage

### Lambda Invocation

Invoke the Lambda function with an event:

```json
{
  "bucketName": "fakeout-videos-dev",
  "datePrefix": "2025-12-07",
  "mode": "DESCRIBE_AND_GENERATE"
}
```

Parameters:
- `bucketName` (optional): R2 bucket name. Defaults to `fakeout-videos-dev`
- `datePrefix` (optional): Date prefix for filtering images. Defaults to today's date in `YYYY-MM-DD` format
- `mode` (optional): Operation mode. Defaults to `DESCRIBE_AND_GENERATE`
  - `DESCRIBE`: Only analyze images and add descriptions to metadata
  - `GENERATE`: Only generate new images using existing descriptions
  - `DESCRIBE_AND_GENERATE`: Do both operations
- `n` (optional): Limit the number of images to process. If not specified, processes all images

**Examples:**

Only describe images:
```json
{
  "mode": "DESCRIBE",
  "datePrefix": "2025-12-07"
}
```

Only generate images (requires existing descriptions):
```json
{
  "mode": "GENERATE",
  "datePrefix": "2025-12-07"
}
```

Describe and generate in one run:
```json
{
  "mode": "DESCRIBE_AND_GENERATE",
  "datePrefix": "2025-12-07"
}
```

Process only the first 5 images:
```json
{
  "mode": "DESCRIBE_AND_GENERATE",
  "datePrefix": "2025-12-07",
  "n": 5
}
```

### Response Format

Success response (all images processed successfully):

```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "message": "Successfully processed images in DESCRIBE_AND_GENERATE mode",
    "data": {
      "bucket_name": "fakeout-videos-dev",
      "date_prefix": "2025-12-07",
      "mode": "DESCRIBE_AND_GENERATE",
      "total": 10,
      "success": 8,
      "skipped": 2,
      "results": [
        {
          "image_number": "001",
          "image_id": 12345,
          "status": "success",
          "meta_key": "2025-12-07/pexel_images_raw/001_meta.json",
          "description": "A stunning mountain landscape...",
          "generated_image_key": "2025-12-07/openai_generated_images/12345",
          "generated_meta_key": "2025-12-07/openai_generated_images/12345_meta.json",
          "revised_prompt": "..."
        }
      ]
    }
  }
}
```

Error response (if any operation fails):

```json
{
  "statusCode": 500,
  "body": {
    "success": false,
    "message": "Failed to analyze images",
    "error": "Image description failed for 2025-12-07/pexel_images_raw/003_meta.json: ..."
  }
}
```

## File Structure

### Original Image Metadata
The function adds/updates the following fields in original metadata JSON files:

- `ai_description`: Detailed description generated by OpenAI Vision API
- `ai_description_timestamp`: ISO timestamp when the description was generated

Example updated metadata (`2025-12-07/pexel_images_raw/001_meta.json`):

```json
{
  "id": 12345,
  "width": 1920,
  "height": 1080,
  "photographer": "John Doe",
  "alt": "A beautiful landscape",
  "ai_description": "A stunning mountain landscape at sunset with vibrant orange and pink hues reflecting off snow-capped peaks. The foreground features a serene alpine lake with crystal clear waters.",
  "ai_description_timestamp": "2025-12-07T12:34:56.789123"
}
```

### Generated Images
Generated images are stored in: `{date}/openai_generated_images/{original_image_id}`

Generated image metadata (`2025-12-07/openai_generated_images/12345_meta.json`):

```json
{
  "original_image_id": 12345,
  "original_image_key": "2025-12-07/pexel_images_raw/001",
  "generation_prompt": "A stunning mountain landscape at sunset...",
  "revised_prompt": "A breathtaking mountain landscape photograph featuring...",
  "generated_at": "2025-12-07T13:00:00.000000",
  "model": "dall-e-3"
}
```

## Features

- **Three Operation Modes**: DESCRIBE (analyze only), GENERATE (create images only), or DESCRIBE_AND_GENERATE (both)
- **Idempotent**: Skips images that already have descriptions (in DESCRIBE mode)
- **Fail Fast**: If any operation fails, the entire Lambda execution is interrupted and returns an error
- **DALL-E 3 Integration**: Generates high-quality images using the latest DALL-E model
- **Organized Storage**: Generated images stored in structured folders by date and original image ID
- **Detailed Logging**: Comprehensive logging for debugging
- **Cost Efficient**: Uses `gpt-4o-mini` for vision analysis and standard quality for DALL-E 3

## Dependencies

Dependencies are managed via `pyproject.toml`:

- `boto3>=1.34.0`: AWS SDK for Python (S3/R2 access)
- `openai>=1.54.0`: OpenAI Python client library (Vision API + DALL-E 3)
- `python-dotenv>=1.0.0`: Environment variable management
- `requests>=2.31.0`: HTTP library for downloading generated images
