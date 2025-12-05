# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a video scraping and storage system that fetches videos from Pexels and stores them in Cloudflare R2 (S3-compatible storage). The system is designed to run as an AWS Lambda function and is provisioned using Terraform.

## Architecture

The project consists of two main components:

1. **Scraper (`code/scraper/`)**: Node.js application that fetches videos from Pexels API and uploads them to Cloudflare R2
   - `scrape.js`: Main entry point that orchestrates video fetching and R2 upload testing
   - `clients/pexel.js`: Pexels API client wrapper for video search
   - `clients/s3.js`: S3/R2 client wrapper with upload functionality (supports both direct data and file uploads)

2. **Infrastructure (`code/terraform/`)**: Terraform configuration for AWS Lambda and Cloudflare R2
   - Creates an R2 bucket (`fakeout-videos-dev`)
   - Provisions AWS Lambda function with IAM roles and policies for R2 access
   - Lambda is configured with Node.js 20.x runtime, 512MB memory, 300s timeout

### Key Integration Points

- The scraper uses the AWS SDK S3 client to interact with Cloudflare R2 via S3-compatible API
- Lambda function receives R2 credentials and Pexels API key via environment variables
- Terraform expects a Lambda deployment package at `../scraper/lambda.zip` (relative to terraform directory)

## Development Commands

### Scraper

Navigate to `code/scraper/` for all scraper operations:

```bash
cd code/scraper
```

Install dependencies:
```bash
pnpm install
```

Run the scraper locally:
```bash
node scrape.js
```

The scraper requires a `.env` file with:
```
PEXELS_API_KEY=your-key
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
```

### Infrastructure

Navigate to `code/terraform/` for all Terraform operations:

```bash
cd code/terraform
```

Initialize Terraform (download providers):
```bash
terraform init
```

Plan infrastructure changes:
```bash
terraform plan
```

Apply infrastructure changes:
```bash
terraform apply
```

Destroy infrastructure:
```bash
terraform destroy
```

Required `terraform.tfvars` configuration:
- `cloudflare_api_token`: Cloudflare API token with R2 permissions
- `cloudflare_account_id`: Your Cloudflare account ID
- `r2_endpoint`: R2 endpoint URL (format: `https://<account_id>.r2.cloudflarestorage.com`)
- `r2_access_key_id`: R2 access key
- `r2_secret_access_key`: R2 secret key
- `pexels_api_key`: Pexels API key

See `terraform.tfvars.example` for the complete template.

## Lambda Deployment

Before deploying the Lambda function:

1. Build the Lambda deployment package:
   ```bash
   cd code/scraper
   pnpm run build:lambda
   # or directly: ./build-lambda.sh
   ```
   This creates `lambda.zip` with all necessary dependencies properly packaged (uses npm to avoid pnpm symlink issues).

2. Deploy with Terraform:
   ```bash
   cd ../terraform
   terraform apply
   ```

**Important**: The build script uses npm (not pnpm) to install dependencies in the Lambda package because pnpm's symlink structure doesn't work in zip files. The local development still uses pnpm.

Note: The `main.tf:97` uses `fileexists()` to conditionally compute the source code hash, allowing Terraform operations even when the deployment package doesn't exist yet.

## Configuration Notes

- The project uses pnpm as the package manager (version 10.10.0)
- Scraper defaults to portrait-oriented videos, 5-10 second duration, with "cat" as the search query
- All sensitive credentials are kept in `.env` (scraper) and `terraform.tfvars` (infrastructure) - both are gitignored
- The R2 bucket is named `fakeout-videos-dev` for the development environment
