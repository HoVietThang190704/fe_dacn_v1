import type { Post } from './Post';
import type { Product } from './Product';
import type { User } from './User';

export interface SearchResultsSection<T> {
  items: T[];
  total: number;
  limit: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
}

export interface SearchResults {
  query: string;
  products: SearchResultsSection<Product>;
  posts: SearchResultsSection<Post>;
  users: SearchResultsSection<User>;
}
