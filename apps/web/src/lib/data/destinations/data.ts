import type { ExploreArticle, ExploreDestination } from './types';
import { NORTH_DESTINATIONS } from './north';
import { CENTRAL_DESTINATIONS } from './central';
import { SOUTH_DESTINATIONS } from './south';

export const EXPLORE_DESTINATIONS: ExploreDestination[] = [
  ...NORTH_DESTINATIONS,
  ...CENTRAL_DESTINATIONS,
  ...SOUTH_DESTINATIONS,
];

/** Alias tương thích cho các component dùng EXPLORE_ARTICLES */
export const EXPLORE_ARTICLES: ExploreArticle[] = EXPLORE_DESTINATIONS;

export { NORTH_DESTINATIONS, CENTRAL_DESTINATIONS, SOUTH_DESTINATIONS };
