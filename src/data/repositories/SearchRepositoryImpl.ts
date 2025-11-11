import type { SearchResults } from '@/domain/entities/Search';
import type { Post } from '@/domain/entities/Post';
import type { User, UserAddress } from '@/domain/entities/User';
import type { ISearchRepository, SearchQueryParams } from '@/domain/repositories/ISearchRepository';
import { SearchApiDataSource, PostDto, UserDto, SearchApiResponse } from '../datasources/SearchApiDataSource';
import { mapProductDtoToDomain, ProductDto } from '../datasources/ProductApiDataSource';

const fallbackDate = () => new Date();

const mapPostAuthor = (author?: PostDto['user']): Post['user'] => {
  if (!author || !author.id || !author.email) {
    return undefined;
  }
  return {
    id: String(author.id),
    userName: author.userName,
    email: String(author.email),
    avatar: author.avatar,
  };
};

const mapSharedBy = (sharedBy?: PostDto['sharedBy']): Post['sharedBy'] => {
  if (!sharedBy || !sharedBy.id) {
    return undefined;
  }
  return {
    id: String(sharedBy.id),
    userName: sharedBy.userName,
    avatar: sharedBy.avatar,
  };
};

const mapPostDtoToDomain = (dto: PostDto): Post => {
  const createdAt = dto.createdAt ? new Date(dto.createdAt) : fallbackDate();
  const updatedAt = dto.updatedAt ? new Date(dto.updatedAt) : createdAt;

  return {
    id: String(dto.id),
    userId: String(dto.userId),
    user: mapPostAuthor(dto.user),
    content: dto.content ?? '',
    images: Array.isArray(dto.images) ? dto.images.filter(Boolean) : [],
    likesCount: dto.likesCount ?? 0,
    commentsCount: dto.commentsCount ?? 0,
    sharesCount: dto.sharesCount ?? 0,
    isLiked: dto.isLiked ?? false,
    visibility: dto.visibility ?? 'public',
    isEdited: dto.isEdited ?? false,
    editedAt: dto.editedAt ? new Date(dto.editedAt) : undefined,
    originalPostId: dto.originalPostId,
    originalPost: dto.originalPost ? mapPostDtoToDomain(dto.originalPost) : undefined,
    sharedBy: mapSharedBy(dto.sharedBy),
    createdAt,
    updatedAt,
  };
};

const mapAddress = (address?: Record<string, unknown> | null): UserAddress | null => {
  if (!address) {
    return null;
  }

  const safeString = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value : undefined);

  const record = address as Record<string, unknown>;

  return {
    province: safeString(record.province),
    district: safeString(record.district),
    commune: safeString(record.commune),
    street: safeString(record.street),
    detail: safeString(record.detail),
  };
};

const mapUserDtoToDomain = (dto: UserDto): User => ({
  id: String(dto.id),
  email: String(dto.email),
  userName: dto.userName,
  phone: dto.phone,
  avatar: dto.avatar,
  address: mapAddress(dto.address),
  role: dto.role,
  isVerified: dto.isVerified,
  dateOfBirth: dto.dateOfBirth ?? null,
  createdAt: dto.createdAt ?? null,
  updatedAt: dto.updatedAt ?? null,
});

const ensureSectionLimit = (declared?: number, fallback?: number): number => {
  if (typeof declared === 'number' && Number.isFinite(declared) && declared > 0) {
    return declared;
  }
  if (typeof fallback === 'number' && Number.isFinite(fallback) && fallback > 0) {
    return fallback;
  }
  return 0;
};

const normalizeProductsSection = (section: SearchApiResponse['products'] | undefined, params?: SearchQueryParams) => {
  const safeSection: SearchApiResponse['products'] = section ?? {
    items: [],
    total: 0,
    limit: params?.productsLimit,
    hasMore: false,
  };
  const items = Array.isArray(safeSection.items) ? safeSection.items.map((item: ProductDto) => mapProductDtoToDomain(item)) : [];
  return {
    items,
    total: safeSection.total ?? items.length,
    limit: ensureSectionLimit(safeSection.limit, params?.productsLimit ?? items.length),
    hasMore: safeSection.hasMore ?? false,
  };
};

const normalizePostsSection = (section: SearchApiResponse['posts'] | undefined, params?: SearchQueryParams) => {
  const safeSection: SearchApiResponse['posts'] = section ?? {
    items: [],
    total: 0,
    limit: params?.postsLimit,
    hasMore: false,
    page: 1,
    totalPages: 1,
  };
  const items = Array.isArray(safeSection.items) ? safeSection.items.map((item: PostDto) => mapPostDtoToDomain(item)) : [];
  return {
    items,
    total: safeSection.total ?? items.length,
    limit: ensureSectionLimit(safeSection.limit, params?.postsLimit ?? items.length),
    hasMore: safeSection.hasMore ?? false,
    page: safeSection.page,
    totalPages: safeSection.totalPages,
  };
};

const normalizeUsersSection = (section: SearchApiResponse['users'] | undefined, params?: SearchQueryParams) => {
  const safeSection: SearchApiResponse['users'] = section ?? {
    items: [],
    total: 0,
    limit: params?.usersLimit,
    hasMore: false,
  };
  const items = Array.isArray(safeSection.items) ? safeSection.items.map((item: UserDto) => mapUserDtoToDomain(item)) : [];
  return {
    items,
    total: safeSection.total ?? items.length,
    limit: ensureSectionLimit(safeSection.limit, params?.usersLimit ?? items.length),
    hasMore: safeSection.hasMore ?? false,
  };
};

export class SearchRepositoryImpl implements ISearchRepository {
  constructor(private readonly dataSource: SearchApiDataSource) {}

  async search(query: string, params?: SearchQueryParams): Promise<SearchResults> {
    const response = await this.dataSource.search(query, params);

    return {
      query: response.query,
      products: normalizeProductsSection(response.products, params),
      posts: normalizePostsSection(response.posts, params),
      users: normalizeUsersSection(response.users, params),
    };
  }
}
