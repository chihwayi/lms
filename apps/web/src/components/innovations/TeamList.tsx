'use client';

import { useState } from 'react';
import { InnovationMember } from './InnovationCard';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface TeamListProps {
  innovationId: string;
  members: InnovationMember[];
  ownerId?: string;
  isOwner: boolean;
  onUpdate: () => void;
}

export function TeamList({ innovationId, members, ownerId, isOwner, onUpdate }: TeamListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const handleAddMember = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient(`/innovations/${innovationId}/team`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to add member');
      }

      toast.success('Team member added');
      setIsAddDialogOpen(false);
      setEmail('');
      setRole('member');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setMemberToDelete(memberId);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      const res = await apiClient(`/innovations/${innovationId}/team/${memberToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove member');

      toast.success('Member removed');
      onUpdate();
    } catch (error) {
      toast.error('Could not remove member');
    } finally {
      setMemberToDelete(null);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Team Members
        </h2>
        {isOwner && (
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Owner / Leader (Usually implied, but let's assume members list contains everyone except owner if not added explicitly, but here we can show owner if passed) */}
        {/* Note: The backend returns 'members' which are explicitly added. The 'owner' is in innovation.student. */}
        
        {members && members.length > 0 ? (
          members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user.avatar ? `/uploads/${member.user.avatar}` : undefined} />
                  <AvatarFallback>{getInitials(member.user.firstName, member.user.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{member.user.firstName} {member.user.lastName}</p>
                  <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                </div>
              </div>

              {isOwner && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" 
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p>No additional team members.</p>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Invite a student to collaborate on this innovation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student Email</Label>
              <Input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="leader">Co-Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
