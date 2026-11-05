// PLE-CC1 Knowledge Hub — Study Summary Web App + Integrated 23-Folder Google Drive Sheet Library

const App = {
  data: window.CC1_DATA || { groups: [], driveFolders: [] },
  state: {
    route: 'home',
    readTopics: {},
    bookmarkedTopics: {},
    fontScale: 1
  },


  // ================= OFF-CANVAS SLIDE DRAWER =================
  openDrawer() {
    this.renderDrawer();
    document.getElementById('slideNavDrawer')?.classList.add('active');
    document.getElementById('drawerBackdrop')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    document.getElementById('slideNavDrawer')?.classList.remove('active');
    document.getElementById('drawerBackdrop')?.classList.remove('active');
    document.body.style.overflow = '';
  },

  renderDrawer() {
    const isQuick = !!this.state.quickMode;
    const currentId = this.state.currentTopicId || (this.getAllTopics()[0] ? this.getAllTopics()[0].id : 'htn');
    const drawerBody = document.getElementById('drawerBody');
    if (!drawerBody) return;

    drawerBody.innerHTML = `
      <!-- Main Navigation Items -->
      <div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.05em;">
          🧭 เมนูนำทาง:
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.45rem;">
          <a href="#/" class="drawer-nav-item">🏠 สารบัญหลัก</a>
          <a href="#/summary?topic=${currentId}" class="drawer-nav-item ${!isQuick && this.state.route === 'summary' ? 'active' : ''}">📖 อ่านรายบท (เนื้อหาเต็ม)</a>
          <a href="#/quick-rx?topic=${currentId}" class="drawer-nav-item ${isQuick ? 'active' : ''}">⚡ สรุปย่อ CC1 (เน้นสอบ + ตารางยา)</a>
          <a href="#/drive" class="drawer-nav-item">📂 คลังชีท Drive (23 โฟลเดอร์)</a>
          <a href="#/cheatsheet" class="drawer-nav-item">⚡ High-Yield สรุปสูตรจำ</a>
          <a href="https://rx-practice-ple-cc1-2026.lushlarch17.chatgpt.site/" target="_blank" rel="noopener" class="drawer-nav-item" style="color: #059669; font-weight: 600;">🎯 เว็บฝึกข้อสอบ CC1 ↗</a>
          <a href="https://jame0854117312-blip.github.io/cc2-app/" target="_blank" rel="noopener" class="drawer-nav-item" style="color: #7c3aed; font-weight: 600;">🧪 CC2 OSPE Lab ↗</a>
        </div>
      </div>
    `;

    // Auto-close drawer on any link click
    drawerBody.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        this.closeDrawer();
      });
    });
  },

  init() {
    this.loadProgress();
    this.setupTheme();

    // Drawer triggers (☰ FAB and Topbar)
    // floatingMenuBtn removed
    document.getElementById('topbarMenuBtn')?.addEventListener('click', () => this.openDrawer());
    document.getElementById('drawerCloseBtn')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('drawerBackdrop')?.addEventListener('click', () => this.closeDrawer());

    // Close drawer on ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDrawer();
    });

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const sidebarSearch = document.getElementById('sidebarFilterInput');
        if (sidebarSearch) {
          sidebarSearch.focus();
          sidebarSearch.select();
          return;
        }
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          window.location.hash = '#/';
          setTimeout(() => {
            const s = document.getElementById('globalSearchInput');
            if (s) { s.focus(); s.select(); }
          }, 150);
        }
      }
    });
    this.handleRoute();
  },

  loadProgress() {
    try {
      this.state.readTopics = JSON.parse(localStorage.getItem('cc1.readTopics') || '{}');
      this.state.bookmarkedTopics = JSON.parse(localStorage.getItem('cc1.bookmarkedTopics') || '{}');
      const savedScale = parseFloat(localStorage.getItem('cc1.fontScale') || '1');
      if (savedScale >= 0.9 && savedScale <= 1.35) {
        this.state.fontScale = savedScale;
        document.documentElement.style.fontSize = `${savedScale * 100}%`;
      }
    } catch (e) {
      this.state.readTopics = {};
      this.state.bookmarkedTopics = {};
    }
  },

  toggleRead(topicId) {
    if (this.state.readTopics[topicId]) {
      delete this.state.readTopics[topicId];
    } else {
      this.state.readTopics[topicId] = true;
    }
    localStorage.setItem('cc1.readTopics', JSON.stringify(this.state.readTopics));
    this.handleRoute();
  },

  toggleBookmark(topicId) {
    if (this.state.bookmarkedTopics[topicId]) {
      delete this.state.bookmarkedTopics[topicId];
    } else {
      this.state.bookmarkedTopics[topicId] = true;
    }
    localStorage.setItem('cc1.bookmarkedTopics', JSON.stringify(this.state.bookmarkedTopics));
    this.handleRoute();
  },

  setupTheme() {
    const btn = document.getElementById('themeBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem('cc1.theme', nextTheme);
      btn.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
    });
    btn.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
  },

  
  getFirstLectureTopic() {
    const cvsGroup = (this.data.groups || []).find(g => g.group === 'cvs');
    if (cvsGroup && cvsGroup.topics && cvsGroup.topics[0]) {
      return cvsGroup.topics[0];
    }
    const all = this.getAllTopics();
    const nonPast = all.find(t => !t.id.startsWith('past-'));
    return nonPast || all[0] || { id: 'htn' };
  },

  getAllTopics() {
    const list = [];
    (this.data.groups || []).forEach((g, gIdx) => {
      (g.topics || []).forEach(t => {
        list.push({
          ...t,
          groupId: g.group,
          groupName: g.groupName,
          groupIndex: gIdx + 1,
          icon: g.icon || '📌'
        });
      });
    });
    return list;
  },

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  },


  renderQuickSummary(rawHtml) {
    if (!rawHtml) return '';
    try {
      let html = rawHtml;

      // 1. Transform subgroup headers
      html = html.replace(/<div\s+style="[^"]*border-left:[^"]*"[^>]*>\s*<b>([^<]+)<\/b>\s*<\/div>/gi, (m, text) => {
        return `<div class="rx-subgroup-banner"><b>${text}</b></div>`;
      });

      // 2. Wrap drug blocks into .drug-card if not already wrapped
      if (!html.includes('class="drug-card"')) {
        const drugPattern = /<p>\s*<b>(\d+\.|•|-|[ก-ฮ]\.)\s*([^<]+)<\/b>:?\s*<\/p>\s*<ul>([\s\S]*?)<\/ul>/gi;
        html = html.replace(drugPattern, (match, num, title, listContent) => {
          const fullTitle = `${num} ${title}`.trim().replace(/:$/, '');
          return `
            <div class="drug-card">
              <div class="drug-card-header">
                <span class="drug-title">${fullTitle}</span>
              </div>
              <ul>
                ${listContent}
              </ul>
            </div>
          `;
        });
      }

      // 3. Highlight 1st-line badges (bright emerald green)
      html = html.replace(/[\[\(]\s*(?:1st-line|First-line)[^\]\)]*[\]\)]/gi, (match) => {
        const clean = match.replace(/^[\[\(]\s*/, '').replace(/\s*[\]\)]$/, '').replace(/^[—\-:\s]+/, '');
        return `<span class="badge-1st-line">✓ ${clean}</span>`;
      });

      // 4. Highlight 2nd-line badges (slate gray)
      html = html.replace(/[\[\(]\s*(?:2nd-line|Second-line)[^\]\)]*[\]\)]/gi, (match) => {
        const clean = match.replace(/^[\[\(]\s*/, '').replace(/\s*[\]\)]$/, '').replace(/^[—\-:\s]+/, '');
        return `<span class="badge-2nd-line">${clean}</span>`;
      });

      return html;
    } catch (e) {
      console.error('Error in renderQuickSummary:', e);
      return rawHtml;
    }
  },

  renderDriveFilesWidget(driveFiles, isCompact = false) {
    if (!driveFiles || !driveFiles.length) return '';
    const isUnlocked = sessionStorage.getItem('cc1.drive_unlocked') === 'true';

    if (!isUnlocked) {
      return `
        <div class="card no-print" style="margin-top: 1.25rem; border: 1.5px solid var(--primary); background: var(--bg-surface-solid); text-align: center; padding: 1.75rem 1.25rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔒</div>
          <h3 style="margin-top: 0; margin-bottom: 0.35rem; font-size: 1.15rem; color: var(--text-primary); font-weight: 700;">
            เอกสารสไลด์ต้นฉบับประจำบท (${driveFiles.length} ไฟล์ PDF)
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 1.15rem;">
            ไฟล์สไลด์ PDF ถูกเข้ารหัสเพื่อความปลอดภัย กรุณากรอกรหัสผ่านเพื่อปลดล็อกเข้าดู
          </p>
          <form id="topicPdfUnlockForm" onsubmit="event.preventDefault();" style="display: flex; gap: 0.5rem; justify-content: center; align-items: center; max-width: 320px; margin: 0 auto; flex-wrap: wrap;">
            <input type="password" id="topicPdfPasswordInput" class="search-input" placeholder="ใส่รหัสผ่าน..." style="padding: 0.5rem 0.85rem; font-size: 1rem; text-align: center; width: 170px; letter-spacing: 0.15em;" autocomplete="off">
            <button type="submit" id="topicPdfSubmitBtn" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.92rem; font-weight: 700;">
              🔑 ปลดล็อก
            </button>
          </form>
          <div id="topicPdfPassError" style="color: var(--danger); font-size: 0.85rem; font-weight: 600; display: none; margin-top: 0.65rem;">
            ❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
          </div>
        </div>
      `;
    }

    return `
      <div class="card" style="margin-top: 1rem; margin-bottom: ${isCompact ? '0.5rem' : '1rem'}; background: var(--bg-primary); border: 1px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.65rem;">
          <div style="font-weight: 700; font-size: 1.05rem; color: var(--primary); display: flex; align-items: center; gap: 0.4rem;">
            <span>📂</span>
            <span>เอกสารสไลด์ต้นฉบับประจำบท (${driveFiles.length} ไฟล์ PDF — ปลดล็อกแล้ว):</span>
          </div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <a href="#/drive" class="btn btn-outline no-print" style="padding: 0.2rem 0.6rem; font-size: 0.82rem;">ดูคลังชีททั้ง 23 โฟลเดอร์ →</a>
            <button id="lockTopicPdfBtn" class="btn btn-secondary no-print" style="padding: 0.2rem 0.55rem; font-size: 0.78rem;" title="ล็อกการเข้าถึงไฟล์ชีท">🔒 ล็อก</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${driveFiles.map(df => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
                <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">
                  📄 <b>${this.escapeHtml(df.name)}</b> <span class="badge" style="font-size: 0.75rem; background: var(--bg-secondary);">${df.totalPages || 0} หน้า</span>
                </div>
                <a href="${df.url}" target="_blank" rel="noopener" class="btn btn-secondary no-print" style="font-size: 0.8rem; padding: 0.25rem 0.55rem;">
                  เปิด PDF บน Google Drive ↗
                </a>
              </div>
              
              ${df.rawText ? `
                <details style="margin-top: 0.4rem; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border-color); overflow: hidden;">
                  <summary style="cursor: pointer; padding: 0.5rem 0.75rem; font-weight: 600; font-size: 0.88rem; color: var(--primary); outline: none; user-select: none;">
                    🔍 คลิกเพื่อเปิดอ่านเนื้อหาถอดความจากสไลด์ทีละหน้าแบบ 100% (${df.totalPages || 0} หน้า — อ่านในเว็บได้ทันที ไม่ต้องเปิดไฟล์)
                  </summary>
                  <div style="padding: 0.85rem; max-height: 500px; overflow-y: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; line-height: 1.65; white-space: pre-wrap; background: var(--bg-primary); border-top: 1px solid var(--border-color); color: var(--text-primary);">
${this.escapeHtml(df.rawText)}
                  </div>
                </details>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, query] = hash.split('?');
    const navLinks = document.querySelectorAll('.nav a[data-route]');
    navLinks.forEach(a => a.classList.remove('active'));

    const container = document.getElementById('app');

    if (path === '/' || path === '') {
      this.highlightNav('home');
      this.renderHome(container);
    } else if (path.startsWith('/quick-rx')) {
      this.highlightNav('quick-rx');
      const params = new URLSearchParams(query);
      this.state.quickMode = true;
      const defaultTopic = this.state.currentTopicId || this.getFirstLectureTopic().id;
      const targetTopic = params.get('topic') || defaultTopic;
      this.renderSummary(container, targetTopic);
    } else if (path.startsWith('/summary')) {
      this.state.quickMode = false;
      this.highlightNav('summary');
      const params = new URLSearchParams(query);
      const defaultTopic = this.state.currentTopicId || this.getFirstLectureTopic().id;
      const targetTopic = params.get('topic') || defaultTopic;
      this.renderSummary(container, targetTopic);
    } else if (path.startsWith('/drive')) {
      this.highlightNav('drive');
      const params = new URLSearchParams(query);
      this.renderDriveLibrary(container, params.get('folder'));
    } else if (path.startsWith('/cheatsheet')) {
      this.highlightNav('cheatsheet');
      this.renderCheatSheet(container);
    } else {
      this.highlightNav('home');
      this.renderHome(container);
    }
  },

  highlightNav(route) {
    const target = document.querySelector(`.nav a[data-route="${route}"]`);
    if (target) target.classList.add('active');

    const curId = this.state.currentTopicId || this.getFirstLectureTopic().id;
    const summaryNav = document.querySelector('.nav a[data-route="summary"]');
    const quickNav = document.querySelector('.nav a[data-route="quick-rx"]');
    if (summaryNav) summaryNav.setAttribute('href', `#/summary?topic=${curId}`);
    if (quickNav) quickNav.setAttribute('href', `#/quick-rx?topic=${curId}`);
  },

  // ================= VIEW: HOME (BLUEPRINT DIRECTORY & INLINE FULL SUMMARY) =================
  renderHome(c) {
    const allTopics = this.getAllTopics();
    const readCount = allTopics.filter(t => this.state.readTopics[t.id]).length;
    const bookmarkedList = allTopics.filter(t => this.state.bookmarkedTopics[t.id]);
    const percentRead = allTopics.length ? Math.round((readCount / allTopics.length) * 100) : 0;
    const totalDriveFolders = (this.data.driveFolders || []).length;
    const totalDriveFiles = (this.data.driveFolders || []).reduce((acc, f) => acc + (f.files ? f.files.length : 0), 0);
    const firstTopic = this.getFirstLectureTopic();

    c.innerHTML = `
      <!-- Overview Top Bar (Mockup Style) -->
      <div class="overview-top-bar">
        <div class="overview-title-group">
          <h2 class="overview-heading">ภาพรวมระบบ (Overview)</h2>
          <span class="overview-pill-badge">
            <span class="ping-dot" style="width:7px; height:7px; border-radius:50%; background:#16a34a;"></span>
            <span>เกณฑ์ ศสภ. ที่ 5/2566 · ฉบับอัปเดตล่าสุด</span>
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <a href="#/drive" class="btn btn-secondary" style="border-radius: 9999px; padding: 0.45rem 1rem; font-size: 0.88rem;">
            📁 คลังชีท Drive (${totalDriveFolders})
          </a>
          <a href="#/quick-rx?topic=${firstTopic.id}" class="btn-lime-pill" style="font-size: 0.88rem;">
            ⚡ สรุปด่วน QuickRx
          </a>
          <a href="#/summary?topic=${firstTopic.id}" class="btn-dark-pill" style="font-size: 0.88rem;">
            + เริ่มอ่านบทเรียน
          </a>
        </div>
      </div>

      <!-- Hero Dark Banner (Image 1 & 4 Style) -->
      <div class="hero-banner-dark">
        <div class="hero-lime-tag">
          <span class="ping-dot"></span>
          <span>ระบบพร้อมสอบ 100% สรุปครบ 22 หมวด 106 หัวข้อ 119 สไลด์</span>
        </div>
        <h1>ระบบบริหารจัดการความรู้และเตรียมสอบใบประกอบวิชาชีพ PLE-CC1</h1>
        <p>
          คลังสรุปเนื้อหาเข้มข้นตรงตามเกณฑ์มาตรฐาน ศสภ. ครบทั้ง 16 กลุ่มโรค เภสัชภัณฑ์ เภสัชเคมี (SAR) การควบคุมคุณภาพ สมุนไพร และกฎหมายวิชาชีพ แยกอ่าน 1 สไลด์/1 โรค = 1 บทเดี่ยว พร้อมตาราง QuickRx ยาแม่บท และเชื่อมโยงไฟล์สไลด์ต้นฉบับ
        </p>
        <div class="hero-dark-watermark">📘</div>
      </div>

      <!-- Metrics Strip (4 Clean White Cards as in Mockup) -->
      <div class="metric-strip-modern">
        <div class="metric-card-modern">
          <div class="metric-left-col">
            <span class="metric-label-clean">หมวดวิชาทั้งหมด</span>
            <span class="metric-val-clean">22</span>
            <span class="metric-sub-clean" style="color: #d97706;">✓ โครงสร้างมาตรฐาน ศสภ.</span>
          </div>
          <div class="metric-badge-icon icon-amber">📚</div>
        </div>

        <div class="metric-card-modern">
          <div class="metric-left-col">
            <span class="metric-label-clean">บทสรุปเจาะลึกในระบบ</span>
            <span class="metric-val-clean">106</span>
            <span class="metric-sub-clean" style="color: #2563eb;">✓ 1.89 ล้านตัวอักษร</span>
          </div>
          <div class="metric-badge-icon icon-blue">📖</div>
        </div>

        <div class="metric-card-modern">
          <div class="metric-left-col">
            <span class="metric-label-clean">สไลด์ PDF ต้นฉบับ</span>
            <span class="metric-val-clean">${totalDriveFiles}</span>
            <span class="metric-sub-clean" style="color: #16a34a;">📁 Drive 23 โฟลเดอร์</span>
          </div>
          <div class="metric-badge-icon icon-green">📄</div>
        </div>

        <div class="metric-card-modern">
          <div class="metric-left-col">
            <span class="metric-label-clean">ความคืบหน้าการอ่าน</span>
            <span class="metric-val-clean">${percentRead}%</span>
            <span class="metric-sub-clean" style="color: #4d7c0f;">● อ่านแล้ว ${readCount}/${allTopics.length} บท</span>
          </div>
          <div class="metric-badge-icon icon-lime">🎯</div>
        </div>
      </div>

      <!-- Spotlight Search Bar Full Pill -->
      <div class="search-wrapper-pill">
        <span class="search-icon-pill">🔍</span>
        <input type="search" id="globalSearchInput" class="search-input-pill" placeholder="ค้นหาได้ทั้งสรุปและสไลด์ PDF 119 ไฟล์ (เช่น allopurinol, GINA, ข.ย.11, HLB, ICER, ยาเบญจกูล, lithium, SAR)..." autocomplete="off">
      </div>
      <div id="searchResultsBox" style="margin-top: -1rem; margin-bottom: 1.5rem;"></div>

      <!-- Dashboard Two Column Content -->
      <div class="dashboard-grid-cols">
        <!-- Left: Chapter Progress List -->
        <div class="card" style="padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--text-primary);">
              ความคืบหน้าการจัดตารางอ่านรายหมวด
            </h3>
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">22 หมวดวิชา</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.45rem;">
            ${this.data.groups.map(g => {
              const gTopics = g.topics || [];
              const gRead = gTopics.filter(t => this.state.readTopics[t.id]).length;
              const gPercent = gTopics.length ? Math.round((gRead / gTopics.length) * 100) : 0;
              const firstTid = gTopics[0] ? gTopics[0].id : '';
              return `
                <a href="#/summary?topic=${firstTid}" class="dashboard-chapter-row" title="เปิดหมวด ${g.groupName}">
                  <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0;">
                    <span style="font-size: 1.25rem; flex-shrink: 0;">${g.icon}</span>
                    <div style="min-width: 0;">
                      <div style="font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${g.groupName}
                      </div>
                      <div style="font-size: 0.78rem; color: var(--text-muted);">
                        ${gTopics.length} บทเรียน (${gRead}/${gTopics.length} จบแล้ว)
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.45rem; flex-shrink: 0;">
                    <div class="chapter-progress-bar-bg">
                      <div class="chapter-progress-bar-fill" style="width: ${gPercent}%;"></div>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); width: 35px; text-align: right;">${gPercent}%</span>
                    <span style="font-size: 0.95rem; color: var(--text-muted); margin-left: 0.25rem;">›</span>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Subject Modules & Tools -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card" style="padding: 1.75rem 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--text-primary);">
                กลุ่มสาระ / หมวดวิชาในระบบ
              </h3>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
              เลือกคลิกเข้าสู่บทสรุปของแต่ละกลุ่มวิชาได้โดยตรง:
            </p>
            <div class="subject-pill-grid">
              ${this.data.groups.map(g => {
                const firstTid = g.topics[0] ? g.topics[0].id : '';
                return `
                  <a href="#/summary?topic=${firstTid}" class="subject-pill-link" title="${g.groupName}">
                    <span>${g.icon}</span>
                    <span>${g.groupName.split('(')[0].trim()}</span>
                  </a>
                `;
              }).join('')}
            </div>
            <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
              <a href="#/summary?topic=${firstTopic.id}" class="btn-dark-pill" style="width: 100%; justify-content: center; padding: 0.65rem 1rem !important;">
                📖 อ่านสรุปรายบททั้งหมด
              </a>
            </div>
          </div>

          <!-- Companion Apps Card -->
          <div class="card" style="padding: 1.75rem 2rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.65rem; color: var(--text-primary);">
              🔗 แหล่งเรียนรู้เตรียมสอบคู่เคียง
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              <a href="https://rx-practice-ple-cc1-2026.lushlarch17.chatgpt.site/" target="_blank" rel="noopener" class="btn btn-secondary" style="border-radius: var(--radius-lg); text-align: left; justify-content: flex-start; padding: 0.75rem 1rem;">
                <span style="font-size: 1.25rem;">📝</span>
                <div>
                  <div style="font-weight: 700; font-size: 0.92rem;">เว็บฝึกข้อสอบ PLE-CC1 ↗</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">คลังโจทย์เสมือนจริง จับเวลาและเฉลยละเอียด</div>
                </div>
              </a>
              <a href="https://jame0854117312-blip.github.io/cc2-app/" target="_blank" rel="noopener" class="btn btn-secondary" style="border-radius: var(--radius-lg); text-align: left; justify-content: flex-start; padding: 0.75rem 1rem;">
                <span style="font-size: 1.25rem;">🧪</span>
                <div>
                  <div style="font-weight: 700; font-size: 0.92rem;">CC2 OSPE Lab ↗</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">ห้องฝึกทักษะปฏิบัติการ OSPE เภสัชกรรม</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Reattach search listeners
    const searchInput = document.getElementById('globalSearchInput');
    const resultsBox = document.getElementById('searchResultsBox');
    if (searchInput && resultsBox) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
          resultsBox.innerHTML = '';
          return;
        }

        const hits = [];
        allTopics.forEach(t => {
          const matchTitle = (t.title + ' ' + (t.titleTh || '')).toLowerCase().includes(query);
          const matchHighYield = (t.highYield || []).some(y => y.toLowerCase().includes(query));
          const matchSection = (t.sections || []).some(s => s.heading.toLowerCase().includes(query) || s.html.toLowerCase().includes(query));
          if (matchTitle || matchHighYield || matchSection) {
            hits.push(t);
          }
        });

        if (hits.length === 0) {
          resultsBox.innerHTML = `<div class="card" style="padding: 1rem; text-align: center; color: var(--text-muted); border-radius: var(--radius-2xl);">🔍 ไม่พบบทเรียนที่ตรงกับคำค้น "${e.target.value}"</div>`;
          return;
        }

        resultsBox.innerHTML = `
          <div class="card" style="padding: 1rem 1.25rem; border-radius: var(--radius-2xl); border-color: var(--border-hover);">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">
              ผลการค้นหา (${hits.length} หัวข้อ):
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem; max-height: 380px; overflow-y: auto;">
              ${hits.slice(0, 10).map(h => `
                <a href="#/summary?topic=${h.id}" class="dashboard-chapter-row" style="margin-bottom:0; padding:0.6rem 0.85rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>${h.icon}</span>
                    <span style="font-weight: 600; font-size: 0.92rem;">${h.titleTh || h.title}</span>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">(${h.groupName})</span>
                  </div>
                  <span style="font-size: 0.85rem; color: var(--text-muted);">›</span>
                </a>
              `).join('')}
            </div>
          </div>
        `;
      });
    }
  },

  // ================= VIEW: SUMMARY READER =================
  renderSummary(c, activeTopicId) {
    const allTopics = this.getAllTopics();
    const defaultTopicObj = this.getFirstLectureTopic();
    let currentIndex = allTopics.findIndex(t => t.id === activeTopicId);
    if (currentIndex === -1) {
      currentIndex = allTopics.findIndex(t => t.id === defaultTopicObj.id);
      if (currentIndex === -1) currentIndex = 0;
    }
    const currentTopic = allTopics[currentIndex] || defaultTopicObj;

    if (!currentTopic) {
      c.innerHTML = `<div class="card"><p>ไม่พบเนื้อหาสรุป</p></div>`;
      return;
    }

    this.state.currentTopicId = currentTopic.id;
    const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;
    const isRead = !!this.state.readTopics[currentTopic.id];
    const isBookmarked = !!this.state.bookmarkedTopics[currentTopic.id];

    const existingLayout = c.querySelector('.summary-layout');
    const existingSidebar = document.getElementById('summarySidebar');
    const getArticleElement = () => c.querySelector('.topic-content');

    const renderArticleHtml = () => `
      <!-- Mobile Topic Drawer Toggle Button -->
      <button id="mobileSidebarToggleBtn" class="mobile-sidebar-toggle-btn no-print" type="button" aria-label="เปิดสารบัญบทเรียน">
        <span style="display: flex; align-items: center; gap: 0.45rem;">
          <span>📚</span>
          <span>สารบัญบทเรียน: ${currentTopic.icon} ${currentTopic.groupName}</span>
        </span>
        <span id="mobileSidebarArrow" style="font-size: 1.15rem; transition: transform 0.2s;">▾</span>
      </button>

      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div>
            <span class="badge badge-blue" style="font-size: 0.85rem;">${currentTopic.icon} ${currentTopic.groupName}</span>
            <h1 style="font-size: 1.85rem; font-weight: 700; margin: 0.35rem 0 0.15rem 0;">
              ${currentTopic.titleTh || currentTopic.title}
            </h1>
            <div style="color: var(--text-secondary); font-size: 1.05rem; font-weight: 500;">${currentTopic.title}</div>
          </div>
          <div class="no-print" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button id="toggleBookmarkBtn" class="btn btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.9rem;">
              ${isBookmarked ? '⭐ ปักหมุดแล้ว' : '☆ ปักหมุดทบทวน'}
            </button>
            <button id="toggleReadBtn" class="btn ${isRead ? 'btn-primary' : 'btn-outline'}" style="padding: 0.45rem 0.85rem; font-size: 0.9rem;">
              ${isRead ? '✅ อ่านจบแล้ว' : '☑️ ทำเครื่องหมายว่าอ่านจบ'}
            </button>
          </div>
        </div>

        ${currentTopic.highYield && currentTopic.highYield.length > 0 ? `
          <div class="tip" style="margin-top: 1.1rem; font-size: 1rem;">
            <div style="font-weight: 700; font-size: 1.08rem; margin-bottom: 0.4rem; color: var(--primary);">
              ⚡ สรุปจุดเน้น High-Yield ที่ออกสอบ PLE-CC1 บ่อยที่สุด:
            </div>
            <ul style="padding-left: 1.3rem;">
              ${currentTopic.highYield.map(y => `<li style="margin-bottom: 0.35rem;">${y}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <!-- Detailed Sections / Quick Mode Filter -->
      ${this.state.quickMode ? (
        currentTopic.quickSummaryHtml ? `
          <section class="card" style="margin-bottom: 1rem; border-top: 4px solid var(--accent); padding: 1.5rem 1.75rem;">
            <div style="line-height: 1.8; font-size: 1.05rem;">
              ${this.renderQuickSummary(currentTopic.quickSummaryHtml)}
            </div>
          </section>
          ${currentTopic.quickRx && currentTopic.quickRx.html ? `
            <section class="card" style="margin-bottom: 1rem; padding: 1.5rem 1.75rem;">
              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--accent);">
                ${currentTopic.quickRx.title || '⚡ ตารางยาแม่บท & จุดจำเน้นสอบ (QuickRx Cards)'}
              </h2>
              ${currentTopic.quickRx.html}
            </section>
          ` : ''}
        ` : `
          <section class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
            <div class="callout callout-info" style="margin-bottom: 1rem;">
              <b>⚡ สรุปย่อ CC1:</b> กำลังเตรียมเนื้อหาสรุปย่อแม่บทสำหรับหัวข้อนี้ (ดูเนื้อหาเต็มได้ที่แถบ สรุปเนื้อหาเต็ม)
            </div>
            ${currentTopic.sections.filter(s => {
              const h = s.heading || '';
              return !h.includes('สรุปคำสอนสด') && (h.includes('Quick Rx') || h.includes('ตารางยา') || h.includes('สรุปย่อ') || h.includes('จุดเน้น'));
            }).map(s => `
              <div style="line-height: 1.75; font-size: 1.05rem; margin-bottom: 1.25rem;">
                ${s.html}
              </div>
            `).join('')}
          </section>
        `
      ) : (
        currentTopic.sections.filter(s => !s.heading.includes('สรุปคำสอนสด') && !s.heading.includes('Quick Rx')).map((s, idx) => `
          <section class="card" style="margin-bottom: 1rem;">
            <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.45rem;">
              ${/^\d+\./.test((s.heading || '').trim()) ? s.heading : `${idx + 1}. ${s.heading}`}
            </h2>
            <div style="line-height: 1.75; font-size: 1.05rem;">
              ${s.html}
            </div>
          </section>
        `).join('')
      )}

      <!-- Attached Google Drive PDFs & Full Extracted Slides -->
      ${this.renderDriveFilesWidget(currentTopic.driveFiles, false)}

      ${currentTopic.refs && currentTopic.refs.length > 0 ? `
        <div class="card" style="background: var(--bg-primary); font-size: 0.9rem; color: var(--text-secondary);">
          <b>📚 แนวทางเวชปฏิบัติและเอกสารอ้างอิง:</b>
          <ul style="margin-top: 0.3rem; padding-left: 1.3rem;">
            ${currentTopic.refs.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Partner CC2 OSPE Banner -->
      <div class="card no-print" style="background: rgba(139, 92, 246, 0.08); border: 1px dashed rgba(139, 92, 246, 0.35); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem;">
        <div>
          <div style="font-weight: 700; color: #7c3aed; font-size: 1rem;">🧪 เตรียมต่อการสอบปฏิบัติการ PLE-CC2?</div>
          <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.2rem;">
            เมื่ออ่านทฤษฎี CC1 เข้าใจแล้ว สามารถไปฝึกจำลองสถานี OSPE ซักประวัติและจ่ายยาต่อได้ที่ <b>CC2 OSPE Lab · ห้องฝึก OSPE เภสัช</b>
          </div>
        </div>
        <a href="https://jame0854117312-blip.github.io/cc2-app/" target="_blank" rel="noopener" class="btn" style="background: #7c3aed; color: #ffffff; text-decoration: none; font-size: 0.88rem; padding: 0.45rem 0.9rem; font-weight: 600; white-space: nowrap;">
          เข้าห้องฝึก CC2 OSPE Lab ↗
        </a>
      </div>

      <!-- Prev / Next Topic Footer Navigation -->
      <div class="card no-print" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div>
          ${prevTopic ? `
            <a href="#/${this.state.quickMode ? 'quick-rx' : 'summary'}?topic=${prevTopic.id}" class="btn btn-secondary">
              ⬅️ ก่อนหน้า: ${prevTopic.titleTh || prevTopic.title}
            </a>
          ` : `<span></span>`}
        </div>
        <button id="bottomMarkReadBtn" class="btn ${isRead ? 'btn-secondary' : 'btn-primary'}">
          ${isRead ? '✅ อ่านจบหัวข้อนี้แล้ว' : '✅ บันทึกว่าอ่านจบหัวข้อนี้'}
        </button>
        <div>
          ${nextTopic ? `
            <a href="#/${this.state.quickMode ? 'quick-rx' : 'summary'}?topic=${nextTopic.id}" class="btn btn-primary">
              ถัดไป: ${nextTopic.titleTh || nextTopic.title} ➡️
            </a>
          ` : `<a href="#/" class="btn btn-primary">🏠 กลับหน้าสารบัญ</a>`}
        </div>
      </div>
    `;

    const attachArticleEvents = () => {
      document.getElementById('toggleReadBtn')?.addEventListener('click', () => this.toggleRead(currentTopic.id));
      // Mobile drawer toggle & close
      const mobileToggle = document.getElementById('mobileSidebarToggleBtn');
      const mobileClose = document.getElementById('mobileSidebarCloseBtn');
      const sb = document.getElementById('summarySidebar');
      const arrow = document.getElementById('mobileSidebarArrow');

      if (mobileToggle && sb) {
        mobileToggle.addEventListener('click', () => {
          sb.classList.toggle('mobile-expanded');
          if (arrow) arrow.textContent = sb.classList.contains('mobile-expanded') ? '▴' : '▾';
          if (sb.classList.contains('mobile-expanded')) {
            sb.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
      if (mobileClose && sb) {
        mobileClose.addEventListener('click', () => {
          sb.classList.remove('mobile-expanded');
          if (arrow) arrow.textContent = '▾';
        });
      }

      document.getElementById('bottomMarkReadBtn')?.addEventListener('click', () => {
        this.toggleRead(currentTopic.id);
        if (!isRead && nextTopic) {
          window.location.hash = `#/${this.state.quickMode ? 'quick-rx' : 'summary'}?topic=${nextTopic.id}`;
        }
      });
      document.getElementById('toggleBookmarkBtn')?.addEventListener('click', () => this.toggleBookmark(currentTopic.id));
      // Topic PDF password unlock & lock listeners
      const topicPdfForm = document.getElementById('topicPdfUnlockForm');
      const topicPdfInput = document.getElementById('topicPdfPasswordInput');
      const topicPdfErr = document.getElementById('topicPdfPassError');

      topicPdfForm?.addEventListener('submit', () => {
        if (topicPdfInput && topicPdfInput.value.trim() === '12345') {
          sessionStorage.setItem('cc1.drive_unlocked', 'true');
          const artEl = getArticleElement();
          if (artEl) {
            artEl.innerHTML = renderArticleHtml();
            attachArticleEvents();
          }
        } else {
          if (topicPdfErr) topicPdfErr.style.display = 'block';
          if (topicPdfInput) {
            topicPdfInput.value = '';
            topicPdfInput.focus();
          }
        }
      });

      document.getElementById('lockTopicPdfBtn')?.addEventListener('click', () => {
        sessionStorage.removeItem('cc1.drive_unlocked');
        const artEl = getArticleElement();
        if (artEl) {
          artEl.innerHTML = renderArticleHtml();
          attachArticleEvents();
        }
      });
    };

    const currentArtEl = getArticleElement();
    if (existingLayout && existingSidebar && currentArtEl) {
      // In-place update: sidebar preserves its exact scroll position, main article updates and jumps smoothly to top
      const prevScrollTop = existingSidebar.scrollTop;
      currentArtEl.innerHTML = renderArticleHtml();
      attachArticleEvents();

      const targetModePrefix = this.state.quickMode ? 'quick-rx' : 'summary';
      existingSidebar.querySelectorAll('.sidebar-topic-link').forEach(a => {
        const tid = a.getAttribute('data-topic-id');
        if (tid) {
          a.setAttribute('href', `#/${targetModePrefix}?topic=${tid}`);
        }
        const isTarget = tid === currentTopic.id;
        a.setAttribute('data-active', isTarget ? 'true' : 'false');
        if (isTarget) {
          a.classList.add('active');
        } else {
          a.classList.remove('active');
        }
      });
      existingSidebar.querySelectorAll('.sidebar-group > a').forEach(a => {
        const tid = a.getAttribute('data-first-topic');
        if (tid) {
          a.setAttribute('href', `#/${targetModePrefix}?topic=${tid}`);
        }
      });
      const activeLink = existingSidebar.querySelector(`.sidebar-topic-link[data-topic-id="${currentTopic.id}"]`);
      if (activeLink) {
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      if (window.innerWidth <= 900) {
        const mobileSb = document.getElementById('summarySidebar');
        if (mobileSb) mobileSb.classList.remove('mobile-expanded');
        const arrow = document.getElementById('mobileSidebarArrow');
        if (arrow) arrow.textContent = '▾';
      }

      existingSidebar.scrollTop = prevScrollTop;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    c.innerHTML = `
      <div class="summary-layout">
        <!-- Sidebar Navigation grouped by Official Blueprint -->
        <aside id="summarySidebar" class="card no-print sidebar-sticky-panel">
          <!-- Pinned Header: ALWAYS VISIBLE -->
          <div class="sidebar-pinned-header">
            <!-- Mobile Close Bar -->
            <div class="mobile-sidebar-close-row no-print" style="margin-bottom: 0.5rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--border-color);">
              <span style="font-weight: 700; color: var(--primary); font-size: 0.92rem;">📖 สารบัญ ${this.data.groups.length} หมวด ${allTopics.length} บท</span>
              <button id="mobileSidebarCloseBtn" type="button" class="btn btn-secondary" style="padding: 0.2rem 0.55rem; font-size: 0.8rem; font-weight: 600;">✕ ปิด</button>
            </div>
            <div class="sidebar-search-container">
              <span class="sidebar-search-icon">🔍</span>
              <input type="search" id="sidebarFilterInput" class="sidebar-search-input" placeholder="ค้นหา / กรองหัวข้อ (${allTopics.length} บท)..." autocomplete="off">
              <button id="sidebarSearchClearBtn" type="button" class="sidebar-search-clear" title="ล้างการค้นหา" style="display: none;">✕</button>
            </div>
          </div>

          <!-- Scrollable Topic List -->
          <div id="sidebarTopicList" class="sidebar-scrollable-list">
            ${this.data.groups.map((g, gIdx) => `
              <div class="sidebar-group">
                <a href="#/${this.state.quickMode ? 'quick-rx' : 'summary'}?topic=${g.topics[0] ? g.topics[0].id : ''}" data-first-topic="${g.topics[0] ? g.topics[0].id : ''}" style="text-decoration: none; display: block;" title="ไปยังบทแรกของหมวดนี้">
                  <div class="sidebar-group-title" style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.25rem; padding: 0.2rem 0.3rem; border-radius: 4px; cursor: pointer; transition: all 0.15s ease;">
                    ${g.icon} ${g.groupName}
                  </div>
                </a>
                <div class="sidebar-group-topics" style="display: flex; flex-direction: column; gap: 0.2rem;">
                  ${g.topics.map(t => {
                    const active = t.id === currentTopic.id;
                    const read = !!this.state.readTopics[t.id];
                    const bmk = !!this.state.bookmarkedTopics[t.id];
                    return `
                      <a href="#/${this.state.quickMode ? 'quick-rx' : 'summary'}?topic=${t.id}" class="sidebar-topic-link ${active ? 'active' : ''}" data-topic-id="${t.id}" data-active="${active ? 'true' : 'false'}" data-title="${(t.title + ' ' + (t.titleTh || '')).toLowerCase()}">
                        <span>${t.titleTh || t.title}</span>
                        <span style="font-size: 0.8rem; margin-left: 0.35rem; flex-shrink: 0;">${bmk ? '⭐' : ''}${read ? '✅' : ''}</span>
                      </a>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
            <div id="sidebarNoMatch" style="display: none; padding: 1.25rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
              🔍 ไม่พบหัวข้อที่ตรงกับคำค้น
            </div>
          </div>
        </aside>

        <!-- Main Study Article -->
        <article class="topic-content">
          ${renderArticleHtml()}
        </article>
      </div>
    `;

    attachArticleEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const activeLink = document.querySelector(`.sidebar-topic-link[href="#/summary?topic=${currentTopic.id}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    document.getElementById('toggleReadBtn')?.addEventListener('click', () => this.toggleRead(currentTopic.id));
    document.getElementById('bottomMarkReadBtn')?.addEventListener('click', () => {
      this.toggleRead(currentTopic.id);
      if (!isRead && nextTopic) {
        window.location.hash = `#/${this.state.quickMode ? 'quick-rx' : 'summary'}?topic=${nextTopic.id}`;
      }
    });
    document.getElementById('toggleBookmarkBtn')?.addEventListener('click', () => this.toggleBookmark(currentTopic.id));

    const filterInput = document.getElementById('sidebarFilterInput');
    const clearBtn = document.getElementById('sidebarSearchClearBtn');
    const noMatchEl = document.getElementById('sidebarNoMatch');

    const updateFilter = () => {
      const q = (filterInput?.value || '').trim().toLowerCase();
      const isFiltering = q.length > 0;
      if (clearBtn) clearBtn.style.display = isFiltering ? 'block' : 'none';
      let totalVisible = 0;

      document.querySelectorAll('.sidebar-group').forEach(grp => {
        const titleEl = grp.querySelector('.sidebar-group-title');
        let groupMatches = 0;

        grp.querySelectorAll('.sidebar-topic-link').forEach(a => {
          const match = !isFiltering || (a.dataset.title || '').includes(q);
          a.style.display = match ? 'flex' : 'none';
          if (match) {
            groupMatches++;
            totalVisible++;
          }
        });

        if (isFiltering) {
          if (titleEl) titleEl.style.display = 'none';
          grp.style.display = groupMatches > 0 ? 'block' : 'none';
        } else {
          if (titleEl) titleEl.style.display = 'block';
          grp.style.display = 'block';
        }
      });

      if (noMatchEl) {
        noMatchEl.style.display = (isFiltering && totalVisible === 0) ? 'block' : 'none';
      }
    };

    filterInput?.addEventListener('input', updateFilter);
    filterInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        filterInput.value = '';
        updateFilter();
      }
    });
    clearBtn?.addEventListener('click', () => {
      if (filterInput) {
        filterInput.value = '';
        filterInput.focus();
        updateFilter();
      }
    });
  },

  // ================= VIEW: 23-FOLDER GOOGLE DRIVE LIBRARY =================
  renderDriveLibrary(c, activeFolderId) {
    const isUnlocked = sessionStorage.getItem('cc1.drive_unlocked') === 'true';
    
    // Naturally sort folders: Chapter 1..16 first, then remaining folders alphabetically
    const parseChapterNum = (name) => {
      const m = (name || '').match(/chapter\s*(\d+)/i);
      return m ? parseInt(m[1], 10) : 9999;
    };
    const folders = [...(this.data.driveFolders || [])].sort((a, b) => {
      const na = parseChapterNum(a.name);
      const nb = parseChapterNum(b.name);
      if (na !== nb) return na - nb;
      return (a.name || '').localeCompare(b.name || '', 'th');
    });

    const totalFiles = folders.reduce((acc, f) => acc + (f.files ? f.files.length : 0), 0);

    if (!isUnlocked) {
      c.innerHTML = `
        <div style="max-width: 440px; margin: 3.5rem auto; text-align: center;">
          <div class="card" style="padding: 2.5rem 1.75rem; border: 1.5px solid var(--border-glow); box-shadow: var(--shadow-lg);">
            <div style="font-size: 3.2rem; margin-bottom: 0.75rem;">🔒</div>
            <h2 style="font-family: var(--font-display); font-size: 1.45rem; font-weight: 800; margin-bottom: 0.4rem;">
              คลังชีท Google Drive
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.5rem;">
              กรุณากรอกรหัสผ่านเพื่อเข้าดูคลังชีทต้นฉบับ 23 โฟลเดอร์ (${totalFiles} ไฟล์ PDF)
            </p>
            <form id="driveUnlockForm" onsubmit="event.preventDefault();" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <input type="password" id="drivePasswordInput" class="search-input" placeholder="ใส่รหัสผ่าน..." style="text-align: center; font-size: 1.25rem; letter-spacing: 0.25em; padding: 0.75rem 1rem;" autocomplete="off" autofocus>
              <div id="drivePassError" style="color: var(--danger); font-size: 0.88rem; font-weight: 600; display: none;">
                ❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
              </div>
              <button type="submit" id="submitUnlockBtn" class="btn btn-primary" style="padding: 0.75rem; font-size: 1rem; font-weight: 700;">
                🔑 ปลดล็อกเข้าดูคลังชีท
              </button>
            </form>
          </div>
        </div>
      `;
      const form = document.getElementById('driveUnlockForm');
      const input = document.getElementById('drivePasswordInput');
      const err = document.getElementById('drivePassError');
      form?.addEventListener('submit', () => {
        if (input.value.trim() === '12345') {
          sessionStorage.setItem('cc1.drive_unlocked', 'true');
          this.renderDriveLibrary(c, activeFolderId);
        } else {
          err.style.display = 'block';
          input.value = '';
          input.focus();
        }
      });
      return;
    }

    c.innerHTML = `
      <div class="card" style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge badge-blue">Google Drive Sync • 23 โฟลเดอร์</span>
          <h1 style="font-family: var(--font-display); font-size: 1.65rem; font-weight: 800; margin-top: 0.35rem;">
            📂 คลังชีทเรียน Google Drive (${totalFiles} ไฟล์ PDF)
          </h1>
        </div>
        <button id="lockDriveBtn" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.85rem;">
          🔒 ล็อกคลังชีท
        </button>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <input type="search" id="driveSearchInput" class="search-input" placeholder="🔎 ค้นหาชื่อโฟลเดอร์หรือชื่อไฟล์ PDF..." autocomplete="off">
      </div>

      <div id="driveFoldersContainer" style="display: flex; flex-direction: column; gap: 1rem;">
        ${folders.map((folder, fIdx) => `
          <div class="card drive-folder-card" data-search="${this.escapeHtml((folder.name + ' ' + folder.files.map(x => x.name).join(' ')).toLowerCase())}" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">
              <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">
                📁 ${fIdx + 1}. ${this.escapeHtml(folder.name)} <small style="font-weight: 500; color: var(--text-secondary); font-size: 0.85rem;">(${folder.files.length} ไฟล์)</small>
              </h2>
              <a href="${folder.url}" target="_blank" rel="noopener" class="btn btn-outline" style="padding: 0.3rem 0.75rem; font-size: 0.85rem;">
                เปิดโฟลเดอร์ใน Drive ↗
              </a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem;">
              ${folder.files.map(df => `
                <a href="${df.url}" target="_blank" rel="noopener" class="btn btn-secondary" style="justify-content: space-between; padding: 0.5rem 0.8rem; font-size: 0.88rem; text-align: left;">
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;" title="${this.escapeHtml(df.name)}">
                    📄 ${this.escapeHtml(df.name)}
                  </span>
                  <small style="color: var(--text-muted); flex-shrink: 0;">${df.totalPages || 0} หน้า ↗</small>
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('lockDriveBtn')?.addEventListener('click', () => {
      sessionStorage.removeItem('cc1.drive_unlocked');
      this.renderDriveLibrary(c, activeFolderId);
    });

    const searchInput = document.getElementById('driveSearchInput');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.drive-folder-card').forEach(card => {
        const match = !q || (card.dataset.search || '').includes(q);
        card.style.display = match ? 'block' : 'none';
      });
    });
  },

  // ================= VIEW: ALL HIGH-YIELD CHEAT SHEET =================
  renderCheatSheet(c) {
    c.innerHTML = `
      <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h1 style="font-size: 1.75rem; font-weight: 700; color: var(--primary);">
            ⚡ สรุปรวมจุดเน้น High-Yield ก่อนเข้าห้องสอบ (ครบทุกบท)
          </h1>
          <p style="color: var(--text-secondary);">
            รวบรวมเฉพาะประเด็นสำคัญที่ออกสอบบ่อยที่สุดของทุกกลุ่มโรค ผลิตภัณฑ์ เภสัชเคมี และกฎหมาย สำหรับกวาดตาทบทวนเร็ว ๆ
          </p>
        </div>
        <button class="btn btn-outline no-print" onclick="window.print()">🖨️ พิมพ์สรุป High-Yield ทั้งหมด</button>
      </div>

      ${this.data.groups.map((g, gIdx) => `
        <div class="card" style="margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--primary); border-bottom: 2px solid var(--border-color); padding-bottom: 0.4rem;">
            ${g.icon} ${g.groupName}
          </h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${g.topics.map(t => `
              <div style="padding: 0.75rem 1rem; background: var(--bg-primary); border-radius: var(--radius-sm); border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
                  <h3 style="font-size: 1.15rem; font-weight: 700;">${t.titleTh || t.title} (${t.title})</h3>
                  <a href="#/summary?topic=${t.id}" class="btn btn-secondary no-print" style="padding: 0.25rem 0.65rem; font-size: 0.85rem;">อ่านตารางเต็ม + ชีท Drive →</a>
                </div>
                <ul style="padding-left: 1.3rem;">
                  ${(t.highYield || []).map(hy => `<li style="margin-bottom: 0.3rem;">${hy}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
