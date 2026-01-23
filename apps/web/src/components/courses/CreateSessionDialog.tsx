'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { Plus, Calendar, Clock, Link as LinkIcon, Video, AlignLeft, Type } from 'lucide-react';

interface CreateSessionDialogProps {
  courseId: string;
  onSessionCreated: () => void;
}

export function CreateSessionDialog({ courseId, onSessionCreated }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    meeting_link: '',
    platform: 'zoom',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient('/live-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          course_id: courseId,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      toast.success('Live session scheduled successfully');
      setOpen(false);
      onSessionCreated();
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        meeting_link: '',
        platform: 'zoom',
      });
    } catch (error) {
      toast.error('Failed to schedule session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            Schedule Live Session
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Create a new live learning session for your students.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-gray-700 font-medium">
                <Type className="w-4 h-4 text-purple-500" />
                Session Title
              </Label>
              <Input
                id="title"
                required
                placeholder="e.g., Weekly Q&A Session"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-gray-700 font-medium">
                <AlignLeft className="w-4 h-4 text-purple-500" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="What will be covered in this session?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Start Time
                </Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Clock className="w-4 h-4 text-purple-500" />
                  End Time
                </Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Video className="w-4 h-4 text-purple-500" />
                  Platform
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link" className="flex items-center gap-2 text-gray-700 font-medium">
                  <LinkIcon className="w-4 h-4 text-purple-500" />
                  Meeting Link
                </Label>
                <Input
                  id="meeting_link"
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-xl hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
