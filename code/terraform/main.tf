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
  filename      = var.lambda_deployment_package
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
    }
  }

  source_code_hash = fileexists(var.lambda_deployment_package) ? filebase64sha256(var.lambda_deployment_package) : null
}