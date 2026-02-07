<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBillStore } from '../stores/bills'
import type { Bill } from '../types/bills'
import { bucketBills } from '../utils/billBuckets'
import Header from '../components/Header.vue'
import BillList from '../components/BillList.vue'
import CreateUpdateModal from '../components/CreateUpdateModal.vue'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const store = useBillStore()

onMounted(() => {
  store.fetchBills()
})

// Tab state
type TabType = 'overdue' | 'upcoming' | 'paid'
const activeTab = ref<TabType>('upcoming')

// Modals state
const isCreateUpdateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedBill = ref<Bill | null>(null)

const openCreateModal = () => {
  selectedBill.value = null
  isCreateUpdateModalOpen.value = true
}

const openEditModal = (bill: Bill) => {
  selectedBill.value = bill
  isCreateUpdateModalOpen.value = true
}

const openDeleteModal = (bill: Bill) => {
  selectedBill.value = bill
  isDeleteModalOpen.value = true
}

const handleDeleteConfirm = async () => {
  if (selectedBill.value) {
    await store.deleteBill(selectedBill.value.id)
    isDeleteModalOpen.value = false
    selectedBill.value = null
  }
}

const handleMarkAsPaid = async (bill: Bill) => {
  await store.payBill(bill.id)
  await store.fetchBills()
}

const billBuckets = computed(() => bucketBills(store.bills))

// Lists
const overdueBills = computed(() => {
  return billBuckets.value.overdue
})

const upcomingBills = computed(() => {
  return billBuckets.value.upcoming
})

const paidBills = computed(() => {
  return billBuckets.value.paid
})

const currentBills = computed(() => {
  switch (activeTab.value) {
    case 'overdue':
      return overdueBills.value
    case 'upcoming':
      return upcomingBills.value
    case 'paid':
      return paidBills.value
    default:
      return []
  }
})

const tabs = computed(() => [
  { key: 'overdue', label: 'Overdue', count: overdueBills.value.length, color: 'rose' },
  { key: 'upcoming', label: 'Upcoming', count: upcomingBills.value.length, color: 'blue' },
  { key: 'paid', label: 'Paid', count: paidBills.value.length, color: 'emerald' },
])
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-100">
    <Header />

    <main class="flex-1 px-6 py-8">
      <div class="mx-auto max-w-7xl">
        <!-- Page Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Bills</h1>
            <p class="text-sm text-slate-500">Manage your recurring and upcoming bills.</p>
          </div>
          <button
            @click="openCreateModal"
            class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + New Bill
          </button>
        </div>

        <!-- Tabs -->
        <div class="mb-6 flex gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key as TabType"
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
            "
          >
            {{ tab.label }}
            <span
              class="rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="{
                'bg-rose-100 text-rose-700': tab.color === 'rose',
                'bg-blue-100 text-blue-700': tab.color === 'blue',
                'bg-emerald-100 text-emerald-700': tab.color === 'emerald',
              }"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Bill List -->
        <div class="rounded-2xl bg-white shadow-sm">
          <BillList
            :bills="currentBills"
            :readonly="activeTab === 'paid'"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @pay="handleMarkAsPaid"
          />
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CreateUpdateModal :is-open="isCreateUpdateModalOpen" :bill="selectedBill" @close="isCreateUpdateModalOpen = false" />

    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete Bill"
      message="Are you sure you want to delete this bill? This action cannot be undone."
      is-destructive
      @close="isDeleteModalOpen = false"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
