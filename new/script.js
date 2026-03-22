/* ================= SYSTEM STATUS (SMART & SIMPLE) ================= */
const statusSpan = document.querySelector(".status span");

if (statusSpan) {
  const hour = new Date().getHours();

  if (hour < 12) statusSpan.textContent = "Good Morning";
  else if (hour < 18) statusSpan.textContent = "Good Afternoon";
  else statusSpan.textContent = "Good Evening";
}

/* ================= HERO ENTRANCE ANIMATION ================= */
window.addEventListener("load", () => {
  document.querySelectorAll(".hero-content, .scanner-container").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
  });

  setTimeout(() => {
    document.querySelectorAll(".hero-content, .scanner-container").forEach(el => {
      el.style.transition = "all 0.8s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, 200);
});

/* ================= SCROLL REVEAL (VERY CLEAN) ================= */
const revealElements = document.querySelectorAll(
  ".feature-card, .card, .page-header, .section"
);

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;

  revealElements.forEach(el => {
    const boxTop = el.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
};

revealElements.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "all 0.7s ease";
});

window.addEventListener("scroll", revealOnScroll);

/* ================= BUTTON MICRO INTERACTIONS ================= */
document.querySelectorAll(".btn-main, .btn-secondary, .btn-nav").forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.style.boxShadow = "0 12px 30px rgba(10,223,20,0.35)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.boxShadow = "none";
  });
});

/* ================= SIMULATED IOT DATA (OPTIONAL) ================= */
const temp = document.getElementById("temp");
const humidity = document.getElementById("humidity");
const soil = document.getElementById("soil");

if (temp && humidity && soil) {
  setInterval(() => {
    temp.textContent = (24 + Math.random() * 6).toFixed(1) + " °C";
    humidity.textContent = (60 + Math.random() * 15).toFixed(1) + " %";
    soil.textContent = (40 + Math.random() * 20).toFixed(0);
  }, 2500);
}

/* ================= ACTIVE NAV LINK ================= */
const currentPage = location.pathname.split("/").pop();

document.querySelectorAll(".nav-links a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.style.color = "#0adf14";
  }
});

/* ================= SENSOR DATA SIMULATION ================= */

let sensorData = {
  temperature: { current: 0, history: [], min: 0, max: 0, avg: 0 },
  humidity:    { current: 0, history: [], min: 0, max: 0, avg: 0 },
  soil:        { current: 0, history: [], min: 0, max: 0, avg: 0 },
  light:       { current: 0, history: [], min: 0, max: 0, avg: 0 }
};

function generateSensorData() {
  const baseTemp = 27, baseHumidity = 70, baseSoil = 55, baseLight = 18000;
  const time = new Date().getHours();

  const tempVariation = Math.sin((time - 6) * Math.PI / 12) * 3;
  sensorData.temperature.current = parseFloat((baseTemp + tempVariation + (Math.random() - 0.5) * 2).toFixed(1));

  const humidityVariation = -tempVariation * 2;
  sensorData.humidity.current = parseFloat((baseHumidity + humidityVariation + (Math.random() - 0.5) * 5).toFixed(1));

  const soilVariation = -time * 0.5;
  sensorData.soil.current = parseFloat((baseSoil + soilVariation + (Math.random() - 0.5) * 3).toFixed(1));

  const lightVariation = Math.max(0, Math.sin((time - 6) * Math.PI / 12)) * 15000;
  sensorData.light.current = parseInt(baseLight + lightVariation + (Math.random() - 0.5) * 2000);

  Object.keys(sensorData).forEach(sensor => {
    sensorData[sensor].history.push(sensorData[sensor].current);
    if (sensorData[sensor].history.length > 24) sensorData[sensor].history.shift();
    const history = sensorData[sensor].history;
    sensorData[sensor].min = Math.min(...history);
    sensorData[sensor].max = Math.max(...history);
    sensorData[sensor].avg = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1);
  });
}

for (let i = 0; i < 24; i++) generateSensorData();

/* ================= UPDATE UI ELEMENTS ================= */

function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function safeStyle(id, prop, value) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = value;
}

function updateUI() {
  safeSet('currentTemp',     `${sensorData.temperature.current}°C`);
  safeSet('currentHumidity', `${sensorData.humidity.current}%`);
  safeSet('currentSoil',     `${sensorData.soil.current}%`);
  safeSet('currentLight',    `${sensorData.light.current.toLocaleString()} lux`);

  safeSet('tempDetail',     `${sensorData.temperature.current}°C`);
  safeSet('humidityDetail', `${sensorData.humidity.current}%`);
  safeSet('soilDetail',     `${sensorData.soil.current}%`);
  safeSet('lightDetail',    `${sensorData.light.current.toLocaleString()} lux`);

  safeSet('tempMin', `${sensorData.temperature.min}°C`);
  safeSet('tempMax', `${sensorData.temperature.max}°C`);
  safeSet('tempAvg', `${sensorData.temperature.avg}°C`);

  safeSet('humidityMin', `${sensorData.humidity.min}%`);
  safeSet('humidityMax', `${sensorData.humidity.max}%`);
  safeSet('humidityAvg', `${sensorData.humidity.avg}%`);

  safeSet('soilMin', `${sensorData.soil.min}%`);
  safeSet('soilMax', `${sensorData.soil.max}%`);
  safeSet('soilAvg', `${sensorData.soil.avg}%`);

  safeSet('lightMin', `${Math.round(sensorData.light.min).toLocaleString()} lux`);
  safeSet('lightMax', `${Math.round(sensorData.light.max).toLocaleString()} lux`);
  safeSet('lightAvg', `${Math.round(sensorData.light.avg).toLocaleString()} lux`);

  safeStyle('soilMoistureBar', 'width', `${sensorData.soil.current}%`);
  safeSet('soilMoistureValue', `${sensorData.soil.current}%`);

  const ph = (6.0 + Math.random() * 1.5).toFixed(1);
  const phPercent = ((ph - 6.0) / 1.5) * 100;
  safeStyle('phBar', 'width', `${phPercent}%`);
  safeSet('phValue', ph);

  safeStyle('nBar', 'width', `${70 + Math.random() * 20}%`);
  safeStyle('pBar', 'width', `${60 + Math.random() * 25}%`);
  safeStyle('kBar', 'width', `${65 + Math.random() * 20}%`);

  updateLastUpdateTime();
}

function updateLastUpdateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  safeSet('lastUpdate', timeStr);
}

/* ================= CHARTS ================= */

let mainChart, tempMiniChart, humidityMiniChart, soilMiniChart, lightMiniChart;

function createMainChart() {
  const ctx = document.getElementById('mainChart');
  if (!ctx) return;
  const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
  mainChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Temperature (°C)', data: sensorData.temperature.history, borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.1)', tension: 0.4 },
        { label: 'Humidity (%)',     data: sensorData.humidity.history,    borderColor: '#4ecdc4', backgroundColor: 'rgba(78,205,196,0.1)',  tension: 0.4 },
        { label: 'Soil Moisture (%)',data: sensorData.soil.history,        borderColor: '#95e1d3', backgroundColor: 'rgba(149,225,211,0.1)', tension: 0.4 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function createMiniChart(id, data, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  return new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{ data, borderColor: color, backgroundColor: color + '33', tension: 0.4, fill: true, pointRadius: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

function updateMiniCharts() {
  if (tempMiniChart)     tempMiniChart.destroy();
  if (humidityMiniChart) humidityMiniChart.destroy();
  if (soilMiniChart)     soilMiniChart.destroy();
  if (lightMiniChart)    lightMiniChart.destroy();

  tempMiniChart     = createMiniChart('tempMiniChart',     sensorData.temperature.history, '#ff6b6b');
  humidityMiniChart = createMiniChart('humidityMiniChart', sensorData.humidity.history,    '#4ecdc4');
  soilMiniChart     = createMiniChart('soilMiniChart',     sensorData.soil.history,        '#95e1d3');
  lightMiniChart    = createMiniChart('lightMiniChart',    sensorData.light.history,       '#ffd93d');
}

/* ================= INTERACTIVE FUNCTIONS ================= */

function refreshData() {
  const btn = document.querySelector('.btn-refresh i');
  if (btn) btn.style.animation = 'spin 1s ease-in-out';
  setTimeout(() => {
    generateSensorData();
    updateUI();
    updateMainChart();
    updateMiniCharts();
    if (btn) btn.style.animation = '';
  }, 500);
}

function updateMainChart() {
  if (mainChart) {
    mainChart.data.datasets[0].data = sensorData.temperature.history;
    mainChart.data.datasets[1].data = sensorData.humidity.history;
    mainChart.data.datasets[2].data = sensorData.soil.history;
    mainChart.update('none');
  }
}

function updateTimeframe(value) {
  alert(`Timeframe view changed to: ${value}`);
}

function exportData() {
  const dataStr = JSON.stringify({ timestamp: new Date().toISOString(), sensors: sensorData }, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `helagrow-iot-data-${new Date().toISOString().split('T')[0]}.json`);
  link.click();
}

function viewAllAlerts() {
  alert('View All Alerts - This would navigate to a dedicated alerts page');
}

function showNotifications() {
  alert('No new alerts at this time. Your plant is healthy!');
}

/* ================= CAMERA FUNCTIONS ================= */

let videoStream = null;

async function openCamera() {
  const preview = document.getElementById('cameraPreview');
  const video   = document.getElementById('video');
  if (!preview || !video) return;

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = videoStream;
    preview.style.display = 'block';
  } catch (err) {
    alert('Camera access denied or not available: ' + err.message);
  }
}

function captureImage() {
  const video    = document.getElementById('video');
  const canvas   = document.getElementById('canvas');
  const captured = document.getElementById('capturedImage');
  const preview  = document.getElementById('cameraPreview');
  const img      = document.getElementById('capturedImg');
  if (!video || !canvas) return;

  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  img.src = canvas.toDataURL('image/jpeg');

  closeCamera();
  if (captured) captured.style.display = 'block';
  if (preview)  preview.style.display  = 'none';

  analyzeImage();
}

function closeCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  const preview = document.getElementById('cameraPreview');
  if (preview) preview.style.display = 'none';
}

function retakePhoto() {
  const captured = document.getElementById('capturedImage');
  if (captured) captured.style.display = 'none';
  document.getElementById('result')    && (document.getElementById('result').style.display = 'none');
  openCamera();
}

function refreshCamera() {
  const frame = document.getElementById('cameraFrame');
  if (frame) {
    const src = frame.src;
    frame.src = '';
    setTimeout(() => { frame.src = src; }, 300);
  }
  updateLastUpdateTime();
}

/* ================= AI DISEASE DETECTION ================= */

async function analyzeImage() {
  const canvas   = document.getElementById('canvas');
  const analyzing = document.getElementById('analyzing');
  const result    = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const confidence = document.getElementById('confidence');
  if (!canvas) return;

  const imageBase64 = canvas.toDataURL('image/jpeg');

  if (analyzing) analyzing.style.display = 'flex';
  if (result)    result.style.display    = 'none';

  try {
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    if (analyzing) analyzing.style.display = 'none';
    if (result)    result.style.display    = 'block';
    if (resultText) resultText.textContent  = data.disease;
    if (confidence) confidence.textContent  = data.confidence + '%';

  } catch (error) {
    if (analyzing) analyzing.style.display = 'none';
    if (result)    result.style.display    = 'block';
    if (resultText) resultText.textContent  = 'Cannot connect to AI server. Make sure app.py is running on port 5000.';
    if (confidence) confidence.textContent  = '—';
  }
}

/* ================= SMOOTH SCROLL ================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ================= ACTIVE NAV LINK ================= */

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function setActiveLink() {
  let scrollY = window.pageYOffset;
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop    = section.offsetTop - 100;
    const sectionId     = section.getAttribute('id');
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
      });
    }
  });
}

window.addEventListener('scroll', setActiveLink);

/* ================= SCROLL ANIMATIONS ================= */

const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.stat-card, .dashboard-card, .sensor-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

/* ================= MOBILE MENU ================= */

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinksContainer = document.querySelector('.nav-links');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
  });
}

/* ================= INITIALIZATION ================= */

document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  createMainChart();
  updateMiniCharts();

  setInterval(() => {
    generateSensorData();
    updateUI();
    updateMainChart();
    updateMiniCharts();
  }, 5000);

  setInterval(updateLastUpdateTime, 1000);

  console.log('🌱 HelaGrow IoT Dashboard initialized successfully!');
});

/* ================= KEYBOARD SHORTCUTS ================= */

document.addEventListener('keydown', (e) => {
  if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    refreshData();
  }
  if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    exportData();
  }
});


/* ── SCROLL REVEAL ───────────────────────────────────────
   Watches every .reveal element and adds .visible when it
   enters the viewport, triggering the CSS fade-up animation.
─────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const THRESHOLD   = 0.1;
  const ROOT_MARGIN = '0px 0px -40px 0px';

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
  );

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ── ACTIVE NAV LINK on scroll ───────────────────────── */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  function setActiveLink() {
    const scrollY = window.pageYOffset + 100;
    sections.forEach((sec) => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ── NAVBAR shadow on scroll ─────────────────────────── */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,.4)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });

  /* ── SMOOTH anchor scroll ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  console.log('🌱 HelaGrow disease page loaded.');
})();
/* ================= ANIMATION KEYFRAMES ================= */

const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(animStyle);