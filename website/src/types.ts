export type WikipediaPageId = string;

export interface WikipediaPage {
  readonly title: string;
  readonly url: string;
  readonly description?: string;
  readonly thumbnailUrl?: string;
}

export interface ShortestPathsApiResponse {
  readonly paths: readonly string[][];
  readonly pages: Record<string, WikipediaPage>;
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
  readonly isSourceRedirected: boolean;
  readonly isTargetRedirected: boolean;
}
