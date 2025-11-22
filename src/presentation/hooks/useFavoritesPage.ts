import { useRouter } from 'next/navigation';
import { container } from '@/presentation/di/container';
import { useFavoritesViewModel } from '@/presentation/viewmodels/useFavoritesViewModel';
import { ROUTES } from '@/presentation/config/favoritesConfig';

export const useFavoritesPage = (userId: string) => {
  const router = useRouter();
  const viewModel = useFavoritesViewModel(
    {
      getFavoritesUseCase: container.getFavoritesUseCase,
      removeFavoriteUseCase: container.removeFavoriteUseCase,
      toggleFavoriteUseCase: container.toggleFavoriteUseCase,
    },
    userId
  );

  const goToDiscover = () => {
    router.push(ROUTES.DISCOVER_PRODUCTS);
  };

  return {
    viewModel,
    goToDiscover,
  };
};

export default useFavoritesPage;