export type WikipediaPageId = string;

export interface WikipediaPage {
  readonly id: WikipediaPageId;
  readonly title: string;
  readonly url: string;
  readonly description?: string;
  readonly thumbnailUrl?: string;
}

export interface ShortestPathsApiResponse {
  readonly paths: readonly number[][];
  readonly pages: Record<string, WikipediaPage>;
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
  readonly isSourceRedirected: boolean;
  readonly isTargetRedirected: boolean;
}

export interface ShortestPathsErrorResponse {
  readonly error: string;
}

export interface BlogPostInfo {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly author: string;
  readonly description: string;
}
