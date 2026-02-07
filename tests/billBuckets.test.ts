import { bucketBills, getDueDateKey, getLocalDateKey } from '../src/utils/billBuckets'
import type { Bill } from '../src/types/bills'

const buildBill = (overrides: Partial<Bill>): Bill => ({
  id: overrides.id ?? 'bill-id',
  userId: overrides.userId ?? 'user-id',
  name: overrides.name ?? 'Internet',
  amount: overrides.amount ?? '79.99',
  currency: overrides.currency ?? 'USD',
  description: overrides.description ?? null,
  isRecurring: overrides.isRecurring ?? true,
  frequency: overrides.frequency ?? 'MONTHLY',
  dueDate: overrides.dueDate ?? '2026-02-07T00:00:00.000Z',
  paidAt: overrides.paidAt ?? null,
  createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
  updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
})

describe('bill bucketing', () => {
  it('separates overdue, upcoming, and paid bills', () => {
    const bills = [
      buildBill({ id: 'overdue', dueDate: '2026-02-06T00:00:00.000Z' }),
      buildBill({ id: 'today', dueDate: '2026-02-07T00:00:00.000Z' }),
      buildBill({ id: 'future', dueDate: '2026-02-08T00:00:00.000Z' }),
      buildBill({
        id: 'paid',
        dueDate: '2026-02-05T00:00:00.000Z',
        paidAt: '2026-02-05T12:00:00.000Z',
      }),
    ]

    const result = bucketBills(bills, new Date('2026-02-07T12:00:00.000Z'))

    expect(result.overdue.map((b) => b.id)).toEqual(['overdue'])
    expect(result.upcoming.map((b) => b.id)).toEqual(['today', 'future'])
    expect(result.paid.map((b) => b.id)).toEqual(['paid'])
  })

  it('keeps UTC-midnight due date as upcoming on the same calendar day', () => {
    const bills = [buildBill({ id: 'due-today', dueDate: '2026-02-07T00:00:00.000Z' })]

    // A local midday "today" should not classify a same-day due date as overdue.
    const result = bucketBills(bills, new Date(2026, 1, 7, 12, 0, 0))

    expect(result.overdue).toHaveLength(0)
    expect(result.upcoming.map((b) => b.id)).toEqual(['due-today'])
  })
})

describe('date key helpers', () => {
  it('extracts date key from an ISO due date', () => {
    expect(getDueDateKey('2026-11-09T00:00:00.000Z')).toBe('2026-11-09')
  })

  it('formats local date key as YYYY-MM-DD', () => {
    const localDate = new Date(2026, 10, 9, 8, 30, 0)
    expect(getLocalDateKey(localDate)).toBe('2026-11-09')
  })
})
