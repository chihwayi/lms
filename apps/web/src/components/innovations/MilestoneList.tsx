'use client';

import { useState } from 'react';
import { InnovationMilestone } from './InnovationCard';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, CheckCircle2, Clock, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api-client';

interface MilestoneListProps {
  innovationId: string;
  milestones: InnovationMilestone[];
  canManage: boolean;
  onUpdate: () => void;
}

export function MilestoneList({ innovationId, milestones, canManage, onUpdate }: MilestoneListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<InnovationMilestone | null>(null);
  const [loading, setLoading] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      status: 'pending',
    });
    setEditingMilestone(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (milestone: InnovationMilestone) => {
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      due_date: milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : '',
      status: milestone.status,
    });
    setEditingMilestone(milestone);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    try {
      const url = editingMilestone
        ? `/innovations/${innovationId}/milestones/${editingMilestone.id}`
        : `/innovations/${innovationId}/milestones`;
      
      const method = editingMilestone ? 'PATCH' : 'POST';

      const res = await apiClient(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save milestone');

      toast.success(editingMilestone ? 'Milestone updated' : 'Milestone added');
      setIsAddDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (milestoneId: string) => {
    setMilestoneToDelete(milestoneId);
  };

  const confirmDelete = async () => {
    if (!milestoneToDelete) return;

    try {
      const res = await apiClient(`/innovations/${innovationId}/milestones/${milestoneToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Milestone deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete milestone');
    } finally {
      setMilestoneToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          Project Milestones
        </h2>
        {canManage && (
          <Button onClick={handleOpenAdd} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {milestones && milestones.length > 0 ? (
          milestones.map((milestone) => (
            <div 
              key={milestone.id} 
              className="flex items-start justify-between p-4 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900">{milestone.title}</h3>
                  <Badge variant="outline" className={getStatusColor(milestone.status)}>
                    {milestone.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {milestone.description && (
                  <p className="text-sm text-slate-600">{milestone.description}</p>
                )}
                {milestone.due_date && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    Due: {format(new Date(milestone.due_date), 'PPP')}
                  </div>
                )}
              </div>

              {canManage && (
                <div className="flex gap-1 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(milestone)}>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(milestone.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
            <p>No milestones defined yet.</p>
            {canManage && (
              <Button variant="ghost" onClick={handleOpenAdd} className="mt-2 text-blue-600 hover:text-blue-700">
                Create the first milestone
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMilestone ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
            <DialogDescription>
              Define a key step in your project timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., MVP Prototype"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what needs to be achieved..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingMilestone ? 'Save Changes' : 'Add Milestone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!milestoneToDelete} onOpenChange={(open) => !open && setMilestoneToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Milestone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this milestone? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMilestoneToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
