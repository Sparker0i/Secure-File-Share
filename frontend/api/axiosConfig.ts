// axiosConfig.ts
import axios from "axios"
import store from "../store" // Adjust the path to your Redux store
import { setNewAccessToken, logout } from "../store/slices/authSlice"

// Create an Axios instance with your backend base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
})

// Request interceptor to attach the access token from Redux
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.token
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Check if we got a 401 and haven't already retried this request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const state = store.getState()
      const refreshToken = state.auth.refreshToken
      if (refreshToken) {
        try {
          // Call your refresh endpoint; adjust the URL as needed
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/token/refresh/`, {
            refresh_token: refreshToken,
          })
          const newAccessToken = response.data.access_token
          // Update the Redux store with the new token
          store.dispatch(setNewAccessToken(newAccessToken))
          // Update the original request's Authorization header and retry it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return axios(originalRequest)
        } catch (refreshError) {
          // If refresh fails, log the user out
          store.dispatch(logout())
          return Promise.reject(refreshError)
        }
      } else {
        // If no refresh token, log out
        store.dispatch(logout())
      }
    }
    return Promise.reject(error)
  },
)

export default api

