'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Users, UserPlus, Search, Trash2, Mail, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';

interface Enrollment {
  id: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  enrolledAt: string;
  progress: number;
}

interface CourseEnrollmentsProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseEnrollments({ courseId, isOpen, onClose }: CourseEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // New state for enrollment search
  const [enrollSearchTerm, setEnrollSearchTerm] = useState('');
  const [potentialStudents, setPotentialStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bulkEnrolling, setBulkEnrolling] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchEnrollments();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (enrollSearchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const { accessToken } = useAuthStore.getState();
          const token = accessToken || localStorage.getItem('token');
          const response = await fetch(`http://localhost:3001/api/v1/enrollments/${courseId}/search-students?q=${enrollSearchTerm}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setPotentialStudents(data);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPotentialStudents([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [enrollSearchTerm, courseId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/v1/enrollments/${courseId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (student: any) => {
    if (selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedStudents.length === 0) return;
    setBulkEnrolling(true);
    try {
      const { accessToken } = useAuthStore.getState();
      const token = accessToken || localStorage.getItem('token');

      const response = await fetch(`http://localhost:3001/api/v1/enrollments/${courseId}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedStudents.map(s => s.id) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enroll students');
      }

      toast.success(`Successfully enrolled ${selectedStudents.length} students`);
      setSelectedStudents([]);
      setEnrollSearchTerm('');
      setPotentialStudents([]);
      fetchEnrollments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll students');
    } finally {
      setBulkEnrolling(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const fullName = `${enrollment.user.firstName || ''} ${enrollment.user.lastName || ''}`.trim();
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-white/40 ring-1 ring-white/50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/60 backdrop-blur-xl border-b border-white/40">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-inner">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Manage Students</h2>
              <p className="text-gray-600 text-sm mt-0.5">Enroll new students and track progress</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-red-50 hover:text-red-500 rounded-xl w-10 h-10 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          
          {/* Bulk Enroll Section */}
          <div className="bg-white/50 border border-blue-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Enroll Students
            </h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students to enroll..."
                value={enrollSearchTerm}
                onChange={(e) => setEnrollSearchTerm(e.target.value)}
                className="pl-9 bg-white border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 h-12 text-base rounded-xl shadow-sm"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {potentialStudents.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-50">
                {potentialStudents.map((student) => {
                  const isSelected = selectedStudents.some(s => s.id === student.id);
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => toggleStudentSelection(student)}
                      className={`p-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                          {student.firstName?.charAt(0) || student.email.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Students */}
            {selectedStudents.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{selectedStudents.length} students selected</span>
                  <button 
                    onClick={() => setSelectedStudents([])}
                    className="text-red-500 hover:text-red-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map(student => (
                    <div key={student.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-100">
                      <span>{student.firstName} {student.lastName}</span>
                      <button 
                        onClick={() => toggleStudentSelection(student)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleBulkEnroll}
                  disabled={bulkEnrolling}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-70 mt-2"
                >
                  {bulkEnrolling ? 'Enrolling Students...' : `Enroll ${selectedStudents.length} Students`}
                </Button>
              </div>
            )}
          </div>

          {/* Student List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Enrolled Students ({enrollments.length})</h3>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search students..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 bg-white/50 border-gray-200 rounded-xl focus:bg-white transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No students found</p>
                <p className="text-gray-400 text-sm">Try inviting someone or adjusting your search</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm rounded-2xl hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                        {enrollment.user.firstName?.charAt(0).toUpperCase() || enrollment.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{enrollment.user.firstName} {enrollment.user.lastName}</p>
                        <div className="flex items-center text-sm text-gray-500 gap-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {enrollment.user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{Math.round(enrollment.progress)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
