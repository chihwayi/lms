'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuthStore } from '@/lib/auth-store';
import { ReviewForm } from './ReviewForm';
import { MilestoneList } from './MilestoneList';
import { TeamList } from './TeamList';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InnovationDetailProps {
  id: string;
}

import { apiClient } from '@/lib/api-client';

export default function InnovationDetail({ id }: InnovationDetailProps) {
  const [innovation, setInnovation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  const fetchInnovation = async () => {
    try {
      if (!accessToken) return;

      const res = await apiClient(`innovations/${id}`);

      if (res.ok) {
        const data = await res.json();
        setInnovation(data);
        if (data.budget_estimate) {
          setAllocatedBudget(data.budget_estimate.toString());
        }
      } else {
        toast.error('Failed to load innovation');
        router.push('/innovations');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchInnovation();
    }
  }, [id, accessToken]);

  const handleDecision = async (status: 'approved' | 'rejected') => {
    try {
      const body: any = { status: status === 'approved' ? 'approved' : 'rejected' };
      
      if (status === 'approved' && allocatedBudget) {
        body.allocated_budget = parseFloat(allocatedBudget);
      }

      const res = await apiClient(`innovations/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(`Innovation ${status} successfully`);
        fetchInnovation();
        setShowApprovalForm(false);
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${status} innovation`);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!innovation) return null;

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'educator';
  const canReview = isInstructorOrAdmin && innovation.status === 'submitted';
  const isOwner = user?.id === innovation.student?.id;
  const canManageMilestones = isOwner || isInstructorOrAdmin;

  // Build comment tree from flat list to support infinite nesting
  const buildCommentTree = (comments: any[]) => {
    const commentMap = new Map();
    // Deep clone to avoid mutating state directly if needed, though here we just process the array
    // Initialize map and children arrays
    const processedComments = comments.map(c => ({ ...c, children: [] }));
    
    processedComments.forEach(c => {
      commentMap.set(c.id, c);
    });

    const roots: any[] = [];

    processedComments.forEach(c => {
      if (c.parent_id && commentMap.has(c.parent_id)) {
        commentMap.get(c.parent_id).children.push(c);
      } else if (!c.parent_id) {
        roots.push(c);
      }
    });

    return roots;
  };

  const rootComments = innovation.comments ? buildCommentTree(innovation.comments) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/innovations" className="inline-flex items-center text-slate-500 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Innovations
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{innovation.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span>By {innovation.student?.firstName} {innovation.student?.lastName}</span>
            <span>•</span>
            <span>{new Date(innovation.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge className={`text-lg px-4 py-1 ${
          innovation.status === 'approved' ? 'bg-green-500' :
          innovation.status === 'rejected' ? 'bg-red-500' :
          innovation.status === 'submitted' ? 'bg-blue-500' :
          'bg-gray-500'
        }`}>
          {innovation.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Problem Statement</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{innovation.problem_statement}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Proposed Solution</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{innovation.solution_description}</p>
          </Card>

          <MilestoneList 
            innovationId={id}
            milestones={innovation.milestones || []}
            canManage={canManageMilestones}
            onUpdate={fetchInnovation}
          />

          <TeamList 
            innovationId={id}
            members={innovation.members || []}
            ownerId={innovation.student?.id}
            isOwner={canManageMilestones}
            onUpdate={fetchInnovation}
          />

          <CommentSection 
            innovationId={id}
            comments={rootComments}
            onUpdate={fetchInnovation}
          />

          {innovation.reviews && innovation.reviews.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                {innovation.reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{review.reviewer?.firstName}</span>
                      <Badge variant="outline">Score: {review.score}/100</Badge>
                    </div>
                    <p className="text-slate-600">{review.comments}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-500 mb-2 uppercase text-xs">Budget Estimate</h3>
            <p className="text-2xl font-bold text-slate-700">
              ${Number(innovation.budget_estimate || 0).toLocaleString()}
            </p>
            {innovation.allocated_budget && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-slate-500 mb-2 uppercase text-xs">Allocated Funding</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${Number(innovation.allocated_budget).toLocaleString()}
                </p>
              </div>
            )}
          </Card>

          {canReview && (
            <>
              <ReviewForm innovationId={id} onReviewSubmitted={fetchInnovation} />
              
              <div className="flex flex-col gap-2 pt-4 border-t">
                {!showApprovalForm ? (
                  <>
                    <Button 
                      onClick={() => setShowApprovalForm(true)}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Innovation
                    </Button>
                    <Button 
                      onClick={() => setShowRejectionDialog(true)}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Innovation
                    </Button>
                  </>
                ) : (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Approve & Fund</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="allocatedBudget">Allocated Budget ($)</Label>
                        <Input
                          id="allocatedBudget"
                          type="number"
                          value={allocatedBudget}
                          onChange={(e) => setAllocatedBudget(e.target.value)}
                          placeholder="Enter amount..."
                          className="bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDecision('approved')}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          Confirm
                        </Button>
                        <Button 
                          onClick={() => setShowApprovalForm(false)}
                          variant="outline"
                          className="bg-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Innovation</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this innovation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                handleDecision('rejected');
                setShowRejectionDialog(false);
              }}
            >
              Reject Innovation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
