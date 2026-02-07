import type { Bill } from '../types/bills'

export type BillBuckets = {
  overdue: Bill[]
  upcoming: Bill[]
  paid: Bill[]
}

export const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getDueDateKey = (dueDate: string) => dueDate.slice(0, 10)

export const bucketBills = (bills: Bill[], today: Date = new Date()): BillBuckets => {
  const todayKey = getLocalDateKey(today)
  const overdue: Bill[] = []
  const upcoming: Bill[] = []
  const paid: Bill[] = []

  for (const bill of bills) {
    if (bill.paidAt) {
      paid.push(bill)
      continue
    }

    if (getDueDateKey(bill.dueDate) < todayKey) {
      overdue.push(bill)
      continue
    }

    upcoming.push(bill)
  }

  return { overdue, upcoming, paid }
}
