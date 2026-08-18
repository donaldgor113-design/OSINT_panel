import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Source, Session, WorkspaceTab, Filters, ViewMode, ReportTemplateId, SourceId } from "@/types";
import { INITIAL_TABS, SOURCES, SESSIONS } from "@/data/mock";

interface WorkspaceState {
  tabs: WorkspaceTab[];
  activeTab: string;
  sources: Source[];
  sessions: Session[];
  filters: Filters;
  reportTemplate: ReportTemplateId;
}

const initialState: WorkspaceState = {
  tabs: INITIAL_TABS.map((t) => ({ ...t, results: t.results.map((r) => ({ ...r })) })),
  activeTab: "tab-1",
  sources: SOURCES.map((s) => ({ ...s })),
  sessions: SESSIONS.map((s) => ({ ...s })),
  filters: { from: 2024, img: true, txt: true, geo: true },
  reportTemplate: "soc",
};

let tabSeq = 1;

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    addTab(state) {
      tabSeq += 1;
      const tab: WorkspaceTab = {
        id: "tab-" + Date.now(),
        title: "Проєкт " + (state.tabs.length + 1),
        view: "cards",
        submenu: ["shodan", "telegram"],
        results: [],
      };
      state.tabs.push(tab);
      state.activeTab = tab.id;
    },
    closeTab(state, action: PayloadAction<string>) {
      const i = state.tabs.findIndex((t) => t.id === action.payload);
      if (i === -1) return;
      state.tabs.splice(i, 1);
      if (!state.tabs.length) {
        tabSeq += 1;
        state.tabs.push({
          id: "tab-" + Date.now(),
          title: "Проєкт 1",
          view: "cards",
          submenu: ["shodan", "telegram"],
          results: [],
        });
      }
      if (state.activeTab === action.payload) {
        state.activeTab = state.tabs[state.tabs.length - 1].id;
      }
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    setTabView(state, action: PayloadAction<{ tabId: string; view: ViewMode }>) {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) tab.view = action.payload.view;
    },
    setTabResults(state, action: PayloadAction<{ tabId: string; results: WorkspaceTab["results"] }>) {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab) tab.results = action.payload.results;
    },
    addResultToTab(state, action: PayloadAction<{ tabId: string; result: WorkspaceTab["results"][number] }>) {
      const tab = state.tabs.find((t) => t.id === action.payload.tabId);
      if (tab && !tab.results.some((r) => r.id === action.payload.result.id)) {
        tab.results.push(action.payload.result);
      }
    },
    toggleSourceSubmenu(state, action: PayloadAction<SourceId>) {
      const tab = state.tabs.find((t) => t.id === state.activeTab);
      if (!tab) return;
      const ix = tab.submenu.indexOf(action.payload);
      if (ix > -1) tab.submenu.splice(ix, 1);
      else tab.submenu.push(action.payload);
    },
    toggleSource(state, action: PayloadAction<SourceId>) {
      const src = state.sources.find((s) => s.id === action.payload);
      if (!src) return;
      src.active = !src.active;
      const tab = state.tabs.find((t) => t.id === state.activeTab);
      if (!tab) return;
      if (src.active && !tab.submenu.includes(src.id)) tab.submenu.push(src.id);
      if (!src.active) tab.submenu = tab.submenu.filter((x) => x !== src.id);
    },
    toggleAllSources(state) {
      const allOn = state.sources.every((s) => s.active);
      state.sources.forEach((s) => (s.active = !allOn));
      const tab = state.tabs.find((t) => t.id === state.activeTab);
      if (tab) tab.submenu = state.sources.filter((s) => s.active).map((s) => s.id);
    },
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    tickSessions(state) {
      state.sessions.forEach((s) => {
        if (s.state === "run") {
          s.pct = Math.min(100, s.pct + Math.floor(Math.random() * 4));
          if (s.pct >= 100) s.state = "done";
        }
      });
    },
    setReportTemplate(state, action: PayloadAction<ReportTemplateId>) {
      state.reportTemplate = action.payload;
    },
  },
});

export const {
  addTab,
  closeTab,
  setActiveTab,
  setTabView,
  setTabResults,
  addResultToTab,
  toggleSourceSubmenu,
  toggleSource,
  toggleAllSources,
  setFilters,
  tickSessions,
  setReportTemplate,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
