import React, { useEffect, useState } from 'react'
import {
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  FileText,
  Send
} from 'lucide-react'

import {
  getLeaveBalance,
  getLeaveRequests,
  getTeamRequests,
  sendAIMessage,
  updateLeaveStatus
} from '../services/leaveApi'

interface LeaveBalance {
  annual: number
  medical: number
  compassionate: number
}

interface LeaveRequest {
  id: number
  type: string
  dates: string
  days: number
  status: 'Pending' | 'Approved' | 'Rejected'
  reason: string
}

interface TeamRequest {
  id: number
  employee: string
  type: string
  dates: string
  days: number
  status: 'Pending' | 'Approved' | 'Rejected'
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

type TabType = 'dashboard' | 'chat' | 'approvals'

interface NewLeaveRequest {
  type: string
  startDate: string
  endDate: string
  reason: string
}

const UOBLeaveSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [chatInput, setChatInput] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI assistant. How can I help you with your leave request today?"
    }
  ])

  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState<NewLeaveRequest>({
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const USER_ID = 1 // logged-in user
  const MANAGER_ID = 3 // for manager view

  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([])

  const calculateDays = (start: string, end: string): number => {
    const s = new Date(start)
    const e = new Date(end)
    return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) + 1
  }

  const handleSubmitLeave = async () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      alert('Please fill in all fields')
      return
    }

    const days = calculateDays(formData.startDate, formData.endDate)

    try {
      const res = await createLeaveRequest({
        userId: USER_ID,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        reason: formData.reason
      })

      setLeaveRequests((prev) => [res.data, ...prev])
      setShowForm(false)
      setFormData({
        type: 'Annual Leave',
        startDate: '',
        endDate: '',
        reason: ''
      })
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit leave')
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')

    const res = await sendAIMessage(userMessage, USER_ID)

    setChatMessages((prev) => [...prev, res.data])
  }

  const handleApproval = async (
    requestId: number,
    decision: 'Approved' | 'Rejected'
  ) => {
    await updateLeaveStatus(requestId, decision, MANAGER_ID)

    setTeamRequests((prev) => prev.filter((req) => req.id !== requestId))

    alert(`Leave request ${decision}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  const getStatusColor = (status: string): string => {
    return status === 'Approved'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  useEffect(() => {
    const loadData = async () => {
      const [balanceRes, requestRes] = await Promise.all([
        getLeaveBalance(USER_ID),
        getLeaveRequests(USER_ID)
      ])

      setLeaveBalance(balanceRes.data)
      setLeaveRequests(requestRes.data)
    }

    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'team') {
      getTeamRequests(MANAGER_ID).then((res) => setTeamRequests(res.data))
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <img src="/images.png" className="h-auto w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <User className="size-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                John Doe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`border-b-2 px-2 py-4 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`border-b-2 px-2 py-4 text-sm font-medium ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`border-b-2 px-2 py-4 text-sm font-medium ${
                activeTab === 'approvals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Approvals
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Leave Balance Cards */}
            <div>
              <div className="inline-flex w-full items-center justify-between">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Leave Balance
                </h2>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowForm(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Request Leave
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Annual Leave</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {leaveBalance?.annual}
                      </p>
                      <p className="text-xs text-gray-500">days remaining</p>
                    </div>
                    <Calendar className="size-12 text-blue-600 opacity-20" />
                  </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Medical Leave</p>
                      <p className="text-3xl font-bold text-green-600">
                        {leaveBalance?.medical}
                      </p>
                      <p className="text-xs text-gray-500">days remaining</p>
                    </div>
                    <FileText className="size-12 text-green-600 opacity-20" />
                  </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Compassionate Leave
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {leaveBalance?.compassionate}
                      </p>
                      <p className="text-xs text-gray-500">days remaining</p>
                    </div>
                    <Clock className="size-12 text-purple-600 opacity-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Leave Requests */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                My Leave Requests
              </h2>
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {leaveRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {request.type}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {request.dates}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {request.days}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {request.reason}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex h-[600px] flex-col rounded-lg bg-white shadow">
            <div className="border-b p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <MessageSquare className="size-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Leave Assistant
                  </h2>
                  <p className="text-sm text-gray-500">
                    Ask me anything about your leave
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleChatSubmit}
                  className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  <Send className="size-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Team Leave Requests
            </h2>
            <div className="rounded-lg bg-white shadow">
              {teamRequests.map((request) => (
                <div key={request.id} className="border-b p-6 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                          <User className="size-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.employee}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.type}
                          </p>
                        </div>
                      </div>
                      <div className="ml-13 mt-3 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Dates:</span>{' '}
                          {request.dates}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Duration:</span>{' '}
                          {request.days} days
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(request.id, 'approved')}
                        className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      >
                        <CheckCircle className="size-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproval(request.id, 'rejected')}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">New Leave Request</h3>

            <div className="space-y-4">
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full rounded-lg border p-2"
              >
                <option>Annual Leave</option>
                <option>Medical Leave</option>
                <option>Compassionate Leave</option>
              </select>

              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full rounded-lg border p-2"
              />

              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full rounded-lg border p-2"
              />

              <textarea
                placeholder="Reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLeave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UOBLeaveSystem
