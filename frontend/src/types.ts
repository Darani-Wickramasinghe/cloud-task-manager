export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  attachmentName: string | null
  attachmentBlobName: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
}
