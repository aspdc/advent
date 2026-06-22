import { tryCatch } from "@/lib/try-catch"
import { validateTurnstile } from "@/actions/turnstile" 

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
  turnstileToken?: string | null,
  fallbackMessage = "Something went wrong"
): Promise<AuthActionResult<T>> {

  if (turnstileToken !== undefined) {
    if (!turnstileToken) {
      return {
        data: null,
        error: "Security verification token is missing.",
      }
    }

    const verification = await validateTurnstile(turnstileToken)
    if (!verification.success) {
      return {
        data: null,
        error: verification.error || "Security verification failed.",
      }
    }
  }

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