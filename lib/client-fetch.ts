import { tryCatch } from "@/lib/try-catch"

type ApiResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string }

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  const { data: res, error: netErr } = await tryCatch(fetch(url, options))

  if (netErr) return { data: null, error: "Failed to reach the server" }

  const { data: json, error: parseErr } = await tryCatch<ApiResponse<T>>(
    res.json()
  )

  if (parseErr) return { data: null, error: "Unexpected response" }
  if (!json.success) return { data: null, error: json.error ?? "Unknown error" }

  return { data: json.data, error: null }
}
