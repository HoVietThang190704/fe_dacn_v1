# 🎨 Color System Guide - Hướng dẫn Hệ thống Màu

## 📋 Tổng quan

Dự án sử dụng **CSS Variables** thay vì hardcode màu Tailwind để hỗ trợ **Dark Mode** trong tương lai.

## 🌈 CSS Variables Đã Định nghĩa

### 1. **Background & Foreground**
```css
--background        /* Màu nền chính */
--foreground        /* Màu chữ chính */
```

### 2. **Card & Popover**
```css
--card              /* Màu nền card */
--card-foreground   /* Màu chữ trong card */
--popover           /* Màu nền popover/dropdown */
--popover-foreground /* Màu chữ trong popover */
```

### 3. **Primary Color** (Màu chủ đạo - Xanh lá)
```css
--primary           /* Light: #22c55e | Dark: #34d399 */
--primary-foreground /* Màu chữ trên nền primary */
```

### 4. **Secondary & Muted**
```css
--secondary         /* Màu phụ */
--secondary-foreground
--muted             /* Màu mờ nhạt */
--muted-foreground
```

### 5. **Accent** (Màu nhấn)
```css
--accent            /* Màu highlight/hover */
--accent-foreground
```

### 6. **Destructive** (Màu cảnh báo/xóa)
```css
--destructive       /* Màu đỏ cho nút xóa, lỗi */
--destructive-foreground
```

### 7. **Border & Input**
```css
--border            /* Màu viền */
--input             /* Màu border input */
--ring              /* Màu focus ring */
```

### 8. **Sidebar** (Thanh menu bên)
```css
--sidebar           /* Nền sidebar */
--sidebar-foreground /* Chữ sidebar */
--sidebar-primary   /* Màu primary cho menu active */
--sidebar-primary-foreground
--sidebar-accent    /* Màu hover sidebar */
--sidebar-accent-foreground
--sidebar-border    /* Viền sidebar */
--sidebar-ring
```

### 9. **Navbar** (Thanh điều hướng trên)
```css
--navbar            /* Light: #0d9488 (teal-600) | Dark: #1e293b */
--navbar-foreground /* Light: #ffffff | Dark: #d1d5db */
--navbar-hover      /* Light: #0f766e | Dark: #334155 */
```

### 10. **Charts** (Biểu đồ)
```css
--chart-1 đến --chart-5  /* Màu cho charts - tông xanh */
```

---

## 💡 Cách Sử Dụng trong Tailwind

### ❌ SAI - Không nên hardcode màu:
```tsx
<div className="bg-teal-600 text-white">...</div>
<button className="hover:bg-gray-100">...</button>
```

### ✅ ĐÚNG - Dùng CSS variables:
```tsx
<div className="bg-navbar text-navbar-foreground">...</div>
<button className="hover:bg-accent text-accent-foreground">...</button>
```

---

## 📝 Mapping Table - Bảng Quy Đổi

| Màu Cũ (Hardcode) | CSS Variable Mới | Ghi chú |
|-------------------|------------------|---------|
| `bg-white` | `bg-card` | Nền trắng cho card |
| `text-gray-700` | `text-foreground` | Chữ đen chính |
| `text-gray-500` | `text-muted-foreground` | Chữ mờ |
| `bg-gray-100` | `bg-muted` | Nền xám nhạt |
| `bg-teal-600` | `bg-navbar` hoặc `bg-primary` | Xanh chủ đạo |
| `text-white` | `text-navbar-foreground` | Chữ trắng trên navbar |
| `bg-red-500` | `bg-destructive` | Màu đỏ cảnh báo |
| `border-gray-200` | `border-border` | Viền xám |
| `text-teal-600` | `text-primary` | Chữ xanh primary |
| `hover:bg-gray-50` | `hover:bg-accent` | Màu hover |

---

## 🌓 Dark Mode Values

### Light Mode (Default)
- **Primary**: `#22c55e` (green-500)
- **Background**: `#f0f8ff` (alice blue)
- **Navbar**: `#0d9488` (teal-600)
- **Sidebar**: `#e0f2fe` (sky-100)

### Dark Mode (.dark class)
- **Primary**: `#34d399` (emerald-400)
- **Background**: `#0f172a` (slate-900)
- **Navbar**: `#1e293b` (slate-800)
- **Sidebar**: `#1e293b` (slate-800)

---

## 🔧 Cách Thêm Màu Mới

### Bước 1: Thêm vào `globals.css`
```css
:root {
  --my-new-color: #123456;
}

.dark {
  --my-new-color: #654321;
}
```

### Bước 2: Thêm vào `@theme inline`
```css
@theme inline {
  --color-my-new-color: var(--my-new-color);
}
```

### Bước 3: Sử dụng trong component
```tsx
<div className="bg-my-new-color text-foreground">
  Content here
</div>
```

---

## 📦 Components Đã Được Cập nhật

✅ **MenuButton** - Dùng `primary-foreground`, `popover`
✅ **Sidebar** - Dùng `sidebar-*` variables
✅ **Navbar** - Dùng `navbar-*` variables
✅ **SearchBar** - Dùng `card`, `input`, `ring`
✅ **CartIcon** - Dùng `navbar-foreground`, `destructive`
✅ **UserAvatar** - Dùng `popover`, `accent`, `destructive`

---

## 🎯 Best Practices

1. **Luôn dùng CSS variables** thay vì hardcode màu Tailwind
2. **Kiểm tra light/dark mode** khi thêm màu mới
3. **Đặt tên variable có ý nghĩa** (primary, accent, destructive...)
4. **Nhóm màu theo chức năng** (navbar, sidebar, card...)
5. **Document khi thêm màu mới** vào file này

---

## 🚀 Testing Dark Mode

```tsx
// Thêm class "dark" vào <html> để test
<html className="dark">
```

Hoặc tạo toggle button:
```tsx
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
}
```

---

## 📞 Support

Nếu cần thêm màu mới hoặc có thắc mắc về hệ thống màu, hãy:
1. Check file `src/app/globals.css`
2. Đọc tài liệu này
3. Tham khảo các component đã implement

**Note**: Màu `orange-500` trong delivery badge có thể cần update thành CSS variable trong tương lai!
