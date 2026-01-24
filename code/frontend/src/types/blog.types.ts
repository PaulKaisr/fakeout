import type { SupportedLocale } from '@/i18n';

/**
 * Type for raw markdown content imported via Vite glob
 */
export type MarkdownModule = {
  default: string;
};

/**
 * Map of markdown file paths to their import functions
 * Created by Vite's import.meta.glob()
 */
export type ArticleMarkdownMap = Record<string, () => Promise<MarkdownModule>>;

/**
 * Loaded article content with metadata
 */
export interface LoadedArticleContent {
  locale: SupportedLocale;
  content: string;
  fromMarkdown: boolean;
}
