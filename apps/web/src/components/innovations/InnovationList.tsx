'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Innovation, InnovationCard } from './InnovationCard';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { apiClient } from '@/lib/api-client';

export default function InnovationList() {
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToSubmit, setItemToSubmit] = useState<string | null>(null);
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();

  const fetchInnovations = async () => {
    try {
      if (!accessToken) {
        return;
      }

      const res = await apiClient('innovations');

      if (res.status === 401) {
        logout();
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setInnovations(data);
      }
    } catch (error) {
      console.error('Failed to fetch innovations', error);
      toast.error('Failed to fetch innovations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchInnovations();
    }
  }, [accessToken]);

  const initiateDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (!accessToken) return;

      const res = await apiClient(`innovations/${itemToDelete}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        setInnovations(innovations.filter(i => i.id !== itemToDelete));
        toast.success('Innovation deleted successfully');
      } else {
        toast.error('Failed to delete innovation');
      }
    } catch (error) {
      console.error('Failed to delete innovation', error);
      toast.error('An error occurred while deleting');
    } finally {
      setItemToDelete(null);
    }
  };

  const initiateSubmit = (id: string) => {
    setItemToSubmit(id);
  };

  const confirmSubmit = async () => {
    if (!itemToSubmit) return;

    try {
      if (!accessToken) return;

      const res = await apiClient(`/innovations/${itemToSubmit}/submit`, {
        method: 'POST',
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        setInnovations(innovations.map(i => i.id === itemToSubmit ? { ...i, status: 'submitted' } : i));
        toast.success('Innovation submitted for review');
      } else {
        toast.error('Failed to submit innovation');
      }
    } catch (error) {
      console.error('Failed to submit innovation', error);
      toast.error('An error occurred while submitting');
    } finally {
      setItemToSubmit(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading innovations...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Innovations</h1>
          <p className="text-gray-600 mt-1">Manage your ideas and projects</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/innovations/showcase">
            <Button variant="outline" className="bg-white/50 hover:bg-white border-white/40 hover:border-blue-200 transition-all duration-300">
              Showcase
            </Button>
          </Link>
          {(user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'educator') && (
            <Link href="/innovations/review">
              <Button variant="outline" className="bg-white/50 hover:bg-white border-white/40 hover:border-blue-200 transition-all duration-300">
                Review Dashboard
              </Button>
            </Link>
          )}
          <Link href="/innovations/create">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              New Innovation
            </Button>
          </Link>
        </div>
      </div>


      {innovations.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No innovations yet</h3>
          <p className="text-slate-500 mb-6">Start by submitting your first idea!</p>
          <Link href="/innovations/create">
            <Button>Create Innovation</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {innovations.map((innovation) => (
            <InnovationCard 
              key={innovation.id} 
              innovation={innovation}
              isOwner={true} // Assuming 'My Innovations' page implies ownership or filtered by backend
              onDelete={initiateDelete}
              onSubmit={initiateSubmit}
            />
          ))}
        </div>
      )}

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Innovation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this innovation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!itemToSubmit} onOpenChange={(open) => !open && setItemToSubmit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Innovation</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this innovation for review? You cannot edit it while it is under review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToSubmit(null)}>Cancel</Button>
            <Button onClick={confirmSubmit}>Submit for Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
