// ===================== 全域變數 =====================
let currentPage = 'home';
let currentSubItem = {};

let backgroundShapes = [];
let animationId;
let mouseX = 0, mouseY = 0;

// 數據管理相關
const ADMIN_PASSWORD = 'admin123';
const STORAGE_KEYS = {
  visits: 'website_visits',
  devices: 'website_devices',
  clicks: 'website_clicks'
};

// 中文標籤映射
const CHINESE_LABELS = {
  'novel': '小說',
  'article': '文章', 
  'narrative': '敘事結構',
  'song': '歌曲',
  'bgm': '背景音樂',
  'design': '平面設計',
  'illustration': '插畫',
  'webdesign': '網頁設計',
  'survivor': '類倖存者',
  'card': '卡牌',
  'portfolio': '文學創作',
  'music': '音樂創作',
  'art': '藝術作品',
  'games': '小遊戲',
  'data-management': '數據管理',
  'home': '首頁'
};

// ===================== 性能優化工具 =====================
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ===================== 粒子系統 =====================


// ===================== 背景動畫系統 =====================
function initBackgroundAnimation() {
  const shapes = document.querySelectorAll('.shape');
  backgroundShapes = Array.from(shapes).map(shape => ({
    element: shape,
    speed: parseFloat(shape.dataset.speed) || 0.5,
    baseX: parseFloat(shape.style.left) || 0,
    baseY: parseFloat(shape.style.top) || 0,
    offsetX: 0,
    offsetY: 0
  }));
}

function updateBackgroundShapes() {
  const time = Date.now() * 0.001;
  
  backgroundShapes.forEach(shape => {
    const { element, speed } = shape;
    const offsetX = Math.sin(time * speed) * 20;
    const offsetY = Math.cos(time * speed * 0.7) * 15;
    
    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });
}



// ===================== 滑鼠跟隨效果 =====================
function initMouseGlow() {
  const mouseGlow = document.getElementById('mouseGlow');
  if (!mouseGlow) return;

  const updateMouseGlow = throttle((e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    mouseGlow.style.left = (mouseX - 150) + 'px';
    mouseGlow.style.top = (mouseY - 150) + 'px';
    mouseGlow.style.opacity = '1';
  }, 16);

  document.addEventListener('mousemove', updateMouseGlow);
  
  document.addEventListener('mouseleave', () => {
    mouseGlow.style.opacity = '0';
  });
}

// ===================== 主動畫循環 =====================
function startAnimationLoop() {
  function animate() {
    updateBackgroundShapes();
    animationId = requestAnimationFrame(animate);
  }
  animate();
}

function stopAnimationLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// ===================== 數據管理系統 =====================
function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function getDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

function trackVisit() {
  try {
    // 記錄總訪問次數
    const visits = parseInt(localStorage.getItem(STORAGE_KEYS.visits) || '0') + 1;
    localStorage.setItem(STORAGE_KEYS.visits, visits.toString());
    
    // 記錄設備
    const deviceId = getDeviceId();
    const devices = JSON.parse(localStorage.getItem(STORAGE_KEYS.devices) || '[]');
    if (!devices.includes(deviceId)) {
      devices.push(deviceId);
      localStorage.setItem(STORAGE_KEYS.devices, JSON.stringify(devices));
    }
  } catch (error) {
    console.warn('無法記錄訪問數據:', error);
  }
}

function trackClick(item) {
  try {
    const clicks = JSON.parse(localStorage.getItem(STORAGE_KEYS.clicks) || '{}');
    clicks[item] = (clicks[item] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.clicks, JSON.stringify(clicks));
  } catch (error) {
    console.warn('無法記錄點擊數據:', error);
  }
}

function getAnalyticsData() {
  try {
    return {
      totalViews: parseInt(localStorage.getItem(STORAGE_KEYS.visits) || '0'),
      uniqueDevices: JSON.parse(localStorage.getItem(STORAGE_KEYS.devices) || '[]').length,
      clicks: JSON.parse(localStorage.getItem(STORAGE_KEYS.clicks) || '{}')
    };
  } catch (error) {
    console.warn('無法獲取分析數據:', error);
    return {
      totalViews: 0,
      uniqueDevices: 0,
      clicks: {}
    };
  }
}

// ===================== 密碼驗證 =====================
async function verifyPasswordAndGetData() {
  const passwordInput = document.getElementById('passwordInput');
  const errorMessage = document.getElementById('errorMessage');
  const loadingMessage = document.getElementById('loadingMessage');
  const dataStats = document.getElementById('dataStats');
  
  const password = passwordInput.value.trim();
  
  if (!password) {
    errorMessage.textContent = '請輸入密碼';
    return;
  }
  
  errorMessage.textContent = '';
  loadingMessage.textContent = '驗證中...';
  
  // 模擬驗證延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (password === ADMIN_PASSWORD) {
    loadingMessage.textContent = '';
    dataStats.classList.add('show');
    displayAnalyticsData();
  } else {
    loadingMessage.textContent = '';
    errorMessage.textContent = '密碼錯誤，請重試';
    passwordInput.value = '';
  }
}

function displayAnalyticsData() {
  const data = getAnalyticsData();
  
  // 更新基本統計
  document.getElementById('totalViews').textContent = data.totalViews;
  document.getElementById('uniqueDevices').textContent = data.uniqueDevices;
  
  // 生成點擊統計圖表
  generateClickChart(data.clicks);
}

function generateClickChart(clickData) {
  const clickStats = document.getElementById("clickStats");
  clickStats.innerHTML = "";
  
  if (Object.keys(clickData).length === 0) {
    clickStats.innerHTML = '<p style="color: #ccc; text-align: center;">暫無點擊數據</p>';
    return;
  }
  
  // 創建柱狀圖容器
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";
  
  const chartTitle = document.createElement("h4");
  chartTitle.textContent = "點擊量統計圖表";
  chartTitle.style.color = "#fff";
  chartTitle.style.textAlign = "center";
  chartTitle.style.marginBottom = "20px";
  chartContainer.appendChild(chartTitle);
  
  const chartWrapper = document.createElement("div");
  chartWrapper.className = "chart-wrapper";
  
  // 計算最大值用於比例
  const maxValue = Math.max(...Object.values(clickData));
  
  // 排序數據
  const sortedData = Object.entries(clickData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // 只顯示前10項
  
  sortedData.forEach(([key, count]) => {
    const barItem = document.createElement("div");
    barItem.className = "chart-bar-item";
    
    const barLabel = document.createElement("div");
    barLabel.className = "chart-bar-label";
    // 移除前綴並使用中文標籤映射
    let displayKey = key.replace(/^(頁面-|子項-)/, '');
    barLabel.textContent = CHINESE_LABELS[displayKey] || displayKey;
    
    const barContainer = document.createElement("div");
    barContainer.className = "chart-bar-container";
    
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
    bar.style.height = Math.max(percentage, 2) + '%'; // 高度根據百分比
    bar.style.width = '100%'; // 寬度固定
    
    const barValue = document.createElement("div");
    barValue.className = "chart-bar-value";
    barValue.textContent = count;
    
    barContainer.appendChild(bar);
    barContainer.appendChild(barValue);
    barItem.appendChild(barLabel);
    barItem.appendChild(barContainer);
    chartWrapper.appendChild(barItem);
  });
  
  chartContainer.appendChild(chartWrapper);
  clickStats.appendChild(chartContainer);
}

// ===================== 頁面導航系統 =====================
function showPage(pageId) {
  // 隱藏所有頁面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // 顯示目標頁面
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    currentPage = pageId;
  }
  
  // 更新導航狀態
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`nav a[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// 子項切換系統
function showSubContent(pageId, subId) {
  const page = document.getElementById(pageId);
  if (!page) return;
  
  // 隱藏所有子內容
  page.querySelectorAll('.sub-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // 顯示目標子內容
  const targetContent = document.getElementById(`${subId}-content`);
  if (targetContent) {
    targetContent.classList.add('active');
  }
  
  // 更新子導航狀態
  page.querySelectorAll('.sub-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeSubNav = page.querySelector(`.sub-nav-item[data-sub="${subId}"]`);
  if (activeSubNav) {
    activeSubNav.classList.add('active');
  }
  
  currentSubItem[pageId] = subId;
}

// ===================== 事件監聽器 =====================
function initEventListeners() {
  // 導航點擊事件
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-page]');
    if (target) {
      e.preventDefault();
      const pageId = target.dataset.page;
      showPage(pageId);
      trackClick(`頁面-${pageId}`);
    }
    
    // 子項導航點擊事件
    const subTarget = e.target.closest('[data-sub]');
    if (subTarget) {
      e.preventDefault();
      const subId = subTarget.dataset.sub;
      showSubContent(currentPage, subId);
      trackClick(`子項-${subId}`);
    }
  });

  // 密碼驗證事件
  const passwordBtn = document.getElementById('passwordBtn');
  const passwordInput = document.getElementById('passwordInput');
  
  if (passwordBtn) {
    passwordBtn.addEventListener('click', verifyPasswordAndGetData);
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        verifyPasswordAndGetData();
      }
    });
  }

  // 窗口大小變化事件
  window.addEventListener('resize', debounce(() => {
    resizeCanvas();
  }, 250));

  // 頁面可見性變化事件（性能優化）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimationLoop();
    } else {
      startAnimationLoop();
    }
  });
}

// ===================== 初始化系統 =====================
function initializeWebsite() {
  try {
    // 記錄頁面訪問
    trackVisit();
    
    // 初始化子項狀態
    currentSubItem = {
      portfolio: 'novel',
      music: 'song',
      art: 'design',
      games: 'survivor'
    };

    // 初始化各個系統
    initBackgroundAnimation();
    initMouseGlow();
    animateClickParticles(); // 添加點擊粒子特效
    initEventListeners();
    
    // 啟動動畫循環
    startAnimationLoop();
    
    console.log('網站已成功載入，所有功能正常運作');
  } catch (error) {
    console.error('網站初始化失敗:', error);
  }
}

// ===================== 頁面載入完成後初始化 =====================
document.addEventListener('DOMContentLoaded', initializeWebsite);

// 確保在頁面完全載入後也執行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
  initializeWebsite();
}



// ===================== 點擊粒子特效 =====================
let clickParticles = [];

class ClickParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 0.5; // 降低粒子大小
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`; // RGB彩色
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    if (this.life < 0) this.life = 0;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(${this.color.substring(4, this.color.length - 1)}, ${this.life})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animateClickParticles() {
  const canvas = document.createElement("canvas");
  canvas.id = "clickParticleCanvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999"; // 確保在最上層
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  function resizeClickCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeClickCanvas);
  resizeClickCanvas();

  function updateAndDrawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < clickParticles.length; i++) {
      clickParticles[i].update();
      clickParticles[i].draw(ctx);
    }
    clickParticles = clickParticles.filter(p => p.life > 0);
    requestAnimationFrame(updateAndDrawParticles);
  }
  updateAndDrawParticles();

  let isMouseDown = false;
  document.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    for (let i = 0; i < 5; i++) { // 點擊時產生少量粒子
      clickParticles.push(new ClickParticle(e.clientX, e.clientY));
    }
  });

  document.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
      for (let i = 0; i < 2; i++) { // 長按拖曳時持續產生粒子
        clickParticles.push(new ClickParticle(e.clientX, e.clientY));
      }
    }
  });
}


