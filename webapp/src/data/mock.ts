import type { Source, Session, Result, Pin, MediaItem, ReportTemplate, ReportTemplateId, WorkspaceTab } from "@/types";

export const SOURCES: Source[] = [
  { id: "shodan", name: "Shodan", icon: "🔍", color: "#FF5C00", active: true, online: true, desc: "Пошук підключених пристроїв та портів" },
  { id: "maltego", name: "Maltego", icon: "🕸️", color: "#00B0A6", active: true, online: true, desc: "Графова кореляція сутностей" },
  { id: "telegram", name: "Telegram API", icon: "✈️", color: "#29A9EB", active: true, online: true, desc: "Парсинг каналів, чатів, медіа" },
  { id: "dorks", name: "Google Dorks", icon: "🔬", color: "#FFD60A", active: true, online: true, desc: "Розширений пошук індексації" },
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
  { id: "p1", name: "TOR exit · 185.220.101.34", x: 12, y: 34, color: "#00E5FF", kind: "ip" },
  { id: "p2", name: "Київ · вул. Хрещатик (фото)", x: 31, y: 31, color: "#FFD60A", kind: "geo" },
  { id: "p3", name: "Хостинг · RU-IX", x: 37, y: 28, color: "#FF6D00", kind: "host" },
  { id: "p4", name: "Proton-mail · Чикаго", x: 76, y: 40, color: "#00E5FF", kind: "ip" },
  { id: "p5", name: "C2 relay · Frankfurt", x: 14, y: 30, color: "#FF4D5E", kind: "c2" },
  { id: "p6", name: "Лондон · meeting_b.mp4", x: 11, y: 35, color: "#FFD60A", kind: "geo" },
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
