<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBillStore } from '../stores/bills'
import type { Bill, BillStatus } from '../types/bills'
import Header from '../components/Header.vue'
import BillList from '../components/BillList.vue'
import CreateUpdateModal from '../components/CreateUpdateModal.vue'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const store = useBillStore()

onMounted(() => {
  void store.fetchBills({ status: activeTab.value, page: 1 })
})

const activeTab = ref<BillStatus>('upcoming')

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
    await store.fetchBills({ status: activeTab.value, page: store.currentPage })
    isDeleteModalOpen.value = false
    selectedBill.value = null
  }
}

const handleMarkAsPaid = async (bill: Bill) => {
  await store.payBill(bill.id)
  await store.fetchBills({ status: activeTab.value, page: store.currentPage })
}

const handleTabChange = async (tab: BillStatus) => {
  activeTab.value = tab
  await store.fetchBills({ status: tab, page: 1 })
}

const handlePageChange = async (nextPage: number) => {
  if (nextPage < 1 || nextPage > store.pagination.totalPages) return
  await store.fetchBills({ status: activeTab.value, page: nextPage })
}

const handlePageSizeChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const nextLimit = Number(target.value)
  if (!Number.isFinite(nextLimit) || nextLimit < 1) return

  await store.fetchBills({ status: activeTab.value, page: 1, limit: nextLimit })
}

const tabs: { key: BillStatus; label: string; color: 'rose' | 'blue' | 'emerald' }[] = [
  { key: 'overdue', label: 'Overdue', color: 'rose' },
  { key: 'upcoming', label: 'Upcoming', color: 'blue' },
  { key: 'paid', label: 'Paid', color: 'emerald' },
]
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
            @click="handleTabChange(tab.key)"
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition"
            :class="
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
            "
            >
              {{ tab.label }}
            <span
              class="h-2 w-2 rounded-full"
              :class="{
                'bg-rose-500': tab.color === 'rose',
                'bg-blue-500': tab.color === 'blue',
                'bg-emerald-500': tab.color === 'emerald',
              }"
            />
          </button>
        </div>

        <p v-if="store.error" class="mb-4 text-sm text-rose-600">{{ store.error }}</p>

        <div class="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <BillList
            :bills="store.bills"
            :is-loading="store.isLoading"
            :readonly="activeTab === 'paid'"
            @edit="openEditModal"
            @delete="openDeleteModal"
            @pay="handleMarkAsPaid"
          />

          <div class="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div class="flex items-center gap-2">
              <button
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!store.pagination.hasPrevPage || store.isLoading"
                @click="handlePageChange(store.pagination.page - 1)"
              >
                ← Prev
              </button>
              <p class="text-sm text-slate-500">
                Page {{ store.pagination.page }} of {{ store.pagination.totalPages }}
              </p>
              <button
                class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!store.pagination.hasNextPage || store.isLoading"
                @click="handlePageChange(store.pagination.page + 1)"
              >
                Next →
              </button>
            </div>

            <div class="flex items-center gap-3">
              <label for="page-size" class="text-sm text-slate-500">Per page</label>
              <select
                id="page-size"
                class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                :value="store.pageSize"
                :disabled="store.isLoading"
                @change="handlePageSizeChange"
              >
                <option :value="6">6</option>
                <option :value="12">12</option>
                <option :value="24">24</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CreateUpdateModal
      :is-open="isCreateUpdateModalOpen"
      :bill="selectedBill"
      @save="store.fetchBills({ status: activeTab, page: 1 })"
      @close="isCreateUpdateModalOpen = false"
    />

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
