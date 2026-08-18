export type SourceId =
  | "shodan"
  | "maltego"
  | "telegram"
  | "dorks"
  | "virustotal"
  | "twitter"
  | "instagram"
  | "pastebin"
  | "dnstwist";

export interface Source {
  id: SourceId;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  online: boolean;
  desc: string;
}

export type SessionState = "run" | "done" | "err";

export interface Session {
  id: string;
  source: SourceId;
  label: string;
  pct: number;
  state: SessionState;
  tooltip: string;
}

export type ResultType = "text" | "geo" | "ip" | "ioc" | "domain" | "graph" | "doc";

export interface Result {
  id: string;
  source: SourceId;
  type: string;
  title: string;
  body: string;
  tags: string[];
  date: string;
  ok: boolean;
}

export type ViewMode = "cards" | "json" | "map" | "media";

export interface WorkspaceTab {
  id: string;
  title: string;
  view: ViewMode;
  submenu: SourceId[];
  results: Result[];
}

export interface Filters {
  from: number;
  img: boolean;
  txt: boolean;
  geo: boolean;
}

export interface Pin {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  kind: "ip" | "geo" | "host" | "c2";
}

export interface MediaItem {
  id: string;
  type: "photo" | "video";
  label: string;
  exif: string;
  pal: number;
}

export interface FieldMap {
  from: string;
  to: string;
  status: "ok" | "warn";
}

export interface ReportTemplate {
  name: string;
  icon: string;
  desc: string;
  fields: FieldMap[];
}

export type ReportTemplateId = "soc" | "geo" | "footprint";

// Analysis Lab
export type EntityType = "person" | "company" | "address" | "phone" | "email";

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  meta?: string;
  confidence: number;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  source: SourceId;
  confidence: number;
}

// AI Assistant
export type AgentType = "research" | "analysis" | "verification" | "report";
export type AgentTaskStatus = "queued" | "running" | "completed" | "failed";

export interface AgentTask {
  id: string;
  agentType: AgentType;
  description: string;
  status: AgentTaskStatus;
  progress: number;
  confidence?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

// Tools: Browsers / APIs
export interface BrowserProfile {
  id: string;
  name: string;
  status: "idle" | "running" | "offline";
  proxy: string;
  sessions: number;
}

export interface ApiIntegration {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "rate_limited";
  quota: string;
  lastUsed: string;
}

// Reports archive
export interface ReportArchiveItem {
  id: string;
  title: string;
  template: ReportTemplateId;
  createdAt: string;
  status: "draft" | "final";
  format: "pdf" | "docx";
}

// Audit
export interface AuditLogEntry {
  id: string;
  eventType: string;
  user: string;
  resource: string;
  action: string;
  status: "success" | "failure";
  ip: string;
  time: string;
}
