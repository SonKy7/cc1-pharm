// PLE-CC1 Knowledge Hub — Pure Study & High-Yield Summary Web App (ประกาศ ศสภ. ที่ 5/2566)

const App = {
  data: window.CC1_DATA || { groups: [], questions: [], cases: {} },
  state: {
    route: 'home',
    readTopics: {},
    bookmarkedTopics: {},
    fontScale: 1
  },

  init() {
    this.loadProgress();
    this.setupTheme();
    this.setupFontSize();
    window.addEventListener('hashchange', () => this.handleRoute());
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

  setupFontSize() {
    const btn = document.getElementById('fontSizeBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const scales = [1, 1.12, 1.25];
      const nextIdx = (scales.indexOf(this.state.fontScale) + 1) % scales.length;
      this.state.fontScale = scales[nextIdx];
      document.documentElement.style.fontSize = `${this.state.fontScale * 100}%`;
      localStorage.setItem('cc1.fontScale', String(this.state.fontScale));
    });
  },

  getAllTopics() {
    const list = [];
    this.data.groups.forEach((g, gIdx) => {
      g.topics.forEach(t => {
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

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, query] = hash.split('?');
    const navLinks = document.querySelectorAll('.nav a[data-route]');
    navLinks.forEach(a => a.classList.remove('active'));

    const container = document.getElementById('app');

    if (path === '/' || path === '') {
      this.highlightNav('home');
      this.renderHome(container);
    } else if (path.startsWith('/summary')) {
      this.highlightNav('summary');
      const params = new URLSearchParams(query);
      this.renderSummary(container, params.get('topic'));
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
  },

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  },

  // ================= VIEW: HOME (BLUEPRINT DIRECTORY & SEARCH) =================
  renderHome(c) {
    const allTopics = this.getAllTopics();
    const readCount = allTopics.filter(t => this.state.readTopics[t.id]).length;
    const bookmarkedList = allTopics.filter(t => this.state.bookmarkedTopics[t.id]);
    const percentRead = allTopics.length ? Math.round((readCount / allTopics.length) * 100) : 0;

    c.innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, var(--primary-light), var(--bg-surface)); border-color: var(--primary); padding: 1.75rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div style="max-width: 720px;">
            <span class="badge badge-blue" style="font-size: 0.85rem; margin-bottom: 0.5rem;">อ้างอิงประกาศศูนย์สอบความรู้ฯ (ศสภ.) ที่ 5/2566</span>
            <h1 style="font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;">
              📘 สรุปเนื้อหาสอบใบประกอบวิชาชีพเภสัชกรรม (PLE-CC1 & CC2)
            </h1>
            <p style="color: var(--text-secondary); font-size: 1.05rem;">
              ครอบคลุมครบทุกกลุ่มโรคย่อยในภาคผนวก 1 + บูรณาการความรู้ด้านผลิตภัณฑ์ (เทคโนโลยีเภสัชกรรม เภสัชเคมี การควบคุมคุณภาพ สมุนไพรในบัญชียาหลักฯ) และกฎหมายเภสัชกรรม (สัดส่วน <b>ผู้ป่วย 50% : ผลิตภัณฑ์ 40% : สังคมและกฎหมาย 10%</b>)
            </p>
          </div>
          <div style="background: var(--bg-surface); padding: 1rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); min-width: 220px; text-align: center;">
            <div style="font-size: 0.85rem; color: var(--text-muted);">ความคืบหน้าการอ่านของคุณ</div>
            <div style="font-size: 1.9rem; font-weight: 700; color: var(--primary);">${readCount} / ${allTopics.length}</div>
            <div style="font-size: 0.85rem; color: var(--success); font-weight: 600;">อ่านจบแล้ว ${percentRead}%</div>
          </div>
        </div>

        <div style="margin-top: 1.25rem; position: relative;">
          <input type="search" id="globalSearchInput" class="search-input" placeholder="🔍 ค้นหาโรค, ชื่อยา, กลไก, ยีนแพ้ยา (HLA), ADR, กฎหมาย, สูตรคำนวณ (เช่น allopurinol, GINA, ข.ย.11, HLB, warfarin)..." autocomplete="off">
        </div>
        <div id="searchResultsBox" style="margin-top: 0.75rem;"></div>
      </div>

      ${bookmarkedList.length > 0 ? `
        <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.15rem; margin-bottom: 0.6rem;">⭐ หัวข้อที่คุณปักหมุดไว้ทบทวนด่วน (${bookmarkedList.length})</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${bookmarkedList.map(t => `
              <a href="#/summary?topic=${t.id}" class="btn btn-secondary" style="font-size: 0.9rem; padding: 0.35rem 0.8rem;">
                ${t.icon} ${t.titleTh || t.title}
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <h2 style="font-size: 1.45rem;">🗂️ สารบัญเนื้อหาครบตามเกณฑ์ประกาศ ศสภ. ที่ 5/2566</h2>
        <div style="display: flex; gap: 0.6rem;">
          <a href="#/cheatsheet" class="btn btn-outline" style="font-size: 0.9rem; padding: 0.45rem 0.9rem;">⚡ ดูรวมจุดเน้น High-Yield ทั้งหมด</a>
          <a href="#/summary?topic=${allTopics[0]?.id || ''}" class="btn btn-primary" style="font-size: 0.9rem; padding: 0.45rem 0.9rem;">📖 เริ่มอ่านเรียงตามบท</a>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
        ${this.data.groups.map((g, idx) => {
          const doneInGroup = g.topics.filter(t => this.state.readTopics[t.id]).length;
          return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">${g.icon || '📌'}</span>
                    <h3 style="font-size: 1.15rem; font-weight: 700;">หมวด ${idx + 1}: ${g.groupName}</h3>
                  </div>
                  <span class="badge ${doneInGroup === g.topics.length ? 'conf-high' : ''}">${doneInGroup}/${g.topics.length} อ่านแล้ว</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.6rem;">
                  ${g.topics.map(t => {
                    const isRead = !!this.state.readTopics[t.id];
                    const isBookmarked = !!this.state.bookmarkedTopics[t.id];
                    return `
                      <a href="#/summary?topic=${t.id}" style="
                        text-decoration: none;
                        color: var(--text-primary);
                        padding: 0.5rem 0.7rem;
                        border-radius: var(--radius-sm);
                        border: 1px solid var(--border-color);
                        background: ${isRead ? 'var(--success-bg)' : 'var(--bg-primary)'};
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.15s;
                      ">
                        <div>
                          <div style="font-weight: 600; font-size: 0.98rem;">
                            ${isRead ? '✅ ' : '📄 '}${t.titleTh || t.title}
                          </div>
                          <div style="font-size: 0.82rem; color: var(--text-secondary);">${t.title}</div>
                        </div>
                        <span style="font-size: 0.85rem; color: var(--primary); white-space: nowrap;">
                          ${isBookmarked ? '⭐ ' : ''}อ่านสรุป →
                        </span>
                      </a>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Full Inline Expandable Content directly on Home Page -->
      <div style="margin-top: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
          <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">📖 เนื้อหาสรุปฉบับเต็ม (กางอ่านได้ทันทีในหน้าเดียว หรือคลิกแต่ละบท)</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button id="expandAllBtn" class="btn btn-secondary" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">📂 กางเนื้อหาทุกบททั้งหมด</button>
            <button id="collapseAllBtn" class="btn btn-secondary" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">📁 ย่อเก็บทั้งหมด</button>
          </div>
        </div>

        ${this.data.groups.map((g, gIdx) => `
          <div style="margin-bottom: 1.75rem;">
            <h3 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.75rem; padding: 0.5rem 0.85rem; background: var(--primary-light); color: var(--primary); border-left: 5px solid var(--primary); border-radius: var(--radius-sm);">
              ${g.icon} หมวดที่ ${gIdx + 1}: ${g.groupName}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${g.topics.map((t, tIdx) => `
                <details class="card home-topic-details" ${gIdx === 0 && tIdx === 0 ? 'open' : ''} style="margin-bottom: 0;">
                  <summary style="cursor: pointer; font-size: 1.2rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; list-style: none;">
                    <span>📌 ${t.titleTh || t.title} <small style="font-weight: 500; color: var(--text-secondary);">(${t.title})</small></span>
                    <span style="display: flex; gap: 0.5rem; align-items: center;">
                      <a href="#/summary?topic=${t.id}" class="btn btn-outline" style="padding: 0.25rem 0.65rem; font-size: 0.85rem;" onclick="event.stopPropagation();">เปิดหน้าเต็ม ↗</a>
                    </span>
                  </summary>
                  <div class="topic-content" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    ${t.highYield && t.highYield.length ? `
                      <div class="tip" style="margin-bottom: 1rem;">
                        <b style="color: var(--primary);">⚡ จุดเน้น High-Yield ที่ออกสอบบ่อย:</b>
                        <ul style="padding-left: 1.3rem; margin-top: 0.35rem;">
                          ${t.highYield.map(y => `<li>${y}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    ${(t.sections || []).map((s, sIdx) => `
                      <div style="margin-bottom: 1.1rem;">
                        <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 0.45rem;">${sIdx + 1}) ${s.heading}</h4>
                        <div style="line-height: 1.7; font-size: 1.02rem;">${s.html}</div>
                      </div>
                    `).join('')}
                  </div>
                </details>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('expandAllBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.home-topic-details').forEach(d => { d.open = true; });
    });
    document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.home-topic-details').forEach(d => { d.open = false; });
    });

    // Bind live search
    const searchInput = document.getElementById('globalSearchInput');
    const resultsBox = document.getElementById('searchResultsBox');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) {
        resultsBox.innerHTML = '';
        return;
      }

      const matches = [];
      allTopics.forEach(t => {
        let hitWhere = [];
        if ((t.title + ' ' + (t.titleTh || '')).toLowerCase().includes(q)) {
          hitWhere.push('ชื่อหัวข้อ');
        }
        const hyHits = (t.highYield || []).filter(hy => hy.toLowerCase().includes(q));
        if (hyHits.length > 0) {
          hitWhere.push(`High-Yield (${hyHits[0].slice(0, 90)}...)`);
        }
        (t.sections || []).forEach(s => {
          const plain = (s.heading + ' ' + this.stripHtml(s.html)).toLowerCase();
          const idx = plain.indexOf(q);
          if (idx !== -1) {
            const snippet = plain.slice(Math.max(0, idx - 35), Math.min(plain.length, idx + 85));
            hitWhere.push(`${s.heading}: "...${snippet}..."`);
          }
        });

        if (hitWhere.length > 0) {
          matches.push({ topic: t, hits: hitWhere.slice(0, 3) });
        }
      });

      if (matches.length === 0) {
        resultsBox.innerHTML = `<div class="card" style="margin-bottom:0; padding: 0.8rem;">ไม่พบคำว่า "<b>${q}</b>" ในคลังเนื้อหา</div>`;
        return;
      }

      resultsBox.innerHTML = `
        <div class="card" style="margin-bottom: 0; max-height: 420px; overflow-y: auto; border: 2px solid var(--primary);">
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 0.6rem;">
            พบ ${matches.length} หัวข้อที่เกี่ยวข้องกับ "${searchInput.value.trim()}":
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${matches.map(m => `
              <a href="#/summary?topic=${m.topic.id}" style="text-decoration: none; color: inherit; padding: 0.65rem; border-radius: var(--radius-sm); background: var(--bg-primary); border: 1px solid var(--border-color);">
                <div style="font-weight: 700; color: var(--primary);">
                  ${m.topic.icon} ${m.topic.titleTh} (${m.topic.title}) — <span style="font-weight: 500; color: var(--text-secondary);">${m.topic.groupName}</span>
                </div>
                <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.25rem;">
                  ${m.hits.map(h => `<div>• ${h}</div>`).join('')}
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    });
  },

  // ================= VIEW: SUMMARY READER =================
  renderSummary(c, activeTopicId) {
    const allTopics = this.getAllTopics();
    const currentIndex = Math.max(0, allTopics.findIndex(t => t.id === activeTopicId));
    const currentTopic = allTopics[currentIndex] || allTopics[0];

    if (!currentTopic) {
      c.innerHTML = `<div class="card"><p>ไม่พบเนื้อหาสรุป</p></div>`;
      return;
    }

    const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
    const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;
    const isRead = !!this.state.readTopics[currentTopic.id];
    const isBookmarked = !!this.state.bookmarkedTopics[currentTopic.id];

    c.innerHTML = `
      <div class="summary-layout">
        <!-- Sidebar Navigation grouped by Official Blueprint -->
        <aside class="card no-print" style="max-height: calc(100vh - 6rem); overflow-y: auto; position: sticky; top: 4.8rem; padding: 0.9rem;">
          <div style="margin-bottom: 0.6rem;">
            <input type="search" id="sidebarFilterInput" placeholder="🔎 กรองหัวข้อ..." style="width: 100%; padding: 0.45rem 0.7rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-family: var(--font-sans); font-size: 0.95rem; background: var(--bg-primary); color: var(--text-primary);">
          </div>
          <div id="sidebarTopicList" style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${this.data.groups.map((g, gIdx) => `
              <div class="sidebar-group">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.25rem; padding: 0 0.3rem;">
                  ${g.icon} ${gIdx + 1}. ${g.groupName}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                  ${g.topics.map(t => {
                    const active = t.id === currentTopic.id;
                    const read = !!this.state.readTopics[t.id];
                    const bmk = !!this.state.bookmarkedTopics[t.id];
                    return `
                      <a href="#/summary?topic=${t.id}" class="sidebar-topic-link" data-title="${(t.title + ' ' + (t.titleTh || '')).toLowerCase()}" style="
                        text-decoration: none;
                        padding: 0.4rem 0.65rem;
                        border-radius: var(--radius-sm);
                        font-size: 0.95rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: ${active ? 'var(--primary-light)' : 'transparent'};
                        color: ${active ? 'var(--primary)' : 'var(--text-primary)'};
                        font-weight: ${active ? '700' : '400'};
                        border-left: 3px solid ${active ? 'var(--primary)' : 'transparent'};
                      ">
                        <span>${t.titleTh || t.title}</span>
                        <span style="font-size: 0.8rem;">${bmk ? '⭐' : ''}${read ? '✅' : ''}</span>
                      </a>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </aside>

        <!-- Main Study Article -->
        <article class="topic-content">
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
                <button id="printTopicBtn" class="btn btn-secondary" style="padding: 0.45rem 0.85rem; font-size: 0.9rem;" title="พิมพ์หรือบันทึกเป็น PDF">
                  🖨️ พิมพ์ / PDF
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

          <!-- Detailed Sections -->
          ${currentTopic.sections.map((s, idx) => `
            <section class="card" style="margin-bottom: 1rem;">
              <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.45rem;">
                ${idx + 1}. ${s.heading}
              </h2>
              <div style="line-height: 1.75; font-size: 1.05rem;">
                ${s.html}
              </div>
            </section>
          `).join('')}

          ${currentTopic.refs && currentTopic.refs.length > 0 ? `
            <div class="card" style="background: var(--bg-primary); font-size: 0.9rem; color: var(--text-secondary);">
              <b>📚 แนวทางเวชปฏิบัติและเอกสารอ้างอิง:</b>
              <ul style="margin-top: 0.3rem; padding-left: 1.3rem;">
                ${currentTopic.refs.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Prev / Next Topic Footer Navigation -->
          <div class="card no-print" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <div>
              ${prevTopic ? `
                <a href="#/summary?topic=${prevTopic.id}" class="btn btn-secondary">
                  ⬅️ ก่อนหน้า: ${prevTopic.titleTh || prevTopic.title}
                </a>
              ` : `<span></span>`}
            </div>
            <button id="bottomMarkReadBtn" class="btn ${isRead ? 'btn-secondary' : 'btn-primary'}">
              ${isRead ? '✅ อ่านจบหัวข้อนี้แล้ว' : '✅ บันทึกว่าอ่านจบหัวข้อนี้'}
            </button>
            <div>
              ${nextTopic ? `
                <a href="#/summary?topic=${nextTopic.id}" class="btn btn-primary">
                  ถัดไป: ${nextTopic.titleTh || nextTopic.title} ➡️
                </a>
              ` : `<a href="#/" class="btn btn-primary">🏠 กลับหน้าสารบัญ</a>`}
            </div>
          </div>
        </article>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('toggleReadBtn')?.addEventListener('click', () => this.toggleRead(currentTopic.id));
    document.getElementById('bottomMarkReadBtn')?.addEventListener('click', () => {
      this.toggleRead(currentTopic.id);
      if (!isRead && nextTopic) {
        window.location.hash = `#/summary?topic=${nextTopic.id}`;
      }
    });
    document.getElementById('toggleBookmarkBtn')?.addEventListener('click', () => this.toggleBookmark(currentTopic.id));
    document.getElementById('printTopicBtn')?.addEventListener('click', () => window.print());

    const filterInput = document.getElementById('sidebarFilterInput');
    filterInput?.addEventListener('input', () => {
      const q = filterInput.value.trim().toLowerCase();
      document.querySelectorAll('.sidebar-topic-link').forEach(a => {
        const match = !q || (a.dataset.title || '').includes(q);
        a.style.display = match ? 'flex' : 'none';
      });
    });
  },

  // ================= VIEW: ALL HIGH-YIELD CHEAT SHEET =================
  renderCheatSheet(c) {
    const allTopics = this.getAllTopics();
    c.innerHTML = `
      <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h1 style="font-size: 1.75rem; font-weight: 700; color: var(--primary);">
            ⚡ สรุปรวมจุดเน้น High-Yield ก่อนเข้าห้องสอบ (ครบทุกบท)
          </h1>
          <p style="color: var(--text-secondary);">
            รวบรวมเฉพาะประเด็นสำคัญที่ออกสอบบ่อยที่สุดของทุกกลุ่มโรค ผลิตภัณฑ์ และกฎหมาย สำหรับกวาดตาทบทวนเร็ว ๆ
          </p>
        </div>
        <button class="btn btn-outline no-print" onclick="window.print()">🖨️ พิมพ์สรุป High-Yield ทั้งหมด</button>
      </div>

      ${this.data.groups.map((g, gIdx) => `
        <div class="card" style="margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--primary); border-bottom: 2px solid var(--border-color); padding-bottom: 0.4rem;">
            ${g.icon} หมวดที่ ${gIdx + 1}: ${g.groupName}
          </h2>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${g.topics.map(t => `
              <div style="padding: 0.75rem 1rem; background: var(--bg-primary); border-radius: var(--radius-sm); border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
                  <h3 style="font-size: 1.15rem; font-weight: 700;">${t.titleTh || t.title} (${t.title})</h3>
                  <a href="#/summary?topic=${t.id}" class="btn btn-secondary no-print" style="padding: 0.25rem 0.65rem; font-size: 0.85rem;">อ่านตารางเต็ม →</a>
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
