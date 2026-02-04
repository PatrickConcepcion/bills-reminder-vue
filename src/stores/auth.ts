import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../lib/axios'
import type { ApiError } from '../types/api-error'
import type { LoginPayload, RegisterPayload } from '../types/auth'

interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string
  created_at?: string
  updated_at?: string
}

export const useAuthStore = defineStore('auth', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const isHydrated = ref(false)
  const user = ref<User | null>(null)

  const hydrate = async () => {
    try {
      const res = await api.get('/auth/me')
      user.value = res.data
      isAuthenticated.value = true
    } catch {
      user.value = null
      isAuthenticated.value = false
    } finally {
      isHydrated.value = true
    }
  }

  const login = async (payload: LoginPayload) => {
    isLoading.value = true
    error.value = null

    try {
      await api.post('/auth/login', payload)
      await hydrate()
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message ?? apiError.message ?? 'Login failed'
      isAuthenticated.value = false
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: RegisterPayload) => {
    isLoading.value = true
    error.value = null

    try {
      await api.post('/auth/register', payload)
      await hydrate()
    } catch (err) {
      const apiError = err as ApiError
      error.value =
        apiError.response?.data?.message ?? apiError.message ?? 'Registration failed'
      isAuthenticated.value = false
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    await api.post('/auth/logout')
    isAuthenticated.value = false
    user.value = null
  }

  return {
    isLoading,
    error,
    isAuthenticated,
    isHydrated,
    user,
    hydrate,
    login,
    register,
    logout,
  }
})
