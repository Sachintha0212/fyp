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

// Initialize sensor data storage
let sensorData = {
  temperature: {
    current: 0,
    history: [],
    min: 0,
    max: 0,
    avg: 0
  },
  humidity: {
    current: 0,
    history: [],
    min: 0,
    max: 0,
    avg: 0
  },
  soil: {
    current: 0,
    history: [],
    min: 0,
    max: 0,
    avg: 0
  },
  light: {
    current: 0,
    history: [],
    min: 0,
    max: 0,
    avg: 0
  }
};

// Generate realistic sensor data
function generateSensorData() {
  const baseTemp = 27;
  const baseHumidity = 70;
  const baseSoil = 55;
  const baseLight = 18000;

  const time = new Date().getHours();
  
  // Temperature varies with time of day
  const tempVariation = Math.sin((time - 6) * Math.PI / 12) * 3;
  sensorData.temperature.current = parseFloat((baseTemp + tempVariation + (Math.random() - 0.5) * 2).toFixed(1));
  
  // Humidity inversely related to temperature
  const humidityVariation = -tempVariation * 2;
  sensorData.humidity.current = parseFloat((baseHumidity + humidityVariation + (Math.random() - 0.5) * 5).toFixed(1));
  
  // Soil moisture slowly decreases throughout day
  const soilVariation = -time * 0.5;
  sensorData.soil.current = parseFloat((baseSoil + soilVariation + (Math.random() - 0.5) * 3).toFixed(1));
  
  // Light intensity follows sun pattern
  const lightVariation = Math.max(0, Math.sin((time - 6) * Math.PI / 12)) * 15000;
  sensorData.light.current = parseInt(baseLight + lightVariation + (Math.random() - 0.5) * 2000);

  // Update history (keep last 24 data points)
  Object.keys(sensorData).forEach(sensor => {
    sensorData[sensor].history.push(sensorData[sensor].current);
    if (sensorData[sensor].history.length > 24) {
      sensorData[sensor].history.shift();
    }
    
    // Calculate min, max, avg
    const history = sensorData[sensor].history;
    sensorData[sensor].min = Math.min(...history);
    sensorData[sensor].max = Math.max(...history);
    sensorData[sensor].avg = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1);
  });
}

// Initialize with some historical data
for (let i = 0; i < 24; i++) {
  generateSensorData();
}

/* ================= UPDATE UI ELEMENTS ================= */

function updateUI() {
  // Update current readings
  document.getElementById('currentTemp').textContent = `${sensorData.temperature.current}°C`;
  document.getElementById('currentHumidity').textContent = `${sensorData.humidity.current}%`;
  document.getElementById('currentSoil').textContent = `${sensorData.soil.current}%`;
  document.getElementById('currentLight').textContent = `${sensorData.light.current.toLocaleString()} lux`;

  // Update detailed sensor readings
  document.getElementById('tempDetail').textContent = `${sensorData.temperature.current}°C`;
  document.getElementById('humidityDetail').textContent = `${sensorData.humidity.current}%`;
  document.getElementById('soilDetail').textContent = `${sensorData.soil.current}%`;
  document.getElementById('lightDetail').textContent = `${sensorData.light.current.toLocaleString()} lux`;

  // Update min/max/avg
  document.getElementById('tempMin').textContent = `${sensorData.temperature.min}°C`;
  document.getElementById('tempMax').textContent = `${sensorData.temperature.max}°C`;
  document.getElementById('tempAvg').textContent = `${sensorData.temperature.avg}°C`;
  
  document.getElementById('humidityMin').textContent = `${sensorData.humidity.min}%`;
  document.getElementById('humidityMax').textContent = `${sensorData.humidity.max}%`;
  document.getElementById('humidityAvg').textContent = `${sensorData.humidity.avg}%`;
  
  document.getElementById('soilMin').textContent = `${sensorData.soil.min}%`;
  document.getElementById('soilMax').textContent = `${sensorData.soil.max}%`;
  document.getElementById('soilAvg').textContent = `${sensorData.soil.avg}%`;
  
  document.getElementById('lightMin').textContent = `${Math.round(sensorData.light.min).toLocaleString()} lux`;
  document.getElementById('lightMax').textContent = `${Math.round(sensorData.light.max).toLocaleString()} lux`;
  document.getElementById('lightAvg').textContent = `${Math.round(sensorData.light.avg).toLocaleString()} lux`;

  // Update soil analysis progress bars
  document.getElementById('soilMoistureBar').style.width = `${sensorData.soil.current}%`;
  document.getElementById('soilMoistureValue').textContent = `${sensorData.soil.current}%`;
  
  // Simulate pH (6.0-7.5 range, shown as percentage)
  const ph = (6.0 + Math.random() * 1.5).toFixed(1);
  const phPercent = ((ph - 6.0) / 1.5) * 100;
  document.getElementById('phBar').style.width = `${phPercent}%`;
  document.getElementById('phValue').textContent = ph;

  // Simulate NPK levels
  document.getElementById('nBar').style.width = `${70 + Math.random() * 20}%`;
  document.getElementById('pBar').style.width = `${60 + Math.random() * 25}%`;
  document.getElementById('kBar').style.width = `${65 + Math.random() * 20}%`;

  // Update last update time
  updateLastUpdateTime();
}

function updateLastUpdateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('lastUpdate').textContent = timeStr;
}

/* ================= CHARTS ================= */

let mainChart, tempMiniChart, humidityMiniChart, soilMiniChart, lightMiniChart;

// Create main environmental trends chart
function createMainChart() {
  const ctx = document.getElementById('mainChart').getContext('2d');
  
  const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
  
  mainChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: sensorData.temperature.history,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Humidity (%)',
          data: sensorData.humidity.history,
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        },
        {
          label: 'Soil Moisture (%)',
          data: sensorData.soil.history,
          borderColor: '#95e1d3',
          backgroundColor: 'rgba(149, 225, 211, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#cfcfcf',
            font: {
              family: 'Poppins',
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 17, 16, 0.95)',
          titleColor: '#0adf14',
          bodyColor: '#cfcfcf',
          borderColor: '#0adf14',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          titleFont: {
            family: 'Poppins',
            size: 13
          },
          bodyFont: {
            family: 'Poppins',
            size: 12
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              family: 'Poppins',
              size: 11
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temperature (°C)',
            color: '#ff6b6b',
            font: {
              family: 'Poppins',
              size: 11
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              family: 'Poppins',
              size: 11
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Percentage (%)',
            color: '#4ecdc4',
            font: {
              family: 'Poppins',
              size: 11
            }
          },
          grid: {
            drawOnChartArea: false,
            drawBorder: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              family: 'Poppins',
              size: 11
            }
          }
        }
      }
    }
  });
}

// Create mini sparkline charts
function createMiniChart(canvasId, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: data.length}, (_, i) => i),
      datasets: [{
        data: data,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function updateMiniCharts() {
  if (tempMiniChart) tempMiniChart.destroy();
  if (humidityMiniChart) humidityMiniChart.destroy();
  if (soilMiniChart) soilMiniChart.destroy();
  if (lightMiniChart) lightMiniChart.destroy();

  tempMiniChart = createMiniChart('tempMiniChart', sensorData.temperature.history, '#ff6b6b');
  humidityMiniChart = createMiniChart('humidityMiniChart', sensorData.humidity.history, '#4ecdc4');
  soilMiniChart = createMiniChart('soilMiniChart', sensorData.soil.history, '#95e1d3');
  lightMiniChart = createMiniChart('lightMiniChart', sensorData.light.history, '#ffd93d');
}

/* ================= INTERACTIVE FUNCTIONS ================= */

function refreshData() {
  const btn = document.querySelector('.btn-refresh i');
  btn.style.animation = 'spin 1s ease-in-out';
  
  setTimeout(() => {
    generateSensorData();
    updateUI();
    updateMainChart();
    updateMiniCharts();
    btn.style.animation = '';
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
  console.log(`Timeframe changed to: ${value}`);
  // In a real application, this would fetch different data ranges
  alert(`Timeframe view changed to: ${value}`);
}

function exportData() {
  const data = {
    timestamp: new Date().toISOString(),
    sensors: sensorData
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `helagrow-iot-data-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function viewAllAlerts() {
  alert('View All Alerts - This would navigate to a dedicated alerts page');
}

/* ================= SMOOTH SCROLL ================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* ================= ACTIVE NAV LINK ================= */

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function setActiveLink() {
  let scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', setActiveLink);

/* ================= SCROLL ANIMATIONS ================= */

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

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
  // Initial UI update
  updateUI();
  
  // Create charts
  createMainChart();
  updateMiniCharts();
  
  // Update data every 5 seconds
  setInterval(() => {
    generateSensorData();
    updateUI();
    updateMainChart();
    updateMiniCharts();
  }, 5000);
  
  // Update time every second
  setInterval(updateLastUpdateTime, 1000);
  
  console.log('🌱 HelaGrow IoT Dashboard initialized successfully!');
});

/* ================= KEYBOARD SHORTCUTS ================= */

document.addEventListener('keydown', (e) => {
  // Press 'R' to refresh data
  if (e.key === 'r' || e.key === 'R') {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      refreshData();
    }
  }
  
  // Press 'E' to export data
  if (e.key === 'e' || e.key === 'E') {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      exportData();
    }
  }
});

/* ================= ANIMATION KEYFRAMES ================= */

const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

async function analyzeImage() {
  const canvas = document.getElementById('canvas');
  const imageBase64 = canvas.toDataURL('image/jpeg');

  document.getElementById('analyzing').style.display = 'flex';
  document.getElementById('result').style.display = 'none';

  try {
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });

    const data = await response.json();

    document.getElementById('analyzing').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('resultText').textContent = data.disease;
    document.getElementById('confidence').textContent = data.confidence + '%';

  } catch (error) {
    document.getElementById('analyzing').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('resultText').textContent = 'Cannot connect to AI server. Make sure app.py is running.';
    document.getElementById('confidence').textContent = '—';
  }
}
```

---

## Test it right now

Open your browser and go to:
```
http://127.0.0.1:5000/predict