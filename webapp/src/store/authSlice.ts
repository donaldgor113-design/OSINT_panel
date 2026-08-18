import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authApi from "@/api/auth";
import { tokenStorage } from "@/api/tokenStorage";
import type { ApiUser } from "@/types/api";
import type { ApiError } from "@/types/api";
import { isAxiosError } from "axios";

interface AuthState {
  user: ApiUser | null;
  status: "idle" | "loading" | "authenticated" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: tokenStorage.getUser(),
  status: tokenStorage.getAccess() && tokenStorage.getUser() ? "authenticated" : "idle",
  error: null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload.username, payload.password);
      tokenStorage.set(res.access_token, res.refresh_token);
      tokenStorage.setUser(res.user);
      return res.user;
    } catch (err) {
      if (isAxiosError<ApiError>(err) && err.response?.data?.error) {
        return rejectWithValue(err.response.data.error.message);
      }
      return rejectWithValue("Не вдалося увійти. Перевірте з'єднання з сервером.");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } finally {
    tokenStorage.clear();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    forceLogout(state) {
      tokenStorage.clear();
      state.user = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Помилка входу";
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
      });
  },
});

export const { forceLogout } = authSlice.actions;
export default authSlice.reducer;
