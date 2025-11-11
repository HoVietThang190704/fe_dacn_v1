import type { SearchResults } from '../entities/Search';

export interface SearchQueryParams {
  productsLimit?: number;
  postsLimit?: number;
  usersLimit?: number;
}

export interface ISearchRepository {
  search(query: string, params?: SearchQueryParams): Promise<SearchResults>;
}
