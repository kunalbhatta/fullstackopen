export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, options)
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const error = body && typeof body === 'object' && 'error' in body ? body.error : undefined
    throw new Error(typeof error === 'string' ? error : `Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function send<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export const messageFor = (error: unknown) => error instanceof Error ? error.message : 'An unexpected error occurred'
