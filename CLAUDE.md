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

## Frontend Design System

The FakeOut frontend uses a distinctive "Reality Fracture" design aesthetic that visually represents the core game concept: the tension between authentic content and AI-generated synthesis. This design system avoids generic "AI slop" aesthetics by employing bold, technical, and brutalist design patterns.

### Design Philosophy

**Core Concept: Reality Fracture**
- Visual metaphor: Glitches, distortions, and CRT artifacts represent the fracturing of reality perception
- Technical precision: Monospace typography, status indicators, and terminal aesthetics convey systematic analysis
- Hard edges: No rounded corners (border-radius: 0) for a brutalist, unpolished feel
- Maximalist approach: Bold animations, layered effects, and decorative elements create visual interest
- Retro-futurism: CRT scanlines, pixel effects, and binary patterns evoke early digital aesthetics

### Typography

**Font Pairing**
- **Display/Headers**: [Archivo Black](https://fonts.google.com/specimen/Archivo+Black) - Bold, condensed, geometric sans-serif
- **Body/Monospace**: [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) - Technical monospace with excellent readability

**Usage Guidelines**
- Use Archivo Black for: Main headlines, large numbers, brand elements, decorative badges
- Use IBM Plex Mono for: Body text, labels, buttons, navigation, code-like elements
- Always include via Google Fonts import: `@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600;700&display=swap');`
- Never use generic fonts like Inter, Roboto, or system fonts

### Color Palette

**Core Colors (always use these exact hex codes)**
```css
/* Primary - Purple */
--color-primary: #8b5cf6;

/* Secondary - Pink */
--color-secondary: #ec4899;

/* Accent - Cyan */
--color-accent: #06b6d4;

/* Background - Deep Black */
--color-bg: #0a0a0f;

/* Text - White variations */
--color-text: rgba(255, 255, 255, 0.9);
--color-text-dim: rgba(255, 255, 255, 0.7);
--color-text-subtle: rgba(255, 255, 255, 0.5);
--color-text-ghost: rgba(255, 255, 255, 0.4);
```

**Color Usage**
- Purple (#8b5cf6): Primary borders, main glows, status indicators, primary interactions
- Pink (#ec4899): Active states, highlights, badges, accent elements
- Cyan (#06b6d4): Tertiary accents, alternative status indicators, gradient endpoints
- Deep Black (#0a0a0f): All backgrounds
- Gradients: Combine purple → pink → cyan for animated elements

### Visual Effect Patterns

#### 1. Scanlines (CRT Effect)
```css
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.03) 0px,
    rgba(0, 0, 0, 0.05) 1px,
    transparent 2px,
    transparent 4px
  );
  pointer-events: none;
  z-index: 1;
  animation: scanline-drift 8s linear infinite;
}

@keyframes scanline-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
```

#### 2. Glitch Effects (RGB Separation)
```css
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #ec4899;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  animation: glitch-anim-1 2s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: 2px 0 #06b6d4;
  clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}

@keyframes glitch-anim-1 {
  0% { clip-path: polygon(0 0%, 100% 0%, 100% 5%, 0 5%); }
  20% { clip-path: polygon(0 15%, 100% 15%, 100% 25%, 0 25%); }
  40% { clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%); }
  60% { clip-path: polygon(0 75%, 100% 75%, 100% 76%, 0 76%); }
  80% { clip-path: polygon(0 85%, 100% 85%, 100% 100%, 0 100%); }
  100% { clip-path: polygon(0 0%, 100% 0%, 100% 100%, 0 100%); }
}
```

#### 3. Grid Background
```css
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.5;
  z-index: 1;
}
```

#### 4. Noise Texture
```css
.noise-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.3;
  z-index: 2;
}
```

#### 5. Corner Brackets (L-shaped indicators)
```css
.corner-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
}

.corner-bracket::before,
.corner-bracket::after {
  content: '';
  position: absolute;
  background: #8b5cf6;
}

.corner-bracket::before {
  width: 100%;
  height: 2px;
}

.corner-bracket::after {
  width: 2px;
  height: 100%;
}

/* Top-left */
.corner-tl { top: 1rem; left: 1rem; }
.corner-tl::before { top: 0; left: 0; }
.corner-tl::after { top: 0; left: 0; }

/* Top-right */
.corner-tr { top: 1rem; right: 1rem; }
.corner-tr::before { top: 0; right: 0; }
.corner-tr::after { top: 0; right: 0; }

/* Bottom-left */
.corner-bl { bottom: 1rem; left: 1rem; }
.corner-bl::before { bottom: 0; left: 0; }
.corner-bl::after { bottom: 0; left: 0; }

/* Bottom-right */
.corner-br { bottom: 1rem; right: 1rem; }
.corner-br::before { bottom: 0; right: 0; }
.corner-br::after { bottom: 0; right: 0; }
```

#### 6. Bracket Motifs (Text decoration)
```html
<!-- Navigation links -->
<a class="nav-link">
  <span class="bracket">[</span>
  <span class="text">LINK TEXT</span>
  <span class="bracket">]</span>
</a>

<!-- Badges -->
<div class="badge">
  <span class="bracket">▸</span>
  <span class="text">BADGE TEXT</span>
  <span class="bracket">◂</span>
</div>
```

```css
.bracket {
  color: rgba(139, 92, 246, 0.6);
  transition: all 0.3s ease;
}

.nav-link:hover .bracket:first-child {
  transform: translateX(-2px);
}

.nav-link:hover .bracket:last-child {
  transform: translateX(2px);
}
```

### Animation Patterns

**Standard Easing Function**
```css
/* Use this cubic-bezier for all bouncy animations */
transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Staggered Entrance Animations**
```vue
<template>
  <div
    v-for="(item, index) in items"
    :key="index"
    :style="{ animationDelay: `${index * 0.1}s` }"
    class="animated-item"
  >
</template>

<style>
.animated-item {
  animation: entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) backwards;
}

@keyframes entrance {
  0% {
    opacity: 0;
    transform: translateX(-40px) rotateY(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotateY(0deg);
  }
}
</style>
```

**Status Pulse**
```css
@keyframes status-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.status-dot {
  animation: status-pulse 2s ease-in-out infinite;
}
```

**Hover Scan Effect**
```css
.scan-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.2) 50%,
    transparent
  );
  transform: translateX(-100%);
  transition: transform 1s ease;
}

.card:hover .scan-effect {
  transform: translateX(100%);
}
```

### Code Implementation Patterns

#### Component Structure Template
```vue
<template>
  <div class="fracture-component relative overflow-hidden">
    <!-- Background Effects (always first) -->
    <div class="scanlines"></div>
    <div class="grid-bg"></div>
    <div class="noise-texture"></div>

    <!-- Main Content (relative z-10) -->
    <div class="component-content relative z-10">
      <!-- Your content here -->
    </div>

    <!-- Decorative Elements (last) -->
    <div class="corner-bracket corner-tl"></div>
    <div class="corner-bracket corner-tr"></div>
    <div class="corner-bracket corner-bl"></div>
    <div class="corner-bracket corner-br"></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;600;700&display=swap');

.fracture-component {
  background: #0a0a0f;
  font-family: 'IBM Plex Mono', monospace;
  position: relative;
}

/* Add scanlines, grid, noise, corners styles here */
</style>
```

#### Badge Component Pattern (see [MissionHero.vue](code/frontend/src/components/MissionHero.vue#L29-L33))
```vue
<div class="fracture-badge">
  <span class="badge-bracket">▸</span>
  <span class="badge-text">{{ $t('badge.text') }}</span>
  <span class="badge-bracket">◂</span>
</div>

<style scoped>
.fracture-badge {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 2rem;
  border: 2px solid #ec4899;
  background: rgba(236, 72, 153, 0.05);
  position: relative;
}

.badge-bracket {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.25rem;
  color: #ec4899;
  animation: badge-pulse 2s ease-in-out infinite;
}

.badge-text {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.2em;
  color: #ec4899;
  text-transform: uppercase;
}
</style>
```

#### Numbered Card Pattern (see [GameFAQ.vue](code/frontend/src/components/game/GameFAQ.vue#L19-L50))
```vue
<div class="fracture-card" v-for="(item, index) in items" :key="index">
  <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>

  <div class="card-content">
    <!-- Your content -->
  </div>
</div>

<style scoped>
.fracture-card {
  position: relative;
  background: #0a0a0f;
}

.card-number {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  font-family: 'Archivo Black', sans-serif;
  font-size: 2.5rem;
  color: rgba(139, 92, 246, 0.1);
  line-height: 1;
  pointer-events: none;
  transition: all 0.4s ease;
}

.fracture-card:hover .card-number {
  color: rgba(139, 92, 246, 0.2);
  transform: scale(1.1);
}

.card-content {
  padding: 2rem 2rem 2rem 6rem;
  position: relative;
}
</style>
```

#### Status Indicators Pattern (see [AppFooter.vue](code/frontend/src/components/AppFooter.vue#L12-L25))
```vue
<div class="status-bar">
  <div class="status-item">
    <div class="status-dot status-online"></div>
    <span class="status-label">SYSTEM:ONLINE</span>
  </div>
  <div class="status-item">
    <div class="status-dot status-ready"></div>
    <span class="status-label">STATUS:READY</span>
  </div>
</div>

<style scoped>
.status-bar {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: status-pulse 2s ease-in-out infinite;
}

.status-online {
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
}

.status-ready {
  background: #ec4899;
  box-shadow: 0 0 8px rgba(236, 72, 153, 0.8);
  animation-delay: 0.3s;
}

.status-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}
</style>
```

#### Navigation with Brackets Pattern (see [AppFooter.vue](code/frontend/src/components/AppFooter.vue#L28-L46))
```vue
<nav class="fracture-nav">
  <div class="nav-section">
    <div class="nav-section-label">// SECTION_NAME</div>
    <a href="#" class="nav-link">
      <span class="nav-bracket">[</span>
      <span class="nav-text">{{ $t('nav.link') }}</span>
      <span class="nav-bracket">]</span>
    </a>
  </div>
</nav>

<style scoped>
.nav-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(236, 72, 153, 0.6);
  margin-bottom: 0.5rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  width: fit-content;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.nav-link:hover {
  color: #8b5cf6;
  transform: translateX(4px);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-bracket {
  color: rgba(139, 92, 246, 0.4);
  transition: all 0.3s ease;
}

.nav-link:hover .nav-bracket {
  color: #ec4899;
}
</style>
```

#### Interactive Card with Corner Brackets (see [ImageCard.vue](code/frontend/src/components/game/ImageCard.vue))
```vue
<div class="fracture-interactive-card" :class="{ 'card-selected': isSelected }">
  <!-- Corner Brackets -->
  <div class="card-corner card-corner-tl"></div>
  <div class="card-corner card-corner-tr"></div>
  <div class="card-corner card-corner-bl"></div>
  <div class="card-corner card-corner-br"></div>

  <!-- Scan Effect on Hover -->
  <div class="card-scan-effect"></div>

  <!-- Label Badge -->
  <div class="label-badge">
    <span class="label-bracket">[</span>
    <span class="label-text">A</span>
    <span class="label-bracket">]</span>
  </div>

  <!-- Content -->
  <div class="card-image-wrapper">
    <img :src="imageUrl" alt="" />
  </div>
</div>

<style scoped>
.fracture-interactive-card {
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(139, 92, 246, 0.3);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
}

.fracture-interactive-card:hover {
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-4px);
}

.card-selected {
  border-color: #8b5cf6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  animation: border-pulse 1.5s ease-in-out infinite;
}

@keyframes border-pulse {
  0%, 100% { border-color: #8b5cf6; }
  50% { border-color: #ec4899; }
}

.card-scan-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(139, 92, 246, 0.3) 50%,
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.8s ease;
  pointer-events: none;
  z-index: 10;
}

.fracture-interactive-card:hover .card-scan-effect {
  transform: translateX(100%);
}

.label-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(10, 10, 15, 0.9);
  border: 2px solid rgba(139, 92, 246, 0.5);
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.1em;
}

.label-bracket {
  color: rgba(139, 92, 246, 0.6);
}

.label-text {
  color: rgba(255, 255, 255, 0.9);
}
</style>
```

### Component Design Checklist

When creating or modifying components, ensure:

**Typography**
- [ ] Google Fonts import included for Archivo Black and IBM Plex Mono
- [ ] Archivo Black used for display elements (headlines, large numbers, brand)
- [ ] IBM Plex Mono used for body text and monospace elements
- [ ] Appropriate font weights (400, 600, 700) specified

**Colors**
- [ ] Using exact hex codes: #8b5cf6, #ec4899, #06b6d4, #0a0a0f
- [ ] Background is always #0a0a0f
- [ ] Text uses rgba(255, 255, 255, X) with appropriate opacity
- [ ] Purple for primary, pink for active/highlight, cyan for tertiary

**Visual Effects**
- [ ] Scanlines layer added for CRT effect
- [ ] Grid background included where appropriate
- [ ] Corner brackets on cards and containers
- [ ] Bracket motifs ([...] or ▸◂) on buttons/links/badges
- [ ] No border-radius (hard edges everywhere)

**Animations**
- [ ] Using cubic-bezier(0.68, -0.55, 0.265, 1.55) for bouncy transitions
- [ ] Staggered animations with animationDelay for lists
- [ ] Hover effects with scan/glitch animations
- [ ] Status indicators have pulse animations

**Structure**
- [ ] Background effects positioned absolutely with z-index: 1
- [ ] Main content has relative positioning with z-index: 10
- [ ] Decorative elements (corners, badges) properly layered
- [ ] Overflow hidden on containers with effects

**Accessibility**
- [ ] Proper semantic HTML elements
- [ ] i18n integration for all text content
- [ ] Sufficient color contrast maintained
- [ ] Interactive elements have focus states

**Responsive**
- [ ] Mobile breakpoints defined (@media max-width: 768px)
- [ ] Font sizes and spacing adjust for mobile
- [ ] Grid layouts use grid-template-columns with minmax()
- [ ] Touch targets are at least 44x44px

### Reference Components

Study these components as reference implementations:

1. **[MissionHero.vue](code/frontend/src/components/MissionHero.vue)** - Hero section with large typography, glitch effects, numbered mission blocks
2. **[GameFAQ.vue](code/frontend/src/components/game/GameFAQ.vue)** - Custom accordion, numbered cards, animated plus/minus icons
3. **[index.vue](code/frontend/src/pages/[lang]/index.vue)** - Articles grid with scan effects, date badges, border animations
4. **[AppFooter.vue](code/frontend/src/components/AppFooter.vue)** - Status bar, bracketed navigation, terminal divider, brand display
5. **[ImageCard.vue](code/frontend/src/components/game/ImageCard.vue)** - Interactive cards, corner brackets, result overlays, emoji icons

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
