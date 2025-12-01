import { IRegisterShopOwnerRepository } from '@/domain/repositories/IRegisterShopOwnerRepository';
import { RegisterShopOwnerRequest } from '@/domain/entities/RegisterShopOwnerRequest';
import { RegisterShopOwnerApiDataSource } from '@/data/datasources/RegisterShopOwnerApiDataSource';

export class RegisterShopOwnerRepositoryImpl implements IRegisterShopOwnerRepository {
  constructor(private readonly api: RegisterShopOwnerApiDataSource) {}

  getMyRequest(): Promise<RegisterShopOwnerRequest | null> {
    return this.api.getMyRequest();
  }

  submitRequest(payload: { certificate: File }): Promise<RegisterShopOwnerRequest> {
    return this.api.submitRequest(payload.certificate);
  }
}
