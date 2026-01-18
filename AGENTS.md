# AGENTS.md

This file provides guidance to agentic coding agents working with the FakeOut codebase.

## Project Overview

FakeOut is a web-based game where users identify AI-generated images versus real photos. The system consists of:
- **Scraper**: Node.js Lambda fetching media from Pexels
- **Describe-and-Generate**: Python Lambda processing images with AI vision/generation
- **Frontend**: Vue 3 + Vuetify + Tailwind CSS web application
- **Infrastructure**: Terraform-managed AWS Lambda and Cloudflare R2 resources

## Build Commands

### Frontend (Vue.js)
```bash
cd code/frontend
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (port 3000)
pnpm build                # Build for production (runs type-check in parallel)
pnpm preview              # Preview production build
pnpm type-check           # Run TypeScript type checking
pnpm lint                 # Run ESLint with auto-fix
```

### Scraper (Node.js Lambda)
```bash
cd code/scraper
pnpm install              # Install dependencies
node scrape.js            # Run locally (requires .env)
pnpm run test:lambda      # Test Lambda handler locally
pnpm run build:lambda     # Build lambda.zip deployment package
```

### Describe-and-Generate (Python Lambda)
```bash
cd code/describe-and-generate
uv sync                                      # Install dependencies
uv run python test_local.py                  # Run default test (DESCRIBE mode, 2 images)
uv run python test_local.py describe         # Test DESCRIBE mode only
uv run python test_local.py generate         # Test GENERATE mode only
uv run python test_local.py both             # Test DESCRIBE_AND_GENERATE mode
uv run python test_local.py full             # Test with all images
./build-lambda.sh                            # Build lambda.zip deployment package
```

### Infrastructure (Terraform)
```bash
cd code/terraform
terraform init            # Initialize Terraform
terraform plan            # Preview infrastructure changes
terraform apply           # Apply infrastructure changes
```

## Code Style Guidelines

### Frontend (Vue.js/TypeScript)

**Imports:**
- Use `@/` alias for src directory imports
- Group imports: external libraries first, then internal modules
- Vue composition API: import from `vue` first, then composables

```typescript
// External libraries
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// Internal modules
import { getR2GameRounds } from "@/services/gameServiceR2";
import type { Round, Image } from "@/types/game";
```

**Component Structure:**
- Use `<script setup lang="ts">` for composition API
- Define props with `interface Props` and `const props = defineProps<Props>()`
- Use `const emit = defineEmits<{ eventName: [payload: Type] }>()`
- Reactive state with `ref()` or `reactive()`
- Computed properties with `computed()`

**Naming Conventions:**
- Components: PascalCase (e.g., `GameContainer.vue`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/interfaces: PascalCase
- Files: kebab-case for utilities, PascalCase for components

**Error Handling:**
- Use try/catch for async operations
- Log errors with `console.error()`
- Return error states or throw for critical failures
- User-facing errors via i18n keys

### Scraper (Node.js)

**Module System:**
- ES modules (`"type": "module"` in package.json)
- Use `import/export` syntax
- Named exports for utilities, default export for main handler

**Code Style:**
- Async/await for asynchronous operations
- Destructuring for object properties
- Arrow functions for callbacks
- JSDoc comments for public functions

**Error Handling:**
- Wrap async operations in try/catch
- Return structured error responses
- Log with context (operation, item ID)

### Describe-and-Generate (Python)

**Code Style:**
- Python 3.13+ with type hints
- Use `dataclasses` for structured data
- Protocol classes for interfaces
- Literal types for enums

**Imports:**
```python
# Standard library
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Literal, Optional, Protocol

# External libraries
import boto3
from openai import OpenAI
import google.generativeai as genai

# Internal modules
from clients.r2 import R2Client
from clients.openai_vision import VisionClient
```

**Error Handling:**
- Use specific exception types
- Log with structured information
- Return error responses for Lambda
- Fail-fast for critical errors

## Testing

### Frontend
- No test framework currently configured
- Manual testing via dev server
- Consider adding Vitest or Playwright

### Lambda Functions
- Scraper: `pnpm run test:lambda` (local handler test)
- Python: `uv run python test_local.py` with various modes
- Test modes: `describe`, `generate`, `both`, `full`

## Environment Configuration

### Frontend (.env.local)
```bash
VITE_R2_BASE_URL=https://your-r2-custom-domain.com
VITE_R2_BUCKET_NAME=fakeout-videos-dev
```

### Scraper (.env)
```bash
PEXELS_API_KEY=your-key
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
```

### Python Lambda (.env)
```bash
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

## Deployment

### Lambda Packages
- Build packages before Terraform deployment
- Scraper: Uses npm for Lambda packaging (pnpm symlinks don't work in zip)
- Python: Uses `uv` with Linux platform targeting
- Packages: `lambda.zip` in respective directories

### Terraform
- Uses `fileexists()` for conditional source code hashing
- Variables in `terraform.tfvars` (see example file)
- AWS region: `eu-central-1` (default)

## Key Integration Points

- **Storage**: Cloudflare R2 with date-prefixed keys (`YYYY-MM-DD/`)
- **Manifests**: Separate files per media type for game availability
- **Frontend**: Direct R2 access via custom domain, no backend API
- **Automation**: Step Functions + EventBridge for weekly content generation

## Important Notes

- Project uses `pnpm` v10.10.0 for Node.js, `uv` for Python
- Frontend supports i18n (English/German) - always add translations
- Lambda functions receive credentials via environment variables
- All sensitive data in `.env` files (gitignored)
- R2 bucket name: `fakeout-videos-dev` (development)