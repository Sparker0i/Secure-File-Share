// store/slices/authSlice.ts
import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set both tokens and user data
    setAuthData(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    // Update only the access token after refresh
    setNewAccessToken(state, action) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
  },
});

export const { setAuthData, setNewAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
