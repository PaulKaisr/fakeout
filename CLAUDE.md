# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FakeOut** (also known as "AI or Real?") is a web-based game where users identify AI-generated images versus real photos. The application combines automated content generation, AI vision APIs, and a modern Vue.js frontend into a complete gaming experience.

### System Architecture

The system uses AWS Lambda functions to scrape real images from Pexels, generate AI-created versions using DALL-E 3 or Google Imagen 3, and automatically creates weekly game content via AWS Step Functions. The frontend is a Vue 3 + Vuetify application with internationalization support (English/German), game state management, and an archive system for past games. All media is stored in Cloudflare R2 with a manifest-based tracking system.

## Architecture

The project consists of five main components:

### 1. Scraper (`code/scraper/`)
Node.js Lambda function that fetches media from Pexels API and uploads to Cloudflare R2
- `index.js`: Main Lambda handler supporting two modes:
  - `foto` mode (default): Fetches curated images
  - `video` mode: Fetches popular videos
- `clients/pexel.js`: Pexels API client wrapper
- `clients/s3.js`: S3/R2 client for uploads

**Storage pattern**: `{YYYY-MM-DD}/pexel_{images|videos}_raw/{number}` with corresponding `{number}_meta.json` metadata files

### 2. Describe-and-Generate (`code/describe-and-generate/`)
Python Lambda function that processes images with AI vision and generation APIs (OpenAI or Google)
- `main.py`: Lambda handler with three operational modes:
  - `DESCRIBE`: Analyzes images with AI vision (GPT-4o-mini or Gemini), adds descriptions to metadata
  - `GENERATE`: Creates new images using existing descriptions (DALL-E 3 or Imagen 3)
  - `DESCRIBE_AND_GENERATE` (default): Performs both operations
- `clients/r2.py`: R2 client wrapper
- `clients/openai_vision.py`: OpenAI Vision API and DALL-E 3 client
- `clients/google_ai.py`: Google Gemini Vision and Imagen 3 client
- Supports provider selection via `provider` parameter (default: "google")
  - `"openai"`: Uses OpenAI GPT-4o-mini for vision, DALL-E 3 for generation
  - `"google"`: Uses Gemini 2.0 Flash for vision, Imagen 3 for generation
- Includes manifest management:
  - `backfill` parameter (default: `true`): Scans all date folders and rebuilds manifest
  - Creates/updates separate manifest files per media type at bucket root:
    - `games_manifest_images.json`: Available image game dates
    - `games_manifest_videos.json`: Available video game dates
- Image limit parameter `n` for partial processing
- Fail-fast error handling with enhanced logging

**Storage pattern**: Generated images saved to `{YYYY-MM-DD}/{provider}_generated_images/{original_image_id}` with corresponding metadata including `original_image_id`, `generation_prompt`, `revised_prompt`, `provider`, and `model`

### 3. Frontend (`code/frontend/`)
Vue 3 + Vuetify + Tailwind CSS application implementing the "AI or Real?" game
- Built with Vite, TypeScript, Vue Router
- Uses unplugin-vue-router for file-based routing with typed routes
- Configured with ESLint using Vuetify config
- Internationalization (i18n) support with English and German translations
- Tailwind CSS v4 for utility-first styling alongside Vuetify components

**Key Components:**
- `components/game/GameContainer.vue`: Main game logic and state management
- `components/game/ImageCard.vue`: Individual image cards with selection UI
- `components/game/ResultScreen.vue`: End-of-game results with scoring
- `components/game/GameArchive.vue`: Archive view for past games
- `components/LanguageSwitcher.vue`: Language selector with flag icons

**Pages:**
- `/pages/index.vue`: Home page
- `/pages/game.vue`: Current game (loads latest available game)
- `/pages/game/[date].vue`: Date-specific game view (dynamic routing)
- `/pages/archive.vue`: Past games archive

**Services:**
- `services/gameServiceR2.ts`: R2-based game data fetching
- `services/r2.service.ts`: R2 API wrapper with manifest support

**Types:**
- `types/game.ts`: Game domain types (GameState, Round, Image, GameStatus)
- `types/r2.types.ts`: R2 service types and metadata structures

**Game Features:**
- Round-based gameplay with image pair comparisons (A/B choice)
- Score tracking with round history
- Visual feedback for correct/incorrect selections
- Performance-based result messages
- Share functionality (copy to clipboard)
- 7-day lookback for finding latest available game
- Archive navigation for historical games
- Dark theme with gradient accents
- Responsive design with mobile support
- Loading and error states throughout

### 4. Infrastructure (`code/terraform/`)
Terraform configuration for all AWS and Cloudflare resources
- Creates R2 bucket (`fakeout-videos-dev`)
- Provisions scraper and describe-and-generate Lambda functions with IAM roles
- Lambda functions configured with Node.js 24.x (scraper) and Python 3.13 (describe-and-generate)
- All functions: 512MB memory, 300s timeout

### 5. Automation (`code/terraform/automation.tf`)
AWS Step Functions and EventBridge automation for weekly game generation
- **Step Functions State Machine** (`fakeout-weekly-generation`):
  - Two-step workflow: ScrapeImages → GenerateAndDescribe
  - Retry logic with exponential backoff
  - Hardcoded parameters: 5 images, Google provider, backfill enabled
- **EventBridge Scheduler**:
  - Schedule: Every Monday at 9 AM UTC (`cron(0 9 ? * MON *)`)
  - Resource: `fakeout-weekly-trigger`
  - Automatically triggers weekly game generation
- **IAM Roles**:
  - `step_functions_role`: Step Functions execution permissions
  - `scheduler_role`: EventBridge Scheduler permissions
  - Policies for Lambda invocation and state machine execution

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
GOOGLE_AI_API_KEY=your-google-ai-key
```

**Note**: This project uses `uv` for Python dependency management, not pip or poetry.

### Frontend (Vue.js)

Navigate to `code/frontend/`:

```bash
cd code/frontend
pnpm install              # Install dependencies
pnpm dev                  # Start dev server
pnpm build                # Build for production (runs type-check in parallel)
pnpm preview              # Preview production build
pnpm type-check           # Run TypeScript type checking
pnpm lint                 # Run ESLint with auto-fix
```

Required environment variables (`.env`):
```
VITE_R2_BASE_URL=https://your-r2-custom-domain.com
VITE_R2_BUCKET_NAME=fakeout-videos-dev
```

**Frontend Dependencies:**
- `vue-i18n`: ^9.14.5 (internationalization)
- `@intlify/unplugin-vue-i18n`: ^11.0.3 (Vite i18n plugin)
- `tailwindcss`: ^4.1.18 (utility-first CSS)
- `@tailwindcss/vite`: ^4.1.18 (Tailwind Vite plugin)
- `vuetify`: ^3.7.6 (Material Design components)
- `npm-run-all2`: For parallel build tasks

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
- `openai_api_key`: OpenAI API key (required if using OpenAI provider)
- `google_ai_api_key`: Google AI API key (required if using Google provider)
- `aws_region`: AWS region (optional, defaults to eu-central-1)

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

Describe and generate for today's images using Google AI (default):
```json
{
  "mode": "DESCRIBE_AND_GENERATE"
}
```

Use OpenAI instead of Google:
```json
{
  "mode": "DESCRIBE_AND_GENERATE",
  "provider": "openai"
}
```

Only describe images from specific date:
```json
{
  "mode": "DESCRIBE",
  "datePrefix": "2025-12-07",
  "provider": "google"
}
```

Generate new images (requires existing descriptions):
```json
{
  "mode": "GENERATE",
  "datePrefix": "2025-12-07",
  "n": 5,
  "provider": "google"
}
```

Update manifest without rebuilding (add today's date):
```json
{
  "mode": "DESCRIBE_AND_GENERATE",
  "backfill": false
}
```

Rebuild entire manifest from all date folders:
```json
{
  "mode": "DESCRIBE_AND_GENERATE",
  "backfill": true
}
```

Process videos and update video manifest:
```json
{
  "mode": "DESCRIBE_AND_GENERATE",
  "mediaType": "video"
}
```

## Key Integration Points

- **Scraper → R2**: Downloads media from Pexels and uploads to R2 with date-prefixed keys
- **Describe-and-Generate → R2**: Reads images, adds AI descriptions to metadata, generates new images, updates manifest
- **Frontend → R2**: Fetches game data directly from R2 public URLs (via custom domain)
  - Loads `games_manifest_images.json` for archive listing (image games only)
  - Fetches raw and generated images with metadata
  - Implements 7-day lookback for finding latest game
- **Step Functions → Lambdas**: Orchestrates weekly game generation workflow
- **EventBridge → Step Functions**: Triggers automation every Monday at 9 AM UTC
- **All Lambdas**: Receive credentials via environment variables configured in Terraform
- **Storage hierarchy**: All media organized by date (`YYYY-MM-DD/`) for easy querying
- **Manifest system**: Separate manifest files per media type track available game dates in reverse chronological order
  - `games_manifest_images.json`: Dates with image game content
  - `games_manifest_videos.json`: Dates with video game content

## Configuration Notes

- Project uses pnpm v10.10.0 for Node.js packages and uv for Python packages
- Scraper defaults: portrait videos, 5-10 second duration, "cat" search query
- Describe-and-generate supports two AI providers (default: Google):
  - **Google** (default): Gemini 2.0 Flash (model: `gemini-2.5-flash-image`) for vision, Imagen 3 for generation
  - **OpenAI**: GPT-4o-mini for vision, DALL-E 3 (model: `dall-e-3`) for generation
- Image generation configured for standard quality (1024x1024 or 1:1 aspect ratio)
- All sensitive credentials in `.env` and `terraform.tfvars` (both gitignored)
- R2 bucket name: `fakeout-videos-dev` (development environment)
- Frontend uses Vue 3 composition API with TypeScript, Vuetify 3, and Tailwind CSS v4
- Frontend supports English and German with vue-i18n, browser locale detection, and localStorage persistence
- Scraper Lambda package uses npm for bundling (not pnpm) due to symlink issues in zip files
- Lambda deployment packages (`lambda.zip`) excluded from source control via `.gitignore`

## Game Flow

1. **Content Generation** (Automated weekly via Step Functions):
   - Scraper fetches 5 curated images from Pexels
   - Describe-and-Generate analyzes images with AI vision
   - AI generates fake versions of each image
   - Manifest updated with new game date

2. **User Experience**:
   - User visits game page (loads latest game from last 7 days)
   - Game presents 5 rounds, each with 2 images (1 real, 1 AI-generated)
   - User selects which image is real
   - Immediate visual feedback per round
   - Final score and performance message displayed
   - Option to share results, replay, or browse archive

3. **Archive System**:
   - All past games accessible via archive page
   - Manifest provides date list for navigation
   - Date-specific URLs allow direct linking to past games
