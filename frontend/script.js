'use strict';

/* NAVBAR  */
const navbar    = document.getElementById('navbar');
const menuBtn   = document.getElementById('menuBtn');
const navLinks  = document.getElementById('navLinks');

// Scrolled shadow
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile toggle
menuBtn?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
  const icon = menuBtn.querySelector('i');
  if (icon) icon.className = navLinks.classList.contains('open')
    ? 'fas fa-times'
    : 'fas fa-bars';
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (navLinks?.classList.contains('open') &&
      !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
    navLinks.classList.remove('open');
    const icon = menuBtn?.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
  }
});

/* ── SMOOTH SCROLL ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile menu if open
      navLinks?.classList.remove('open');
    }
  });
});

/* ── ACTIVE NAV LINK ─────────────────────────────────────── */
const sections = document.querySelectorAll('section[id], header[id]');
const links    = document.querySelectorAll('.nav-link');

function setActiveLink() {
  const scrollY = window.pageYOffset + 100;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const id     = sec.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
}
window.addEventListener('scroll', setActiveLink, { passive: true });

/* ── SCROLL REVEAL ───────────────────────────────────────── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

/* ── HERO ENTRANCE ───────────────────────────────────────── */
window.addEventListener('load', () => {
  document.querySelectorAll('.hero-content, .hero-visual').forEach((el, i) => {
    el.style.cssText = `opacity:0;transform:translateY(32px);transition:opacity .8s ease ${i*0.18}s,transform .8s var(--ease, cubic-bezier(.16,1,.3,1)) ${i*0.18}s;`;
  });
  setTimeout(() => {
    document.querySelectorAll('.hero-content, .hero-visual').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 120);
});


/* ── CAMERA ACCESS ───────────────────────────────────────── */
let stream = null;

async function openCamera() {
  console.log('openCamera called');
  const preview  = document.getElementById('cameraPreview');
  const video    = document.getElementById('video');
  const btn      = document.getElementById('openCamBtn');
  const captured = document.getElementById('capturedImage');
  if (!preview || !video) return;

  // Hide previous result
  if (captured) captured.style.display = 'none';
  hideCameraError();

  // Check if getUserMedia is even available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError(
      'Camera API not available.',
      'Your browser does not support camera access, or this page must be served over <strong>HTTPS / localhost</strong> (not file://). Use the upload option below instead.'
    );
    return;
  }

  try {
    // Try rear camera first, fall back to any camera
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    video.srcObject = stream;
    await video.play();
    preview.style.display = 'block';
    if (btn) btn.style.display = 'none';

  } catch (err) {
    let title = 'Camera Error';
    let msg   = 'An unknown error occurred.';

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      title = 'Camera Permission Denied';
      msg   = 'Please allow camera access in your browser settings, then try again.<br><br>' +
              '<strong>Chrome:</strong> Click the 🔒 icon in the address bar → Site settings → Camera → Allow.<br>' +
              '<strong>Firefox:</strong> Click the camera icon in the address bar and select Allow.<br><br>' +
              'Or use the <strong>Upload Image</strong> button below instead.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      title = 'No Camera Found';
      msg   = 'No camera device was detected on this device. Use the <strong>Upload Image</strong> button below.';
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      title = 'Camera In Use';
      msg   = 'Your camera is being used by another application. Close it and try again.';
    } else if (location.protocol === 'file:') {
      title = 'HTTPS Required';
      msg   = 'Camera access is blocked on <code>file://</code> pages. Serve this project via a local server (e.g. <code>python -m http.server</code>) or deploy to HTTPS. Use <strong>Upload Image</strong> below as an alternative.';
    }

    showCameraError(title, msg);
  }
}

function showCameraError(title, msg) {
  let box = document.getElementById('cameraError');
  if (!box) {
    box = document.createElement('div');
    box.id = 'cameraError';
    box.style.cssText = `
      margin-top:14px; padding:16px 18px; border-radius:12px;
      background:rgba(255,91,110,0.08); border:1px solid rgba(255,91,110,0.3);
      font-size:0.85rem; line-height:1.65; color:#f0f5f1;
    `;
    const btn = document.getElementById('openCamBtn');
    if (btn) btn.after(box);
  }
  box.innerHTML = `
    <div style="font-weight:700;color:#ff5b6e;margin-bottom:6px;">
      <i class="fas fa-exclamation-circle" style="margin-right:6px;"></i>${title}
    </div>
    <div style="color:#9db5a3;">${msg}</div>
    <div style="margin-top:12px;">
      <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;
        background:rgba(16,212,102,0.1);border:1px solid rgba(16,212,102,0.3);
        padding:8px 16px;border-radius:50px;font-size:0.82rem;font-weight:600;color:#10d466;
        transition:all .2s;">
        <i class="fas fa-upload"></i> Upload Image Instead
        <input type="file" accept="image/*" capture="environment"
               style="display:none;" onchange="handleFileUpload(this)">
      </label>
    </div>
  `;
  box.style.display = 'block';
}

function hideCameraError() {
  const box = document.getElementById('cameraError');
  if (box) box.style.display = 'none';
}

function handleFileUpload(input) {
  console.log('handleFileUpload called');
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgEl    = document.getElementById('capturedImg');
    const captured = document.getElementById('capturedImage');
    const canvas   = document.getElementById('canvas');
    const btn      = document.getElementById('openCamBtn');

    // Draw to canvas so analyzeImage can read it
    const img = new Image();
    img.onload = () => {
      canvas.width  = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
    };
    img.src = e.target.result;

    if (imgEl)    imgEl.src = e.target.result;
    if (captured) captured.style.display = 'block';
    if (btn)      btn.style.display = 'none';
    hideCameraError();
    analyzeImage();
  };
  reader.readAsDataURL(file);
}

function captureImage() {
  const video    = document.getElementById('video');
  const canvas   = document.getElementById('canvas');
  const captured = document.getElementById('capturedImage');
  const imgEl    = document.getElementById('capturedImg');
  const preview  = document.getElementById('cameraPreview');
  if (!video || !canvas) return;

  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  if (imgEl)    imgEl.src = dataUrl;
  if (captured) captured.style.display = 'block';
  if (preview)  preview.style.display  = 'none';

  closeStream();
  analyzeImage();
}

function closeCamera() {
  const preview = document.getElementById('cameraPreview');
  const btn     = document.getElementById('openCamBtn');
  if (preview) preview.style.display = 'none';
  if (btn)     btn.style.display = 'inline-flex';
  closeStream();
}

function retakePhoto() {
  const captured = document.getElementById('capturedImage');
  if (captured) captured.style.display = 'none';
  hideCameraError();
  openCamera();
}

function closeStream() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}

/* ── AI DISEASE ANALYSIS ─────────────────────────────────── */
const API_SERVER = (() => {
  if (location.protocol.startsWith('http')) {
    return `${location.protocol}//${location.hostname}:5000`;
  }
  return 'http://127.0.0.1:5000';
})();

async function analyzeImage() {
  console.log('analyzeImage called');
  const canvas     = document.getElementById('canvas');
  const analyzing  = document.getElementById('analyzing');
  const result     = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const confidence = document.getElementById('confidence');
  if (!canvas) return;

  const imageBase64 = canvas.toDataURL('image/jpeg', 0.92);
  if (analyzing) { analyzing.style.display = 'flex'; analyzing.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysing with AI…'; }
  if (result)    { result.style.display = 'none'; }

  try {
    const response = await fetch(`${API_SERVER}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error (HTTP ${response.status})`);
    }
    const data = await response.json();

    if (analyzing) analyzing.style.display = 'none';
    if (result)    result.style.display    = 'block';

    const label = data.disease || 'Unknown';
    const isHealthy = label.toLowerCase().includes('normal');

    if (resultText) {
      resultText.textContent = label;
      resultText.style.color = isHealthy ? 'var(--green)' : 'var(--rose)';
    }
    if (confidence) confidence.textContent = (data.confidence != null ? data.confidence : '—') + '%';

    // Show all-predictions breakdown if available
    showAllPredictions(data.all_predictions);
    showIotContext(data.iot);

  } catch (err) {
    if (analyzing) analyzing.style.display = 'none';
    if (result)    result.style.display    = 'block';

    const isNetworkErr = err instanceof TypeError && err.message.includes('fetch');
    if (resultText) {
      resultText.innerHTML = isNetworkErr
        ? '⚠️ Cannot reach AI server.<br><small style="font-size:0.78rem;color:var(--text-3)">Make sure <code>app.py</code> is running:<br><code>python app.py</code></small>'
        : `⚠️ ${err.message}`;
      resultText.style.color = 'var(--amber)';
    }
    if (confidence) confidence.textContent = '—';
  }
}

function showIotContext(iot) {
  const result = document.getElementById('result');
  if (!result || !iot) return;

  let box = document.getElementById('iotContext');
  if (!box) {
    box = document.createElement('div');
    box.id = 'iotContext';
    box.style.cssText = 'margin-top:10px;font-size:0.74rem;color:var(--text-3);line-height:1.5;';
    result.appendChild(box);
  }

  if (!iot.connected || !iot.latest) {
    box.textContent = 'IoT link: no recent sensor data from backend.';
    return;
  }

  const t = iot.latest.temperature;
  const h = iot.latest.humidity;
  const s = iot.latest.soil_moisture;
  box.textContent = `IoT link: Temp ${t ?? '--'} C, Humidity ${h ?? '--'}%, Soil ${s ?? '--'}%.`;
}

function showAllPredictions(preds) {
  if (!preds) return;
  let box = document.getElementById('allPreds');
  if (!box) {
    box = document.createElement('div');
    box.id = 'allPreds';
    box.style.cssText = 'margin-top:12px;font-size:0.75rem;color:var(--text-3);display:grid;gap:4px;';
    const result = document.getElementById('result');
    if (result) result.appendChild(box);
  }
  box.innerHTML = Object.entries(preds)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, pct]) => `
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="flex:1;font-size:0.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</div>
        <div style="width:80px;height:4px;border-radius:2px;background:rgba(255,255,255,0.06);overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:var(--green);border-radius:2px;"></div>
        </div>
        <div style="width:36px;text-align:right;">${pct}%</div>
      </div>`)
    .join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setNumeric(id, value, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  if (value == null || Number.isNaN(value)) {
    el.textContent = '--';
    return;
  }
  el.textContent = `${Number(value).toFixed(1)}${suffix}`;
}

function updateIotConnection(connected) {
  const badge = document.getElementById('iotConnectionBadge');
  if (!badge) return;
  badge.innerHTML = connected
    ? '<i class="fas fa-circle"></i> Backend Connected'
    : '<i class="fas fa-circle"></i> Waiting for ESP32';
  badge.classList.toggle('live', connected);
}

function renderIotAlerts(alerts) {
  const box = document.getElementById('iotAlerts');
  if (!box) return;
  if (!Array.isArray(alerts) || alerts.length === 0) {
    box.innerHTML = '<div class="notif-item"><div class="notif-text"><p>No alerts yet</p></div></div>';
    return;
  }

  box.innerHTML = alerts.map((item) => {
    const dotClass = item.severity === 'critical'
      ? 'err'
      : item.severity === 'warn'
        ? 'warn'
        : 'ok';
    return `
      <div class="notif-item">
        <div class="notif-dot ${dotClass}"></div>
        <div class="notif-text">
          <p>${item.message}</p>
          <div class="notif-time">${item.type}</div>
        </div>
      </div>`;
  }).join('');
}

async function refreshIotData() {
  const loading = document.getElementById('iotLoading');
  if (loading) loading.style.display = 'block';

  try {
    const response = await fetch(`${API_SERVER}/iot/data`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    setNumeric('tempValue', data.temperature, ' C');
    setNumeric('humidityValue', data.humidity, '%');
    setNumeric('soilValue', data.soil_moisture, '%');
    setNumeric('lightValue', data.light, '%');
    setText('deviceId', data.device_id || '--');
    setText('cameraIp', data.camera_url || '--');
    setText('lastSensorUpdate', data.updated_at ? new Date(data.updated_at).toLocaleString() : '--');

    updateIotConnection(Boolean(data.connected));
    renderIotAlerts(data.alerts);

    const frame = document.getElementById('cameraFrame');
    if (frame && data.camera_url && frame.src !== data.camera_url) {
      frame.src = data.camera_url;
    }
    const openCameraBtn = document.getElementById('openCameraBtn');
    if (openCameraBtn && data.camera_url) openCameraBtn.href = data.camera_url;
    const fullResolutionBtn = document.getElementById('fullResolutionBtn');
    if (fullResolutionBtn && data.camera_url) fullResolutionBtn.href = data.camera_url;
  } catch (err) {
    updateIotConnection(false);
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

/* ── NOTIFICATIONS TOGGLE ────────────────────────────────── */
function toggleNotifs() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  const isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    panel.style.animation = 'none';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(-8px)';
    requestAnimationFrame(() => {
      panel.style.transition = 'opacity .25s ease, transform .25s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    });
  }
}
// Legacy alias
function showNotifications() { toggleNotifs(); }

/* ── IOT CAMERA REFRESH ──────────────────────────────────── */
function refreshCamera() {
  const frame = document.getElementById('cameraFrame');
  if (frame) {
    const src = frame.src;
    frame.src = '';
    setTimeout(() => { frame.src = src; }, 300);
  }
  updateTimestamp();
  refreshIotData();
}

function updateTimestamp() {
  const el = document.getElementById('lastUpdate');
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

/* ── AUTO-REFRESH TIMESTAMP ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
  if (document.body.classList.contains('iot-page')) {
    refreshIotData();
    setInterval(refreshIotData, 5000);
  }
  console.log('🌱 HelaGrow AI — system initialized');
});

/* ── KEYBOARD SHORTCUTS ──────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) return;
  if (e.key === 'r' || e.key === 'R') { e.preventDefault(); refreshCamera(); }
  if (e.key === 'Escape') {
    navLinks?.classList.remove('open');
    closeCamera();
  }
});