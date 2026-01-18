# R2 Integration Layer

This directory contains the R2 integration layer for loading images from Cloudflare R2 storage.

## Architecture

The implementation follows a clean, layered architecture:

```
Types (r2.types.ts)
    ↓
Config (r2.config.ts)
    ↓
Service (r2.service.ts)
    ↓
Composables (useR2Config.ts, useR2Images.ts)
    ↓
Components/Pages (test-r2.vue)
```

## File Structure

```
src/
├── types/
│   └── r2.types.ts              # TypeScript type definitions
├── config/
│   └── r2.config.ts             # Configuration management
├── services/
│   └── r2.service.ts            # Core R2 service layer
├── composables/
│   ├── useR2Config.ts           # Config composable
│   └── useR2Images.ts           # Image loading composable
└── pages/
    └── test-r2.vue              # Test page at /test-r2
```

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your R2 custom domain:

```env
VITE_R2_BASE_URL=https://pub-YOUR_BUCKET_ID.r2.dev
VITE_R2_BUCKET_NAME=fakeout-videos-dev
```

### 2. Configure R2 Public Access (Cloudflare Dashboard)

**IMPORTANT:** Public access and CORS must be configured manually in Cloudflare Dashboard.

1. Go to **Cloudflare Dashboard > R2 > fakeout-videos-dev**
2. **Enable Public Access** in bucket settings
3. **Add CORS Policy** (Settings > CORS):
   ```json
   [
     {
       "AllowedOrigins": [
         "https://*.vercel.app",
         "https://yourdomain.com",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. **Link Custom Domain** (Settings > Custom Domains):
   - Add domain: `media.yourdomain.com`
   - Cloudflare will auto-create DNS records

5. **Get Public URL**:
   - After enabling public access, you'll get a URL like: `https://pub-abc123.r2.dev`
   - Or use your custom domain: `https://media.yourdomain.com`
   - Update `VITE_R2_BASE_URL` in `.env.local` with this URL

### 3. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000/test-r2` to test the integration.

## Usage

### Basic Usage

```vue
<script setup>
import { useR2Images } from "@/composables/useR2Images";

const { images, loading, error, loadImages } = useR2Images();

// Load images for a specific date
await loadImages({
  datePrefix: "2025-12-10",
  type: "both", // 'pexels_raw' | 'openai_generated' | 'both'
  limit: 20,
  includeMetadata: true,
});
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else>
    <div v-for="image in images" :key="image.key">
      <img :src="image.url" :alt="image.key" />
    </div>
  </div>
</template>
```

### With Custom Configuration

```ts
import { useR2Images } from "@/composables/useR2Images";

const customConfig = {
  baseUrl: "https://test.example.com",
  bucketName: "test-bucket",
};

const { loadImages } = useR2Images(customConfig);
```

### Available Composables

#### `useR2Images(config?)`

Main composable for loading images:

- `images` - Reactive array of all loaded images
- `pexelsImages` - Computed filtered real images
- `generatedImages` - Computed filtered AI images
- `loading` - Loading state
- `error` - Error state
- `loadImages(options)` - Load images for date/type
- `prefetchImages(keys)` - Preload images for caching
- `clear()` - Clear loaded images

#### `useR2Config()`

Configuration management:

- `config` - Current R2 configuration (readonly)
- `updateConfig(overrides)` - Update config for testing
- `resetConfig()` - Reset to environment defaults

## Storage Structure

### Real Images (Pexels)

```
{YYYY-MM-DD}/pexel_images_raw/001
{YYYY-MM-DD}/pexel_images_raw/001_meta.json
{YYYY-MM-DD}/pexel_images_raw/002
{YYYY-MM-DD}/pexel_images_raw/002_meta.json
...
```

### AI-Generated Images

```
{YYYY-MM-DD}/openai_generated_images/{pexels_id}
{YYYY-MM-DD}/openai_generated_images/{pexels_id}_meta.json
```

**Note:** Generated images use the Pexels image ID as the filename, not sequential numbers.

## API Reference

### Service Layer (`R2Service`)

```ts
// Build URL for R2 object
buildUrl(key: string): string

// Fetch metadata JSON
fetchMetadata(key: string): Promise<Metadata>

// Get key patterns for date/type
buildImageKeys(datePrefix: string, type: string): { imageKeyPattern, metaKeyPattern }

// Load images for date
getImagesForDate(datePrefix, type, options): Promise<R2Image[]>

// Load generated images by Pexels IDs
getGeneratedImagesForIds(datePrefix, pexelsIds, includeMetadata): Promise<R2Image[]>

// Load image blob data
loadImageBlob(key: string): Promise<Blob>

// Prefetch image for caching
prefetchImage(key: string): void
```

## Testing

### Local Testing

1. Set up R2 public access (see setup instructions)
2. Run scraper Lambda to generate test images
3. Navigate to `/test-r2` route
4. Select a date and click "Load Images"

### Test Page Features

- Date picker for selecting image date
- Type selector (Real, AI, Both)
- Limit input for max images
- Live image grid display
- Metadata display
- Error handling
- Loading states

## Deployment (Vercel)

### Environment Variables

Set these in Vercel Dashboard (Settings > Environment Variables):

```
VITE_R2_BASE_URL=https://media.yourdomain.com
VITE_R2_BUCKET_NAME=fakeout-videos-dev
```

### CORS Configuration

Update CORS policy to include your Vercel domains:

```json
{
  "AllowedOrigins": [
    "https://your-app.vercel.app",
    "https://your-app-*.vercel.app",
    "https://yourdomain.com"
  ]
}
```

## Performance Optimizations

1. **CDN Caching** - Custom domain enables Cloudflare edge caching (~80% cache hit rate)
2. **Lazy Loading** - Vuetify `<v-img>` lazy loads images automatically
3. **Prefetching** - Use `prefetchImages()` to preload next images
4. **Sequential Loading** - Stops at first missing image to avoid unnecessary requests
5. **Browser Cache** - Images cached by browser for repeat visits

## Cost Estimate

For a public game with 1000 daily users:

- **Storage**: 200MB × $0.015/GB = $0.003/month
- **Class B ops**: 10,000 requests/day × 20% cache miss × $0.36/million = $0.02/month
- **Egress**: $0 (R2 zero egress fees)
- **Total**: ~$0.023/month (~2 cents)

With CDN caching, this is **5x cheaper** than without caching.

## Troubleshooting

### Images not loading

1. Check R2 public access is enabled
2. Verify CORS policy includes your domain
3. Check browser console for CORS errors
4. Verify `VITE_R2_BASE_URL` is set correctly

### CORS errors

1. Add your domain to CORS `AllowedOrigins`
2. Include `http://localhost:3000` for local dev
3. Use wildcards for Vercel preview deployments: `https://*.vercel.app`

### Metadata not found

1. Ensure images were scraped with metadata
2. Check date format is YYYY-MM-DD
3. Verify sequential numbering (001, 002, etc.)

## Next Steps

This integration layer provides the foundation for:

1. Building the real vs AI guessing game UI
2. Implementing image pair selection logic
3. Adding game scoring and statistics
4. Creating user authentication (if needed)

## References

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Public Buckets Guide](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [CORS Configuration](https://developers.cloudflare.com/r2/buckets/cors/)
- [Vue 3 Composition API](https://vuejs.org/guide/introduction.html)
