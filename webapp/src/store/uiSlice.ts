import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  paletteOpen: boolean;
  reportOpen: boolean;
  exportOpen: boolean;
  notificationsOpen: boolean;
  aiCollapsed: boolean;
}

const initialState: UiState = {
  paletteOpen: false,
  reportOpen: false,
  exportOpen: false,
  notificationsOpen: false,
  aiCollapsed: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openPalette(state) { state.paletteOpen = true; },
    closePalette(state) { state.paletteOpen = false; },
    openReport(state) { state.reportOpen = true; },
    closeReport(state) { state.reportOpen = false; },
    openExport(state) { state.exportOpen = true; },
    closeExport(state) { state.exportOpen = false; },
    toggleNotifications(state) { state.notificationsOpen = !state.notificationsOpen; },
    closeNotifications(state) { state.notificationsOpen = false; },
    toggleAi(state) { state.aiCollapsed = !state.aiCollapsed; },
  },
});

export const {
  openPalette, closePalette,
  openReport, closeReport,
  openExport, closeExport,
  toggleNotifications, closeNotifications,
  toggleAi,
} = uiSlice.actions;

export default uiSlice.reducer;
