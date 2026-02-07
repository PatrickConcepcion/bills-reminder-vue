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

const normalizeRequestPath = (requestUrl?: string) => {
  const sanitizedUrl = requestUrl ?? ''
  if (!sanitizedUrl) return ''

  try {
    return new URL(sanitizedUrl, import.meta.env.VITE_API_BASE_URL).pathname.replace(/\/+$/, '')
  } catch {
    return sanitizedUrl.replace(/[?#].*$/, '').replace(/\/+$/, '')
  }
}

async function forceLogout() {
  try {
    await rawApi.post('/auth/logout')
  } catch {}

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

    const requestPath = normalizeRequestPath(originalRequest.url)
    const isLoginRequest = requestPath === '/auth/login'
    const isRegisterRequest = requestPath === '/auth/register'
    const isRefreshRequest = requestPath === '/auth/refresh'
    const isLogoutRequest = requestPath === '/auth/logout'

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
