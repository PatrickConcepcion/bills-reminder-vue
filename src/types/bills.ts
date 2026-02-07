export type Frequency = 'MONTHLY' | 'WEEKLY' | 'YEARLY'
export type BillStatus = 'overdue' | 'upcoming' | 'paid'

export interface Bill {
  id: string
  userId: string
  name: string
  amount: string
  currency: string
  description: string | null
  isRecurring: boolean
  frequency: Frequency | null
  dueDate: string // ISO date string from JSON
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateBillPayload = {
  name: string
  amount: number
  currency: string
  description?: string
  isRecurring: boolean
  frequency?: Frequency | null
  dueDate: string
  paidAt?: string | null
}

export type UpdateBillPayload = CreateBillPayload

export type BillsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
