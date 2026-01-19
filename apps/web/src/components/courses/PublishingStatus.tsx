'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock, Rocket, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface PublishingStatusProps {
  courseId: string;
  currentStatus: string;
  onStatusUpdate?: (status: any) => void;
}

export function PublishingStatus({ courseId, currentStatus, onStatusUpdate }: PublishingStatusProps) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublishingStatus();
  }, [courseId]);

  const fetchPublishingStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !courseId) return;
      
      const response = await fetch(`/api/v1/courses/${courseId}/publishing-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        // Token expired, redirect to login
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const statusData = await response.json();
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching publishing status:', error);
    }
  };

  const publishCourse = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/${courseId}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Course published successfully!');
        onStatusUpdate?.('published');
        fetchPublishingStatus();
      } else {
        toast.error('Failed to publish course');
      }
    } catch (error) {
      toast.error('Failed to publish course');
    } finally {
      setLoading(false);
    }
  };

  const unpublishCourse = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/courses/${courseId}/unpublish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Course unpublished successfully!');
        onStatusUpdate?.('draft');
        fetchPublishingStatus();
      } else {
        toast.error('Failed to unpublish course');
      }
    } catch (error) {
      toast.error('Failed to unpublish course');
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (status.canPublish && currentStatus === 'published') return 'from-green-500 to-emerald-500';
    if (status.canPublish) return 'from-blue-500 to-purple-500';
    return 'from-orange-500 to-red-500';
  };

  const getStatusIcon = () => {
    if (status.canPublish && currentStatus === 'published') return <CheckCircle className="w-6 h-6 text-white" />;
    if (status.canPublish) return <Rocket className="w-6 h-6 text-white" />;
    return <AlertCircle className="w-6 h-6 text-white" />;
  };

  const getStatusText = () => {
    if (currentStatus === 'published') return 'Published';
    if (status.canPublish) return 'Ready to Publish';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-6">
      {/* Publishing Status Card */}
      <Card className={`bg-gradient-to-r ${getStatusColor()}/10 backdrop-blur-xl border-white/30 shadow-2xl overflow-hidden`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${getStatusColor()} rounded-2xl flex items-center justify-center shadow-xl`}>
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {getStatusText()}
                </h3>
                <div className="flex items-center space-x-6 mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-700">📚 {status.moduleCount}</span>
                    <span className="text-gray-600">modules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-700">🎯 {status.lessonCount}</span>
                    <span className="text-gray-600">lessons</span>
                  </div>
                  {status.publishedAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Published {new Date(status.publishedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              {currentStatus === 'published' ? (
                <Button
                  onClick={unpublishCourse}
                  disabled={loading}
                  variant="outline"
                  className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"></div>
                      <span>Unpublishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Unpublish</span>
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={publishCourse}
                  disabled={!status.canPublish || loading}
                  className={`bg-gradient-to-r ${getStatusColor()} hover:shadow-2xl text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Rocket className="w-5 h-5" />
                      <span>Publish Course</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {status.validationErrors && status.validationErrors.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-xl border-red-200/40 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-800">Publishing Requirements</h4>
                <p className="text-red-600">Complete these items before publishing</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {status.validationErrors.map((error, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-red-200/40">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publishing Checklist */}
      <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">Publishing Checklist</h4>
              <p className="text-gray-600">Track your course completion progress</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center space-x-3 p-4 rounded-xl ${status.moduleCount > 0 ? 'bg-green-100/70 border-green-200/40' : 'bg-gray-100/70 border-gray-200/40'}`}>
              <CheckCircle className={`w-5 h-5 ${status.moduleCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">Course Modules ({status.moduleCount})</span>
            </div>
            
            <div className={`flex items-center space-x-3 p-4 rounded-xl ${status.lessonCount > 0 ? 'bg-green-100/70 border-green-200/40' : 'bg-gray-100/70 border-gray-200/40'}`}>
              <CheckCircle className={`w-5 h-5 ${status.lessonCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">Course Lessons ({status.lessonCount})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}