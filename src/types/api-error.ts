export type ApiError = {
  response?: {
    status?: number
    data?: {
      message?: string
      error?: {
        code?: string
        message?: string
        fields?: Record<string, string[]>
      }
    }
  }
  message?: string
}
