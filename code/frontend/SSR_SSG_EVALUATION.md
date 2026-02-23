# SSR/SSG Evaluation for Fakeout

**Date:** 2026-02-23
**Current Stack:** Vue 3 + Vite + Vuetify 3 + vue-i18n + unplugin-vue-router

## Executive Summary

The Fakeout frontend is currently a client-side rendered (CSR) Single Page Application. While Googlebot can render JavaScript, CSR creates SEO risks:
- Content isn't immediately available in initial HTML
- Core Web Vitals can be impacted (LCP especially)
- Social media crawlers may not see content

**Recommendation:** Implement **vite-ssg** for static site generation of blog and informational pages, keeping game pages as CSR.

## Options Evaluated

### 1. vite-ssg (Recommended for Phase 1)

**What:** Static site generation plugin for Vue 3 + Vite
**Effort:** Low-Medium (1-2 weeks)
**SEO Benefit:** High for static pages

**Pros:**
- Minimal changes to existing code structure
- Pre-renders pages to static HTML at build time
- Compatible with Vuetify 3 (documented examples exist)
- Works with vue-router
- Maintains current development workflow
- @unhead/vue integration (already using it)

**Cons:**
- Game pages with dynamic data still need client-side fetching
- Build time increases with page count
- Need to handle SSR-incompatible code with `<ClientOnly>`

**Migration Steps:**
1. Install: `pnpm add -D vite-ssg`
2. Update `main.ts` to export `createApp` function
3. Wrap Vuetify-specific browser APIs in `<ClientOnly>` if needed
4. Update build script to `vite-ssg build`
5. Test all routes render correctly

**Code Example:**
```typescript
// main.ts (after migration)
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import routes from '~pages'

export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, isClient }) => {
    // Install plugins
    app.use(vuetify)
    app.use(i18n)
  }
)
```

---

### 2. Vike (formerly vite-plugin-ssr)

**What:** Full-featured SSR/SSG framework for Vite
**Effort:** Medium-High (3-4 weeks)
**SEO Benefit:** High

**Pros:**
- Most flexible: SSR, SSG, SPA, hybrid per-page
- Official Vuetify documentation
- Active development (benchmark score: 90.4)
- Fine-grained control over rendering

**Cons:**
- Requires more significant code restructuring
- Different routing paradigm (`+Page.vue`, `+data.ts` files)
- Would need to rewrite existing page components
- Steeper learning curve

**When to choose:** If you need true SSR (server-rendered on each request) for dynamic game pages or want maximum flexibility.

---

### 3. Nuxt 3

**What:** Full-featured Vue 3 metaframework
**Effort:** High (4-8 weeks)
**SEO Benefit:** Highest

**Pros:**
- Best-in-class SSR/SSG support
- Built-in SEO, i18n, routing
- Large ecosystem and community
- Long-term maintainability
- Auto-imports, composables

**Cons:**
- Complete rewrite of application structure
- Different file conventions (`pages/`, `composables/`, `server/`)
- Would need to migrate all existing components
- Vuetify integration requires `vuetify-nuxt-module`

**When to choose:** For a greenfield project or major refactor. Best long-term solution but highest upfront cost.

---

### 4. @vuetify/vite-ssg

**What:** Vuetify's fork of vite-ssg
**Effort:** Low
**SEO Benefit:** Medium

**Pros:**
- Purpose-built for Vuetify
- Should handle Vuetify SSR edge cases

**Cons:**
- Last updated 2 years ago (potential compatibility issues)
- Less active maintenance
- Limited documentation

**Recommendation:** Skip this option due to maintenance concerns.

---

### 5. Manual Pre-rendering (vite-plugin-prerender)

**What:** Pre-render specific routes at build time
**Effort:** Low
**SEO Benefit:** Medium

**Pros:**
- Minimal code changes
- Can target specific high-value pages
- Quick implementation

**Cons:**
- Less comprehensive than full SSG
- May not handle all edge cases
- Limited to truly static pages

**When to choose:** Quick fix for critical pages only.

---

## Recommended Approach: Phased Implementation

### Phase 1: vite-ssg (Weeks 1-2)

1. **Install and configure vite-ssg**
2. **Identify SSR-safe pages:**
   - Homepage (`/[lang]/index.vue`)
   - Blog pages (`/[lang]/blog/*`)
   - About, FAQ, Privacy, Terms
   - Stats page

3. **Mark game components as client-only:**
   - `GameContainer.vue` - fetches live data
   - `ImageCard.vue` - interactive

4. **Test and verify:**
   - Check pre-rendered HTML contains H1, content
   - Verify structured data in source
   - Test hydration works correctly

### Phase 2: Evaluate Results (Week 3)

1. **Monitor Core Web Vitals** via Search Console
2. **Check indexation** in Google Search Console
3. **Compare before/after** Lighthouse scores

### Phase 3: Consider Full SSR if Needed (Future)

If Phase 1 doesn't achieve desired results, consider:
- Vike for hybrid SSR/SSG
- Nuxt 3 for complete rebuild

---

## Technical Considerations

### Vuetify SSR Compatibility

Vuetify 3 is SSR-compatible but requires attention to:

1. **Dynamic styles:** Use `useDisplay()` carefully
2. **Browser APIs:** Wrap in `onMounted()` or `<ClientOnly>`
3. **Theme:** Configure for SSR to avoid FOUC

```vue
<!-- For non-SSR-safe components -->
<ClientOnly>
  <GameContainer />
</ClientOnly>
```

### i18n with SSR

Current setup uses vue-i18n which works with SSR. Ensure:
- Locale detection happens server-side
- Messages are loaded before render

### unplugin-vue-router

Compatible with vite-ssg. File-based routing will work.

### @unhead/vue

Already using this - perfect for SSG. No changes needed.

---

## Effort Estimates

| Task | Estimated Effort |
|------|-----------------|
| Install vite-ssg | 1 hour |
| Update main.ts | 2-4 hours |
| Identify/wrap client-only code | 4-8 hours |
| Test all routes | 4-8 hours |
| Fix SSR issues | 8-16 hours |
| **Total Phase 1** | **2-4 days** |

---

## Decision Matrix

| Criteria | vite-ssg | Vike | Nuxt 3 | Prerender |
|----------|----------|------|--------|-----------|
| Migration effort | Low | Medium | High | Very Low |
| SEO improvement | High | High | Highest | Medium |
| Maintenance | Low | Medium | Low | Low |
| Flexibility | Medium | High | High | Low |
| Community support | Good | Good | Excellent | Limited |
| **Recommended for Fakeout** | **Yes** | Maybe | Future | No |

---

## Next Steps

1. **Approve Phase 1 approach** (vite-ssg)
2. **Create feature branch** for SSG migration
3. **Implement incrementally:**
   - Start with blog pages (lowest risk)
   - Add informational pages
   - Test game pages with ClientOnly wrapper
4. **Deploy to staging** and verify
5. **Monitor SEO metrics** post-deploy

---

## Sources

- [vite-ssg GitHub](https://github.com/antfu-collective/vite-ssg)
- [Vike Documentation](https://vike.dev/)
- [Vuetify + vite-plugin-ssr](https://vite-plugin-ssr.com/vuetify)
- [@vuetify/vite-ssg](https://www.npmjs.com/package/@vuetify/vite-ssg)
- [Building SEO-friendly Vite-SSG + Vuetify3](https://voidzxl.medium.com/building-an-seo-friendly-responsive-i18n-website-using-vite-ssg-vuetify3-fad08f6be99f)
- [Vue.js SSR Guide](https://vuejs.org/guide/scaling-up/ssr.html)
