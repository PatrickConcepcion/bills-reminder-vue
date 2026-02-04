<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'
import { RouterLink, useRouter } from 'vue-router'
import { useZodErrors } from '../composables/useZodErrors'
import { useAuthStore } from '../stores/auth'

const router = useRouter()

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Email must be valid'),
  password: z.string().min(1, 'Password is required'),
})

const form = reactive({
  email: '',
  password: '',
})

const { errors, clearErrors, assignErrors } = useZodErrors(['email', 'password'])
const authStore = useAuthStore()

const handleSubmit = async () => {
  clearErrors()

  const result = schema.safeParse(form)
  if (!result.success) {
    assignErrors(result.error)
    return
  }
  try {
    await authStore.login(result.data)
    router.push({ name: 'dashboard' })
  } catch (error) {
    console.error(error)
  }
}

const validateField = (field: 'email' | 'password') => {
  const result = schema.safeParse(form)
  if (result.success) {
    errors[field] = undefined
    return
  }

  const issue = result.error.issues.find((item) => item.path[0] === field)
  errors[field] = issue ? issue.message : undefined
}
</script>

<template>
  <div class="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold">Sign in</h2>
      <p class="text-sm text-slate-500">
        Use your credentials to access your workspace.
      </p>
    </div>

    <form class="mt-8 flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Email address
        <input
          v-model="form.email"
          type="email"
          placeholder="you@company.com"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.email ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('email')"
        />
        <span v-if="errors.email" class="text-xs text-rose-500">{{ errors.email }}</span>
      </label>

      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Password
        <input
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.password ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('password')"
        />
        <span v-if="errors.password" class="text-xs text-rose-500">{{ errors.password }}</span>
      </label>

      <button
        type="submit"
        class="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Log in
      </button>
      <p v-if="authStore.error" class="text-center text-xs text-rose-500">
        {{ authStore.error }}
      </p>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      No account yet?
      <RouterLink :to="{ name: 'register' }" class="font-medium text-slate-700 hover:text-slate-900">
        Register
      </RouterLink>
    </p>
  </div>
</template>
