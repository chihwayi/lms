'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, accessToken, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);
  const [processingRoles, setProcessingRoles] = useState(new Set<string>());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (accessToken) {
      fetchData();
    }
  }, [isAuthenticated, accessToken, router]);

  const fetchData = async () => {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/v1/admin/users', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch('http://localhost:3001/api/v1/rbac/roles', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/rbac/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleName }),
      });
      
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }
      
      if (response.ok) {
        await fetchData();
        toast.success('Role assigned successfully!');
      } else {
        toast.error('Failed to assign role');
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      toast.error('Failed to assign role');
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/rbac/users/${userId}/roles/${roleName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }
      
      if (response.ok) {
        await fetchData();
        toast.success(`Role ${roleName} removed successfully!`);
      } else {
        toast.error('Failed to remove role');
      }
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast.error('Failed to remove role');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailVerified: !currentStatus }),
      });
      if (response.ok) {
        fetchData();
        toast.success('User status updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const createUser = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        fetchData();
        setShowCreateUser(false);
        toast.success('User created successfully!');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bulkAssignRole = async (roleName: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }
    
    try {
      await Promise.all(
        selectedUsers.map(userId => assignRole(userId, roleName))
      );
      setSelectedUsers([]);
      toast.success(`Role ${roleName} assigned to ${selectedUsers.length} users`);
    } catch (error) {
      toast.error('Failed to assign roles');
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading admin data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduFlow
              </Link>
              <span className="ml-4 text-gray-600">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <Link href="/dashboard" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">System Administration</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.emailVerified).length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🔐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">System Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              + Create User
            </button>
          </div>

          {/* Search and Bulk Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600 py-2">{selectedUsers.length} selected</span>
                  <select
                    onChange={(e) => e.target.value && bulkAssignRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Bulk Assign Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="divide-y divide-gray-200/50">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="px-6 py-4 hover:bg-white/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="mr-4"
                      />
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Role Checkboxes */}
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role: any) => {
                          const userRoles = user.roles || [];
                          const hasRole = userRoles.some((userRole: any) => userRole.name === role.name);
                          return (
                            <label key={role.id} className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasRole}
                                disabled={processingRoles.has(`${user.id}-${role.name}`)}
                                onChange={(e) => {
                                  e.preventDefault();
                                  const key = `${user.id}-${role.name}`;
                                  if (processingRoles.has(key)) return;
                                  
                                  console.log(`${e.target.checked ? 'Adding' : 'Removing'} role ${role.name} for user ${user.email}`);
                                  if (e.target.checked) {
                                    assignRole(user.id, role.name);
                                  } else {
                                    removeRole(user.id, role.name);
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                hasRole 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {role.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={() => toggleUserStatus(user.id, user.emailVerified)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          user.emailVerified 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {user.emailVerified ? '✅ Active' : '⏳ Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Roles & Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role: any) => (
              <div key={role.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 capitalize">{role.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Level {role.level}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{role.description}</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Permissions ({role.permissions.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission: any, index: number) => (
                      <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {permission.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Create New User</h3>
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createUser({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
              });
            }}>
              <div className="space-y-4">
                <input
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}