import { RegisterShopOwnerRequest } from '@/domain/entities/RegisterShopOwnerRequest';
import { IRegisterShopOwnerRepository } from '@/domain/repositories/IRegisterShopOwnerRepository';

export class SubmitRegisterShopOwnerRequestUseCase {
  constructor(private readonly repository: IRegisterShopOwnerRepository) {}

  execute(params: { certificate: File }): Promise<RegisterShopOwnerRequest> {
    if (!params?.certificate) {
      return Promise.reject(new Error('Certificate file is required'));
    }
    return this.repository.submitRequest(params);
  }
}
