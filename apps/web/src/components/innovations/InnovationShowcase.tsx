'use client';

import { useEffect, useState } from 'react';
import { InnovationCard } from '@/components/innovations/InnovationCard';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

export default function InnovationShowcase() {
  const [innovations, setInnovations] = useState<any[]>([]); // TODO: Type this properly
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApprovedInnovations();
  }, []);

  const fetchApprovedInnovations = async () => {
    try {
      // TODO: Backend needs an endpoint for public/approved innovations without auth or with auth but filtered
      // Using findAll for now, assuming backend filters or we filter here.
      // Ideally: GET /api/v1/innovations/showcase or ?status=approved
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/innovations', {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter client-side for now if backend doesn't support specific filter endpoint yet
        // But wait, the backend `findAll` returns:
        // - Admin/Instructor: ALL
        // - Student: ONLY THEIRS
        // This is a problem for the Showcase. We need a public/shared endpoint for Approved innovations.
        setInnovations(data.filter((i: any) => i.status === 'approved')); 
      }
    } catch (error) {
      console.error('Error fetching showcase:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInnovations = innovations.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.problem_statement.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8 md:p-12 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Innovation Showcase
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover the amazing projects created by our community.
        </p>

        <div className="relative max-w-xl mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
          <Input 
            placeholder="Search projects..." 
            className="pl-12 h-12 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 text-lg shadow-sm rounded-xl transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredInnovations.length === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInnovations.map((innovation) => (
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
