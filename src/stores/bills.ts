import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../lib/axios'
import type {
  Bill,
  BillsPagination,
  BillStatus,
  CreateBillPayload,
  UpdateBillPayload,
} from '../types/bills'
import type { ApiError } from '../types/api-error'

export const useBillStore = defineStore('bills', () => {
  const bills = ref<Bill[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentStatus = ref<BillStatus>('upcoming')
  const pageSize = ref(12)
  const currentPage = ref(1)
  const pagination = ref<BillsPagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const fetchBills = async (options?: { status?: BillStatus; page?: number; limit?: number }) => {
    isLoading.value = true
    error.value = null

    const nextStatus = options?.status ?? currentStatus.value
    const nextPage = options?.page ?? currentPage.value
    const nextLimit = options?.limit ?? pageSize.value

    try {
      const res = await api.get('/bills', {
        params: { status: nextStatus, limit: nextLimit, page: nextPage },
      })
      bills.value = res.data.bills
      currentStatus.value = nextStatus
      pagination.value = res.data.pagination
      currentPage.value = res.data.pagination.page
      pageSize.value = res.data.pagination.limit
      return res.data
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message ?? apiError.message ?? 'Failed to fetch bills'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createBill = async (payload: CreateBillPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post('/bills', payload)
      return res.data.bill
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message ?? apiError.message ?? 'Failed to create bill'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateBill = async (id: string, payload: UpdateBillPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.put(`/bills/${id}`, payload)
      const index = bills.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        bills.value[index] = res.data.bill
      }
      return res.data.bill
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message ?? apiError.message ?? 'Failed to update bill'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteBill = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await api.delete(`/bills/${id}`)
      bills.value = bills.value.filter((b) => b.id !== id)
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message ?? apiError.message ?? 'Failed to delete bill'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const payBill = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.post(`/bills/${id}/pay`)
      return res.data
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.response?.data?.message ?? apiError.message ?? 'Failed to pay bill'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    bills,
    isLoading,
    error,
    currentStatus,
    currentPage,
    pageSize,
    pagination,
    fetchBills,
    createBill,
    updateBill,
    deleteBill,
    payBill,
  }
})
