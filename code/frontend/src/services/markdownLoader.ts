import type { SupportedLocale } from "@/i18n";
import type { Article } from "@/data/articles";
import type { ArticleMarkdownMap } from "@/types/blog.types";

/**
 * Vite glob import - loads ALL markdown files at build time
 * Each article's markdown becomes a separate lazy chunk
 * Pattern: /src/content/blog/{slug}/{lang}.md
 *
 * Note: Using eager: false creates code-split chunks for lazy loading
 * Using as: 'raw' imports files as raw text strings
 */
// Support multiple glob patterns to be resilient across environments
// (absolute-style '/src/..', relative '../content/..' and root '/content/..')
const markdownFiles: ArticleMarkdownMap = {
  ...import.meta.glob("/src/content/blog/**/*.md", { as: "raw", eager: false }),
  ...import.meta.glob("../content/blog/**/*.md", { as: "raw", eager: false }),
  ...import.meta.glob("/content/blog/**/*.md", { as: "raw", eager: false }),
} as unknown as ArticleMarkdownMap;

/**
 * Load markdown content for a specific article and locale
 *
 * Fallback order:
 * 1. Try requested locale file
 * 2. Fall back to English if locale file doesn't exist
 * 3. Fall back to inline content if markdown files don't exist
 * 4. Throw error if no content available
 *
 * @param article - The article object from articles.ts
 * @param locale - The requested locale (en, de, bg, etc.)
 * @returns Promise resolving to the markdown content as a string
 * @throws Error if no content can be found for the article
 */
export async function loadArticleContent(
  article: Article,
  locale: SupportedLocale,
): Promise<string> {
  // If article has inline content and doesn't use markdown files, return inline
  if (article.content && !article.useMarkdownFiles) {
    return article.content[locale] || article.content.en;
  }

  // Try multiple possible key formats because glob keys can differ by environment
  const candidates = [
    `/src/content/blog/${article.slug}/${locale}.md`,
    `src/content/blog/${article.slug}/${locale}.md`,
    `../content/blog/${article.slug}/${locale}.md`,
    `/content/blog/${article.slug}/${locale}.md`,
  ];

  const fallbackCandidates = [
    `/src/content/blog/${article.slug}/en.md`,
    `src/content/blog/${article.slug}/en.md`,
    `../content/blog/${article.slug}/en.md`,
    `/content/blog/${article.slug}/en.md`,
  ];

  try {
    // Try requested locale across candidate key formats
    for (const path of candidates) {
      if (markdownFiles[path]) {
        const content = await markdownFiles[path]();
        return content as unknown as string;
      }
    }

    // Fallback to English across candidate formats
    if (locale !== "en") {
      for (const path of fallbackCandidates) {
        if (markdownFiles[path]) {
          console.warn(
            `Markdown file not found for ${article.slug} in ${locale}, falling back to English`,
          );
          const content = await markdownFiles[path]();
          return content as unknown as string;
        }
      }
    }

    // Last resort: use inline content if available
    if (article.content) {
      console.warn(
        `Markdown files not found for ${article.slug}, using inline content`,
      );
      return article.content[locale] || article.content.en;
    }

    throw new Error(
      `No content found for article ${article.slug} in locale ${locale}`,
    );
  } catch (error) {
    console.error(`Failed to load markdown for ${article.slug}:`, error);

    // Final fallback: inline content or re-throw
    if (article.content) {
      return article.content[locale] || article.content.en;
    }

    throw error;
  }
}

/**
 * Check if markdown file exists for a given article and locale
 * Useful for conditional rendering or warnings
 *
 * @param slug - The article slug
 * @param locale - The locale to check
 * @returns true if markdown file exists, false otherwise
 */
export function hasMarkdownFile(
  slug: string,
  locale: SupportedLocale,
): boolean {
  const candidates = [
    `/src/content/blog/${slug}/${locale}.md`,
    `src/content/blog/${slug}/${locale}.md`,
    `../content/blog/${slug}/${locale}.md`,
    `/content/blog/${slug}/${locale}.md`,
  ];
  return candidates.some((p) => p in markdownFiles);
}

/**
 * Get all available locales for a specific article
 * Useful for language switcher or missing translation warnings
 *
 * @param slug - The article slug
 * @returns Array of locales that have markdown files
 */
export function getAvailableLocales(slug: string): SupportedLocale[] {
  const pattern1 = `/src/content/blog/${slug}/`;
  const pattern2 = `src/content/blog/${slug}/`;
  const pattern3 = `../content/blog/${slug}/`;
  const pattern4 = `/content/blog/${slug}/`;
  const availableLocales: SupportedLocale[] = [];

  Object.keys(markdownFiles).forEach((path) => {
    if (path.startsWith(pattern1)) {
      const locale = path
        .replace(pattern1, "")
        .replace(".md", "") as SupportedLocale;
      availableLocales.push(locale);
    } else if (path.startsWith(pattern2)) {
      const locale = path
        .replace(pattern2, "")
        .replace(".md", "") as SupportedLocale;
      availableLocales.push(locale);
    } else if (path.startsWith(pattern3)) {
      const locale = path
        .replace(pattern3, "")
        .replace(".md", "") as SupportedLocale;
      availableLocales.push(locale);
    } else if (path.startsWith(pattern4)) {
      const locale = path
        .replace(pattern4, "")
        .replace(".md", "") as SupportedLocale;
      availableLocales.push(locale);
    }
  });

  return availableLocales;
}
