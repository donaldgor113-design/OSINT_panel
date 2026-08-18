import type {
  Source, Session, Result, Pin, MediaItem, ReportTemplate, ReportTemplateId, WorkspaceTab,
  Entity, Relationship, TimelineEvent, AgentTask, ChatMessage, BrowserProfile, ApiIntegration,
  ReportArchiveItem, AuditLogEntry,
} from "@/types";

export const SOURCES: Source[] = [
  { id: "shodan", name: "Shodan", icon: "🔍", color: "#FF5C00", active: true, online: true, desc: "Пошук підключених пристроїв та портів" },
  { id: "maltego", name: "Maltego", icon: "🕸️", color: "#00B0A6", active: true, online: true, desc: "Графова кореляція сутностей" },
  { id: "telegram", name: "Telegram API", icon: "✈️", color: "#29A9EB", active: true, online: true, desc: "Парсинг каналів, чатів, медіа" },
  { id: "dorks", name: "Google Dorks", icon: "🔬", color: "#F59E0B", active: true, online: true, desc: "Розширений пошук індексації" },
  { id: "virustotal", name: "VirusTotal", icon: "🦠", color: "#3498DB", active: true, online: false, desc: "IOC, hash, малварь" },
  { id: "twitter", name: "X / Twitter", icon: "🐦", color: "#00B7FF", active: false, online: true, desc: "Соціальна розвідка" },
  { id: "instagram", name: "Instagram", icon: "📷", color: "#E1306C", active: false, online: true, desc: "Медіа та геотеги" },
  { id: "pastebin", name: "Pastebin", icon: "📋", color: "#FBBC04", active: false, online: true, desc: "Пошук витоків даних" },
  { id: "dnstwist", name: "DNSTwist", icon: "🧬", color: "#9C6BFF", active: false, online: true, desc: "Typosquatting доменів" },
];

export const SESSIONS: Session[] = [
  { id: "s1", source: "telegram", label: 'monitoring "/darkweb_ua"', pct: 78, state: "run", tooltip: "Парсинг каналів…" },
  { id: "s2", source: "shodan", label: "scan 185.220.101.0/24", pct: 45, state: "run", tooltip: "Сканування портів…" },
  { id: "s3", source: "dorks", label: 'dork "*.gov.ua" config', pct: 100, state: "done", tooltip: "Завершено · 124 результати" },
  { id: "s4", source: "virustotal", label: "hash batch upload", pct: 12, state: "err", tooltip: "Помилка · ліміт API (429)" },
];

export const RESULTS: Result[] = [
  {
    id: "r1", source: "shodan", type: "text",
    title: "Host 185.220.101.34 — TOR exit",
    body: "Порт 443/tcp · TLS cert CN=tor-relay · ISP: PRIVAX · AS AS51852 · Last scan 2 год тому. Останні 30 днів: 4,2 млн з'єднань.",
    tags: ["type:ip", "ioc:185.220.101.34", "source:shodan", "geo:DE", "anomaly"],
    date: "2026-08-17", ok: true,
  },
  {
    id: "r2", source: "telegram", type: "text",
    title: "Канал «⚡ Дані про об'єкт»",
    body: "Публікація від 16.08: згадка нікнейму, пов'язаного з об'єктом «Віктор». 2 файли (JPG з EXIF). Реакції: 312.",
    tags: ["type:text", "source:telegram", "nickname:victor_ua", "date:>2024.01.01"],
    date: "2026-08-16", ok: true,
  },
  {
    id: "r3", source: "maltego", type: "text",
    title: "Граф зв'язків — 12 вузлів",
    body: "Об'єкт «Віктор» → email victor.k@proton.me → 3 номери → 5 доменів (1 спільний з шахрайською групою «Team Crimson»).",
    tags: ["type:graph", "source:maltego", "relation:email", "ioc:proton"],
    date: "2026-08-15", ok: true,
  },
  {
    id: "r4", source: "dorks", type: "text",
    title: 'Google Dork: filetype:pdf "Віктор" site:*.gov.ua',
    body: "Знайдено 14 документів. Документ №3 містить згадку об'єкта та підпис автора, співставний за почерком.",
    tags: ["type:doc", "source:dorks", "filetype:pdf"],
    date: "2026-08-14", ok: true,
  },
  {
    id: "r5", source: "virustotal", type: "text",
    title: "Hash 6d…fa3c — Trojan.Generic",
    body: "Виявлення 23/68 AV. Завантажено 3 роки тому. Пов'язані адреси: 3, з яких 1 активний.",
    tags: ["type:ioc", "source:virustotal", "hash", "malware"],
    date: "2026-08-14", ok: false,
  },
  {
    id: "r6", source: "telegram", type: "geo",
    title: "Геолокація з фото — Київ, вул. Хрещатик",
    body: "EXIF GPS: 50.4474, 30.5215. Знято 14.08 о 18:42. Збіг з маршрутом об'єкта (транзит через точку).",
    tags: ["type:geo", "source:telegram", "lat:50.4474", "lon:30.5215"],
    date: "2026-08-16", ok: true,
  },
  {
    id: "r7", source: "shodan", type: "text",
    title: "Домен victor-k.site — порт 8443",
    body: "Self-signed TLS, панель керування (Jenkins-like). Відкритий RDP 3389 на спільному хості.",
    tags: ["type:domain", "source:shodan", "port:8443", "risk:high"],
    date: "2026-08-13", ok: true,
  },
];

export const MEDIA: MediaItem[] = [
  { id: "m1", type: "photo", label: "IMG_4812.jpg", exif: "50.4474, 30.5215", pal: 1 },
  { id: "m2", type: "photo", label: "IMG_4813.jpg", exif: "50.4474, 30.5215", pal: 2 },
  { id: "m3", type: "photo", label: "victor_profile.png", exif: "geo: приховано", pal: 3 },
  { id: "m4", type: "video", label: "cam_entrance.mp4", exif: "50.4517, 30.5166", pal: 4 },
  { id: "m5", type: "photo", label: "exif_stripped.jpg", exif: "без EXIF", pal: 2 },
  { id: "m6", type: "video", label: "meeting_b.mp4", exif: "51.5074, -0.1278", pal: 1 },
];

export const PINS: Pin[] = [
  { id: "p1", name: "TOR exit · 185.220.101.34", x: 12, y: 34, color: "#8B5CF6", kind: "ip" },
  { id: "p2", name: "Київ · вул. Хрещатик (фото)", x: 31, y: 31, color: "#F59E0B", kind: "geo" },
  { id: "p3", name: "Хостинг · RU-IX", x: 37, y: 28, color: "#3B82F6", kind: "host" },
  { id: "p4", name: "Proton-mail · Чикаго", x: 76, y: 40, color: "#8B5CF6", kind: "ip" },
  { id: "p5", name: "C2 relay · Frankfurt", x: 14, y: 30, color: "#EF4444", kind: "c2" },
  { id: "p6", name: "Лондон · meeting_b.mp4", x: 11, y: 35, color: "#F59E0B", kind: "geo" },
];

export const FACETS = [
  "type:image", "type:text", "type:geo", "type:ip", "type:ioc", "type:domain",
  "source:telegram", "source:shodan", "source:maltego", "source:dorks", "source:virustotal",
  "date:>2024.01.01", "date:<2025.01.01", "geo:UA", "geo:DE", "geo:US",
  "risk:high", "risk:medium", "anomaly", "exif",
];

export const TEMPLATES: Record<ReportTemplateId, ReportTemplate> = {
  soc: {
    name: "SOC-аналіз",
    icon: "🛡️",
    desc: "Інциденти · Timeline · IOC",
    fields: [
      { from: "IOC-колекція (hashes/IP)", to: "Розділ «IOC»", status: "ok" },
      { from: "Інциденти з Timeline", to: "Розділ «Timeline»", status: "ok" },
      { from: "Джерела (Telegram/Shodan)", to: "Список джерел", status: "ok" },
      { from: "Пріоритет ризику", to: "Метрики ризику", status: "warn" },
    ],
  },
  geo: {
    name: "Geo-розвідка",
    icon: "🗺️",
    desc: "Мапа · Маршрути · Координати",
    fields: [
      { from: "EXIF-координати (6 об'єктів)", to: "Карта маршрутів", status: "ok" },
      { from: "IP-геолокація", to: "Мапа точок", status: "ok" },
      { from: "Точки перетину маршрутів", to: "Аналіз перетинів", status: "ok" },
      { from: "Часові позначки медіа", to: "Timeline пересування", status: "ok" },
    ],
  },
  footprint: {
    name: "Digital Footprint",
    icon: "🌐",
    desc: "Соцмережі · Тональність · Згадки",
    fields: [
      { from: "Згадки в соцмережах", to: "Розділ «Згадки»", status: "ok" },
      { from: "Аналіз тональності", to: "Sentiment-графік", status: "ok" },
      { from: "Акаунти-дублікати", to: "Матриця зв'язків", status: "warn" },
      { from: "Медіа-контент", to: "Галерея доказів", status: "ok" },
    ],
  },
};

export const INITIAL_TABS: WorkspaceTab[] = [
  {
    id: "tab-1",
    title: "Geo-розвідка: об'єкт «Віктор»",
    view: "map",
    submenu: ["shodan", "telegram", "maltego", "dorks"],
    results: RESULTS.slice(),
  },
];

// ── Analysis Lab ─────────────────────────────────────────────
export const ENTITIES: Entity[] = [
  { id: "e1", type: "person", label: "Віктор К.", meta: "Особа інтересу", confidence: 8 },
  { id: "e2", type: "email", label: "victor.k@proton.me", confidence: 9 },
  { id: "e3", type: "company", label: "Team Crimson", meta: "Шахрайське угруповання", confidence: 6 },
  { id: "e4", type: "address", label: "Хрещатик, Київ", confidence: 7 },
  { id: "e5", type: "phone", label: "+380 XX XXX XX01", confidence: 5 },
  { id: "e6", type: "phone", label: "+380 XX XXX XX02", confidence: 4 },
  { id: "e7", type: "company", label: "victor-k.site", meta: "Домен, порт 8443", confidence: 7 },
  { id: "e8", type: "address", label: "TOR exit · 185.220.101.34", confidence: 9 },
];

export const RELATIONSHIPS: Relationship[] = [
  { id: "r1", source: "e1", target: "e2", type: "uses_email", confidence: 9 },
  { id: "r2", source: "e2", target: "e3", type: "linked_to", confidence: 6 },
  { id: "r3", source: "e1", target: "e4", type: "located_at", confidence: 7 },
  { id: "r4", source: "e1", target: "e5", type: "uses_phone", confidence: 5 },
  { id: "r5", source: "e1", target: "e6", type: "uses_phone", confidence: 4 },
  { id: "r6", source: "e1", target: "e7", type: "owns", confidence: 7 },
  { id: "r7", source: "e7", target: "e8", type: "hosted_at", confidence: 8 },
  { id: "r8", source: "e2", target: "e7", type: "registered_with", confidence: 6 },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "t1", date: "2026-08-13", title: "Виявлено домен victor-k.site", description: "Shodan: self-signed TLS, відкритий RDP 3389 на спільному хості.", source: "shodan", confidence: 7 },
  { id: "t2", date: "2026-08-14", title: "Google Dork: 14 документів", description: "PDF з підписом, співставним за почерком з об'єктом.", source: "dorks", confidence: 6 },
  { id: "t3", date: "2026-08-14", title: "VirusTotal: Trojan.Generic", description: "Виявлення 23/68 AV, пов'язані адреси: 3.", source: "virustotal", confidence: 5 },
  { id: "t4", date: "2026-08-16", title: "Публікація в Telegram-каналі", description: "Згадка нікнейму victor_ua, 2 файли з EXIF.", source: "telegram", confidence: 7 },
  { id: "t5", date: "2026-08-16", title: "Геолокація з фото — Хрещатик", description: "EXIF GPS 50.4474, 30.5215, збіг з маршрутом об'єкта.", source: "telegram", confidence: 8 },
  { id: "t6", date: "2026-08-17", title: "TOR exit-вузол 185.220.101.34", description: "Shodan: 4.2 млн з'єднань за 30 днів.", source: "shodan", confidence: 9 },
];

// ── AI Assistant ─────────────────────────────────────────────
export const AGENT_TASKS: AgentTask[] = [
  { id: "a1", agentType: "research", description: "Знайти всі профілі соцмереж для «Віктор К.»", status: "completed", progress: 100, confidence: 7 },
  { id: "a2", agentType: "verification", description: "Перехресна перевірка employment history", status: "running", progress: 62 },
  { id: "a3", agentType: "analysis", description: "Виявити аномалії в timeline", status: "queued", progress: 0 },
  { id: "a4", agentType: "report", description: "Чернетка аналітичного звіту", status: "failed", progress: 30, confidence: 3 },
];

export const CHAT_HISTORY: ChatMessage[] = [
  { id: "c1", role: "user", text: "Які патерни ти бачиш у цьому timeline?", time: "14:02" },
  {
    id: "c2", role: "assistant",
    text: "Помічаю 3 ключові патерни: (1) домен і TOR-вузол пов'язані через спільний хостинг, (2) геолокація з фото збігається з маршрутом об'єкта, (3) email використовується як точка реєстрації домену. Впевненість: 7/10, потребує додаткового підтвердження.",
    time: "14:02",
  },
];

// ── Tools: Browsers / APIs ───────────────────────────────────
export const BROWSER_PROFILES: BrowserProfile[] = [
  { id: "b1", name: "Chrome — Investigator", status: "running", proxy: "SOCKS5 · NL", sessions: 3 },
  { id: "b2", name: "Firefox — Clean", status: "idle", proxy: "Пряме з'єднання", sessions: 0 },
  { id: "b3", name: "Edge — Backup", status: "offline", proxy: "—", sessions: 0 },
  { id: "b4", name: "Tor Browser", status: "running", proxy: "Tor circuit · DE→FR", sessions: 1 },
];

export const API_INTEGRATIONS: ApiIntegration[] = [
  { id: "i1", name: "Shodan API", status: "connected", quota: "842 / 1000 запитів", lastUsed: "5 хв тому" },
  { id: "i2", name: "Google Maps API", status: "connected", quota: "12k / 25k запитів", lastUsed: "12 хв тому" },
  { id: "i3", name: "VirusTotal API", status: "rate_limited", quota: "500 / 500 запитів", lastUsed: "2 хв тому" },
  { id: "i4", name: "Twitter/X API", status: "disconnected", quota: "—", lastUsed: "3 дні тому" },
];

// ── Reports archive ───────────────────────────────────────────
export const REPORT_ARCHIVE: ReportArchiveItem[] = [
  { id: "rp1", title: "SOC-аналіз · Operation Nightfall", template: "soc", createdAt: "2026-08-15", status: "final", format: "pdf" },
  { id: "rp2", title: "Geo-розвідка · об'єкт «Віктор»", template: "geo", createdAt: "2026-08-16", status: "final", format: "docx" },
  { id: "rp3", title: "Digital Footprint · чернетка", template: "footprint", createdAt: "2026-08-18", status: "draft", format: "pdf" },
];

// ── Audit ──────────────────────────────────────────────────────
export const AUDIT_LOG: AuditLogEntry[] = [
  { id: "au1", eventType: "login", user: "analyst_1", resource: "auth", action: "create", status: "success", ip: "192.168.1.100", time: "2026-08-19 09:12" },
  { id: "au2", eventType: "data_access", user: "analyst_1", resource: "DMU registry", action: "read", status: "success", ip: "192.168.1.100", time: "2026-08-19 09:14" },
  { id: "au3", eventType: "query", user: "analyst_1", resource: "Shodan", action: "read", status: "failure", ip: "192.168.1.100", time: "2026-08-19 09:20" },
  { id: "au4", eventType: "export", user: "analyst_1", resource: "SOC report #1", action: "read", status: "success", ip: "192.168.1.100", time: "2026-08-19 10:02" },
  { id: "au5", eventType: "config_change", user: "analyst_1", resource: "registries", action: "update", status: "success", ip: "192.168.1.100", time: "2026-08-19 10:15" },
];
