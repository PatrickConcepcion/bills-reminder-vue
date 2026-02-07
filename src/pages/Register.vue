<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'
import { RouterLink, useRouter } from 'vue-router'
import { useZodErrors } from '../composables/useZodErrors'
import { useAuthStore } from '../stores/auth'

const router = useRouter();

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Email must be valid'),
    password: z.string().min(1, 'Password is required'),
    passwordConfirmation: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords must match',
    path: ['passwordConfirmation'],
  })

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

const { errors, clearErrors, assignErrors } = useZodErrors([
  'name',
  'email',
  'password',
  'passwordConfirmation',
])
const authStore = useAuthStore()

const handleSubmit = async () => {
  clearErrors()

  const result = schema.safeParse(form)
  if (!result.success) {
    assignErrors(result.error)
    return
  }

  try {
    await authStore.register(result.data)
    router.push({ name: 'login' })
  } catch (error) {
    console.error(error)
  }
}

const validateField = (
  field: 'name' | 'email' | 'password' | 'passwordConfirmation',
) => {
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
  <div class="flex min-h-screen items-center justify-center px-6 py-16">
    <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-semibold">Create account</h2>
      <p class="text-sm text-slate-500">
        Get started with a new workspace in minutes.
      </p>
    </div>

    <form class="mt-8 flex flex-col gap-5" @submit.prevent="handleSubmit">
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Name
        <input
          v-model="form.name"
          type="text"
          placeholder="Jordan Lee"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.name ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('name')"
        />
        <span v-if="errors.name" class="text-xs text-rose-500">{{ errors.name }}</span>
      </label>

      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Work email
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
          placeholder="Create a password"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.password ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('password')"
        />
        <span v-if="errors.password" class="text-xs text-rose-500">{{ errors.password }}</span>
      </label>

      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Confirm password
        <input
          v-model="form.passwordConfirmation"
          type="password"
          placeholder="Confirm your password"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.passwordConfirmation ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('passwordConfirmation')"
        />
        <span v-if="errors.passwordConfirmation" class="text-xs text-rose-500">{{ errors.passwordConfirmation }}</span>
      </label>

      <button
        type="submit"
        class="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Create account
      </button>
      <p v-if="authStore.error" class="text-center text-xs text-rose-500">
        {{ authStore.error }}
      </p>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Already have an account?
      <RouterLink :to="{ name: 'login' }" class="font-medium text-slate-700 hover:text-slate-900">
        Login
      </RouterLink>
    </p>
    </div>
  </div>
</template>
