'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';

interface Session {
  _id: string;
  user?: string;
  groupId?: {
    _id: string;
    subject: string;
    topic: string;
  };
  teacherId?: {
    _id: string;
    name?: string;
    email: string;
  };
  status: string;
  meetingLink?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  attendees: Array<{
    userId: string;
    joinedAt: string;
    leftAt?: string;
  }>;
}

interface SessionAnalytics {
  statusCounts: Record<string, number>;
  avgAttendance: number;
  totalSessions: number;
}

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchSessions = useCallback(async () => {
    const token = getToken();
    try {
      let url = `${API_BASE_URL}/sessions/admin/list?`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setSessions(data.sessions || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchAnalytics = async () => {
    const token = getToken();
    try {
      const [statusRes, attendanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sessions/analytics/status-counts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/sessions/analytics/attendance`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const [statusData, attendanceData] = await Promise.all([
        statusRes.json(),
        attendanceRes.json(),
      ]);

      setAnalytics({
        statusCounts: statusData.counts || {},
        avgAttendance: attendanceData.stats?.avgAttendance || 0,
        totalSessions: attendanceData.stats?.totalSessions || 0,
      });
      setShowAnalytics(true);
    } catch {
      alert('Failed to fetch analytics');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Delete this session permanently?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/admin/delete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId }),
      });
      if (response.ok) {
        fetchSessions();
        setSelectedSession(null);
      }
    } catch {
      alert('Failed to delete session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-slate-500/20 text-slate-300';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Session Management</h1>
          <p className="text-slate-400">Manage study sessions and schedules</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            📊 Analytics
          </button>
          <button
            onClick={fetchSessions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">Session Analytics</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-white">{analytics.totalSessions}</p>
                  <p className="text-slate-400 text-sm">Total Sessions</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-400">{analytics.avgAttendance.toFixed(1)}</p>
                  <p className="text-slate-400 text-sm">Avg Attendance</p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Status Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <span className="text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-300 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={() => setStatusFilter('')}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">All Sessions ({total})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Attendees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm">
                    {typeof session.groupId === 'object' && session.groupId ? (
                      <div>
                        <div className="font-medium text-white">{session.groupId.subject}</div>
                        <div className="text-xs text-slate-400">{session.groupId.topic}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {typeof session.teacherId === 'object' && session.teacherId
                      ? (session.teacherId.name || session.teacherId.email)
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {session.attendees?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <span className="text-4xl mb-2 block">📅</span>
            <p>No sessions found</p>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Session Details</h2>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                  {selectedSession.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Group</p>
                  {typeof selectedSession.groupId === 'object' && selectedSession.groupId ? (
                    <p className="text-white">{selectedSession.groupId.subject} - {selectedSession.groupId.topic}</p>
                  ) : (
                    <p className="text-slate-400">N/A</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Teacher</p>
                  <p className="text-white">
                    {typeof selectedSession.teacherId === 'object' && selectedSession.teacherId
                      ? (selectedSession.teacherId.name || selectedSession.teacherId.email)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Created</p>
                  <p className="text-white">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                {selectedSession.startedAt && (
                  <div>
                    <p className="text-sm font-medium text-slate-400">Started</p>
                    <p className="text-white">{new Date(selectedSession.startedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedSession.endedAt && (
                  <div>
                    <p className="text-sm font-medium text-slate-400">Ended</p>
                    <p className="text-white">{new Date(selectedSession.endedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedSession.meetingLink && (
                <div>
                  <p className="text-sm font-medium text-slate-400">Meeting Link</p>
                  <a 
                    href={selectedSession.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-400 hover:underline break-all"
                  >
                    {selectedSession.meetingLink}
                  </a>
                </div>
              )}

              {/* Attendees */}
              <div>
                <h3 className="text-white font-medium mb-3">Attendees ({selectedSession.attendees?.length || 0})</h3>
                {selectedSession.attendees && selectedSession.attendees.length > 0 ? (
                  <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">User ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Joined</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Left</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {selectedSession.attendees.map((attendee, index) => (
                          <tr key={index} className="hover:bg-slate-700/30">
                            <td className="px-4 py-2 text-sm text-white font-mono">{attendee.userId}</td>
                            <td className="px-4 py-2 text-sm text-slate-300">
                              {new Date(attendee.joinedAt).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-300">
                              {attendee.leftAt ? new Date(attendee.leftAt).toLocaleTimeString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No attendees recorded</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(selectedSession._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
