import { api } from './client'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string }>('/api/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post<{ token: string }>('/api/auth/register', { email, password }),
  logout: () => api.post<void>('/api/auth/logout', {})
}
