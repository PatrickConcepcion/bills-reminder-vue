import axios, { type InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

const rawApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

async function forceLogout() {
  try {
    await rawApi.post('/auth/logout')
  } catch {
    // no-op: we still redirect to login below
  }

  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

api.interceptors.request.use(
  (config) => ({
    ...config,
    withCredentials: true,
  }),
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url ?? ''
    const isLoginRequest = requestUrl.includes('/auth/login')
    const isRegisterRequest = requestUrl.includes('/auth/register')
    const isRefreshRequest = requestUrl.includes('/auth/refresh')
    const isLogoutRequest = requestUrl.includes('/auth/logout')

    if (isLoginRequest || isRegisterRequest) {
      return Promise.reject(error)
    }

    if (isRefreshRequest || isLogoutRequest || originalRequest._retry) {
      await forceLogout()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await rawApi.post('/auth/refresh')
      return api(originalRequest)
    } catch (refreshError) {
      await forceLogout()
      return Promise.reject(refreshError)
    }
  },
)

export default api
