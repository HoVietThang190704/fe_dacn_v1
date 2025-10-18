# Clean Architecture - Fresh Market Frontend

## 📐 Cấu trúc dự án

```
src/
├── domain/                      # ⭐ DOMAIN LAYER (Business Logic Core)
│   ├── entities/               # Domain Models
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Banner.ts
│   │   ├── Favorite.ts
│   │   ├── Livestream.ts
│   │   ├── Community.ts
│   │   └── Support.ts
│   ├── repositories/           # Repository Interfaces
│   │   ├── IProductRepository.ts
│   │   ├── IOrderRepository.ts
│   │   ├── IBannerRepository.ts
│   │   ├── IFavoriteRepository.ts
│   │   ├── ILivestreamRepository.ts
│   │   ├── ICommunityRepository.ts
│   │   └── ISupportRepository.ts
│   └── usecases/              # Business Use Cases
│       ├── GetProductsUseCase.ts
│       ├── GetHomeDataUseCase.ts
│       ├── GetOrdersUseCase.ts
│       ├── GetFavoritesUseCase.ts
│       ├── GetLivestreamsUseCase.ts
│       ├── GetCommunityPostsUseCase.ts
│       └── GetSupportTicketsUseCase.ts
│
├── data/                       # 🔌 DATA LAYER (Implementation)
│   ├── datasources/           # API Implementations
│   │   ├── ProductApiDataSource.ts
│   │   ├── BannerApiDataSource.ts
│   │   ├── OrderApiDataSource.ts
│   │   ├── FavoriteApiDataSource.ts
│   │   ├── LivestreamApiDataSource.ts
│   │   ├── CommunityApiDataSource.ts
│   │   └── SupportApiDataSource.ts
│   └── repositories/          # Repository Implementations
│       ├── ProductRepositoryImpl.ts
│       ├── BannerRepositoryImpl.ts
│       ├── OrderRepositoryImpl.ts
│       ├── FavoriteRepositoryImpl.ts
│       ├── LivestreamRepositoryImpl.ts
│       ├── CommunityRepositoryImpl.ts
│       └── SupportRepositoryImpl.ts
│
├── presentation/              # 🎨 PRESENTATION LAYER (UI)
│   ├── pages/                # Page Components
│   │   ├── HomePage.tsx
│   │   ├── ProductsListPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── FavoritesPage.tsx
│   │   ├── LivestreamsPage.tsx
│   │   ├── CommunityPage.tsx
│   │   ├── SupportPage.tsx
│   │   └── SettingsPage.tsx
│   ├── viewmodels/           # State Management
│   │   ├── useHomeViewModel.ts
│   │   ├── useProductsViewModel.ts
│   │   ├── useProductsListViewModel.ts
│   │   ├── useOrdersViewModel.ts
│   │   ├── useFavoritesViewModel.ts
│   │   ├── useLivestreamsViewModel.ts
│   │   ├── useCommunityViewModel.ts
│   │   └── useSupportViewModel.ts
│   └── di/                   # Dependency Injection
│       └── container.ts
│
├── shared/                    # 🔧 SHARED (Common)
│   ├── constants/
│   │   ├── api.ts           # API endpoints & config
│   │   ├── navigation.ts    # Menu items
│   │   └── index.ts
│   ├── hooks/
│   └── utils/
│
└── components/               # 🧩 REUSABLE UI COMPONENTS
    ├── layout/
    ├── ui/
    └── auth/
```

## 🎯 Clean Architecture Layers

### 1. Domain Layer (Core - Không phụ thuộc gì)
- **Entities**: Pure TypeScript interfaces/types
- **Repository Interfaces**: Contracts cho data access
- **Use Cases**: Business logic thuần túy

### 2. Data Layer (Implementation)
- **Data Sources**: HTTP requests, API calls
- **Repository Implementations**: Implement domain interfaces

### 3. Presentation Layer (UI)
- **Pages**: Pure React components (chỉ UI)
- **ViewModels**: State management + orchestration
- **DI Container**: Dependency injection

### 4. Shared Layer
- **Constants**: Configuration không hardcode
- **Utils**: Helper functions
- **Hooks**: Reusable React hooks

## 🔄 Data Flow

```
User Action
    ↓
Page Component (UI only)
    ↓
ViewModel (State + orchestration)
    ↓
Use Case (Business logic)
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
Data Source (API call)
    ↓
HTTP Response
```

## 📱 Các trang đã hoàn thành

| Trang | Component | ViewModel | Use Case | Status |
|-------|-----------|-----------|----------|--------|
| Trang chủ | ✅ HomePage | ✅ useHomeViewModel | ✅ GetHomeDataUseCase | ✅ |
| Sản phẩm | ✅ ProductsListPage | ✅ useProductsListViewModel | ✅ GetProductsUseCase | ✅ |
| Đơn hàng | ✅ OrdersPage | ✅ useOrdersViewModel | ✅ GetOrdersUseCase | ✅ |
| Yêu thích | ✅ FavoritesPage | ✅ useFavoritesViewModel | ✅ GetFavoritesUseCase | ✅ |
| Livestream | ✅ LivestreamsPage | ✅ useLivestreamsViewModel | ✅ GetLivestreamsUseCase | ✅ |
| Cộng đồng | ✅ CommunityPage | ✅ useCommunityViewModel | ✅ GetCommunityPostsUseCase | ✅ |
| Hỗ trợ | ✅ SupportPage | ✅ useSupportViewModel | ✅ GetSupportDataUseCase | ✅ |
| Cài đặt | ✅ SettingsPage | N/A | N/A | ✅ |

## 🚀 Cách sử dụng

### 1. Import Page Component

```typescript
import { HomePage } from '@/presentation/pages';

export default function Home() {
  return <HomePage locale="vi" />;
}
```

### 2. Page tự động sử dụng ViewModel

```typescript
// Trong HomePage.tsx
const viewModel = useHomeViewModel(container.getHomeDataUseCase);
```

### 3. ViewModel tự động gọi Use Case

```typescript
// Trong useHomeViewModel.ts
const homeData = await getHomeDataUseCase.execute();
```

### 4. Use Case orchestrate Repository

```typescript
// Trong GetHomeDataUseCase.ts
const [banners, categories, products] = await Promise.all([
  this.bannerRepository.getActiveBanners(),
  this.productRepository.getCategories(),
  this.productRepository.getBestSellingProducts(10)
]);
```

## ✨ Ưu điểm

1. **Separation of Concerns**: Mỗi layer độc lập
2. **Testability**: Dễ test từng layer
3. **Maintainability**: Dễ maintain và scale
4. **Reusability**: Use cases có thể reuse
5. **Type Safety**: Full TypeScript
6. **No Hardcoded Values**: Tất cả config trong constants
7. **Clean Code**: Tuân thủ SOLID principles

## 🔧 Configuration

Tất cả config trong `src/shared/constants/`:
- **api.ts**: API endpoints, base URL
- **navigation.ts**: Menu items, routes

## 📝 Conventions

1. **Naming**:
   - Entities: `Product`, `Order`
   - Interfaces: `IProductRepository`
   - Implementations: `ProductRepositoryImpl`
   - Use Cases: `GetProductsUseCase`
   - ViewModels: `useHomeViewModel`
   - Pages: `HomePage`

2. **File structure**: Theo feature/domain

3. **Imports**: Absolute paths với `@/`

## 🎨 UI Components

Các page components được thiết kế với:
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Tailwind CSS
- ✅ Accessible (a11y)

## 🔐 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📦 Dependencies

Check `package.json` for all dependencies.

---

**Created with Clean Architecture principles** 🏗️
