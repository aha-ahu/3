# 🎬 Web App: Chúc Cô 8/3 (Clapperboard + Video + Letter)

Một ứng dụng web một trang (SPA) mobile-first được thiết kế để gửi lời chúc ngày 8/3 với hiệu ứng mượt mà và trải nghiệm tương tác.

---

## 📋 Cấu Trúc Dự Án

```
project/
├── index.html        # Markup & semantic HTML
├── styles.css        # Responsive CSS + animations
├── script.js         # Logic & event handling
├── video.mp4         # Video chính (~10s)
├── music.mp3         # Audio nền
├── letter.jpg        # Ảnh bìa thư (tùy chọn)
├── class-photo-1.jpg # Ảnh lớp 1
├── class-photo-2.jpg # Ảnh lớp 2
└── README.md         # Tài liệu này
```

---

## 🎯 Tính Năng Chính

✅ **Mobile-First Responsive Design**
   - Tối ưu cho màn hình dọc (portrait) ≤ 480px
   - Responsive tablet (481-768px) và desktop (769px+)
   - Dùng CSS variables cho dễ bảo trì

✅ **Clapperboard Button**
   - SVG icon với animation pulse
   - Gradient background + shadow hiện đại
   - Accessible (aria-label, keyboard support)

✅ **Video Fullscreen**
   - Phủ toàn màn hình (cover)
   - playsinline cho iOS (không native fullscreen)
   - Preload auto để giảm jank
   - Fade out smooth (600ms)

✅ **Audio Sync**
   - Phát ngay khi click (sau khi browser cho phép)
   - Fallback: nút "Bật nhạc" nếu autoplay bị chặn
   - Support .mp3 & .ogg

✅ **Letter + Typewriter**
   - Fade in + scale animation
   - Gõ máy hiệu ứng (theo từng chữ)
   - Hiển thị ảnh lớp sau khi gõ xong
   - Mền đủ contrast cho accessibility

✅ **GPU-Accelerated Animations**
   - Chỉ dùng `transform` & `opacity`
   - Không reflow/repaint
   - will-change được set hợp lý
   - Smooth 60fps trên mobile

✅ **Error Handling & Fallback**
   - Preload assets (timeout 5s)
   - Video lỗi? → chuyển thẳng tới letter
   - Audio lỗi? → bật nút unmute
   - Video timeout? → auto jump sau 10s

✅ **Accessibility**
   - Semantic HTML (button, aria-label)
   - Keyboard support (Enter/Space)
   - Đủ contrast (WCAG AA)
   - Support prefers-reduced-motion
   - Dark mode support

---

## 🚀 Cách Sử Dụng

### 1. Chuẩn Bị Assets

#### Video (video.mp4)
- **Format:** H.264 (AVC), MP4 container
- **Độ dài:** ~10 giây
- **Độ phân giải:** 1080x1920 (9:16 portrait) hoặc tùy ý (sẽ scale cover)
- **Bitrate:** 2000-4000 kbps (balance giữa chất lượng & size)
- **Recommendation:** ffmpeg command:
  ```bash
  ffmpeg -i input.mov -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 128k -pix_fmt yuv420p video.mp4
  ```

#### Audio (music.mp3)
- **Format:** MP3 (CBR 128-192 kbps) hoặc OGG
- **Độ dài:** Bất kỳ (script sẽ stop khi video kết thúc)
- **Recommendation:** ffmpeg:
  ```bash
  ffmpeg -i input.mp3 -q:a 5 output.mp3
  ```

#### Hình ảnh (letter.jpg, class-photo-1.jpg, class-photo-2.jpg)
- **Format:** JPEG (tốc độ tốt) hoặc PNG (tính minh bạch)
- **Kích thước:** 
  - letter.jpg: ~400x300px (tỉ lệ 4:3)
  - class-photo-*.jpg: ~200x200px (vuông)
- **Optimization:**
  ```bash
  jpegoptim --max=80 image.jpg
  optipng image.png
  ```

### 2. Chỉnh Sửa Nội Dung Text

Mở `script.js`, tìm dòng:
```javascript
const LETTER_TEXT = `Kính gửi Cô,

Cảm ơn cô đã cùng chúng em suốt 3 năm. Chúc cô 8/3 thật nhiều niềm vui và sức khỏe.`;
```

Thay đoạn text bằng nội dung của bạn. Hỗ trợ:
- Line breaks (\n)
- Ký tự đặc biệt
- Unicode (emoji nếu muốn)

### 3. Tùy Chỉnh Timing

Mở `script.js`, đoạn `TIMING`:
```javascript
const TIMING = {
  videoTimeout: 10000,    // ms - timeout nếu video không ended
  typeSpeed: 45,          // ms - tốc độ gõ máy (càng nhỏ càng nhanh)
  photoShowDelay: 1000,   // ms - delay trước khi show ảnh
};
```

Hoặc chỉnh CSS variables trong `styles.css`:
```css
:root {
  --fade-duration: 500ms;
  --video-fade-duration: 600ms;
  --typewriter-speed: 45ms;
  --letter-scale-duration: 700ms;
  --photo-delay: 1000ms;
  --photo-fade-duration: 600ms;
}
```

### 4. Tùy Chỉnh Màu Sắc

Trong `styles.css`, sửa CSS variables:
```css
:root {
  --primary-color: #ff69b4;       /* Màu nút & accent */
  --primary-dark: #ff1493;         /* Gradient đậm */
  --text-color: #333;              /* Chữ */
  --bg-color: #fef5f9;             /* Background nhạt */
  --accent-color: #ffb3d9;         /* Emphasize */
  --spinner-color: #ff69b4;        /* Spinner */
}
```

### 5. Deploy

#### Cách 1: Netlify/Vercel (Recommended)
```bash
# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=.

# Vercel
npm install -g vercel
vercel prod
```

#### Cách 2: GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/project.git
git push -u origin main
```
→ Enable Pages từ GitHub → Chọn branch `main`

#### Cách 3: Local Server (Testing)
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# Nginx / Apache
# Copy files vào document root
```

---

## 🔧 Kỹ Thuật Nâng Cao

### Preload Strategy
- Assets được preload ngay trong `DOMContentLoaded`
- Timeout 5s mỗi asset (không block UI)
- Status được log trong browser console

### Event Sequence
1. User click clapper button → `playSequence()`
2. Button fade out
3. `playAudio()` → phát nhạc (fallback: show unmute button)
4. `showVideo()` → display: visible + opacity: 1
5. `playVideo()` → video play
6. `waitForVideoEnd()` → race giữa event 'ended' + timeout 10s
7. `hideVideo()` → fade out video
8. `showLetter()` → letter scale in
9. `typewriterEffect()` → chữ từ từ xuất hiện
10. `showPhotos()` → ảnh fade in + slide up

### CSS GPU Acceleration
- **transform**: translateX, translateY, scale, rotate → GPU ✅
- **opacity**: thay đổi trong transition → GPU ✅
- **width/height/top/left**: KHÔNG dùng trong animation ❌

### Accessibility Checklist
- ✅ Semantic HTML (button, img alt, lang)
- ✅ aria-label trên interactive elements
- ✅ Keyboard support (Enter, Space)
- ✅ Color contrast ≥ 4.5:1 (WCAG AA)
- ✅ Focus visible outline
- ✅ Respect prefers-reduced-motion

---

## 🐛 Troubleshooting

### Video không phát
- Kiểm tra format: H.264 video codec, yuv420p pixel format
- Kiểm tra CORS: nếu từ server khác, cần CORS header
- Log console: xem error message

### Audio không phát / autoplay bị chặn
- **iOS Safari**: cần user interaction trước (click/tap) ✓ (script đã handle)
- **Chrome**: autoplay policy - cần muted hoặc user gesture ✓ (script fallback)
- Nếu vẫn không phát: show nút "Bật nhạc" fallback

### Video không full screen / playsinline không work
- playsinline attribute đặt rồi, nhưng cần user interaction (click button)
- iOS: check Settings → Safari → Video Autoplay
- Android: hầu hết browsers support playsinline

### Cảnh tiếp không mượt / có jank
- Check browser DevTools → Performance tab
- Tìm long tasks, reflow, repaint
- Confirm: chỉ transform & opacity được dùng (not width/height)
- Check will-change: set hợp lý (không overuse)

### Assets trong folder con / subfolder
- Update `src` trong HTML:
  ```html
  <video src="assets/video.mp4"></video>
  <audio src="assets/music.mp3"></audio>
  <img src="assets/letter.jpg" />
  ```

---

## 📊 Browser Support

| Browser | Mobile | Desktop | Notes |
|---------|--------|---------|-------|
| Apple Safari | ✅ iOS 12+ | ✅ | playsinline required |
| Chrome | ✅ 60+ | ✅ | Autoplay policy: cần user gesture |
| Firefox | ✅ 55+ | ✅ | Full support |
| Samsung Internet | ✅ 8+ | — | Mobile only |
| Edge | ✅ | ✅ | Chromium-based |

---

## 📈 Performance Tips

1. **Compress Assets**
   ```bash
   # Video
   HandBrakeCLI -i input.mov -c x264 -q 20 -E aac output.mp4
   
   # Audio
   ffmpeg -i input.mp3 -b:a 128k -ac 2 output.mp3
   
   # Images
   tinypng.com (online)
   optipng + jpegoptim (CLI)
   ```

2. **Preload Optimize**
   - Video/audio: preload="auto"
   - Check Network tab → measure DL time
   - Aim: ≤ 1MB (WiFi), ≤ 500KB (mobile 4G)

3. **Bundle Size**
   - HTML: ~3KB
   - CSS: ~8KB
   - JS: ~8KB
   - Total: ~19KB (before assets)

4. **Caching**
   - Set cache headers: max-age=31536000 cho assets
   - Service Worker? (optional, tự implement nếu cần)

---

## 🎨 Customization Examples

### Đổi kiểu nút
Sửa `.clapper-button` trong CSS:
```css
.clapper-button {
  border-radius: 8px;  /* Vuông bo tròn */
  /* ... */
}
```

### Đổi font
HTML:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet">
```

CSS:
```css
body {
  font-family: 'Playfair Display', serif;
}
```

### Thêm custom animation
Styles.css:
```css
@keyframes my-animation {
  from { ... }
  to { ... }
}

.element {
  animation: my-animation 1s ease-out;
}
```

---

## 📝 Changelog

### v1.0 (2026-03-04)
- Initial release
- Mobile-first design
- Video + Audio + Letter sequence
- Typewriter effect
- Fallback for autoplay policy
- Accessibility support

---

## 📄 License

Dùng tự do cho mục đích cá nhân và giáo dục.

---

## 💡 Tips & Tricks

1. **Test trên thiết bị thực** - emulator không 100% giống
2. **Kiểm tra Network tab** - xem asset load time
3. **Dùng DevTools Performance** - check jank & bottleneck
4. **Sound test trên mute mode** - iOS often starts muted
5. **Try different video formats** - fallback .webm nếu cần

---

## 🆘 Support

Nếu gặp vấn đề:
1. Check browser console → F12
2. Xem console logs (script log chi tiết)
3. Kiểm tra file assets có tồn tại
4. Test trên browser khác
5. Clear cache: Ctrl+Shift+R (hard refresh)

---

## ✨ Credits

Xây dựng với vanilla HTML/CSS/JS (không dùng framework).

Happy coding! 🚀
