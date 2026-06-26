import { tryCatch } from "@/lib/try-catch"

type AuthClientLikeError = {
  message?: string
}

type AuthClientActionResponse<T> = {
  data: T | null
  error: AuthClientLikeError | null
}

export type AuthActionResult<T> = {
  data: T | null
  error: string | null
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export async function runAuthAction<T>(
  action: Promise<AuthClientActionResponse<T>>,
  fallbackMessage = "Something went wrong"
): Promise<AuthActionResult<T>> {
  const { data: response, error: requestError } = await tryCatch(action)

  if (requestError) {
    return {
      data: null,
      error: getErrorMessage(requestError, fallbackMessage),
    }
  }

  if (!response) {
    return {
      data: null,
      error: fallbackMessage,
    }
  }

  if (response.error) {
    return {
      data: null,
      error: response.error.message || fallbackMessage,
    }
  }

  return {
    data: response.data,
    error: null,
  }
}
