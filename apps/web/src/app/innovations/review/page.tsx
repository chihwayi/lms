'use client';

import { useEffect, useState } from 'react';
import { InnovationCard } from '@/components/innovations/InnovationCard';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ReviewerDashboard() {
  const [innovations, setInnovations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Basic check, backend handles actual security
    if (user && user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'educator') {
      router.push('/innovations');
      return;
    }
    fetchSubmittedInnovations();
  }, [user]);

  const fetchSubmittedInnovations = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch all (admin/instructor sees all)
      const res = await fetch('/api/v1/innovations', {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter for submitted only
        setInnovations(data.filter((i: any) => i.status === 'submitted'));
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <Link href="/innovations" className="w-fit">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Innovations
          </Button>
        </Link>
        
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-6 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reviewer Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Review and grade innovation submissions from students.
          </p>
        </div>
      </div>

      {innovations.length === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No pending submissions to review at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {innovations.map((innovation) => (
            <InnovationCard 
              key={innovation.id} 
              innovation={innovation}
              isOwner={false} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
