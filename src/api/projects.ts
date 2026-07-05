import { api } from './client'
import type { Project } from '@/types'

export const projectApi = {
  list: () => api.get<Project[]>('/api/projects'),
  get: (id: string) => api.get<Project>(`/api/projects/${id}`),
  create: (project: Partial<Project>) => api.post<Project>('/api/projects', project),
  update: (id: string, project: Partial<Project>) => api.put<Project>(`/api/projects/${id}`, project),
  delete: (id: string) => api.delete<void>(`/api/projects/${id}`),
  sync: (id: string) => api.post<void>(`/api/projects/${id}/sync`, {})
}
