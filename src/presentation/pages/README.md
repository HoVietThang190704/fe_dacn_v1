# Clean Architecture - Presentation Layer

## 📁 Cấu trúc Pages

Tất cả các trang UI đã được tạo theo cấu trúc Clean Architecture:

### ✅ Các trang đã hoàn thành:

1. **HomePage** - Trang chủ với banner, categories, best-selling products
2. **ProductsListPage** - Danh sách sản phẩm với filter, sort, pagination
3. **OrdersPage** - Quản lý đơn hàng với statistics và filters
4. **FavoritesPage** - Danh sách sản phẩm yêu thích
5. **LivestreamsPage** - Livestream với tabs (Live/Scheduled)
6. **CommunityPage** - Bài viết cộng đồng với infinite scroll
7. **SupportPage** - Hỗ trợ với FAQs và tickets
8. **SettingsPage** - Cài đặt tài khoản với multiple tabs

### 🔄 Data Flow

```
User Action → Page Component → ViewModel → Use Case → Repository → Data Source → API
```

### 📦 Import Usage

```typescript
import { HomePage, ProductsListPage, OrdersPage } from '@/presentation/pages';
```

### 🎯 Nguyên tắc thiết kế

- ✅ Pure UI components (không có business logic)
- ✅ Data từ ViewModels
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ TypeScript types đầy đủ
