'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  suspendedUsers: number;
  adminCount: number;
  superadminCount: number;
  totalGroups: number;
  totalSessions: number;
  totalResources: number;
  activeSessions: number;
  scheduledSessions: number;
  completedSessions: number;
  recentActivities: Array<{
    _id: string;
    userId: string;
    actionType: string;
    timestamp: string;
    details?: Record<string, unknown>;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400">View platform statistics and metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-400 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-white">{analytics?.totalUsers || 0}</div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-400 mb-2">Active Users</div>
          <div className="text-3xl font-bold text-green-400">{analytics?.activeUsers || 0}</div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-400 mb-2">Suspended</div>
          <div className="text-3xl font-bold text-yellow-400">{analytics?.suspendedUsers || 0}</div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-400 mb-2">Banned</div>
          <div className="text-3xl font-bold text-red-400">{analytics?.bannedUsers || 0}</div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-400 mb-2">Admins</div>
          <div className="text-3xl font-bold text-purple-400">{analytics?.adminCount || 0}</div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-400 mb-2">Super Admins</div>
          <div className="text-3xl font-bold text-indigo-400">{analytics?.superadminCount || 0}</div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Total Learning Groups</div>
                <div className="text-3xl font-bold text-blue-400">{analytics?.totalGroups || 0}</div>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Total Sessions</div>
                <div className="text-3xl font-bold text-purple-400">{analytics?.totalSessions || 0}</div>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Total Resources</div>
                <div className="text-3xl font-bold text-green-400">{analytics?.totalResources || 0}</div>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Active Sessions</div>
                <div className="text-3xl font-bold text-orange-400">{analytics?.activeSessions || 0}</div>
              </div>
              <div className="text-4xl">🔴</div>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Scheduled Sessions</div>
                <div className="text-3xl font-bold text-yellow-400">{analytics?.scheduledSessions || 0}</div>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Completed Sessions</div>
                <div className="text-3xl font-bold text-cyan-400">{analytics?.completedSessions || 0}</div>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Status Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-300">Active Users</span>
              <span className="text-slate-400">
                {analytics?.activeUsers || 0} ({Math.round(((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(((analytics?.activeUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-300">Suspended Users</span>
              <span className="text-slate-400">
                {analytics?.suspendedUsers || 0} ({Math.round(((analytics?.suspendedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(((analytics?.suspendedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-300">Banned Users</span>
              <span className="text-slate-400">
                {analytics?.bannedUsers || 0} ({Math.round(((analytics?.bannedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(((analytics?.bannedUsers || 0) / (analytics?.totalUsers || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Role Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-700/50 rounded-lg">
            <div className="text-4xl font-bold text-white">
              {(analytics?.totalUsers || 0) - (analytics?.adminCount || 0) - (analytics?.superadminCount || 0)}
            </div>
            <div className="text-sm text-slate-400 mt-2">Regular Users</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <div className="text-4xl font-bold text-purple-400">{analytics?.adminCount || 0}</div>
            <div className="text-sm text-slate-400 mt-2">Admins</div>
          </div>
          <div className="text-center p-4 bg-indigo-500/10 rounded-lg">
            <div className="text-4xl font-bold text-indigo-400">{analytics?.superadminCount || 0}</div>
            <div className="text-sm text-slate-400 mt-2">Super Admins</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        
        <div className="p-6">
          {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3 border-b border-slate-700 pb-3 last:border-b-0">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-400">📋</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        {activity.actionType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      User ID: {activity.userId}
                    </div>
                    {activity.details && (
                      <div className="text-xs text-slate-400 mt-1 bg-slate-700/50 p-2 rounded font-mono">
                        {JSON.stringify(activity.details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <span className="text-4xl mb-2 block">📭</span>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
