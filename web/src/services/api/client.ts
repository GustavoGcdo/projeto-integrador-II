const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = 'Nao foi possivel concluir a requisicao.'

    try {
      const payload = (await response.json()) as { message?: string | string[] }
      if (Array.isArray(payload.message)) {
        message = payload.message.join(', ')
      } else if (payload.message) {
        message = payload.message
      }
    } catch {
      message = response.statusText || message
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}
