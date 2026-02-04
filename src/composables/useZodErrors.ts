import { reactive } from 'vue'
import type { ZodError } from 'zod'

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

  return {
    errors,
    clearErrors,
    assignErrors,
  }
}
