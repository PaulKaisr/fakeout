terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "aws" {
  region = var.aws_region
}

resource "cloudflare_r2_bucket" "fakeout_videos_dev" {
  account_id = var.cloudflare_account_id
  name       = "fakeout-videos-dev"
}

# Note: Public access and CORS configuration for R2 bucket must be done manually via Cloudflare Dashboard
# This is because the Terraform provider doesn't support these settings yet.
#
# Manual Setup Steps:
# 1. Go to Cloudflare Dashboard > R2 > fakeout-videos-dev
# 2. Enable "Public Access" in bucket settings
# 3. Add CORS policy (Settings > CORS):
#    [{
#      "AllowedOrigins": ["https://*.vercel.app", "https://yourdomain.com"],
#      "AllowedMethods": ["GET", "HEAD"],
#      "AllowedHeaders": ["*"],
#      "ExposeHeaders": ["ETag"],
#      "MaxAgeSeconds": 3600
#    }]
# 4. Link custom domain (Settings > Custom Domains):
#    - Add domain: media.yourdomain.com
#    - Cloudflare will auto-create DNS records
#
# For more information:
# - https://developers.cloudflare.com/r2/buckets/public-buckets/
# - https://developers.cloudflare.com/r2/buckets/cors/

resource "aws_iam_role" "scraper_lambda" {
  name = "scraper-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.scraper_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "r2_access" {
  name        = "scraper-r2-access-policy"
  description = "Allow Lambda to read/write to Cloudflare R2 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${cloudflare_r2_bucket.fakeout_videos_dev.name}",
          "arn:aws:s3:::${cloudflare_r2_bucket.fakeout_videos_dev.name}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_r2_access" {
  role       = aws_iam_role.scraper_lambda.name
  policy_arn = aws_iam_policy.r2_access.arn
}

resource "aws_lambda_function" "scraper" {
  filename      = "${path.module}/../scraper/lambda.zip"
  function_name = "scraper"
  role          = aws_iam_role.scraper_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      R2_ENDPOINT            = var.r2_endpoint
      R2_ACCESS_KEY_ID       = var.r2_access_key_id
      R2_SECRET_ACCESS_KEY   = var.r2_secret_access_key
      PEXELS_API_KEY         = var.pexels_api_key
      R2_BUCKET_NAME         = cloudflare_r2_bucket.fakeout_videos_dev.name
      SUPABASE_URL           = var.supabase_url
      SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_role_key
    }
  }

  source_code_hash = fileexists("${path.module}/../scraper/lambda.zip") ? filebase64sha256("${path.module}/../scraper/lambda.zip") : null
}

# IAM Role for describe-and-generate Lambda
resource "aws_iam_role" "describe_lambda" {
  name = "describe-and-generate-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic execution role for logging
resource "aws_iam_role_policy_attachment" "describe_lambda_basic_execution" {
  role       = aws_iam_role.describe_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach R2 access policy (reuse the same policy)
resource "aws_iam_role_policy_attachment" "describe_lambda_r2_access" {
  role       = aws_iam_role.describe_lambda.name
  policy_arn = aws_iam_policy.r2_access.arn
}

# Lambda function for describe-and-generate
resource "aws_lambda_function" "describe_and_generate" {
  filename      = "${path.module}/../describe-and-generate/lambda.zip"
  function_name = "describe-and-generate"
  role          = aws_iam_role.describe_lambda.arn
  handler       = "main.handler"
  runtime       = "python3.13"
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      R2_ENDPOINT          = var.r2_endpoint
      R2_ACCESS_KEY_ID     = var.r2_access_key_id
      R2_SECRET_ACCESS_KEY = var.r2_secret_access_key
      OPENAI_API_KEY       = var.openai_api_key
      GOOGLE_AI_API_KEY    = var.google_ai_api_key
    }
  }

  source_code_hash = fileexists("${path.module}/../describe-and-generate/lambda.zip") ? filebase64sha256("${path.module}/../describe-and-generate/lambda.zip") : null
}