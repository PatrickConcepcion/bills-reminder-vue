<script setup lang="ts">
import type { Bill } from '../types/bills'

defineProps<{
  bills: Bill[]
  isLoading?: boolean
  readonly?: boolean
}>()

defineEmits<{
  (e: 'edit', bill: Bill): void
  (e: 'delete', bill: Bill): void
  (e: 'pay', bill: Bill): void
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount: string, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(Number(amount))
}

const isOverdue = (bill: Bill) => {
  const dueDate = new Date(bill.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today && !bill.paidAt
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="idx in 6"
        :key="idx"
        class="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex h-full flex-col justify-between gap-4">
          <div class="space-y-2">
            <div class="h-4 w-2/3 rounded bg-slate-200" />
            <div class="h-3 w-1/2 rounded bg-slate-200" />
            <div class="h-5 w-20 rounded-full bg-slate-200" />
          </div>

          <div class="flex items-center justify-between">
            <div class="h-4 w-20 rounded bg-slate-200" />
            <div class="flex gap-1">
              <div class="h-8 w-8 rounded-lg bg-slate-200" />
              <div class="h-8 w-8 rounded-lg bg-slate-200" />
              <div class="h-8 w-8 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="bills.length === 0" class="py-12 text-center text-slate-400">
      No bills found.
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="bill in bills"
        :key="bill.id"
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200"
      >
        <div class="flex h-full flex-col justify-between gap-4">
          <div class="flex flex-col gap-2">
            <span class="font-semibold text-slate-900">{{ bill.name }}</span>
            <span class="text-xs" :class="isOverdue(bill) ? 'text-rose-500' : 'text-slate-500'">
              Due {{ formatDate(bill.dueDate) }}
            </span>
            <span
              v-if="bill.isRecurring"
              class="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {{ bill.frequency }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="font-semibold" :class="isOverdue(bill) ? 'text-rose-500' : 'text-slate-900'">{{
              formatCurrency(bill.amount, bill.currency)
            }}</span>

            <div v-if="!readonly" class="flex items-center gap-1">
              <button
                class="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                title="Mark as Paid"
                @click="$emit('pay', bill)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </button>
              <button
                class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                title="Edit"
                @click="$emit('edit', bill)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
              <button
                class="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                title="Delete"
                @click="$emit('delete', bill)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
