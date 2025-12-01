export type RegisterShopOwnerStatus = 'pending' | 'approved' | 'rejected';

export interface RegisterShopOwnerRequest {
  id: string;
  userId: string;
  certificateUrl: string;
  status: RegisterShopOwnerStatus;
  reviewMessage?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userSnapshot?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: Record<string, unknown> | null;
  } | null;
}
