import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./workspaceSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
