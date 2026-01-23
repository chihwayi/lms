'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Linkedin, Globe, Users, Clock, Award, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { RequestMentorshipModal } from './RequestMentorshipModal';
import { BookingModal } from './BookingModal';
import { useChatStore } from '@/lib/chat-store';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface MentorProfile {
  id: string;
  userId: string;
  title: string;
  company: string;
  bio: string;
  expertise: string[];
  yearsOfExperience: number;
  linkedinUrl?: string;
  websiteUrl?: string;
  maxMentees: number;
  matchScore?: number;
  matchingSkills?: string[];
  availability?: { dayOfWeek: number; startTime: string; endTime: string }[];
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface MentorCardProps {
  mentor: MentorProfile;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { openChatWithConversation } = useChatStore();
  const [chatLoading, setChatLoading] = useState(false);

  const handleMessage = async () => {
    setChatLoading(true);
    try {
        const res = await apiClient('/chat/conversations/direct', {
            method: 'POST',
            body: JSON.stringify({ userId: mentor.userId })
        });
        
        if (res.ok) {
            const conversation = await res.json();
            openChatWithConversation(conversation.id);
        } else {
            toast.error('Failed to start conversation');
        }
    } catch (e) {
        toast.error('Failed to start conversation');
    } finally {
        setChatLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden relative border-slate-200 hover:border-indigo-200 flex flex-col h-full bg-white">
      {mentor.matchScore && (
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-emerald-100 flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
            <span className="text-sm font-bold text-emerald-600">{mentor.matchScore}%</span>
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Match</span>
          </div>
      )}
      
      <div className="h-28 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>
      
      <CardHeader className="relative pt-0 pb-4 px-6 grow-0">
        <div className="absolute -top-14 left-6 ring-4 ring-white rounded-full shadow-md bg-white">
          <Avatar className="w-28 h-28 rounded-full">
            <AvatarImage src={mentor.user.avatar} className="object-cover" />
            <AvatarFallback className="text-2xl bg-indigo-50 text-indigo-600 font-bold">
              {mentor.user.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="ml-36 pt-3 min-h-[88px]">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1" title={`${mentor.user.firstName} ${mentor.user.lastName}`}>
            {mentor.user.firstName} {mentor.user.lastName}
          </h3>
          <div className="flex items-start text-sm text-slate-500 mt-1.5 leading-snug">
            <Briefcase className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-2">
                {mentor.title} at <span className="font-medium text-slate-700">{mentor.company}</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-5 grow flex flex-col">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-slate-700">{mentor.yearsOfExperience} Years Exp.</span>
            </div>
            <div className="w-px h-4 bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-slate-700">Available</span>
            </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 h-[60px]">
          {mentor.bio}
        </p>

        <div className="flex flex-wrap gap-2 content-start h-[52px] overflow-hidden">
          {mentor.expertise.slice(0, 4).map(skill => (
            <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors">
              {skill}
            </Badge>
          ))}
          {mentor.expertise.length > 4 && (
            <Badge variant="outline" className="text-slate-500 border-slate-200 bg-white">+{mentor.expertise.length - 4}</Badge>
          )}
        </div>

        <div className="mt-auto pt-2 flex gap-3">
            {mentor.availability && mentor.availability.length > 0 ? (
                <BookingModal
                    mentorId={mentor.id}
                    mentorName={`${mentor.user.firstName} ${mentor.user.lastName}`}
                    availability={mentor.availability}
                >
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 font-medium">
                        Book Session
                    </Button>
                </BookingModal>
            ) : (
                <RequestMentorshipModal 
                  mentorId={mentor.id} 
                  mentorName={`${mentor.user.firstName} ${mentor.user.lastName}`}
                >
                  <Button className="flex-1 bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 font-medium shadow-sm">
                      Request Mentorship
                  </Button>
                </RequestMentorshipModal>
            )}
            
            <Button 
                variant="outline" 
                size="icon" 
                className="border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 shrink-0"
                onClick={handleMessage}
                disabled={chatLoading}
            >
                <MessageSquare className="w-4 h-4" />
            </Button>

            {mentor.linkedinUrl && (
                <Link href={mentor.linkedinUrl} target="_blank">
                    <Button variant="outline" size="icon" className="border-slate-200 text-slate-500 hover:text-[#0077b5] hover:bg-blue-50 hover:border-blue-100">
                        <Linkedin className="w-4 h-4" />
                    </Button>
                </Link>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
