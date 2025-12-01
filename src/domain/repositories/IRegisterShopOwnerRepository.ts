import { RegisterShopOwnerRequest } from '@/domain/entities/RegisterShopOwnerRequest';

export interface IRegisterShopOwnerRepository {
  getMyRequest(): Promise<RegisterShopOwnerRequest | null>;
  submitRequest(payload: { certificate: File }): Promise<RegisterShopOwnerRequest>;
}
