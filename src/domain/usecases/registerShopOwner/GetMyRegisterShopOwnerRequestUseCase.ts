import { RegisterShopOwnerRequest } from '@/domain/entities/RegisterShopOwnerRequest';
import { IRegisterShopOwnerRepository } from '@/domain/repositories/IRegisterShopOwnerRepository';

export class GetMyRegisterShopOwnerRequestUseCase {
  constructor(private readonly repository: IRegisterShopOwnerRepository) {}

  execute(): Promise<RegisterShopOwnerRequest | null> {
    return this.repository.getMyRequest();
  }
}
