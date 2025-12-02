'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  profile: {
    name: string;
    country?: string;
    region?: string;
  };
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Ban this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchUsers();
    } catch {
      alert('Failed to ban user');
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspend this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchUsers();
    } catch {
      alert('Failed to suspend user');
    }
  };

  const handleReactivate = async (userId: string) => {
    if (!confirm('Reactivate this user?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reactivate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchUsers();
    } catch {
      alert('Failed to reactivate user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) fetchUsers();
    } catch {
      alert('Failed to change role');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword }),
      });
      if (response.ok) {
        alert('Password reset successful');
      }
    } catch {
      alert('Failed to reset password');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchUsers}
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

      {/* Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">All Users ({filteredUsers.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Quick Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {user.profile?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.emailVerified ? (
                      <span className="text-green-400">✓ Verified</span>
                    ) : (
                      <span className="text-slate-500">Not verified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {user.profile?.country || 'N/A'}
                    {user.profile?.region && `, ${user.profile.region}`}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {user.status !== 'banned' && (
                      <button
                        onClick={() => handleBan(user._id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Ban
                      </button>
                    )}
                    {user.status !== 'suspended' && user.status !== 'banned' && (
                      <button
                        onClick={() => handleSuspend(user._id)}
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        Suspend
                      </button>
                    )}
                    {(user.status === 'suspended' || user.status === 'banned') && (
                      <button
                        onClick={() => handleReactivate(user._id)}
                        className="text-green-400 hover:text-green-300 text-xs"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleResetPassword(user._id)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <span className="text-4xl mb-2 block">👥</span>
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
