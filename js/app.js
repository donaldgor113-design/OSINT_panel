/* ============================================================
   OSINT Command Center — App Logic (vanilla JS, no deps)
   ============================================================ */
(function () {
  "use strict";

  const D = window.OSINT_DATA;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  const state = {
    tabs: D.tabs.map((t) => ({ ...t, results: D.results.slice() })),
    activeTab: "tab-1",
    sources: D.sources.map((s) => ({ ...s })),
    view: "cards",
    reportTemplate: "soc",
    filters: { from: 2024, img: true, txt: true, geo: true },
  };

  const ACTIVE_ICON = { shodan: "🔍", maltego: "🕸️", telegram: "✈️", dorks: "🔬", virustotal: "🦠", twitter: "🐦", instagram: "📷", pastebin: "📋", dnstwist: "🧬" };

  /* ==================== HELPERS ==================== */
  function toast(msg) {
    const t = $("#export-toast");
    $("#export-toast-text").textContent = msg;
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 2600);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ==================== TABS ==================== */
  function renderTabs() {
    const bar = $("#tabbar");
    bar.innerHTML = "";
    state.tabs.forEach((t) => {
      const hasErr = t.results.some((r) => !r.ok);
      const b = document.createElement("button");
      b.className = "tab" + (t.id === state.activeTab ? " active" : "");
      b.dataset.tab = t.id;
      b.innerHTML =
        `<span class="tab__dot ${hasErr ? "error" : ""}"></span>` +
        `<span class="tab__label">${esc(t.title)}</span>` +
        `<span class="tab__close" data-close="${t.id}" title="Закрити вкладку">✕</span>`;
      b.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]")) { closeTab(t.id); return; }
        state.activeTab = t.id;
        renderTabs(); renderWorkspace();
      });
      bar.appendChild(b);
    });
    const add = document.createElement("button");
    add.className = "tab__add";
    add.textContent = "+";
    add.title = "Нова вкладка";
    add.addEventListener("click", newTab);
    bar.appendChild(add);
  }

  function newTab() {
    const id = "tab-" + (Date.now());
    const n = state.tabs.length + 1;
    state.tabs.push({ id, title: "Проект " + n, view: "cards", submenu: ["shodan", "telegram"], results: [] });
    state.activeTab = id;
    renderTabs(); renderWorkspace();
    window.dispatchEvent(new CustomEvent("opencode:event", { detail: { type: "tab", message: `Вкладка "${state.tabs[state.tabs.length - 1].title}" створена` } }));
  }

  function closeTab(id) {
    const i = state.tabs.findIndex((t) => t.id === id);
    if (i === -1) return;
    state.tabs.splice(i, 1);
    if (!state.tabs.length) newTab();
    if (state.activeTab === id) state.activeTab = state.tabs[state.tabs.length - 1].id;
    renderTabs(); renderWorkspace();
  }

  function curTab() { return state.tabs.find((t) => t.id === state.activeTab); }

  /* ==================== SUBMENU ==================== */
  function renderSubmenu() {
    const sm = $("#submenu");
    sm.innerHTML = "";
    const tab = curTab();
    tab.submenu.forEach((srcId) => {
      const src = state.sources.find((s) => s.id === srcId);
      if (!src) return;
      const b = document.createElement("button");
      b.className = "submenu__btn on";
      b.innerHTML = `<span>${ACTIVE_ICON[src.id] || src.icon}</span><span class="submenu__title">${esc(src.name)} — активний</span>`;
      b.addEventListener("click", () => {
        b.classList.toggle("on");
        const sub = curTab().submenu;
        const ix = sub.indexOf(srcId);
        if (ix > -1) sub.splice(ix, 1); else sub.push(srcId);
        renderSubmenu();
      });
      sm.appendChild(b);
    });
  }

  /* ==================== SIDEBAR: SOURCES ==================== */
  function renderSources() {
    const list = $("#source-list");
    list.innerHTML = "";
    state.sources.forEach((s) => {
      const item = document.createElement("div");
      item.className = "source-item";
      item.title = s.desc;
      item.innerHTML =
        `<input type="checkbox" class="source-item__check" ${s.active ? "checked" : ""} data-src="${s.id}" />` +
        `<span class="source-item__name" style="color:${s.color}">${esc(s.name)}</span>` +
        `<span class="source-item__badge">${s.online ? "online" : "down"}</span>` +
        `<span class="source-item__status ${s.active ? "on" : ""}">${s.active ? "активний" : "вимк."}</span>`;
      const cb = $("input", item);
      cb.addEventListener("change", () => {
        s.active = cb.checked;
        const tab = curTab();
        if (s.active && !tab.submenu.includes(s.id)) tab.submenu.push(s.id);
        if (!s.active) tab.submenu = tab.submenu.filter((x) => x !== s.id);
        renderSources(); renderSubmenu(); renderCanvas();
      });
      list.appendChild(item);
    });
  }

  /* ==================== SIDEBAR: SESSIONS ==================== */
  function renderSessions() {
    const list = $("#session-list");
    list.innerHTML = "";
    D.sessions.forEach((s) => {
      const wrap = document.createElement("div");
      wrap.className = "session";
      const pct = s.pct;
      const fillClass = s.state === "err" ? "fail" : s.state === "done" ? "" : pct > 70 ? "warn" : "";
      wrap.innerHTML =
        `<div class="session__top"><span class="session__name">${ACTIVE_ICON[s.source] || ""} ${esc(s.label)}</span>` +
        `<span class="session__pct ${s.state === "done" ? "done" : s.state === "err" ? "err" : ""}">${s.state === "done" ? "✓ 100%" : s.state === "err" ? "✕ помилка" : pct + "%"}</span></div>` +
        `<div class="progress-track"><div class="progress-track__bar"><div class="progress-track__fill ${fillClass}" style="width:${s.state === "err" ? 0 : s.state === "done" ? 100 : pct}%"></div></div>` +
        `<span class="progress-track__label">${esc(s.tooltip)}</span></div>`;
      list.appendChild(wrap);
    });
  }

  /* ==================== RENDER CANVAS ==================== */
  function renderCanvas() {
    const body = $("#canvas-body");
    const tab = curTab();
    const v = tab.view || state.view;
    $("#view-label").textContent = v === "cards" ? "Картки" : v === "json" ? "JSON" : v === "map" ? "Мапа" : "Медіа";
    $$(".seg__btn").forEach((b) => b.classList.toggle("active", b.dataset.view === v));

    if (v === "cards") renderCards(body, tab);
    else if (v === "json") renderJson(body, tab);
    else if (v === "map") renderMap(body);
    else renderMedia(body);
  }

  function renderCards(body, tab) {
    if (!tab.results.length) { body.innerHTML = emptyState(); return; }
    const grid = document.createElement("div");
    grid.className = "card-grid";
    tab.results.forEach((r) => {
      const card = document.createElement("div");
      card.className = "card draggable";
      card.draggable = true;
      card.dataset.rid = r.id;
      card.innerHTML =
        `<div class="card__head">` +
        `<span class="card__src card__src--${r.source}">${ACTIVE_ICON[r.source] || ""} ${esc(r.source)}</span>` +
        `<span class="card__meta" style="margin-left:auto;margin-top:0">${esc(r.date)}</span></div>` +
        `<div class="card__title">${esc(r.title)}</div>` +
        `<div class="card__body">${esc(r.body)}</div>` +
        `<div class="card__tags">${r.tags.map((t) => `<span class="chip chip--${tagCls(t)}">${esc(t)}</span>`).join("")}</div>` +
        `<div class="card__meta"><span class="card__status status-${r.ok ? "ok" : "err"}">${r.ok ? "● Успішно" : "● Помилка"}</span></div>` +
        (r.ok ? "" : `<div class="card__err">⚠ ${esc(sourceErr(r.source))}</div>`);
      grid.appendChild(card);
    });
    body.innerHTML = "";
    body.appendChild(grid);
    bindDrag();
  }

  function tagCls(t) {
    if (t.startsWith("type:")) return "type";
    if (t.startsWith("source:")) return "src";
    if (t.startsWith("geo:") || t.startsWith("lat:") || t.startsWith("lon:")) return "geo";
    if (t.startsWith("ioc:") || t === "hash" || t === "malware") return "ioc";
    return "type";
  }
  function sourceErr(src) {
    return { virustotal: "VirusTotal повернув 429 (rate limit). Ключ перевищив квоту.", shodan: "Shodan: таймаут підключення." }[src] || "Помилка отримання даних від джерела.";
  }

  function emptyState() {
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60%;color:var(--text-faint);gap:12px">
      <div style="font-size:46px">🛰️</div>
      <div style="font-size:15px;color:var(--text-dim)">Канва порожня</div>
      <div style="font-size:12px">Активуйте джерела зправа або зробіть запит через глобальний пошук (Ctrl+K)</div>
    </div>`;
  }

  function renderJson(body, tab) {
    if (!tab.results.length) { body.innerHTML = emptyState(); return; }
    const data = { query: { tab: tab.title, sources: tab.submenu, filters: state.filters }, count: tab.results.length, results: tab.results.map((r) => ({ id: r.id, source: r.source, type: r.type, title: r.title, date: r.date, ok: r.ok })) };
    const html = syntaxJson(data);
    body.innerHTML = `<div class="json-view"><pre>${html}</pre></div>`;
  }

  function syntaxJson(o) {
    const indent = 0;
    const escs = (s) => esc(String(s));
    function walk(v, dep) {
      const pad = "  ".repeat(dep);
      if (v === null) return `<span class="j-null">null</span>`;
      if (typeof v === "string") return `<span class="j-str">"${escs(v)}"</span>`;
      if (typeof v === "number") return `<span class="j-num">${v}</span>`;
      if (typeof v === "boolean") return `<span class="j-bool">${v}</span>`;
      if (Array.isArray(v)) {
        if (!v.length) return `<span class="j-punct">[]</span>`;
        const items = v.map((i) => walk(i, dep + 1)).join(`,\n${pad}  `);
        return `<span class="j-punct">[</span>\n${pad}  ${items}\n${pad}<span class="j-punct">]</span>`;
      }
      const keys = Object.keys(v);
      if (!keys.length) return `<span class="j-punct">{}</span>`;
      const items = keys.map((k) => `<span class="j-key">"${escs(k)}"</span><span class="j-punct">:</span> ${walk(v[k], dep + 1)}`).join(`,\n${pad}  `);
      return `<span class="j-punct">{</span>\n${pad}  ${items}\n${pad}<span class="j-punct">}</span>`;
    }
    return walk(o, indent);
  }

  function renderMap(body) {
    body.innerHTML = `<div class="map-wrap">
      <div class="map-grid" id="map-grid">
        ${D.pins.map((p) => `
          <div class="map-pin" style="left:${p.x}%;top:${p.y}%;color:${p.color}" data-pin="${p.name}">
            <div class="map-pin__tooltip">${esc(p.name)}</div>
            ${p.kind === "geo" ? "📍" : p.kind === "c2" ? "☠️" : p.kind === "host" ? "🖥️" : "📡"}
          </div>`).join("")}
      </div>
      <div class="map-legend">
        <span><i style="background:#00E5FF"></i> IP-вузол</span>
        <span><i style="background:#FFD60A"></i> Геолокація</span>
        <span><i style="background:#FF6D00"></i> Хостинг</span>
        <span><i style="background:#FF4D5E"></i> C2</span>
      </div>
    </div>`;
  }

  function renderMedia(body) {
    body.innerHTML = `<div class="media-grid">${D.media.map((m) => `
      <div class="media-card" title="Відкрити ${esc(m.label)}">
        <div class="media-card__ph media-card__ph--${m.pal}">${m.type === "video" ? "🎬" : "🖼️"}</div>
        ${m.type === "video" ? `<div class="play">▶</div>` : ""}
        <div class="media-card__meta">${esc(m.label)}</div>
        <div class="media-card__exif">${esc(m.exif)}</div>
      </div>`).join("")}</div>`;
  }

  /* ==================== DRAG & DROP ==================== */
  function bindDrag() {
    $$(".card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", card.dataset.rid);
        $("#drop-zone").classList.remove("hidden");
      });
      card.addEventListener("dragend", () => $("#drop-zone").classList.add("hidden"));
    });
  }

  function bindDropZone() {
    const dz = $("#drop-zone");
    const canvas = $("#canvas");
    canvas.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.remove("hidden"); });
    canvas.addEventListener("dragleave", (e) => {
      if (!canvas.contains(e.relatedTarget)) dz.classList.add("hidden");
    });
    canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.add("hidden");
      const rid = e.dataTransfer.getData("text/plain");
      const tab = curTab();
      const r = D.results.find((x) => x.id === rid);
      if (r && !tab.results.some((x) => x.id === rid)) {
        tab.results.push({ ...r });
        renderCanvas();
        toast("Фрагмент додано до канви для порівняння");
      }
    });
  }

  /* ==================== WORKSPACE ==================== */
  function renderWorkspace() {
    renderTabs(); renderSubmenu(); renderCanvas();
  }

  /* ==================== PALETTE / FACETED SEARCH ==================== */
  function openPalette() {
    $("#palette").classList.remove("hidden");
    $("#palette-overlay").classList.remove("hidden");
    $("#palette-input").value = "";
    renderFacetChips([]);
    $("#palette-results").innerHTML = paletteActions();
    bindPaletteRows();
    setTimeout(() => $("#palette-input").focus(), 30);
  }
  function closePalette() {
    $("#palette").classList.add("hidden");
    $("#palette-overlay").classList.add("hidden");
  }

  function renderFacetChips(parsed) {
    const wrap = $("#palette-chips");
    if (!parsed.length) { wrap.innerHTML = ""; return; }
    wrap.innerHTML = parsed.map((f) => `<span class="chip chip--type">${esc(f)} <b style="cursor:pointer" data-remove="${esc(f)}">✕</b></span>`).join("");
    $$("[data-remove]", wrap).forEach((b) => b.addEventListener("click", () => {
      $("#palette-input").value = $("#palette-input").value.replace(b.dataset.remove, "").trim();
      handlePaletteInput();
    }));
  }

  function handlePaletteInput() {
    const q = $("#palette-input").value.trim();
    renderFacetChips(q ? q.split(/\s+/).filter((f) => /^(type|source|date|geo|risk):/.test(f)) : []);
    const results = $("#palette-results");
    if (!q) { results.innerHTML = paletteActions(); bindPaletteRows(); return; }
    const rows = D.facets.filter((f) => f.includes(q.toLowerCase()));
    results.innerHTML = `<div class="kbd-palette__group">Знайдено джерел: ${rows.length}</div>` +
      rows.slice(0, 8).map((f) => `<button class="kbd-palette__row" data-facet="${esc(f)}"><span>#</span> ${esc(f)} <span class="kbd-palette__key">⏎</span></button>`).join("") +
      `<button class="kbd-palette__row" data-run="true"><span>🔎</span> Виконати розумний пошук: <b style="color:var(--cyan)">${esc(q)}</b></button>`;
    bindPaletteRows();
  }

  function paletteActions() {
    return `<div class="kbd-palette__group">Швидкі дії</div>` +
      `<button class="kbd-palette__row" data-action="new-tab"><span>➕</span> Нова вкладка <span class="kbd-palette__key">Ctrl+T</span></button>` +
      `<button class="kbd-palette__row" data-action="report"><span>📄</span> Створити звіт <span class="kbd-palette__key">Ctrl+R</span></button>` +
      `<button class="kbd-palette__row" data-action="sources"><span>🔌</span> Відкрити менеджер джерел</button>` +
      `<button class="kbd-palette__row" data-action="ai"><span>🤖</span> AI Insights</button>` +
      `<button class="kbd-palette__row" data-action="export"><span>⛑️</span> Екстрений експорт</button>`;
  }

  function bindPaletteRows() {
    $$("#palette-results [data-action]").forEach((b) => b.addEventListener("click", () => { runAction(b.dataset.action); closePalette(); }));
    $$("#palette-results [data-facet]").forEach((b) => {
      b.addEventListener("click", () => {
        const input = $("#palette-input");
        input.value = input.value.trim() ? input.value.trim() + " " + b.dataset.facet : b.dataset.facet;
        handlePaletteInput();
      });
    });
    const runBtn = $("#palette-results [data-run]");
    if (runBtn) runBtn.addEventListener("click", () => {
      const q = $("#palette-input").value.trim();
      runSmartSearch(q);
      closePalette();
    });
  }

  function runSmartSearch(q) {
    const tab = curTab();
    let pool = D.results.slice();
    const tokens = q.toLowerCase().split(/\s+/);
    tokens.forEach((t) => {
      if (t.startsWith("type:")) pool = pool.filter((r) => r.type === t.slice(5) || r.tags.some((x) => x === t));
      else if (t.startsWith("source:")) pool = pool.filter((r) => r.source === t.slice(7));
      else if (t.startsWith("date:")) {
        const m = t.match(/^date:([><]?=?)(\d{4})-?(\d{2})?-?(\d{2})?$/);
        if (m) {
          const [_, op, y] = m;
          const bound = (m[3] ? y + "-" + m[3] : y + "-12") + (m[4] ? "-" + m[4] : "-31");
          pool = pool.filter((r) => {
            const rd = r.date.replace(/[.\/]/g, "-");
            if (op === ">") return rd > bound;
            if (op === "<") return rd < bound;
            return rd.startsWith(y);
          });
        }
      }
      else if (t.startsWith("geo:")) pool = pool.filter((r) => r.tags.some((x) => x.startsWith("geo:")));
      else pool = pool.filter((r) => r.tags.some((x) => x === t) || r.title.toLowerCase().includes(t) || r.body.toLowerCase().includes(t));
    });
    tab.results = pool.length ? pool : [{ id: "empty", source: "dorks", type: "text", title: "Нічого не знайдено", body: `Запит «${q}» не дав результатів серед поточних даних.`, tags: [], date: "—", ok: false }];
    renderWorkspace();
    toast(`Розумний пошук: ${pool.length} результатів`);
  }

  function runAction(a) {
    if (a === "new-tab") newTab();
    else if (a === "report") openReport();
    else if (a === "sources") { $("#source-list").scrollIntoView({ behavior: "smooth" }); toast("Менеджер джерел"); }
    else if (a === "ai") toggleAI();
    else if (a === "export") openExport();
  }

  /* ==================== REPORT WIZARD ==================== */
  function openReport() {
    $("#report-modal").classList.remove("hidden");
    $("#report-overlay").classList.remove("hidden");
    renderTemplateList();
    renderFieldmap();
    $("#report-progress").classList.add("hidden");
    $("#report-generate").disabled = false;
  }
  function closeReport() { $("#report-modal").classList.add("hidden"); $("#report-overlay").classList.add("hidden"); }

  function renderTemplateList() {
    $$(".template-card").forEach((c) => {
      c.classList.toggle("active", c.dataset.template === state.reportTemplate);
    });
  }
  function renderFieldmap() {
    const tpl = D.templates[state.reportTemplate];
    $("#fieldmap").innerHTML = tpl.fields.map((f) => `
      <div class="fieldmap__row">
        <b>${esc(f.from)}</b>
        <span class="fm-arrow">→</span>
        <span>${esc(f.to)}</span>
        <span class="fm-status ${f.status === "warn" ? "warn" : ""}">${f.status === "warn" ? "⚠ ручне" : "✓ авто"}</span>
      </div>`).join("");
  }

  function generateReport() {
    const btn = $("#report-generate");
    btn.disabled = true;
    const tpl = D.templates[state.reportTemplate];
    const fmt = $('input[name="report-format"]:checked').value;
    const track = $("#report-progress");
    track.classList.remove("hidden");
    const fill = $("#report-progress-fill");
    const label = $("#report-progress-label");
    let p = 0;
    const timer = setInterval(() => {
      p += Math.floor(Math.random() * 12) + 5;
      if (p >= 100) p = 100;
      fill.style.width = p + "%";
      label.textContent = "Генерація «" + tpl.name + "» (" + fmt.toUpperCase() + ")… " + p + "%";
      if (p >= 100) {
        clearInterval(timer);
        label.textContent = "✓ Готово — " + tpl.name + "." + fmt;
        toast("Звіт згенеровано та підписано водяним знаком");
        setTimeout(() => { track.classList.add("hidden"); closeReport(); }, 1600);
      }
    }, 260);
  }

  /* ==================== EXPORT ==================== */
  function openExport() { $("#export-modal").classList.remove("hidden"); $("#export-overlay").classList.remove("hidden"); }
  function closeExport() { $("#export-modal").classList.add("hidden"); $("#export-overlay").classList.add("hidden"); }

  /* ==================== AI WIDGET ==================== */
  function toggleAI() {
    const w = $("#ai-widget");
    const body = $("#ai-body");
    body.classList.toggle("hidden");
    $("#ai-chev").textContent = body.classList.contains("hidden") ? "▸" : "▾";
    w.classList.toggle("ai-widget--mini", body.classList.contains("hidden"));
  }

  /* ==================== SESSION TIMER ==================== */
  function startTimer() {
    let s = 15 * 60;
    setInterval(() => {
      s--;
      const m = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      $("#session-timer").textContent = m + ":" + ss;
      if (s <= 60) $("#session-timer").style.color = "var(--red)";
    }, 1000);
  }

  /* ==================== SIMULATED SESSIONS ==================== */
  function tickSessions() {
    setInterval(() => {
      D.sessions.forEach((s) => {
        if (s.state === "run") { s.pct = Math.min(100, s.pct + Math.floor(Math.random() * 4)); if (s.pct >= 100) s.state = "done"; }
      });
      renderSessions();
    }, 2200);
  }

  /* ==================== EVENTS ==================== */
  function bindEvents() {
    // Global search
    $("#global-search").addEventListener("click", openPalette);
    $("#palette-overlay").addEventListener("click", closePalette);
    $("#palette-input").addEventListener("input", handlePaletteInput);
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") { e.preventDefault(); openReport(); }
      if (e.key === "Escape") { closePalette(); closeReport(); closeExport(); }
    });

    // View switch
    $("#view-switch").addEventListener("click", (e) => {
      const b = e.target.closest(".seg__btn");
      if (!b) return;
      curTab().view = b.dataset.view;
      renderCanvas();
    });

    // Toolbar
    $("#clear-canvas").addEventListener("click", () => { curTab().results = []; renderCanvas(); toast("Канва очищена"); });
    $("#drag-hint").addEventListener("click", () => toast("Перетягніть картку прямо в область канви"));

    // Report
    $("#report-btn").addEventListener("click", openReport);
    $("#report-close").addEventListener("click", closeReport);
    $("#report-overlay").addEventListener("click", closeReport);
    $("#report-cancel").addEventListener("click", closeReport);
    $("#report-generate").addEventListener("click", generateReport);
    $("#template-list").addEventListener("click", (e) => {
      const c = e.target.closest(".template-card");
      if (!c) return;
      state.reportTemplate = c.dataset.template;
      renderTemplateList(); renderFieldmap();
    });

    // Export
    $("#export-btn").addEventListener("click", openExport);
    $("#export-close").addEventListener("click", closeExport);
    $("#export-overlay").addEventListener("click", closeExport);
    $("#export-full").addEventListener("click", () => toast("Повний дамп зібрано · watermarking done"));
    $$("[data-export]").forEach((b) => b.addEventListener("click", () => toast("Експорт «" + b.dataset.export + "» розпочато")));

    // Notifications
    $("#notif-btn").addEventListener("click", () => $("#notif-panel").classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#notif-btn") && !e.target.closest("#notif-panel")) $("#notif-panel").classList.add("hidden");
    });

    // Sources toggle all
    $("#sources-toggle").addEventListener("click", () => {
      const allOn = state.sources.every((s) => s.active);
      state.sources.forEach((s) => { s.active = !allOn; });
      curTab().submenu = state.sources.filter((s) => s.active).map((s) => s.id);
      renderSources(); renderSubmenu(); renderCanvas();
      toast(allOn ? "Усі джерела вимкнено" : "Усі джерела активовано");
    });

    // Filters
    $("#range-date").addEventListener("input", (e) => { state.filters.from = +e.target.value; $("#range-value").textContent = e.target.value + "–2026"; });
    $("#flt-img").addEventListener("change", (e) => { state.filters.img = e.target.checked; toast("Фільтр зображень: " + (e.target.checked ? "увімк." : "вимк.")); });
    $("#flt-txt").addEventListener("change", (e) => { state.filters.txt = e.target.checked; });
    $("#flt-geo").addEventListener("change", (e) => { state.filters.geo = e.target.checked; });

    // AI
    $("#ai-head").addEventListener("click", toggleAI);
  }

  /* ==================== INIT ==================== */
  function init() {
    renderWorkspace();
    renderSources();
    renderSessions();
    bindEvents();
    bindDropZone();
    startTimer();
    tickSessions();
    // API status toggle demo
    setInterval(() => {
      const el = $("#api-status");
      el.classList.remove("hidden");
      const down = Math.random() < 0.12;
      el.classList.toggle("api-status--exit", down);
      $("#api-label").textContent = down ? " API offline — проксі повторює" : " API online";
    }, 9000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
