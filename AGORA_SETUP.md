# Agora Livestream Setup Guide (SDK v4+)

## 1. Tạo Agora Account và Project

1. Truy cập https://console.agora.io/
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Tạo project mới:
   - Click "Create Project"
   - Đặt tên project (ví dụ: "FreshFood Livestream")
   - Chọn "Secure mode: APP ID + Token" (recommended for production)

## 2. Lấy App ID

1. Trong project dashboard, copy **App ID**
2. Thay thế `'your-app-id'` trong code bằng App ID thực tế

## 3. Cấu hình Token Authentication (Production)

### Bước 1: Enable App Certificate
1. Trong project settings, enable "Primary Certificate"
2. Copy **App Certificate**

### Bước 2: Tạo Token Server-side (Agora SDK v4+)
```javascript
// Sử dụng Agora SDK v4+ để tạo token
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const appId = 'your-app-id';
const appCertificate = 'your-app-certificate';
const channelName = `livestream-${livestreamId}`;
const uid = 0; // Host = 0, Audience = random number
const role = RtcRole.PUBLISHER; // or SUBSCRIBER for viewers
const expirationTimeInSeconds = 3600; // 1 hour

const token = RtcTokenBuilder.buildTokenWithUid(
  appId,
  appCertificate,
  channelName,
  uid,
  role,
  expirationTimeInSeconds
);
```

### Bước 3: Sử dụng Token trong Client
```javascript
// Host (Publisher)
await client.join(appId, channelName, token, 0);

// Viewer (Subscriber)
await client.join(appId, channelName, token, null); // uid = null for auto-assignment
```

## 4. API Changes in SDK v4+

### Old API (v3.x):
```javascript
// Create stream
const stream = AgoraRTC.createStream({ audio: true, video: true });
await stream.init();
stream.play('video-element');
await client.publish(stream);
```

### New API (v4+):
```javascript
// Create tracks separately
const [audioTrack, videoTrack] = await Promise.all([
  AgoraRTC.createMicrophoneAudioTrack(),
  AgoraRTC.createCameraVideoTrack()
]);

// Publish tracks
await client.publish([audioTrack, videoTrack]);

// Play video
videoTrack.play('video-element');
```

### Event Handlers:
```javascript
// Old events
client.on('stream-added', ...)
client.on('stream-subscribed', ...)

// New events
client.on('user-published', async (user, mediaType) => {
  await client.subscribe(user, mediaType);
  if (mediaType === 'video') {
    user.videoTrack.play(`remote-video-${user.uid}`);
  }
});
```

## 4. Troubleshooting

### Lỗi thường gặp:

1. **"PERMISSION_DENIED"**
   - Browser chưa cấp quyền camera/microphone
   - Kiểm tra HTTPS (required for camera access)

2. **"INVALID_APP_ID"**
   - App ID không đúng
   - Kiểm tra có khoảng trắng hoặc ký tự đặc biệt

3. **"DEVICES_NOT_FOUND"**
   - Không tìm thấy camera/microphone
   - Kiểm tra thiết bị đã kết nối

4. **Network Issues**
   - Kiểm tra firewall không block WebRTC ports
   - Sử dụng HTTPS

### Debug Tips:
- Mở Developer Console (F12) để xem lỗi chi tiết
- Kiểm tra Network tab xem có requests đến Agora servers
- Test với https://webdemo.agora.io/ trước

## 5. Security Best Practices

1. **Luôn sử dụng Token Authentication** trong production
2. **Validate channel names** server-side
3. **Implement user authentication** trước khi join stream
4. **Use HTTPS** cho tất cả livestream pages
5. **Monitor stream usage** trong Agora Console

## 6. Performance Optimization

1. **Video Quality Settings**:
```javascript
const stream = AgoraRTC.createStream({
  streamID: 0,
  audio: true,
  video: true,
  screen: false,
  videoProfile: '480p_1' // Adjust based on network
});
```

2. **Bandwidth Management**:
   - Monitor connection quality
   - Auto-adjust video quality
   - Implement reconnection logic

3. **Multiple Stream Handling**:
   - Limit concurrent streams
   - Implement stream prioritization</content>
<parameter name="filePath">d:\DACN\fe_dacn_v1\AGORA_SETUP.md