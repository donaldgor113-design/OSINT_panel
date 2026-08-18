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
