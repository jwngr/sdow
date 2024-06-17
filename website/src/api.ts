import {SDOW_API_URL} from './resources/constants.ts';
import {
  ShortestPathsApiResponse,
  ShortestPathsErrorResponse,
  WikipediaPage,
  WikipediaPageId,
} from './types.ts';

interface FetchShortestPathsResponse {
  readonly paths: readonly WikipediaPageId[][];
  readonly pagesById: Record<WikipediaPageId, WikipediaPage>;
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
  readonly isSourceRedirected: boolean;
  readonly isTargetRedirected: boolean;
}

export async function fetchShortestPaths({
  sourcePageTitle,
  targetPageTitle,
}: {
  readonly sourcePageTitle: string;
  readonly targetPageTitle: string;
}): Promise<FetchShortestPathsResponse> {
  const response = await fetch(`${SDOW_API_URL}/paths`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: sourcePageTitle,
      target: targetPageTitle,
    }),
  });

  if (!response.ok) {
    const data = (await response.json()) as ShortestPathsErrorResponse;
    throw new Error(`Failed to find shortest path: ${data.error}`);
  }

  const data = (await response.json()) as ShortestPathsApiResponse;

  const newPagesByNumberId: Record<number, WikipediaPage> = Object.entries(data.pages).reduce(
    (acc, [pageId, page]) => {
      acc[Number(pageId)] = page;
      return acc;
    },
    {}
  );

  return {
    paths: data.paths,
    pagesById: newPagesByNumberId,
    sourcePageTitle: data.sourcePageTitle,
    targetPageTitle: data.targetPageTitle,
    isSourceRedirected: data.isSourceRedirected,
    isTargetRedirected: data.isTargetRedirected,
  };
}
