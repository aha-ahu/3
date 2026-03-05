/*
  ========================================
  SCRIPT.JS - Main Application Logic
  ========================================
  
  Workflow:
  1. Preload video & audio → optimize performance
  2. Wait for user click/tap on clapper button
  3. Play audio + show video (fullscreen)
  4. Wait for video end or timeout 10s
  5. Fade out video & show letter
  6. Typewriter effect on text
  7. Fade in photos
  8. Handle errors & fallbacks gracefully
*/

/* ========================================
   1. CONFIG & SELECTORS
   ======================================== */

// Editable content - Thay đổi nội dung thư tại đây
const LETTER_TEXT = `Gửi người lái đò thầm lặng!
Lời nhắn này đến từ 18 ngôi sao và 1 ngọn cỏ
Đúng như lời cô nói, thời gian trôi
nhanh thật cô nhỉ! Mới ngày nào 
còn chập chững bước vào lớp 10, 
mà giờ tụi em đã đón kỳ 8/3 cuối 
cùng dưới mái trường này cùng cô.
Chúng em chúc cô có một ngày 8/3 
thật ý nghĩa và ấm áp bên người 
thân. Cảm ơn cô đã luôn là người lái 
đò tận tụy, luôn dìu dắt, đưa chúng 
em đi đúng con đường. Dù sắp tới 
đây hành trình này phải tạm khép 
lại, chúng em mong cô luôn dồi dào 
sức khỏe, trẻ trung và mãi cháy hết 
mình với nghề giáo. Chúc cô mọi 
điều tốt đẹp nhất!
We love you and wish you all the best! 🍀
`;

// Timing config
const TIMING = {
  videoTimeout: 10000,    // 10 giây timeout nếu video không ended
  typeSpeed: 45,          // ms per character
  photoShowDelay: 1000,   // Delay before showing photos (ms)
};

// DOM Elements
const elements = {
  clapperButton: document.getElementById('clapperButton'),
  videoWrapper: document.getElementById('videoWrapper'),
  mainVideo: document.getElementById('mainVideo'),
  bgAudio: document.getElementById('bgAudio'),
  letterContainer: document.getElementById('letterContainer'),
  letterText: document.getElementById('letterText'),
  textCursor: document.getElementById('textCursor'),
  letterPhotos: document.getElementById('letterPhotos'),
  unmuteBtnFallback: document.getElementById('unmuteBtnFallback'),
  loadingSpinner: document.getElementById('loadingSpinner'),
};

// State management
let appState = {
  isPlaying: false,       // Đang phát animation sequence
  audioBlocked: false,    // Âm thanh bị trình duyệt chặn (autoplay)
  videoReady: false,      // Video đã load sẵn sàng
  audioReady: false,      // Audio đã load sẵn sàng
};

/* ========================================
   2. PRELOAD ASSETS
   ======================================== */

/**
 * Preload video element
 * Chuẩn bị video sẵn sàng để phát khi cần
 */
function preloadVideo() {
  if (!elements.mainVideo) return Promise.resolve();

  return new Promise((resolve) => {
    // Listener cho sự kiện canplay (đủ dữ liệu để phát)
    const onCanPlay = () => {
      appState.videoReady = true;
      elements.mainVideo.removeEventListener('canplay', onCanPlay);
      elements.mainVideo.removeEventListener('error', onError);
      console.log('✓ Video ready to play');
      resolve();
    };

    const onError = (e) => {
      console.warn('⚠ Video preload error:', e.target.error?.message);
      elements.mainVideo.removeEventListener('canplay', onCanPlay);
      elements.mainVideo.removeEventListener('error', onError);
      // Vẫn resolve để không block UI
      resolve();
    };

    // Set preload attribute
    elements.mainVideo.preload = 'auto';
    elements.mainVideo.addEventListener('canplay', onCanPlay, { once: true });
    elements.mainVideo.addEventListener('error', onError, { once: true });

    // Attempt to load
    elements.mainVideo.load();

    // Timeout - nếu không load trong 5 giây, coi như ready anyway
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

/**
 * Preload audio element
 */
function preloadAudio() {
  if (!elements.bgAudio) return Promise.resolve();

  return new Promise((resolve) => {
    const onCanPlay = () => {
      appState.audioReady = true;
      elements.bgAudio.removeEventListener('canplay', onCanPlay);
      elements.bgAudio.removeEventListener('error', onError);
      console.log('✓ Audio ready to play');
      resolve();
    };

    const onError = (e) => {
      console.warn('⚠ Audio preload error:', e.target.error?.message);
      elements.bgAudio.removeEventListener('canplay', onCanPlay);
      elements.bgAudio.removeEventListener('error', onError);
      resolve();
    };

    elements.bgAudio.preload = 'auto';
    elements.bgAudio.addEventListener('canplay', onCanPlay, { once: true });
    elements.bgAudio.addEventListener('error', onError, { once: true });

    elements.bgAudio.load();

    // Timeout 5 giây
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

/**
 * Khởi chạy preload tất cả assets
 */
async function initializeAssets() {
  console.log('⏳ Preloading assets...');
  try {
    await Promise.all([preloadVideo(), preloadAudio()]);
    console.log('✓ All assets preloaded');
  } catch (error) {
    console.error('Asset preload error:', error);
  }
}

/* ========================================
   3. PLAY SEQUENCE HANDLERS
   ======================================== */

/**
 * Yêu cầu phát audio và xử lý fallback nếu autoplay bị chặn
 * @returns {Promise} resolves khi audio bắt đầu phát hoặc fallback được thiết lập
 */
async function playAudio() {
  if (!elements.bgAudio) return Promise.resolve();

  try {
    // Reset audio về đầu
    elements.bgAudio.currentTime = 0;
    
    // Thử phát
    const playPromise = elements.bgAudio.play();
    
    if (playPromise !== undefined) {
      await playPromise;
      console.log('✓ Audio playing');
      appState.audioBlocked = false;
      return true;
    }
  } catch (error) {
    // Autoplay policy error (thường xảy ra trên iOS/Chrome khi user chưa interact)
    console.warn('⚠ Audio autoplay blocked, showing unmute button:', error.message);
    appState.audioBlocked = true;
    
    // Hiển thị nút fallback để user có thể bật nhạc
    if (elements.unmuteBtnFallback) {
      elements.unmuteBtnFallback.style.display = 'inline-block';
    }
    return false;
  }
}

/**
 * Yêu cầu phát video (playsinline cho iOS)
 */
async function playVideo() {
  if (!elements.mainVideo) return Promise.resolve();

  try {
    elements.mainVideo.currentTime = 0;
    
    const playPromise = elements.mainVideo.play();
    if (playPromise !== undefined) {
      await playPromise;
      console.log('✓ Video playing');
      return true;
    }
  } catch (error) {
    console.error('✗ Video play error:', error.message);
    return false;
  }
}

/**
 * Hiển thị video wrapper bằng cách thay đổi opacity
 * Dùng requestAnimationFrame để đảm bảo smooth transition
 */
function showVideo() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      elements.videoWrapper.classList.add('show');
      resolve();
    });
  });
}

/**
 * Ẩn video wrapper
 */
function hideVideo() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      elements.videoWrapper.classList.add('hide');
      elements.videoWrapper.classList.remove('show');
    });

    // Đợi transition xong
    setTimeout(() => {
      resolve();
    }, 600); // --video-fade-duration
  });
}

/**
 * Đợi video kết thúc hoặc timeout 10s
 * @returns {Promise} resolves khi video ended hoặc timeout
 */
function waitForVideoEnd() {
  return new Promise((resolve) => {
    const onEnded = () => {
      cleanup();
      console.log('✓ Video ended event');
      resolve('ended');
    };

    const cleanup = () => {
      elements.mainVideo.removeEventListener('ended', onEnded);
      clearTimeout(timeoutId);
    };

    // Listener cho event 'ended'
    elements.mainVideo.addEventListener('ended', onEnded, { once: true });

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      cleanup();
      console.log('⏱ Video timeout (10s reached)');
      resolve('timeout');
    }, TIMING.videoTimeout);
  });
}

/* ========================================
   4. LETTER ANIMATION - TYPEWRITER EFFECT
   ======================================== */

/**
 * Gõ máy hiệu ứng - từng chữ xuất hiện
 * Chỉ hiển thị 7 dòng gần nhất (dòng i-6 biến mất khi dòng i xuất hiện, nếu i > 6)
 * @param {string} text - Văn bản cần gõ
 * @returns {Promise} resolves khi gõ xong
 */
function typewriterEffect(text) {
  return new Promise((resolve) => {
    elements.letterText.textContent = '';
    elements.textCursor.classList.add('typing');

    let charIndex = 0;
    const totalChars = text.length;
    const lines = text.split('\n');
    let currentLineIndex = 0;
    let charInLine = 0;
    const maxVisibleLines = 7; // Chỉ hiển thị 7 dòng

    function typeNextChar() {
      if (charIndex < totalChars) {
        const char = text[charIndex];
        
        // Cập nhật vị trí ký tự trong dòng
        if (char === '\n') {
          currentLineIndex++;
          charInLine = 0;
        } else {
          charInLine++;
        }

        // Tính toán phạm vi dòng cần hiển thị
        let startLine = 0;
        if (currentLineIndex >= maxVisibleLines) {
          startLine = currentLineIndex - maxVisibleLines + 1;
        }

        // Tạo text từ các dòng trong phạm vi
        let displayText = '';
        for (let i = startLine; i <= currentLineIndex && i < lines.length; i++) {
          if (i === currentLineIndex) {
            // Dòng hiện tại - hiển thị đến ký tự hiện tại
            let currentLineText = lines[i].substring(0, charInLine);
            displayText += currentLineText;
          } else {
            // Các dòng trước - hiển thị đầy đủ
            displayText += lines[i] + '\n';
          }
        }

        elements.letterText.textContent = displayText;
        charIndex++;

        // Lên lịch chữ kế tiếp
        setTimeout(typeNextChar, TIMING.typeSpeed);
      } else {
        // Xong - ẩn cursor
        elements.textCursor.classList.remove('typing');
        elements.textCursor.classList.add('done');
        resolve();
      }
    }

    // Bắt đầu gõ
    typeNextChar();
  });
}

/**
 * Hiển thị ảnh lớp (photos)
 * Fade in + slide up transition
 */
function showPhotos() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      elements.letterPhotos.classList.add('show');
    });

    // Đợi transition xong
    setTimeout(() => {
      resolve();
    }, 600 + 1000); // --photo-fade-duration + --photo-delay
  });
}

/**
 * Hiển thị letter container (bức thư)
 */
function showLetter() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      elements.letterContainer.classList.add('show');
    });

    // Đợi animation xong
    setTimeout(() => {
      resolve();
    }, 700); // --letter-scale-duration
  });
}

/* ========================================
   5. MAIN PLAY SEQUENCE
   ======================================== */

/**
 * Chuỗi chính: Audio → Video → Wait → Letter
 * Được gọi khi user bấm nút clapper
 */
async function playSequence() {
  // Kiểm tra đang phát rồi
  if (appState.isPlaying) return;
  appState.isPlaying = true;

  try {
    console.log('🎬 Starting play sequence...');

    // Step 1: Ẩn nút clapper
    requestAnimationFrame(() => {
      elements.clapperButton.classList.add('hidden');
    });

    // Step 2: Phát âm thanh (có fallback)
    console.log('🔊 Playing audio...');
    await playAudio();

    // Step 3: Hiển thị video
    console.log('🎥 Showing video...');
    await showVideo();

    // Step 4: Phát video
    await playVideo();

    // Step 5: Đợi video kết thúc hoặc timeout
    console.log('⏳ Waiting for video to end...');
    await waitForVideoEnd();

    // Step 6: Ẩn video
    console.log('🔍 Hiding video...');
    await hideVideo();

    // Step 7: Hiển thị bức thư
    console.log('📄 Showing letter...');
    await showLetter();

    // Step 8: Gõ máy text
    console.log('⌨️ Typing text...');
    await typewriterEffect(LETTER_TEXT);

    // Step 9: Hiển thị ảnh
    console.log('📸 Showing photos...');
    await showPhotos();

    console.log('✨ Sequence completed!');
  } catch (error) {
    console.error('✗ Play sequence error:', error);
  } finally {
    appState.isPlaying = false;
  }
}

/* ========================================
   6. EVENT LISTENERS & INITIALIZATION
   ======================================== */

/**
 * Fallback: Nút unmute - cho phép user bật nhạc nếu autoplay bị chặn
 */
if (elements.unmuteBtnFallback) {
  elements.unmuteBtnFallback.addEventListener('click', async () => {
    if (elements.bgAudio) {
      try {
        await elements.bgAudio.play();
        console.log('✓ Audio resumed via unmute button');
        elements.unmuteBtnFallback.style.display = 'none';
      } catch (error) {
        console.error('✗ Unmute failed:', error);
      }
    }
  });
}

/**
 * Main: Nút clapper - khởi động sequence
 * Hỗ trợ click, tap, Enter, Space
 */
if (elements.clapperButton) {
  // Click/Tap
  elements.clapperButton.addEventListener('click', (e) => {
    e.preventDefault();
    playSequence();
  });

  // Keyboard: Enter / Space
  elements.clapperButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playSequence();
    }
  });

  // Accessibility: Make sure button is focusable
  elements.clapperButton.addEventListener('focus', () => {
    console.log('Button focused - ready for keyboard input');
  });
}

/**
 * Window DOMContentLoaded - khởi tạo ứng dụng
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Application initialized');
  console.log('📝 Editable text:', LETTER_TEXT);
  
  // Preload assets - không block UI, chạy async
  initializeAssets();

  // Log state
  setTimeout(() => {
    console.log('📊 App State:', {
      videoReady: appState.videoReady,
      audioReady: appState.audioReady,
      audioBlocked: appState.audioBlocked,
    });
  }, 1000);
});

/**
 * Window beforeunload - cleanup (optional)
 */
window.addEventListener('beforeunload', () => {
  if (elements.mainVideo) {
    elements.mainVideo.pause();
    elements.mainVideo.currentTime = 0;
  }
  if (elements.bgAudio) {
    elements.bgAudio.pause();
    elements.bgAudio.currentTime = 0;
  }
});

/* ========================================
   7. UTILITIES & HELPERS
   ======================================== */

/**
 * Hủy video nếu phát lỗi
 */
if (elements.mainVideo) {
  elements.mainVideo.addEventListener('error', (e) => {
    const error = e.target.error;
    console.error('✗ Video error:', {
      code: error?.code,
      message: error?.message,
    });
    // Fallback: tự động chuyển tới letter nếu video lỗi
    if (appState.isPlaying) {
      hideVideo().then(() => {
        showLetter();
      });
    }
  });
}

/**
 * Hủy audio nếu phát lỗi
 */
if (elements.bgAudio) {
  elements.bgAudio.addEventListener('error', (e) => {
    const error = e.target.error;
    console.warn('⚠ Audio error:', {
      code: error?.code,
      message: error?.message,
    });
    // Không block - video tiếp tục phát mà không âm thanh
  });
}

/* ========================================
   8. RESPONSIVE & MOBILE OPTIMIZATION
   ========================================

   Lưu ý:
   - Lazyload: assets preload ngay khi DOM ready
   - Touch: all buttons use touch-action: manipulation
   - Viewport: responsive với CSS variables & media queries
   - Network: preload + graceful degradation nếu asset không tải

   Tối ưu hiệu năng:
   - requestAnimationFrame cho class changes
   - will-change CSS cho animated elements
   - Không reflow/repaint - dùng transform & opacity
   - Cleanup handlers (removeEventListener khi xong)
*/

console.log('✓ Script loaded');
