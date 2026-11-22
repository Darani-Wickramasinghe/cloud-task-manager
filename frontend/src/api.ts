import type { Task, TaskInput } from './types'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, options)
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body.error) message = body.error
    } catch {
      // Keep the default message when the response is not JSON.
    }
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  list: () => request<Task[]>('/tasks'),
  create: (task: TaskInput) => request<Task>('/tasks', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task),
  }),
  update: (id: number, task: TaskInput) => request<Task>(`/tasks/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task),
  }),
  complete: (id: number) => request<Task>(`/tasks/${id}/complete`, { method: 'PATCH' }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  upload: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<Task>(`/tasks/${id}/attachment`, { method: 'POST', body: form })
  },
}
