<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'
import { RouterLink } from 'vue-router'
import { useZodErrors } from '../composables/useZodErrors'

const schema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Email must be valid'),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const { errors, clearErrors, assignErrors } = useZodErrors([
  'fullName',
  'email',
  'password',
  'confirmPassword',
])

const handleSubmit = () => {
  clearErrors()

  const result = schema.safeParse(form)
  if (!result.success) {
    assignErrors(result.error)
  }
}

const validateField = (field: 'fullName' | 'email' | 'password' | 'confirmPassword') => {
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
      <h2 class="text-2xl font-semibold">Create account</h2>
      <p class="text-sm text-slate-500">
        Get started with a new workspace in minutes.
      </p>
    </div>

    <form class="mt-8 flex flex-col gap-5" @submit.prevent="handleSubmit">
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Full name
        <input
          v-model="form.fullName"
          type="text"
          placeholder="Jordan Lee"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.fullName ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('fullName')"
        />
        <span v-if="errors.fullName" class="text-xs text-rose-500">{{ errors.fullName }}</span>
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
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.confirmPassword ? 'border-rose-500' : 'border-slate-200'"
          @blur="validateField('confirmPassword')"
        />
        <span v-if="errors.confirmPassword" class="text-xs text-rose-500">{{ errors.confirmPassword }}</span>
      </label>

      <button
        type="submit"
        class="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Create account
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Already have an account?
      <RouterLink to="/login" class="font-medium text-slate-700 hover:text-slate-900">
        Login
      </RouterLink>
    </p>
  </div>
</template>
