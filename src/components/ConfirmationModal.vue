<script setup lang="ts">
import Modal from './Modal.vue'

defineProps<{
  isOpen: boolean
  title: string
  message: string
  isDestructive?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Modal :is-open="isOpen" :title="title" @close="emit('close')">
    <p class="text-sm text-slate-500">{{ message }}</p>

    <div class="mt-8 flex justify-end gap-3">
      <button
        type="button"
        class="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        @click="emit('close')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="h-10 rounded-xl px-4 text-sm font-semibold text-white transition"
        :class="isDestructive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-900 hover:bg-slate-800'"
        @click="emit('confirm')"
      >
        Confirm
      </button>
    </div>
  </Modal>
</template>
