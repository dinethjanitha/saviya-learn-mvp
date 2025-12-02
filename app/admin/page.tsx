'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  totalSessions: number;
  totalResources: number;
  recentActivities: Array<{
    _id: string;
    actionType: string;
    timestamp: string;
    userId?: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Learning Groups',
      value: stats?.totalGroups || 0,
      icon: '📚',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Study Sessions',
      value: stats?.totalSessions || 0,
      icon: '🎓',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Resources',
      value: stats?.totalResources || 0,
      icon: '📖',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
    },
  ];

  const quickActions = [
    { name: 'Add User', icon: '➕', href: '/admin/users' },
    { name: 'Create Group', icon: '📁', href: '/admin/groups' },
    { name: 'View Reports', icon: '📊', href: '/admin/analytics' },
    { name: 'Manage Sessions', icon: '📅', href: '/admin/sessions' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100">
          Monitor and manage your Saviya Learn platform from this central hub.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} border border-slate-700 rounded-xl p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div
                className={`w-2 h-2 rounded-full bg-linear-to-r ${stat.color}`}
              ></div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="text-sm text-slate-300">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400">📌</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium capitalize">
                      {activity.actionType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
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

      {/* Platform Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white text-sm font-medium">API Server</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white text-sm font-medium">Database</p>
              <p className="text-xs text-green-400">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white text-sm font-medium">Socket Server</p>
              <p className="text-xs text-green-400">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white text-sm font-medium">Email Service</p>
              <p className="text-xs text-green-400">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
