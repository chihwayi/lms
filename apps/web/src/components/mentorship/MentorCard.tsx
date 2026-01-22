'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Linkedin, Globe, Users } from 'lucide-react';
import Link from 'next/link';
import { RequestMentorshipModal } from './RequestMentorshipModal';

interface MentorProfile {
  id: string;
  title: string;
  company: string;
  bio: string;
  expertise: string[];
  yearsOfExperience: number;
  linkedinUrl?: string;
  websiteUrl?: string;
  maxMentees: number;
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
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <CardHeader className="relative pt-0 pb-2">
        <div className="absolute -top-12 left-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md">
            <AvatarImage src={mentor.user.avatar} />
            <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700">
              {mentor.user.firstName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="ml-32 pt-2">
          <h3 className="text-xl font-bold text-gray-900">
            {mentor.user.firstName} {mentor.user.lastName}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Briefcase className="w-3 h-3 mr-1" />
            {mentor.title} at {mentor.company}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
                <span className="font-semibold text-gray-900 mr-1">{mentor.yearsOfExperience}</span>
                Years Exp.
            </div>
            <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>Available for mentoring</span>
            </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3">
          {mentor.bio}
        </p>

        <div className="flex flex-wrap gap-2">
          {mentor.expertise.slice(0, 4).map(skill => (
            <Badge key={skill} variant="secondary" className="bg-indigo-50 text-indigo-700">
              {skill}
            </Badge>
          ))}
          {mentor.expertise.length > 4 && (
            <Badge variant="outline">+{mentor.expertise.length - 4}</Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
            <RequestMentorshipModal 
              mentorId={mentor.id} 
              mentorName={`${mentor.user.firstName} ${mentor.user.lastName}`}
            >
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  Request Mentorship
              </Button>
            </RequestMentorshipModal>
            {mentor.linkedinUrl && (
                <Link href={mentor.linkedinUrl} target="_blank">
                    <Button variant="outline" size="icon">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                    </Button>
                </Link>
            )}
            {mentor.websiteUrl && (
                <Link href={mentor.websiteUrl} target="_blank">
                    <Button variant="outline" size="icon">
                        <Globe className="w-4 h-4 text-gray-600" />
                    </Button>
                </Link>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
