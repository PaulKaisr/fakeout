# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a media pipeline system that scrapes images/videos from Pexels, stores them in Cloudflare R2, uses OpenAI Vision API to generate descriptions, and creates new images using DALL-E 3. The system includes a Vue.js frontend for viewing content and is provisioned using Terraform. All components run as AWS Lambda functions.

## Architecture

The project consists of four main components:

### 1. Scraper (`code/scraper/`)
Node.js Lambda function that fetches media from Pexels API and uploads to Cloudflare R2
- `index.js`: Main Lambda handler supporting two modes:
  - `foto` mode (default): Fetches curated images
  - `video` mode: Fetches popular videos
- `clients/pexel.js`: Pexels API client wrapper
- `clients/s3.js`: S3/R2 client for uploads

**Storage pattern**: `{YYYY-MM-DD}/pexel_{images|videos}_raw/{number}` with corresponding `{number}_meta.json` metadata files

### 2. Describe-and-Generate (`code/describe-and-generate/`)
Python Lambda function that processes images with OpenAI Vision API and DALL-E 3
- `main.py`: Lambda handler with three operational modes:
  - `DESCRIBE`: Analyzes images with GPT-4o-mini, adds descriptions to metadata
  - `GENERATE`: Creates new images with DALL-E 3 using existing descriptions
  - `DESCRIBE_AND_GENERATE` (default): Performs both operations
- `clients/r2.py`: R2 client wrapper
- `clients/openai_vision.py`: OpenAI Vision API and DALL-E 3 client

**Storage pattern**: Generated images saved to `{YYYY-MM-DD}/openai_generated_images/{original_image_id}` with corresponding metadata

### 3. Frontend (`code/frontend/`)
Vue 3 + Vuetify application for displaying content
- Built with Vite, TypeScript, Vue Router
- Uses unplugin-vue-router for file-based routing
- Configured with ESLint using Vuetify config

### 4. Infrastructure (`code/terraform/`)
Terraform configuration for all AWS and Cloudflare resources
- Creates R2 bucket (`fakeout-videos-dev`)
- Provisions scraper and describe-and-generate Lambda functions with IAM roles
- Lambda functions configured with Node.js 20.x (scraper) and Python 3.13 (describe-and-generate)
- All functions: 512MB memory, 300s timeout

## Development Commands

### Scraper (Node.js)

Navigate to `code/scraper/`:

```bash
cd code/scraper
pnpm install              # Install dependencies
node scrape.js            # Run locally (requires .env)
pnpm run test:lambda      # Test Lambda handler locally
pnpm run build:lambda     # Build lambda.zip deployment package
```

Required `.env`:
```
PEXELS_API_KEY=your-key
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
```

**Important**: The build script uses npm (not pnpm) for Lambda package because pnpm's symlink structure doesn't work in zip files. Local development still uses pnpm.

### Describe-and-Generate (Python)

Navigate to `code/describe-and-generate/`:

```bash
cd code/describe-and-generate
uv sync                                      # Install dependencies with uv
uv run python test_local.py                  # Run default test (DESCRIBE mode, 2 images)
uv run python test_local.py describe         # Test DESCRIBE mode only
uv run python test_local.py generate         # Test GENERATE mode only
uv run python test_local.py both             # Test DESCRIBE_AND_GENERATE mode (expensive!)
uv run python test_local.py full             # Test with all images
./build-lambda.sh                            # Build lambda.zip deployment package
```

Required `.env`:
```
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
```

**Note**: This project uses `uv` for Python dependency management, not pip or poetry.

### Frontend (Vue.js)

Navigate to `code/frontend/`:

```bash
cd code/frontend
pnpm install              # Install dependencies
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm preview              # Preview production build
pnpm type-check           # Run TypeScript type checking
pnpm lint                 # Run ESLint with auto-fix
```

### Infrastructure (Terraform)

Navigate to `code/terraform/`:

```bash
cd code/terraform
terraform init            # Initialize Terraform
terraform plan            # Preview infrastructure changes
terraform apply           # Apply infrastructure changes
terraform destroy         # Destroy infrastructure
```

Required `terraform.tfvars`:
- `cloudflare_api_token`: Cloudflare API token with R2 permissions
- `cloudflare_account_id`: Your Cloudflare account ID
- `r2_endpoint`: R2 endpoint URL
- `r2_access_key_id`: R2 access key
- `r2_secret_access_key`: R2 secret key
- `pexels_api_key`: Pexels API key
- `openai_api_key`: OpenAI API key
- `aws_region`: AWS region (optional, defaults to us-east-1)

See `terraform.tfvars.example` for complete template.

## Lambda Deployment

Before deploying with Terraform, build the Lambda packages:

```bash
# Build scraper Lambda
cd code/scraper
pnpm run build:lambda

# Build describe-and-generate Lambda
cd ../describe-and-generate
./build-lambda.sh

# Deploy both with Terraform
cd ../terraform
terraform apply
```

**Important**: Terraform uses `fileexists()` to conditionally compute source code hashes, allowing operations even when deployment packages don't exist yet.

## Lambda Invocation Examples

### Scraper Lambda

Fetch 10 curated images (default):
```json
{
  "mode": "foto",
  "mediaCount": 10
}
```

Fetch 5 popular videos:
```json
{
  "mode": "video",
  "mediaCount": 5
}
```

### Describe-and-Generate Lambda

Describe and generate for today's images:
```json
{
  "mode": "DESCRIBE_AND_GENERATE"
}
```

Only describe images from specific date:
```json
{
  "mode": "DESCRIBE",
  "datePrefix": "2025-12-07"
}
```

Generate new images (requires existing descriptions):
```json
{
  "mode": "GENERATE",
  "datePrefix": "2025-12-07",
  "n": 5
}
```

## Key Integration Points

- **Scraper → R2**: Downloads media from Pexels and uploads to R2 with date-prefixed keys
- **Describe-and-Generate → R2**: Reads images, adds AI descriptions to metadata, generates new images
- **Frontend → R2**: (Future integration) Will display media from R2 buckets
- **All Lambdas**: Receive credentials via environment variables configured in Terraform
- **Storage hierarchy**: All media organized by date (`YYYY-MM-DD/`) for easy querying

## Configuration Notes

- Project uses pnpm v10.10.0 for Node.js packages and uv for Python packages
- Scraper defaults: portrait videos, 5-10 second duration, "cat" search query
- Describe-and-generate uses gpt-4o-mini for vision analysis (cost efficient)
- DALL-E 3 configured for standard quality (1024x1024)
- All sensitive credentials in `.env` and `terraform.tfvars` (both gitignored)
- R2 bucket name: `fakeout-videos-dev` (development environment)
- Frontend uses Vue 3 composition API with TypeScript and Vuetify 3 component framework
