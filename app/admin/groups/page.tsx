'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL, getToken } from '@/lib/api';

interface GroupMember {
  userId: string;
  role: string;
  joinedAt: string;
}

interface Group {
  _id: string;
  grade: string;
  subject: string;
  topic: string;
  description?: string;
  status: string;
  maxMembers: number;
  groupType: string;
  whatsappLink?: string;
  createdBy: {
    _id: string;
    name?: string;
    email: string;
  };
  members: GroupMember[];
  createdAt: string;
}

export default function GroupManagementPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchGroups = useCallback(async () => {
    const token = getToken();
    try {
      let url = `${API_BASE_URL}/groups?`;
      if (searchQuery) url += `q=${searchQuery}&`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setGroups(data.groups || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleArchive = async (groupId: string) => {
    if (!confirm('Archive this group?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}?archive=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchGroups();
    } catch {
      alert('Failed to archive group');
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Permanently delete this group? This cannot be undone!')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchGroups();
    } catch {
      alert('Failed to delete group');
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (!confirm('Remove this member from the group?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        alert('Member removed');
        fetchGroups();
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(null);
        }
      }
    } catch {
      alert('Failed to remove member');
    }
  };

  const handleChangeMemberRole = async (groupId: string, userId: string, newRole: string) => {
    if (!confirm(`Change member role to ${newRole}?`)) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        alert('Member role updated');
        fetchGroups();
      }
    } catch {
      alert('Failed to change member role');
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const token = getToken();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      topic: formData.get('topic') as string,
      description: formData.get('description') as string,
      maxMembers: Number(formData.get('maxMembers')),
      groupType: formData.get('groupType') as string,
      status: formData.get('status') as string,
      whatsappLink: formData.get('whatsappLink') as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroup._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedGroup(null);
        fetchGroups();
        alert('Group updated successfully');
      }
    } catch {
      alert('Failed to update group');
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
          <h1 className="text-2xl font-bold text-white">Group Management</h1>
          <p className="text-slate-400">Manage all learning groups</p>
        </div>
        <button
          onClick={fetchGroups}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">All Groups ({total})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {groups.map((group) => (
                <tr key={group._id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-white">{group.subject} - {group.topic}</div>
                    {group.description && (
                      <div className="text-xs text-slate-400 truncate max-w-xs">{group.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{group.grade}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {group.createdBy?.name || group.createdBy?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {group.members.length} / {group.maxMembers}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {group.groupType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      group.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => { setSelectedGroup(group); setShowEditModal(false); }}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => { setSelectedGroup(group); setShowEditModal(true); }}
                      className="text-green-400 hover:text-green-300 text-xs"
                    >
                      Edit
                    </button>
                    {group.status === 'active' && (
                      <button
                        onClick={() => handleArchive(group._id)}
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(group._id)}
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

        {groups.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <span className="text-4xl mb-2 block">📚</span>
            <p>No groups found</p>
          </div>
        )}
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && !showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedGroup.subject} - {selectedGroup.topic}</h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">Grade</p>
                  <p className="text-white">{selectedGroup.grade}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Type</p>
                  <p className="text-white">{selectedGroup.groupType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedGroup.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'
                  }`}>
                    {selectedGroup.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Members</p>
                  <p className="text-white">{selectedGroup.members.length} / {selectedGroup.maxMembers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">Created</p>
                  <p className="text-white">{new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-400">Description</p>
                <p className="text-white">{selectedGroup.description || 'No description'}</p>
              </div>

              {selectedGroup.whatsappLink && (
                <div>
                  <p className="text-sm font-medium text-slate-400">WhatsApp Link</p>
                  <a href={selectedGroup.whatsappLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">
                    {selectedGroup.whatsappLink}
                  </a>
                </div>
              )}

              {/* Members List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Members ({selectedGroup.members.length})</h3>
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">User ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Joined</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {selectedGroup.members.map((member) => (
                        <tr key={member.userId} className="hover:bg-slate-700/30">
                          <td className="px-4 py-2 text-sm text-white font-mono">{member.userId}</td>
                          <td className="px-4 py-2 text-sm">
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeMemberRole(selectedGroup._id, member.userId, e.target.value)}
                              className="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-300">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <button
                              onClick={() => handleRemoveMember(selectedGroup._id, member.userId)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {selectedGroup && showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Edit Group</h2>
              <button
                onClick={() => { setShowEditModal(false); setSelectedGroup(null); }}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Grade</label>
                  <input
                    type="text"
                    name="grade"
                    defaultValue={selectedGroup.grade}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    defaultValue={selectedGroup.subject}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  defaultValue={selectedGroup.topic}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedGroup.description}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Members</label>
                  <input
                    type="number"
                    name="maxMembers"
                    defaultValue={selectedGroup.maxMembers}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Group Type</label>
                  <select
                    name="groupType"
                    defaultValue={selectedGroup.groupType}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="invite-only">Invite Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={selectedGroup.status}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Link</label>
                <input
                  type="url"
                  name="whatsappLink"
                  defaultValue={selectedGroup.whatsappLink}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedGroup(null); }}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
