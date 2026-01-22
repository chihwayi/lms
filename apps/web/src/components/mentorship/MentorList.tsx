'use client';

import { useEffect, useState } from 'react';
import { MentorCard } from './MentorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export function MentorList() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchMentors();
  }, [debouncedSearch]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      const res = await fetch(`/api/v1/mentorship/mentors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMentors(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
                placeholder="Search by name, company, or role..." 
                className="pl-10 border-slate-200 focus-visible:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700">
                <Filter className="w-4 h-4" />
                Filter by Skill
            </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
          
          {mentors.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <h3 className="text-lg font-medium text-gray-900">No mentors found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
