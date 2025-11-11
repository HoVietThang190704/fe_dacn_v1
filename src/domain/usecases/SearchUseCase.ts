import type { SearchResults } from '../entities/Search';
import type { ISearchRepository, SearchQueryParams } from '../repositories/ISearchRepository';

export class SearchUseCase {
  constructor(private readonly repository: ISearchRepository) {}

  execute(query: string, params?: SearchQueryParams): Promise<SearchResults> {
    return this.repository.search(query, params);
  }
}
