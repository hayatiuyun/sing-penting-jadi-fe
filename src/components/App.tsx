import React, { useState } from 'react'
import {
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  FileText,
  Send
} from 'lucide-react'

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

  // Mock data
  const leaveBalance: LeaveBalance = {
    annual: 14,
    medical: 12,
    compassionate: 3
  }

  const leaveRequests: LeaveRequest[] = [
    {
      id: 1,
      type: 'Annual Leave',
      dates: 'Dec 20-22, 2025',
      days: 3,
      status: 'Pending',
      reason: 'Family vacation'
    },
    {
      id: 2,
      type: 'Medical Leave',
      dates: 'Dec 10, 2025',
      days: 1,
      status: 'Approved',
      reason: 'Medical checkup'
    },
    {
      id: 3,
      type: 'Annual Leave',
      dates: 'Nov 15-17, 2025',
      days: 3,
      status: 'Approved',
      reason: 'Personal matters'
    }
  ]

  const teamRequests: TeamRequest[] = [
    {
      id: 1,
      employee: 'Sarah Chen',
      type: 'Annual Leave',
      dates: 'Dec 23-27, 2025',
      days: 5,
      status: 'Pending'
    },
    {
      id: 2,
      employee: 'Michael Tan',
      type: 'Medical Leave',
      dates: 'Dec 18, 2025',
      days: 1,
      status: 'Pending'
    }
  ]

  const handleChatSubmit = (): void => {
    if (!chatInput.trim()) return

    const userMessage: string = chatInput
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }])
    setChatInput('')

    // Simulate AI response
    setTimeout(() => {
      let aiResponse: string = ''
      const lowerMessage = userMessage.toLowerCase()

      if (lowerMessage.includes('leave') || lowerMessage.includes('request')) {
        aiResponse =
          'I can help you submit a leave request. What type of leave do you need? (Annual, Medical, or Compassionate) And for which dates?'
      } else if (lowerMessage.includes('balance')) {
        aiResponse = `Your current leave balance is: Annual Leave: ${leaveBalance.annual} days, Medical Leave: ${leaveBalance.medical} days, Compassionate Leave: ${leaveBalance.compassionate} days.`
      } else if (lowerMessage.includes('annual')) {
        aiResponse =
          "For annual leave, please provide the dates you'd like to take off. I'll check availability and process your request."
      } else {
        aiResponse =
          'I understand. I can help you with leave requests, checking balances, or viewing your leave history. What would you like to do?'
      }
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse }
      ])
    }, 1000)
  }

  const handleApproval = (id: number, decision: string): void => {
    alert(`Leave request #${id} has been ${decision}`)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-red-600">|||</div>
              <div className="text-2xl font-bold text-blue-900">UOB</div>
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
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Leave Balance
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Annual Leave</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {leaveBalance.annual}
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
                        {leaveBalance.medical}
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
                        {leaveBalance.compassionate}
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
    </div>
  )
}

export default UOBLeaveSystem
