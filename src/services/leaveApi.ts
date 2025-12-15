import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
})

// USER
export const getUser = (userId: number) => api.get(`/user/${userId}`)

// LEAVE
export const getLeaveBalance = (userId: number) =>
  api.get(`/leave-balance/${userId}`)

export const getLeaveRequests = (userId: number) =>
  api.get(`/leave-requests/${userId}`)

export const createLeaveRequest = (payload: unknown) =>
  api.post('/leave-requests', payload)

// MANAGER
export const getTeamRequests = (managerId: number) =>
  api.get(`/team-requests/${managerId}`)

export const updateLeaveStatus = (
  requestId: number,
  status: 'Approved' | 'Rejected',
  managerId: number
) =>
  api.patch(`/leave-requests/${requestId}`, {
    status,
    managerId
  })

// AI CHAT
export const sendAIMessage = (message: string, userId: number) =>
  api.post('/ai-chat', { message, userId })
