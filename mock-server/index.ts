import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Interfaces
interface LeaveBalance {
  annual: number
  medical: number
  compassionate: number
}

interface LeaveRequest {
  id: number
  userId: number
  type: string
  dates: string
  startDate: string
  endDate: string
  days: number
  status: 'Pending' | 'Approved' | 'Rejected'
  reason: string
  createdAt: string
}

interface TeamRequest {
  id: number
  employee: string
  userId: number
  type: string
  dates: string
  startDate: string
  endDate: string
  days: number
  status: 'Pending' | 'Approved' | 'Rejected'
  reason?: string
}

interface User {
  id: number
  name: string
  email: string
  role: 'employee' | 'manager'
  managerId?: number
}

interface CreateLeaveRequest {
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
}

interface AIMessageRequest {
  message: string
  userId: number
}

// Mock Database
const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@uob.com',
    role: 'employee',
    managerId: 3
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@uob.com',
    role: 'employee',
    managerId: 3
  },
  { id: 3, name: 'Michael Tan', email: 'michael.tan@uob.com', role: 'manager' },
  {
    id: 4,
    name: 'Alice Wong',
    email: 'alice.wong@uob.com',
    role: 'employee',
    managerId: 3
  }
]

const leaveBalances: Record<number, LeaveBalance> = {
  1: { annual: 14, medical: 12, compassionate: 3 },
  2: { annual: 10, medical: 14, compassionate: 3 },
  3: { annual: 18, medical: 10, compassionate: 3 },
  4: { annual: 12, medical: 15, compassionate: 3 }
}

const leaveRequests: LeaveRequest[] = [
  {
    id: 1,
    userId: 1,
    type: 'Annual Leave',
    dates: 'Dec 20-22, 2025',
    startDate: '2025-12-20',
    endDate: '2025-12-22',
    days: 3,
    status: 'Pending',
    reason: 'Family vacation',
    createdAt: '2025-12-10T10:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    type: 'Medical Leave',
    dates: 'Dec 10, 2025',
    startDate: '2025-12-10',
    endDate: '2025-12-10',
    days: 1,
    status: 'Approved',
    reason: 'Medical checkup',
    createdAt: '2025-12-05T09:00:00Z'
  },
  {
    id: 3,
    userId: 1,
    type: 'Annual Leave',
    dates: 'Nov 15-17, 2025',
    startDate: '2025-11-15',
    endDate: '2025-11-17',
    days: 3,
    status: 'Approved',
    reason: 'Personal matters',
    createdAt: '2025-11-01T14:00:00Z'
  },
  {
    id: 4,
    userId: 2,
    type: 'Annual Leave',
    dates: 'Dec 23-27, 2025',
    startDate: '2025-12-23',
    endDate: '2025-12-27',
    days: 5,
    status: 'Pending',
    reason: 'Year-end holiday',
    createdAt: '2025-12-12T11:00:00Z'
  },
  {
    id: 5,
    userId: 4,
    type: 'Medical Leave',
    dates: 'Dec 18, 2025',
    startDate: '2025-12-18',
    endDate: '2025-12-18',
    days: 1,
    status: 'Pending',
    reason: 'Doctor appointment',
    createdAt: '2025-12-14T08:30:00Z'
  }
]

// Helper Functions
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }

  if (startDate === endDate) {
    return start.toLocaleDateString('en-US', options)
  }

  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })}-${end.toLocaleDateString('en-US', {
    day: 'numeric'
  })}, ${end.getFullYear()}`
}

const generateAIResponse = (message: string, userId: number): string => {
  const lowerMessage = message.toLowerCase()
  const balance = leaveBalances[userId]

  if (lowerMessage.includes('balance')) {
    return `Your current leave balance is:\n- Annual Leave: ${balance.annual} days\n- Medical Leave: ${balance.medical} days\n- Compassionate Leave: ${balance.compassionate} days`
  }

  if (lowerMessage.includes('request') || lowerMessage.includes('apply')) {
    return 'I can help you submit a leave request. Please provide:\n1. Type of leave (Annual, Medical, or Compassionate)\n2. Start date\n3. End date\n4. Reason for leave'
  }

  if (lowerMessage.includes('annual')) {
    return `You have ${balance.annual} days of annual leave remaining. When would you like to take your leave?`
  }

  if (lowerMessage.includes('medical')) {
    return `You have ${balance.medical} days of medical leave remaining. Please note that medical certificates may be required for leaves longer than 1 day.`
  }

  if (lowerMessage.includes('status') || lowerMessage.includes('pending')) {
    const userRequests = leaveRequests.filter((req) => req.userId === userId)
    const pending = userRequests.filter(
      (req) => req.status === 'Pending'
    ).length
    return `You have ${pending} pending leave request(s). Would you like me to show you the details?`
  }

  return "I'm here to help you with leave requests, checking balances, viewing your leave history, and answering questions about leave policies. What would you like to know?"
}

// Routes

// Get current user
app.get('/api/user/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(user)
})

// Get leave balance
app.get('/api/leave-balance/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  const balance = leaveBalances[userId]

  if (!balance) {
    return res.status(404).json({ error: 'Balance not found' })
  }

  res.json(balance)
})

// Get user's leave requests
app.get('/api/leave-requests/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  const userRequests = leaveRequests
    .filter((req) => req.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  res.json(userRequests)
})

// Create new leave request
app.post(
  '/api/leave-requests',
  (
    req: Request<object, object, CreateLeaveRequest & { userId: number }>,
    res: Response
  ) => {
    const { userId, type, startDate, endDate, days, reason } = req.body

    const balance = leaveBalances[userId]
    const leaveType = type.toLowerCase()

    // Check if user has enough balance
    if (leaveType.includes('annual') && balance.annual < days) {
      return res
        .status(400)
        .json({ error: 'Insufficient annual leave balance' })
    }
    if (leaveType.includes('medical') && balance.medical < days) {
      return res
        .status(400)
        .json({ error: 'Insufficient medical leave balance' })
    }
    if (leaveType.includes('compassionate') && balance.compassionate < days) {
      return res
        .status(400)
        .json({ error: 'Insufficient compassionate leave balance' })
    }

    const newRequest: LeaveRequest = {
      id: leaveRequests.length + 1,
      userId,
      type,
      dates: formatDateRange(startDate, endDate),
      startDate,
      endDate,
      days,
      status: 'Pending',
      reason,
      createdAt: new Date().toISOString()
    }

    leaveRequests.push(newRequest)
    res.status(201).json(newRequest)
  }
)

// Get team requests (for managers)
app.get('/api/team-requests/:managerId', (req: Request, res: Response) => {
  const managerId = parseInt(req.params.managerId)

  const teamMembers = users.filter((u) => u.managerId === managerId)
  const teamMemberIds = teamMembers.map((u) => u.id)

  const teamRequests: TeamRequest[] = leaveRequests
    .filter(
      (req) => teamMemberIds.includes(req.userId) && req.status === 'Pending'
    )
    .map((req) => {
      const employee = users.find((u) => u.id === req.userId)
      return {
        id: req.id,
        employee: employee?.name || 'Unknown',
        userId: req.userId,
        type: req.type,
        dates: req.dates,
        startDate: req.startDate,
        endDate: req.endDate,
        days: req.days,
        status: req.status,
        reason: req.reason
      }
    })

  res.json(teamRequests)
})

// Approve/Reject leave request
app.patch('/api/leave-requests/:requestId', (req: Request, res: Response) => {
  const requestId = parseInt(req.params.requestId)
  const { status, managerId } = req.body

  const request = leaveRequests.find((r) => r.id === requestId)

  if (!request) {
    return res.status(404).json({ error: 'Request not found' })
  }

  const manager = users.find((u) => u.id === managerId)
  if (!manager || manager.role !== 'manager') {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  request.status = status

  // Update balance if approved
  if (status === 'Approved') {
    const balance = leaveBalances[request.userId]
    const leaveType = request.type.toLowerCase()

    if (leaveType.includes('annual')) {
      balance.annual -= request.days
    } else if (leaveType.includes('medical')) {
      balance.medical -= request.days
    } else if (leaveType.includes('compassionate')) {
      balance.compassionate -= request.days
    }
  }

  res.json(request)
})

// AI Chat endpoint
app.post(
  '/api/ai-chat',
  (req: Request<object, object, AIMessageRequest>, res: Response) => {
    const { message, userId } = req.body

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' })
    }

    const response = generateAIResponse(message, userId)

    res.json({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    })
  }
)

// Get leave statistics
app.get('/api/statistics/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId)
  const userRequests = leaveRequests.filter((req) => req.userId === userId)

  const stats = {
    totalRequests: userRequests.length,
    pending: userRequests.filter((r) => r.status === 'Pending').length,
    approved: userRequests.filter((r) => r.status === 'Approved').length,
    rejected: userRequests.filter((r) => r.status === 'Rejected').length,
    totalDaysTaken: userRequests
      .filter((r) => r.status === 'Approved')
      .reduce((sum, r) => sum + r.days, 0)
  }

  res.json(stats)
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UOB Leave Management API running on http://localhost:${PORT}`)
  console.log(`📊 Available endpoints:`)
  console.log(`   GET  /api/user/:userId`)
  console.log(`   GET  /api/leave-balance/:userId`)
  console.log(`   GET  /api/leave-requests/:userId`)
  console.log(`   POST /api/leave-requests`)
  console.log(`   GET  /api/team-requests/:managerId`)
  console.log(`   PATCH /api/leave-requests/:requestId`)
  console.log(`   POST /api/ai-chat`)
  console.log(`   GET  /api/statistics/:userId`)
  console.log(`   GET  /health`)
})

export default app
