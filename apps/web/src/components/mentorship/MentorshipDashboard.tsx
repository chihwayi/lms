'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface MentorProfile {
  id: string;
  user: User;
  title: string;
  company: string;
}

interface MentorshipRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message: string;
  responseMessage?: string;
  createdAt: string;
  mentor: MentorProfile;
  mentee: User;
}

export function MentorshipDashboard() {
  const [sentRequests, setSentRequests] = useState<MentorshipRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [sentRes, receivedRes] = await Promise.all([
        fetch('/api/v1/mentorship/requests/sent', { headers }),
        fetch('/api/v1/mentorship/requests/received', { headers }),
      ]);

      if (sentRes.ok) {
        setSentRequests(await sentRes.json());
      }
      
      // receivedRes might be 404 if user is not a mentor, which is fine
      if (receivedRes.ok) {
        setReceivedRequests(await receivedRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/mentorship/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`Request ${status.toLowerCase()}`);
        fetchRequests(); // Refresh list
      } else {
        toast.error('Failed to update request');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <Button variant="outline" className="hidden sm:flex" onClick={fetchRequests}>
            <Clock className="w-4 h-4 mr-2" />
            Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg w-full sm:w-auto mb-6">
          <TabsTrigger value="sent" className="rounded-md px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all">
            My Requests
          </TabsTrigger>
          <TabsTrigger value="received" className="rounded-md px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all">
            Received Requests 
            {receivedRequests.filter(r => r.status === 'PENDING').length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 h-5 px-1.5">
                    {receivedRequests.filter(r => r.status === 'PENDING').length}
                </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="space-y-4 animate-in fade-in-50 duration-300">
          {sentRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                    <Loader2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No requests sent</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">You haven't sent any mentorship requests yet. Browse mentors to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
                {sentRequests.map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow border-slate-200 overflow-hidden group">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                            <div className="p-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={request.mentor.user.avatar} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{request.mentor.user.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-lg">{request.mentor.user.firstName} {request.mentor.user.lastName}</h4>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mb-3">{request.mentor.title} at {request.mentor.company}</p>
                                        <div className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm italic border border-slate-100">
                                            "{request.message}"
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                            <Clock className="w-3 h-3" />
                                            Sent on {format(new Date(request.createdAt), 'PPP')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`w-full sm:w-2 bg-slate-100 ${
                                request.status === 'ACCEPTED' ? 'bg-green-500' : 
                                request.status === 'REJECTED' ? 'bg-red-500' : 
                                'bg-yellow-500'
                            }`} />
                        </div>
                    </CardContent>
                </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4 animate-in fade-in-50 duration-300">
           {receivedRequests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                    <Loader2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No requests received</h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">You haven't received any mentorship requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
                {receivedRequests.map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow border-slate-200 overflow-hidden group">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                            <div className="p-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={request.mentee?.avatar} />
                                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">{request.mentee?.firstName?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-lg">{request.mentee?.firstName} {request.mentee?.lastName}</h4>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(request.status)}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm italic border border-slate-100 mt-2">
                                            "{request.message}"
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                            <Clock className="w-3 h-3" />
                                            Received on {format(new Date(request.createdAt), 'PPP')}
                                        </div>

                                        {request.status === 'PENDING' && (
                                            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                                                <Button 
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 shadow-sm"
                                                    onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Accept Request
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={`w-full sm:w-2 bg-slate-100 ${
                                request.status === 'ACCEPTED' ? 'bg-green-500' : 
                                request.status === 'REJECTED' ? 'bg-red-500' : 
                                'bg-yellow-500'
                            }`} />
                        </div>
                    </CardContent>
                </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
