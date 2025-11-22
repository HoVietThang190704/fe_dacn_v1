import { authApiClient } from '@/lib/authApiClient';
import { API_ENDPOINTS } from '@/shared/constants/api';
import {
  NotificationEntity,
  NotificationListResult,
  NotificationPayload,
  NotificationSummary,
} from '@/domain/entities/Notification';
import { NotificationQuery } from '@/domain/repositories/INotificationRepository';

interface NotificationApiModel {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  payload?: NotificationPayload | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string;
}

interface NotificationApiListResponse {
  success: boolean;
  data?: NotificationApiModel[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    unreadCount?: number;
  };
  message?: string;
}

interface NotificationSummaryResponse {
  success: boolean;
  data?: {
    total?: number;
    unread?: number;
    hasUnread?: boolean;
    latestUnreadAt?: string | null;
    latestNotification?: NotificationApiModel | null;
  };
  message?: string;
}

interface MarkAllResponse {
  success: boolean;
  data?: {
    updated?: number;
  };
  message?: string;
}

export class NotificationApiDataSource {
  private mapNotification(model: NotificationApiModel): NotificationEntity {
    return {
      id: model.id ?? model._id ?? '',
      userId: String(model.userId),
      title: model.title,
      message: model.message,
      type: model.type,
      payload: model.payload ?? null,
      isRead: Boolean(model.isRead),
      readAt: model.readAt ?? null,
      createdAt: model.createdAt ?? new Date().toISOString(),
    };
  }

  private buildQuery(query?: NotificationQuery): string {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status && query.status !== 'all') params.set('status', query.status);
    return params.toString();
  }

  async getNotifications(query?: NotificationQuery): Promise<NotificationListResult> {
    const qs = this.buildQuery(query);
    const endpoint = qs ? `${API_ENDPOINTS.NOTIFICATIONS}?${qs}` : API_ENDPOINTS.NOTIFICATIONS;
    const response = await authApiClient.get<NotificationApiListResponse>(endpoint);

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể tải danh sách thông báo');
    }

    const items = response.data.data.map((item) => this.mapNotification(item));
    const metaPayload = response.data.meta ?? {
      page: query?.page ?? 1,
      limit: query?.limit ?? 10,
      total: items.length,
      totalPages: 1,
      unreadCount: 0,
    };

    return {
      items,
      meta: {
        page: metaPayload.page,
        limit: metaPayload.limit,
        total: metaPayload.total,
        totalPages: metaPayload.totalPages ?? Math.max(1, Math.ceil(metaPayload.total / Math.max(1, metaPayload.limit))),
        unreadCount: metaPayload.unreadCount ?? 0,
      },
    };
  }

  async markAsRead(notificationId: string): Promise<NotificationEntity> {
    const response = await authApiClient.patch<{ success: boolean; data?: NotificationApiModel }>(
      API_ENDPOINTS.NOTIFICATION_MARK_READ(notificationId),
      {}
    );

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể cập nhật trạng thái thông báo');
    }

    return this.mapNotification(response.data.data);
  }

  async markAllAsRead(): Promise<{ updated: number }> {
    const response = await authApiClient.patch<MarkAllResponse>(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {});
    if (!response.success || !response.data || response.data.data == null) {
      throw new Error(response.error || 'Không thể cập nhật tất cả thông báo');
    }

    return { updated: response.data.data.updated ?? 0 };
  }

  async getSummary(): Promise<NotificationSummary> {
    const response = await authApiClient.get<NotificationSummaryResponse>(API_ENDPOINTS.NOTIFICATIONS_SUMMARY);

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể tải trạng thái thông báo');
    }

    const payload = response.data.data;
    return {
      total: payload.total ?? 0,
      unread: payload.unread ?? 0,
      hasUnread: payload.hasUnread ?? (payload.unread ?? 0) > 0,
      latestUnreadAt: payload.latestUnreadAt ?? null,
      latestNotification: payload.latestNotification ? this.mapNotification(payload.latestNotification) : null,
    };
  }
}
