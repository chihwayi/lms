'use client';

import { useEffect, useState } from 'react';
import { MentorCard } from './MentorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Sparkles, Users, SlidersHorizontal, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { apiClient } from '@/lib/api-client';

export function MentorList() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchMentors();
    fetchMatches();
  }, [debouncedSearch, activeFilters]);

  const handleAddFilter = () => {
    if (expertiseFilter && !activeFilters.includes(expertiseFilter)) {
      setActiveFilters([...activeFilters, expertiseFilter]);
      setExpertiseFilter('');
    }
  };

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const fetchMatches = async () => {
    try {
        const res = await apiClient('mentorship/matches');
        if (res.ok) {
            setMatches(await res.json());
        }
    } catch (e) {
        console.error(e);
    }
  }

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      // Backend currently supports single expertise, so we take the first one or we can update backend to support multiple
      // For now, let's send the first one if exists
      if (activeFilters.length > 0) {
        params.append('expertise', activeFilters[0]);
      }
      
      const res = await apiClient(`mentorship/mentors?${params.toString()}`);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                  placeholder="Search mentors by name, company..." 
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 relative">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
                      {activeFilters.length}
                    </span>
                  )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Mentors</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label>Skills & Expertise</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. React, Leadership..." 
                      value={expertiseFilter}
                      onChange={(e) => setExpertiseFilter(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
                    />
                    <Button size="sm" onClick={handleAddFilter}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilters.map(filter => (
                      <Badge key={filter} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                        {filter}
                        <button onClick={() => handleRemoveFilter(filter)} className="hover:bg-slate-200 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button className="w-full">Show Results</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-100/80 p-1 rounded-lg w-full md:w-auto mb-6 inline-flex">
            <TabsTrigger 
                value="recommended" 
                className="flex items-center gap-2 px-4 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all"
            >
                <Sparkles className="w-4 h-4" />
                Recommended
            </TabsTrigger>
            <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 px-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
            >
                <Users className="w-4 h-4" />
                All Mentors
            </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            {matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-purple-100 shadow-sm">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Sparkles className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No personalized recommendations yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Submit innovation projects and define your tags to let our AI match you with the perfect mentors.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200">
                        Create Innovation Project
                    </Button>
                </div>
            )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-[400px] bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
                            <div className="h-24 bg-slate-100 rounded-t-xl" />
                            <div className="p-6 space-y-4">
                                <div className="w-24 h-24 bg-slate-200 rounded-full -mt-16 border-4 border-white" />
                                <div className="h-6 bg-slate-100 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-1/2" />
                                <div className="h-20 bg-slate-100 rounded w-full" />
                            </div>
                        </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
