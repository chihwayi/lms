import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface SubmissionDetailsModalProps {
  submissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionDetailsModal({ submissionId, isOpen, onClose }: SubmissionDetailsModalProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submissionId && isOpen) {
      fetchSubmission();
    } else {
      setSubmission(null);
    }
  }, [submissionId, isOpen]);

  const fetchSubmission = async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const res = await apiClient(`/lesson-submissions/${submissionId}`);
      if (res.ok) {
        setSubmission(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInteractiveDetails = () => {
    if (!submission || !submission.lesson?.content_data) return null;

    const { items, targets } = submission.lesson.content_data;
    const { assignments } = submission.submission_data || {};

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Items */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-center">Items</h4>
            {items.map((item: any) => (
              <div
                key={item.id}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center min-h-[60px]"
              >
                <span className="font-medium">{item.content}</span>
              </div>
            ))}
          </div>

          {/* Right Column: Targets & Student Answers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 text-center">Student Matches</h4>
            {targets.map((target: any) => {
              const assignedItemId = assignments?.[target.id];
              const assignedItem = items.find((i: any) => i.id === assignedItemId);
              const isCorrect = assignedItemId === target.acceptsId;

              return (
                <div key={target.id} className="relative">
                  <div
                    className={`p-4 border-2 rounded-lg flex items-center justify-between min-h-[60px] ${
                      isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Target: {target.content || 'Box'}
                      </div>
                      <div className="font-medium text-gray-900">
                        {assignedItem ? assignedItem.content : <span className="text-gray-400 italic">No match</span>}
                      </div>
                    </div>
                    
                    {assignedItem && (
                      <div className="ml-3">
                        {isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!isCorrect && assignedItem && (
                     <div className="text-xs text-red-500 mt-1 ml-1">
                        Correct match: {items.find((i: any) => i.id === target.acceptsId)?.content}
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : submission ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{submission.lesson?.title}</h3>
                <p className="text-sm text-gray-500">
                  Student: {submission.student?.firstName} {submission.student?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(submission.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Badge className={submission.grade >= 80 ? 'bg-green-500' : 'bg-amber-500'}>
                  Score: {submission.grade}%
                </Badge>
              </div>
            </div>

            {/* Content Renderer */}
            {submission.submission_type === 'interactive' ? (
              renderInteractiveDetails()
            ) : (
              <p className="text-gray-500 italic">
                Visualization for {submission.submission_type} not implemented yet.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Failed to load details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
