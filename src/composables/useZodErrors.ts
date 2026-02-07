import { reactive } from 'vue'
import type { ZodError } from 'zod'
import type { ApiError } from '../types/api-error'

type FieldErrors<TFields extends string> = Partial<Record<TFields, string>>

export const useZodErrors = <TFields extends string>(fields: TFields[]) => {
  const errors = reactive<Record<string, string | undefined>>({}) as FieldErrors<TFields>

  const clearErrors = () => {
    for (const field of fields) {
      errors[field] = undefined
    }
  }

  const assignErrors = (error: ZodError) => {
    for (const issue of error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && fields.includes(field as TFields)) {
        const key = field as TFields
        if (!errors[key]) {
          errors[key] = issue.message
        }
      }
    }
  }

  const assignApiErrors = (error: ApiError) => {
    const isValidationError = error.response?.status === 400
    const fieldErrors = error.response?.data?.error?.fields
    if (!isValidationError || !fieldErrors) return false

    let didAssign = false

    for (const [path, messages] of Object.entries(fieldErrors)) {
      const field = path.split('.')[0] as TFields
      if (!fields.includes(field)) continue
      if (messages.length === 0) continue

      if (!errors[field]) {
        errors[field] = messages[0]
      }
      didAssign = true
    }

    return didAssign
  }

  return {
    errors,
    clearErrors,
    assignErrors,
    assignApiErrors,
  }
}
