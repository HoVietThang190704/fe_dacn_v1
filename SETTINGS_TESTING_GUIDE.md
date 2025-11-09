# Settings Page Testing Guide

## Manual Testing Steps

### 1. Initial Load
- [ ] Navigate to Settings page
- [ ] Verify loading spinner appears
- [ ] Verify user data loads correctly
- [ ] Check if avatar displays (or initials if no avatar)
- [ ] Verify all user info is displayed correctly

### 2. Profile Display
**Check these fields:**
- [ ] Name
- [ ] Username
- [ ] Email
- [ ] Phone number
- [ ] Birth date (formatted as dd/mm/yyyy)
- [ ] Gender (in Vietnamese)
- [ ] Address
- [ ] Role badge
- [ ] Verification badge (if verified)
- [ ] Created date

### 3. Edit Profile Popup

#### Opening Popup
- [ ] Click "Chỉnh sửa" button
- [ ] Popup appears with fadeIn animation
- [ ] Popup content slides up
- [ ] Form is pre-filled with current user data

#### Avatar Upload
- [ ] Click camera icon on avatar
- [ ] File picker opens
- [ ] Select an image file
- [ ] Preview appears immediately
- [ ] Try uploading file > 5MB (should show error)
- [ ] Try uploading non-image file (should show error)

#### Form Fields
- [ ] Edit name field
- [ ] Edit phone field
- [ ] Edit birth date
- [ ] Change gender dropdown
- [ ] Edit address (textarea)
- [ ] Verify email is read-only (grayed out)
- [ ] Verify username is read-only (grayed out)
- [ ] Verify role is read-only (grayed out)

#### Validation
- [ ] Clear name field and try to submit (button should be disabled)
- [ ] Enter valid name (button should be enabled)

#### Submit
- [ ] Click "Lưu thay đổi" button
- [ ] Loading spinner appears on button
- [ ] Button text changes to "Đang lưu..."
- [ ] Button is disabled during loading
- [ ] Success alert appears
- [ ] Popup closes automatically
- [ ] Profile section updates with new data

#### Cancel
- [ ] Make changes to form
- [ ] Click "Hủy" button
- [ ] Popup closes
- [ ] Changes are discarded
- [ ] Original data is preserved

#### Close via X
- [ ] Make changes to form
- [ ] Click X button (top right)
- [ ] Popup closes
- [ ] Changes are discarded

### 4. Error Handling

#### Network Error
- [ ] Disconnect internet
- [ ] Try to load page
- [ ] Error message appears
- [ ] "Thử lại" button is available
- [ ] Click "Thử lại"
- [ ] Reconnect internet
- [ ] Data loads successfully

#### API Error
- [ ] Mock API to return 500 error
- [ ] Try to update profile
- [ ] Error alert appears
- [ ] Popup remains open
- [ ] User can retry

### 5. Responsive Design

#### Desktop (>1024px)
- [ ] Avatar is 120x120px
- [ ] Two-column grid for info
- [ ] Popup is centered with max-width

#### Tablet (768-1023px)
- [ ] Layout adjusts properly
- [ ] Form remains usable

#### Mobile (<768px)
- [ ] Avatar centered
- [ ] Single column layout
- [ ] Popup takes full width with padding
- [ ] Form fields are touch-friendly
- [ ] Buttons are easily tappable

### 6. Accessibility
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Can submit form with Enter key
- [ ] Can close popup with Escape key (if implemented)
- [ ] Screen reader announces all elements correctly

### 7. Performance
- [ ] Page loads in < 2 seconds
- [ ] No layout shift when data loads
- [ ] Smooth animations (60fps)
- [ ] Avatar preview loads instantly
- [ ] Form submission completes in < 1 second

---

## API Testing

### GET /api/users/me/profile
```bash
curl -X GET http://localhost:5000/api/users/me/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "userName": "johndoe",
    "phone": "0123456789",
    "avatar": "http://...",
    "address": "123 Street, City",
    "gender": "male",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/users/me/profile
```bash
curl -X PUT http://localhost:5000/api/users/me/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "phone": "0987654321",
    "address": "456 New Street",
    "gender": "male",
    "birthDate": "1990-01-01"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    // Updated user object
  }
}
```

### POST /api/users/me/avatar
```bash
curl -X POST http://localhost:5000/api/users/me/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    // User object with updated avatar URL
  }
}
```

---

## Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Animations smooth

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Animations smooth

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Animations smooth
- [ ] File upload works

---

## Known Issues / Limitations

1. **Avatar Upload**
   - Max file size: 5MB
   - Supported formats: image/* (jpg, png, gif, webp)
   - No cropping functionality yet

2. **Form Validation**
   - Only name is required
   - Phone number format not validated
   - Date picker might not work on older browsers

3. **Error Messages**
   - Using browser alerts (should use toast notifications)

---

## Test Data

### Valid User Data
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0123456789",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "gender": "male",
  "birthDate": "1990-01-01"
}
```

### Invalid User Data
```json
{
  "name": "",  // Should fail
  "phone": "invalid",  // Currently accepted
  "address": "",  // Currently accepted
  "gender": "invalid",  // Should fail
  "birthDate": "invalid"  // Should fail
}
```

---

## Testing Checklist Summary

- [ ] Initial load works
- [ ] Profile displays correctly
- [ ] Edit popup opens/closes
- [ ] Avatar upload works
- [ ] Form validation works
- [ ] Submit updates profile
- [ ] Cancel discards changes
- [ ] Error handling works
- [ ] Responsive on all devices
- [ ] Accessible
- [ ] Performant
- [ ] All APIs work correctly
- [ ] Works on all major browsers

---

**Note**: Update this document as new features are added or issues are discovered.
