'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SchedulePublishingProps {
  courseId: string;
  onScheduled?: () => void;
}

export function SchedulePublishing({ courseId, onScheduled }: SchedulePublishingProps) {
  const [publishDate, setPublishDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  const schedulePublish = async () => {
    if (!publishDate) {
      toast.error('Please select a publish date');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient(`/api/v1/courses/${courseId}/schedule-publish`, {
        method: 'POST',
        body: JSON.stringify({ publishDate }),
      });

      if (response.ok) {
        toast.success('Course scheduled for publishing!');
        setShowScheduler(false);
        setPublishDate('');
        onScheduled?.();
      } else {
        toast.error('Failed to schedule publishing');
      }
    } catch (error) {
      toast.error('Failed to schedule publishing');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!showScheduler) {
    return (
      <Button
        onClick={() => setShowScheduler(true)}
        variant="outline"
        className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Schedule Publishing
      </Button>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Schedule Publishing</h3>
            <p className="text-gray-600">Set when this course should be published</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publish Date & Time
            </label>
            <Input
              type="datetime-local"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg"
            />
          </div>

          {publishDate && (
            <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200/40">
              <div className="flex items-center space-x-2 text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Will be published on {formatDateTime(publishDate)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={schedulePublish}
              disabled={!publishDate || loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Scheduling...</span>
                </div>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScheduler(false)}
              className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}