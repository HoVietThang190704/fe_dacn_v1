import {
  SupportTicket,
  FAQ,
  TicketStatus,
  TicketPriority,
  TicketType,
  CreateSupportTicketInput,
  SupportTicketAttachment,
} from '@/domain/entities/Support';
import { API_ENDPOINTS } from '@/shared/constants/api';

type TicketDto = {
  id?: string;
  _id?: string;
  ticketNumber?: string | null;
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  createdBy?: string;
  created_by?: string;
  assignedTo?: string | null;
  assigned_to?: string | null;
  relatedShopId?: string | null;
  related_shop_id?: string | null;
  relatedShopReference?: string | null;
  related_shop_reference?: string | null;
  relatedOrderId?: string | null;
  related_order_id?: string | null;
  relatedOrderReference?: string | null;
  related_order_reference?: string | null;
  tags?: string[];
  attachments?: SupportTicketAttachment[];
  commentsCount?: number;
  comments_count?: number;
  isPublic?: boolean;
  is_public?: boolean;
  resolutionMessage?: string | null;
  resolution_message?: string | null;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string | null;
};

type TicketsResponse = {
  success?: boolean;
  data?: TicketDto[];
  message?: string;
};

type TicketResponse = {
  success?: boolean;
  data?: TicketDto;
  message?: string;
};

type FaqDto = {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'not_helpful' | null;
};

type FaqResponse = {
  success?: boolean;
  data?: FaqDto[];
  message?: string;
};

const normalizeStatus = (value?: string): TicketStatus => {
  switch (value) {
    case TicketStatus.IN_PROGRESS:
    case 'IN_PROGRESS':
    case 'in_progress':
      return TicketStatus.IN_PROGRESS;
    case TicketStatus.ON_HOLD:
    case 'ON_HOLD':
    case 'on_hold':
      return TicketStatus.ON_HOLD;
    case TicketStatus.RESOLVED:
    case 'RESOLVED':
      return TicketStatus.RESOLVED;
    case TicketStatus.CLOSED:
    case 'CLOSED':
      return TicketStatus.CLOSED;
    case TicketStatus.REJECTED:
    case 'REJECTED':
      return TicketStatus.REJECTED;
    default:
      return TicketStatus.OPEN;
  }
};

const normalizePriority = (value?: string): TicketPriority => {
  switch (value) {
    case TicketPriority.HIGH:
    case 'HIGH':
      return TicketPriority.HIGH;
    case TicketPriority.URGENT:
    case 'URGENT':
      return TicketPriority.URGENT;
    case TicketPriority.LOW:
    case 'LOW':
      return TicketPriority.LOW;
    default:
      return TicketPriority.MEDIUM;
  }
};

const normalizeType = (value?: string): TicketType => {
  const lower = value?.toLowerCase() as TicketType | undefined;
  const allowed: TicketType[] = ['support', 'bug', 'feature', 'question', 'refund', 'other'];
  return allowed.includes(lower as TicketType) ? (lower as TicketType) : 'support';
};

const parseDate = (value?: string): Date => {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const mapTicketDtoToDomain = (dto: TicketDto): SupportTicket => {
  const id = dto.id ?? dto._id ?? '';
  if (!id) {
    throw new Error('Invalid ticket data received from API');
  }

  const createdBy = dto.createdBy ?? dto.created_by ?? '';

  return {
    id,
    ticketNumber: dto.ticketNumber ?? null,
    title: dto.title ?? 'Untitled ticket',
    description: dto.description ?? '',
    type: normalizeType(dto.type),
    priority: normalizePriority(dto.priority),
    status: normalizeStatus(dto.status),
    createdBy,
    assignedTo: dto.assignedTo ?? dto.assigned_to ?? null,
    relatedShopId: dto.relatedShopId ?? dto.related_shop_id ?? null,
  relatedShopReference: dto.relatedShopReference ?? dto.related_shop_reference ?? null,
    relatedOrderId: dto.relatedOrderId ?? dto.related_order_id ?? null,
  relatedOrderReference: dto.relatedOrderReference ?? dto.related_order_reference ?? null,
    tags: dto.tags ?? [],
    attachments: dto.attachments ?? [],
    commentsCount: dto.commentsCount ?? dto.comments_count ?? 0,
    isPublic: dto.isPublic ?? dto.is_public ?? true,
    resolutionMessage: dto.resolutionMessage ?? dto.resolution_message ?? null,
    createdAt: parseDate(dto.createdAt),
    updatedAt: parseDate(dto.updatedAt),
    resolvedAt: dto.resolvedAt ? parseDate(dto.resolvedAt) : null,
  };
};

const mapFaqDtoToDomain = (dto: FaqDto): FAQ => ({
  id: dto.id,
  question: dto.question,
  answer: dto.answer,
  category: dto.category,
  helpful: dto.helpful,
  notHelpful: dto.notHelpful,
  userVote: dto.userVote ?? null,
});

export class SupportApiDataSource {
  constructor(private readonly baseUrl: string) {
    if (!baseUrl) {
      throw new Error('SupportApiDataSource requires a valid baseUrl');
    }
  }

  async getTickets(): Promise<SupportTicket[]> {
    const payload = await this.request<TicketsResponse>(API_ENDPOINTS.SUPPORT_TICKETS, { method: 'GET' }, true);
    const tickets = Array.isArray(payload.data) ? payload.data : [];
    return tickets.map(mapTicketDtoToDomain);
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    const payload = await this.request<TicketResponse>(API_ENDPOINTS.SUPPORT_TICKET_DETAIL(id), { method: 'GET' }, true);
    if (!payload.data) {
      throw new Error(payload.message || 'Ticket not found');
    }
    return mapTicketDtoToDomain(payload.data);
  }

  async createTicket(ticket: CreateSupportTicketInput): Promise<SupportTicket> {
    const payload = await this.request<TicketResponse>(
      API_ENDPOINTS.SUPPORT_TICKETS,
      {
        method: 'POST',
        body: JSON.stringify(ticket),
      },
      true
    );

    if (!payload.data) {
      throw new Error(payload.message || 'Failed to create support ticket');
    }

    return mapTicketDtoToDomain(payload.data);
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    const payload = await this.request<TicketResponse>(
      API_ENDPOINTS.SUPPORT_TICKET_STATUS(ticketId),
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      true
    );

    if (!payload.data) {
      throw new Error(payload.message || 'Failed to update ticket status');
    }

    return mapTicketDtoToDomain(payload.data);
  }

  async getFAQs(params?: { category?: string; locale?: string }): Promise<FAQ[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.locale) searchParams.append('lang', params.locale);
    const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const payload = await this.request<FaqResponse>(`${API_ENDPOINTS.SUPPORT_FAQS}${suffix}`, { method: 'GET' });
    const faqs = Array.isArray(payload.data) ? payload.data : [];
    return faqs.map(mapFaqDtoToDomain);
  }

  async searchFAQs(query: string, locale?: string): Promise<FAQ[]> {
    const searchParams = new URLSearchParams({ q: query });
    if (locale) searchParams.append('lang', locale);
    const payload = await this.request<FaqResponse>(
      `${API_ENDPOINTS.SUPPORT_FAQ_SEARCH}?${searchParams.toString()}`,
      { method: 'GET' }
    );
    const faqs = Array.isArray(payload.data) ? payload.data : [];
    return faqs.map(mapFaqDtoToDomain);
  }

  // NOTE: voteFaq implemented below (keeps backward compatibility)

  private async request<T>(path: string, options: RequestInit, requireAuth = false): Promise<T> {
    const url = this.buildUrl(path);
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (!(options.body instanceof FormData) && options.method && options.method !== 'GET') {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    // Include Authorization header when an auth token exists (optional auth support)
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (requireAuth) {
      // requireAuth requested but no token available
      // leave headers as-is; server will return 401
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });

    const text = await response.text();
    let payload: unknown = {};
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {};
      }
    }

    if (!response.ok) {
      const message =
        (typeof payload === 'object' && payload && 'message' in payload
          ? (payload as { message?: string }).message
          : undefined) || response.statusText || 'Request failed';
      throw new Error(message);
    }

    return payload as T;
  }

  async voteFaq(id: string, vote: 'helpful' | 'not_helpful'): Promise<{ faqId: string; helpful: number; notHelpful: number; userVote?: 'helpful' | 'not_helpful' | null }> {
    const payload = await this.request<{
      success?: boolean;
      data?: { faqId: string; helpful: number; notHelpful: number; userVote?: 'helpful' | 'not_helpful' | null };
      message?: string;
    }>(
      `${API_ENDPOINTS.SUPPORT_FAQS}/${id}/vote`,
      {
        method: 'POST',
        body: JSON.stringify({ vote }),
      },
      true
    );

    if (!payload.data) {
      throw new Error(payload.message || 'Failed to submit feedback');
    }

    return {
      faqId: payload.data.faqId || id,
      helpful: typeof payload.data.helpful === 'number' ? payload.data.helpful : 0,
      notHelpful: typeof payload.data.notHelpful === 'number' ? payload.data.notHelpful : 0,
      userVote: payload.data.userVote ?? null,
    };
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalized}`;
  }

  private getAuthToken(): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      undefined
    ) || undefined;
  }
}
