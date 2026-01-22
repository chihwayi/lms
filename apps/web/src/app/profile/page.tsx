'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { User, Upload, Trash2, Save, ArrowLeft, Loader2, Lock, ShieldCheck, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });
  const [verifying, setVerifying] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({ ...user!, ...updatedUser });
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/users/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming response returns { avatar: 'filename' } or the updated user
        // We might need to refresh the user profile
        const profileResponse = await fetch('http://localhost:3001/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileResponse.ok) {
            const updatedUser = await profileResponse.json();
            setUser({ ...user!, ...updatedUser });
        }
        toast.success('Avatar uploaded successfully');
      } else {
        toast.error('Failed to upload avatar');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Verification email sent');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/users/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        logout();
        toast.success('Account deleted successfully');
        router.push('/');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Navigation */}
        <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduFlow
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Courses
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2 border border-blue-200">
                   <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden relative">
                    {user?.avatar ? (
                        <Image src={`http://localhost:3001/uploads/${user.avatar}`} alt="Avatar" fill className="object-cover" unoptimized />
                    ) : (
                        <span className="text-white text-sm font-bold">{user?.firstName?.[0] || 'U'}</span>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.firstName || 'User'}</span>
                </div>
                <Button onClick={handleLogout} variant="outline" className="bg-white/50 hover:bg-white/80">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/dashboard">
                <Button variant="ghost" className="hover:bg-white/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Avatar Section */}
            <div className="md:col-span-1">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4 group">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center relative">
                            {user?.avatar ? (
                                <Image src={`http://localhost:3001/uploads/${user.avatar}`} alt="Profile" fill className="object-cover" unoptimized />
                            ) : (
                                <span className="text-4xl text-white font-bold">{user?.firstName?.[0] || 'U'}</span>
                            )}
                        </div>
                        <div 
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="text-white w-8 h-8" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {user?.role}
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                    </h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <Input 
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    placeholder="John"
                                    className="bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <Input 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    placeholder="Doe"
                                    className="bg-white/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <Textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="Tell us about yourself..."
                                className="bg-white/50 h-32 resize-none"
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Password Change Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Change Password
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                            <Input 
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="bg-white/50"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <Input 
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="bg-white/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                <Input 
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="bg-white/50"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                {loading ? 'Updating...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Email Verification Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        Account Security
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${user?.emailVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Email Verification</h4>
                                <p className="text-sm text-gray-500">
                                    {user?.emailVerified ? 'Your email is verified' : 'Your email is not verified'}
                                </p>
                            </div>
                        </div>
                        {!user?.emailVerified && (
                            <Button 
                                onClick={handleResendVerification} 
                                disabled={verifying}
                                variant="outline"
                            >
                                {verifying ? 'Sending...' : 'Verify Email'}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-red-50/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100">
                    <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Danger Zone
                    </h3>
                    <p className="text-red-700 mb-6">
                        Deleting your account is permanent. All your data, including course progress and certificates, will be wiped out immediately and cannot be recovered.
                    </p>
                    <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        className="w-full sm:w-auto"
                    >
                        Delete My Account
                    </Button>
                </div>
            </div>
          </div>
        </main>

        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAccount}>
                Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}