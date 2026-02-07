<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="sticky top-0 z-10 w-full border-b border-slate-200 bg-white px-8 py-4">
    <div class="mx-auto flex max-w-7xl items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-lg bg-slate-900"></div>
        <span class="text-lg font-bold text-slate-900">BillManager</span>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name }}</p>
          <p class="text-xs text-slate-500">{{ authStore.user?.email }}</p>
        </div>
        <div class="h-8 w-[1px] bg-slate-200"></div>
        <button
          @click="handleLogout"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
