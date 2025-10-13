# Menu Button & Sidebar - Hướng dẫn sử dụng

## 📁 Cấu trúc File

```
src/
├── components/
│   ├── ui/
│   │   ├── MenuButton.tsx          # Button toggle menu
│   │   └── index.ts                # Export MenuButton
│   └── layout/
│       ├── Sidebar.tsx             # Sidebar menu chính
│       └── Navbar.tsx              # Navbar với MenuButton
├── messages/
│   ├── vi.json                     # Translation tiếng Việt
│   └── en.json                     # Translation tiếng Anh
```

## 🎨 Design Features

### MenuButton Component
- **Icon Animation**: Hamburger menu transform thành X khi mở
- **Tooltip**: Hiển thị "Thu gọn" / "Mở rộng" khi hover (chỉ desktop)
- **Responsive**: Tự động detect mobile/desktop
- **Color Theme**: Sử dụng `teal-600`, `teal-700` (theme nông trại)

### Sidebar Component
- **Vertical Menu**: Menu dạng đứng với 7 items
- **Icons**: Mỗi menu item có icon riêng
- **Active State**: 
  - Background: `teal-50`
  - Text color: `teal-700`
  - Active indicator: Thanh dọc màu `teal-600`
- **Badge**: Hiển thị số lượng (vd: Livestream có 3 badge)
- **Footer**: Logo "Nông Trại Tươi" + tagline

## 📱 Responsive Behavior

### Desktop (≥ 768px)
- **Default**: Sidebar **mở** (open) khi load trang
- **Width**: 256px khi mở, 0px khi đóng
- **Toggle**: Click MenuButton để thu gọn/mở rộng
- **Position**: `sticky` bên trái màn hình

### Mobile (< 768px)
- **Default**: Sidebar **đóng** (closed) khi load trang
- **Width**: 256px khi mở
- **Toggle**: Bấm MenuButton để hiện/ẩn
- **Overlay**: Có lớp phủ đen mờ khi sidebar mở
- **Close**: Bấm vào overlay hoặc menu item để đóng

## 🎯 Menu Items

1. **Trang chủ** (`/main`) - Home icon
2. **Sản phẩm** (`/products`) - Box icon
3. **Livestream** (`/livestream`) - Video icon + Badge (3)
4. **Đơn hàng** (`/orders`) - Shopping bag icon
5. **Yêu thích** (`/favorites`) - Heart icon
6. **Cộng đồng** (`/community`) - Users icon
7. **Hỗ trợ** (`/support`) - Question circle icon

## 🌈 Color Palette

```css
/* Primary Colors (Teal Theme - Nông Trại) */
--teal-50: #f0fdfa
--teal-600: #0d9488 (navbar, active text)
--teal-700: #0f766e (hover state)

/* Accent Colors */
--red-500: #ef4444 (badge notification)
--green-500: #22c55e (footer check icon)

/* Neutral Colors */
--gray-50: #f9fafb (hover background)
--gray-200: #e5e7eb (border)
--gray-500: #6b7280 (inactive icon)
--gray-700: #374151 (text)
--gray-800: #1f2937 (tooltip)
```

## 🔧 Technical Details

### State Management
```tsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);

// Auto-detect and set default state
useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setIsSidebarOpen(!mobile); // Open on desktop, closed on mobile
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### Transitions
- **Duration**: 300ms
- **Easing**: ease-in-out
- **Properties**: 
  - `transform` (slide in/out)
  - `opacity` (overlay fade)
  - `width` (sidebar expand/collapse)

## 📝 Translation Keys

### Vietnamese (`vi.json`)
```json
"sidebar": {
  "home": "Trang chủ",
  "products": "Sản phẩm",
  "livestream": "Livestream",
  "orders": "Đơn hàng",
  "favorites": "Yêu thích",
  "community": "Cộng đồng",
  "support": "Hỗ trợ"
}
```

### English (`en.json`)
```json
"sidebar": {
  "home": "Home",
  "products": "Products",
  "livestream": "Livestream",
  "orders": "Orders",
  "favorites": "Favorites",
  "community": "Community",
  "support": "Support"
}
```

## 🚀 Usage Example

```tsx
import Navbar from '@/components/layout/Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {/* Sidebar is automatically rendered inside Navbar */}
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
```

## ✅ Checklist Test

- [ ] Desktop: Sidebar mặc định mở khi vào `/main`
- [ ] Desktop: Click MenuButton để thu gọn sidebar
- [ ] Desktop: Tooltip hiện "Thu gọn" / "Mở rộng" khi hover
- [ ] Mobile: Sidebar mặc định đóng khi load trang
- [ ] Mobile: Click MenuButton để mở sidebar
- [ ] Mobile: Overlay đen xuất hiện khi sidebar mở
- [ ] Mobile: Click overlay để đóng sidebar
- [ ] Mobile: Click menu item để đóng sidebar và chuyển trang
- [ ] Animation mượt mà (hamburger → X)
- [ ] Active state hiển thị đúng theo URL
- [ ] Badge số 3 hiển thị ở Livestream
- [ ] Responsive: Resize window từ desktop → mobile và ngược lại

## 🎨 Screenshots Reference

### Desktop - Open State
```
┌─────────────────────────────────────────────────┐
│ [≡] 🛒 Fresh Market    [Search...]    🛒 👤     │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────────┐  │
│ │ 🏠 Trang │ │                              │  │
│ │ │  chủ   │ │     Main Content Area        │  │
│ │ 📦 Sản   │ │                              │  │
│ │    phẩm  │ │                              │  │
│ │ 📹 Live ③│ │                              │  │
│ └──────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Mobile - Closed State
```
┌────────────────────────┐
│ [≡] 🛒 Fresh  🛒 👤   │
├────────────────────────┤
│                        │
│   Main Content Area    │
│                        │
└────────────────────────┘
```

### Mobile - Open State
```
┌────────────────────────┐
│ [X] 🛒 Fresh  🛒 👤   │
├────────────────────────┤
│ ┌──────────┐ [Overlay]│
│ │ 🏠 Trang │           │
│ │    chủ   │           │
│ │ 📦 Sản   │           │
│ │    phẩm  │           │
│ │ 📹 Live ③│           │
│ └──────────┘           │
└────────────────────────┘
```

---

💚 **Theme**: Nông Trại Cộng Đồng (Farm Community)
🎯 **Goal**: Menu dễ sử dụng, responsive, và đẹp mắt
