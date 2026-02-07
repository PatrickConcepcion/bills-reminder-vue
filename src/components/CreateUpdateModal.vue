<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { z } from 'zod'
import { useZodErrors } from '../composables/useZodErrors'
import { useBillStore } from '../stores/bills'
import type { Bill, CreateBillPayload, Frequency } from '../types/bills'
import Modal from './Modal.vue'

const props = defineProps<{
  isOpen: boolean
  bill?: Bill | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const store = useBillStore()

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.string().min(1, 'Currency is required').default('USD'),
    dueDate: z.string().min(1, 'Due date is required'),
    isRecurring: z.boolean(),
    frequency: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY'] as const).nullable().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.frequency) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['frequency'],
        message: 'Frequency is required for recurring bills',
      })
    }
  })

const form = reactive({
  name: '',
  amount: 0,
  currency: 'USD',
  dueDate: '',
  isRecurring: false,
  frequency: null as Frequency | null,
  description: '',
})

const { errors, clearErrors, assignErrors } = useZodErrors([
  'name',
  'amount',
  'currency',
  'dueDate',
  'frequency',
  'description',
])

const isEditMode = computed(() => !!props.bill)
const modalTitle = computed(() => (isEditMode.value ? 'Edit Bill' : 'New Bill'))

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      clearErrors()
      if (props.bill) {
        form.name = props.bill.name
        form.amount = Number(props.bill.amount)
        form.currency = props.bill.currency
        form.dueDate = props.bill.dueDate.split('T')[0] || ''
        form.isRecurring = props.bill.isRecurring
        form.frequency = props.bill.frequency
        form.description = props.bill.description ?? ''
      } else {
        form.name = ''
        form.amount = 0
        form.currency = 'USD'
        form.dueDate = ''
        form.isRecurring = false
        form.frequency = null
        form.description = ''
      }
    }
  },
)

const handleSubmit = async () => {
  clearErrors()

  const result = schema.safeParse(form)

  if (!result.success) {
    assignErrors(result.error)
    return
  }

  const payload: CreateBillPayload = {
    ...result.data,
    dueDate: new Date(result.data.dueDate).toISOString(),
    frequency: result.data.isRecurring ? result.data.frequency : null,
  }

  try {
    if (isEditMode.value && props.bill) {
      await store.updateBill(props.bill.id, payload)
    } else {
      await store.createBill(payload)
    }
    emit('save')
    emit('close')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <Modal :is-open="isOpen" :title="modalTitle" @close="$emit('close')">
    <form class="flex flex-col gap-5" @submit.prevent="handleSubmit" novalidate>
      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Name
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Electric Bill"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.name ? 'border-rose-500' : 'border-slate-200'"
        />
        <span v-if="errors.name" class="text-xs text-rose-500">{{ errors.name }}</span>
      </label>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Amount
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            :class="errors.amount ? 'border-rose-500' : 'border-slate-200'"
          />
          <span v-if="errors.amount" class="text-xs text-rose-500">{{ errors.amount }}</span>
        </label>

        <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Currency
          <input
            v-model="form.currency"
            type="text"
            placeholder="USD"
            class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            :class="errors.currency ? 'border-rose-500' : 'border-slate-200'"
          />
          <span v-if="errors.currency" class="text-xs text-rose-500">{{ errors.currency }}</span>
        </label>
      </div>

      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Due Date
        <input
          v-model="form.dueDate"
          type="date"
          class="h-11 rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.dueDate ? 'border-rose-500' : 'border-slate-200'"
        />
        <span v-if="errors.dueDate" class="text-xs text-rose-500">{{ errors.dueDate }}</span>
      </label>

      <label class="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          v-model="form.isRecurring"
          type="checkbox"
          class="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
        Is Recurring?
      </label>

      <label
        v-if="form.isRecurring"
        class="flex flex-col gap-2 text-sm font-medium text-slate-700"
      >
        Frequency
        <select
          v-model="form.frequency"
          class="h-11 rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          :class="errors.frequency ? 'border-rose-500' : 'border-slate-200'"
        >
          <option :value="null" disabled>Select Frequency</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <span v-if="errors.frequency" class="text-xs text-rose-500">{{ errors.frequency }}</span>
      </label>

      <label class="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Description (Optional)
        <textarea
          v-model="form.description"
          rows="3"
          class="rounded-xl border border-slate-200 p-4 text-sm text-slate-900 outline-none transition focus:border-slate-900"
        ></textarea>
      </label>

      <div class="mt-4 flex justify-end gap-3">
        <button
          type="button"
          class="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          :disabled="store.isLoading"
        >
          <span v-if="store.isLoading">Saving...</span>
          <span v-else>Save Bill</span>
        </button>
      </div>
      <p v-if="store.error" class="text-center text-xs text-rose-500">
        {{ store.error }}
      </p>
    </form>
  </Modal>
</template>
