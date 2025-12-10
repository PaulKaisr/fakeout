variable "cloudflare_api_token" {
  description = "Cloudflare API Token with R2 permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "r2_endpoint" {
  description = "Cloudflare R2 endpoint URL"
  type        = string
}

variable "r2_access_key_id" {
  description = "R2 Access Key ID"
  type        = string
  sensitive   = true
}

variable "r2_secret_access_key" {
  description = "R2 Secret Access Key"
  type        = string
  sensitive   = true
}

variable "pexels_api_key" {
  description = "Pexels API Key"
  type        = string
  sensitive   = true
}

variable "lambda_deployment_package" {
  description = "Path to Lambda deployment package (zip file)"
  type        = string
  default     = "../scraper/lambda.zip"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 300
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "openai_api_key" {
  description = "OpenAI API Key for Vision API"
  type        = string
  sensitive   = true
}

