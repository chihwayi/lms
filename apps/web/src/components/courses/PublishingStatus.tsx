'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock, Rocket, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { SchedulePublishing } from './SchedulePublishing';

interface PublishingStatusProps {
  courseId: string;
  currentStatus: string;
  onStatusUpdate?: (status: any) => void;
  lastUpdated?: number;
}

interface PublishingStatusData {
  canPublish: boolean;
  moduleCount: number;
  lessonCount: number;
  publishedAt: string | null;
  validationErrors: string[];
}

export function PublishingStatus({ courseId, currentStatus, onStatusUpdate, lastUpdated }: PublishingStatusProps) {
  const [status, setStatus] = useState<PublishingStatusData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublishingStatus();
  }, [courseId, lastUpdated]);

  const fetchPublishingStatus = async () => {
    try {
      if (!courseId) return;
      
      const response = await apiClient(`/api/v1/courses/${courseId}/publishing-status`);

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
      const response = await apiClient(`/api/v1/courses/${courseId}/publish`, {
        method: 'POST',
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
      const response = await apiClient(`/api/v1/courses/${courseId}/unpublish`, {
        method: 'POST',
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
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${getStatusColor()} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}>
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {getStatusText()}
                </h3>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-base md:text-lg font-semibold text-gray-700">📚 {status.moduleCount}</span>
                    <span className="text-gray-600 text-sm md:text-base">modules</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base md:text-lg font-semibold text-gray-700">🎯 {status.lessonCount}</span>
                    <span className="text-gray-600 text-sm md:text-base">lessons</span>
                  </div>
                  {status.publishedAt && (
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm md:text-base">Published {new Date(status.publishedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <SchedulePublishing 
                courseId={courseId} 
                onScheduled={() => fetchPublishingStatus()}
              />
              {currentStatus === 'published' ? (
                <Button
                  onClick={unpublishCourse}
                  disabled={loading}
                  variant="outline"
                  className="w-full sm:w-auto bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 text-gray-700 text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2 justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"></div>
                      <span>Unpublishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 justify-center">
                      <Eye className="w-5 h-5" />
                      <span>Unpublish</span>
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={publishCourse}
                  disabled={!status.canPublish || loading}
                  className={`w-full sm:w-auto bg-gradient-to-r ${getStatusColor()} hover:shadow-2xl text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2 justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 justify-center">
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

      {/* Publishing Requirements */}
      <Card className="bg-white/40 backdrop-blur-xl border-white/30 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${status.canPublish ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-red-500'} rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300`}>
              {status.canPublish ? <CheckCircle className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">Publishing Requirements</h4>
              <p className="text-gray-600">Complete these items to publish your course</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { 
                label: 'Course Title', 
                met: !status.validationErrors.includes('Course title is required') 
              },
              { 
                label: 'Course Description', 
                met: !status.validationErrors.includes('Course description is required') 
              },
              { 
                label: 'Course Category', 
                met: !status.validationErrors.includes('Course category is required') 
              },
              { 
                label: `At least one module (${status.moduleCount})`, 
                met: status.moduleCount > 0 
              },
              { 
                label: `At least one lesson (${status.lessonCount})`, 
                met: status.lessonCount > 0 
              }
            ].map((req, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 ${
                  req.met 
                    ? 'bg-green-50/50 border-green-200/60' 
                    : 'bg-red-50/50 border-red-200/60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 mt-0.5 ${
                  req.met ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {req.met ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-sm font-bold">!</span>
                  )}
                </div>
                <span className={`font-medium transition-colors duration-300 min-w-0 flex-1 break-words ${
                  req.met ? 'text-green-900' : 'text-red-900'
                }`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}