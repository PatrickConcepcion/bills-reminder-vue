<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl transition-all">
        <div class="mb-6 flex items-center justify-between">
          <h3 v-if="title" class="text-xl font-semibold text-slate-900">{{ title }}</h3>
          <button type="button" class="text-slate-400 hover:text-slate-600" @click="$emit('close')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
