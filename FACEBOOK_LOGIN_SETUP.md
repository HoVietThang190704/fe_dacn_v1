# Facebook Login Setup - Frontend

## ✅ Đã hoàn thành

Chức năng đăng nhập Facebook đã được tích hợp hoàn chỉnh vào frontend.

## 🔧 Cấu hình

### 1. Environment Variables

File `.env.local` đã được cập nhật với:

```env
NEXT_PUBLIC_FACEBOOK_APP_ID=1474436206997158
```

**Lưu ý**: Chỉ cần App ID trên frontend. App Secret phải giữ bí mật ở backend.

### 2. Facebook App Settings

Đảm bảo trong Facebook App Dashboard:
- **Valid OAuth Redirect URIs**: `http://localhost:3000` (đã cấu hình)
- **App Domains**: `localhost`
- Status: Development mode (OK cho testing)

## 📦 Components đã cập nhật

### 1. FacebookSignInButton (`src/components/ui/FacebookSignInButton.tsx`)

Component mới với đầy đủ tính năng:
- Load Facebook SDK tự động
- Handle login flow
- Error handling
- Loading states

```tsx
<FacebookSignInButton 
  onSuccess={handleFacebookSuccess}
  onError={handleFacebookError}
  disabled={isLoading}
  className="w-full"
/>
```

### 2. LoginForm (`src/components/auth/LoginForm.tsx`)

Đã được cập nhật để sử dụng:
```tsx
const handleFacebookSuccess = async (accessToken: string) => {
  await loginWithFacebook(accessToken);
};
```

## 🔄 Luồng hoạt động

```
1. User click "Đăng nhập với Facebook"
   ↓
2. FacebookSignInButton load Facebook SDK (nếu chưa có)
   ↓
3. Show Facebook login popup
   ↓
4. User cho phép quyền truy cập
   ↓
5. Nhận Facebook access_token
   ↓
6. Gửi access_token đến backend (POST /api/auth/facebook/token)
   ↓
7. Backend verify với Facebook Graph API
   ↓
8. Backend tạo/tìm user và return JWT tokens
   ↓
9. Frontend lưu tokens vào localStorage
   ↓
10. Redirect đến /main
```

## 🧪 Testing

### 1. Test local
```bash
# Start frontend
npm run dev

# Navigate to login page
http://localhost:3000/auth/login
```

### 2. Test flow
1. Click nút "Facebook"
2. Facebook popup xuất hiện
3. Đăng nhập và cho phép quyền
4. Kiểm tra console log
5. Verify redirect đến /main

### 3. Kiểm tra localStorage
Sau khi đăng nhập thành công, kiểm tra:
```javascript
localStorage.getItem('authToken')      // JWT access token
localStorage.getItem('refreshToken')   // JWT refresh token
localStorage.getItem('user')          // User info
```

## 🐛 Troubleshooting

### Lỗi: "Facebook SDK chưa sẵn sàng"
**Nguyên nhân**: SDK chưa load xong
**Giải pháp**: Đợi vài giây, nút sẽ tự enable khi SDK ready

### Lỗi: "Đăng nhập Facebook bị hủy"
**Nguyên nhân**: User đóng popup hoặc không cho phép
**Giải pháp**: Bình thường, user có thể thử lại

### Lỗi: "Invalid OAuth Redirect URI"
**Nguyên nhân**: URL không match với cấu hình trong Facebook App
**Giải pháp**: Kiểm tra lại Facebook App Settings → Valid OAuth Redirect URIs

### Lỗi CORS
**Nguyên nhân**: Backend chưa allow frontend domain
**Giải pháp**: 
```typescript
// Backend config.ts
FRONTEND_URL: 'http://localhost:3000'
```

## 📝 Code Changes Summary

### Files Modified:
1. ✅ `.env.local` - Thêm FACEBOOK_APP_ID
2. ✅ `src/shared/constants/api.ts` - Thêm AUTH_FACEBOOK_TOKEN endpoint
3. ✅ `src/lib/api.ts` - Thêm facebookToken() function
4. ✅ `src/shared/hooks/useAuth.ts` - Thêm loginWithFacebook() hook
5. ✅ `src/components/ui/FacebookSignInButton.tsx` - Component mới với SDK
6. ✅ `src/components/auth/LoginForm.tsx` - Update để sử dụng Facebook login

### New Features:
- ✨ Facebook SDK auto-loading
- ✨ Login với Facebook account
- ✨ Auto account linking (nếu email đã tồn tại)
- ✨ Error handling đầy đủ
- ✨ Loading states

## 🎯 Next Steps

### Development
- [x] Basic Facebook login
- [x] Frontend integration
- [ ] Add unit tests
- [ ] Add e2e tests

### Production
- [ ] Switch Facebook App to Production mode
- [ ] Update OAuth Redirect URIs với production domain
- [ ] Enable HTTPS
- [ ] App Review (nếu cần permissions cao hơn)

## 📚 Documentation

### Facebook SDK
- [Facebook Login for the Web](https://developers.facebook.com/docs/facebook-login/web)
- [JavaScript SDK Reference](https://developers.facebook.com/docs/javascript)

### Internal Docs
- Backend setup: `BE_DACN_v1/docs/FACEBOOK_LOGIN.md`
- Quick start: `BE_DACN_v1/docs/FACEBOOK_LOGIN_QUICKSTART.md`

## 🔐 Security Notes

### Không commit vào git:
- ❌ `.env.local` (đã trong .gitignore)
- ❌ Access tokens
- ❌ User data

### Best Practices:
- ✅ HTTPS trong production
- ✅ Validate tokens server-side
- ✅ Proper error handling
- ✅ Token refresh logic

## ✨ Features

- **Auto SDK Loading**: Facebook SDK tự động load khi cần
- **Error Handling**: Xử lý đầy đủ các trường hợp lỗi
- **Loading States**: UX tốt với loading indicators
- **Account Linking**: Tự động link với account hiện có
- **Type Safety**: Full TypeScript support

Chúc bạn coding vui vẻ! 🚀
