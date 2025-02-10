// store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import { persistStore, persistReducer } from "redux-persist"
import { CookieStorage } from "redux-persist-cookie-storage"
import Cookies from "js-cookie"

// Configure Redux Persist to use cookies for storage
const persistConfig = {
  key: "root",
  storage: new CookieStorage(Cookies, {
    // Optional: specify additional cookie options here, e.g., domain, secure flag, path, etc.
    // For example:
    // cookieOptions: { path: '/', secure: true }
  }),
  whitelist: ["auth"], // persist only the auth slice
}

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here if needed
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check if needed for non-serializable items
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store

