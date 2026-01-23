'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';

export function MentorProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    bio: '',
    yearsOfExperience: 0,
    linkedinUrl: '',
    websiteUrl: '',
    maxMentees: 5,
  });
  const [currentTag, setCurrentTag] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [availability, setAvailability] = useState<{dayOfWeek: number, startTime: string, endTime: string}[]>([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'maxMentees' ? parseInt(value) || 0 : value
    }));
  };

  const addTag = () => {
    if (currentTag && !expertise.includes(currentTag)) {
      setExpertise([...expertise, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setExpertise(expertise.filter(t => t !== tag));
  };

  const addSlot = () => {
      setAvailability([...availability, newSlot]);
  };

  const removeSlot = (index: number) => {
      setAvailability(availability.filter((_, i) => i !== index));
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient('/mentorship/profile', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          expertise,
          availability
        }),
      });

      if (res.ok) {
        toast.success('Mentor profile created successfully!');
        router.push('/mentorship');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to create profile');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
        <CardTitle className="text-xl">Mentor Profile Details</CardTitle>
        <CardDescription>This information will be visible to potential mentees.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700">Job Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={handleChange}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                placeholder="e.g. Tech Corp"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about your experience and mentoring style..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Expertise (Skills)</Label>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a skill (e.g. React, Leadership)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {expertise.map(tag => (
                <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxMentees">Max Mentees</Label>
              <Input
                id="maxMentees"
                name="maxMentees"
                type="number"
                min="1"
                max="50"
                value={formData.maxMentees}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website (Optional)</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                placeholder="https://..."
                value={formData.websiteUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Availability Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <Label className="text-base font-semibold text-slate-900">Weekly Availability</Label>
            <CardDescription>Set your recurring available hours for mentorship sessions.</CardDescription>
            
            <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-2 w-full sm:w-40">
                    <Label>Day</Label>
                    <Select 
                        value={newSlot.dayOfWeek.toString()} 
                        onValueChange={(val) => setNewSlot({...newSlot, dayOfWeek: parseInt(val)})}
                    >
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                            {days.map((day, index) => (
                                <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-32">
                    <Label>Start Time</Label>
                    <Input 
                        type="time" 
                        value={newSlot.startTime} 
                        onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                        className="bg-white"
                    />
                </div>
                <div className="space-y-2 w-32">
                    <Label>End Time</Label>
                    <Input 
                        type="time" 
                        value={newSlot.endTime} 
                        onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                        className="bg-white"
                    />
                </div>
                <Button type="button" onClick={addSlot} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Slot
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{days[slot.dayOfWeek]}</p>
                                <p className="text-sm text-slate-500">{slot.startTime} - {slot.endTime}</p>
                            </div>
                        </div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => removeSlot(index)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Create Mentor Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
