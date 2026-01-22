import { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { MessageSquare, Reply, Trash2 } from 'lucide-react';
import { InnovationComment } from './InnovationCard';
import { useAuthStore } from '@/lib/auth-store';

interface CommentSectionProps {
  innovationId: string;
  comments: InnovationComment[];
  onUpdate: () => void;
}

export function CommentSection({ innovationId, comments, onUpdate }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (parentId?: string, content?: string) => {
    const text = content || newComment;
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/innovations/${innovationId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text,
          parentId,
        }),
      });

      if (!res.ok) throw new Error('Failed to post comment');

      toast.success('Comment posted');
      setNewComment('');
      setReplyingTo(null);
      onUpdate();
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/innovations/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete comment');

      toast.success('Comment deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: InnovationComment; depth?: number }) => {
    const [replyText, setReplyText] = useState('');
    const isReplying = replyingTo === comment.id;
    const canDelete = user?.id === comment.user.id || user?.role === 'admin' || user?.role === 'instructor';

    return (
      <div className={`flex gap-4 ${depth > 0 ? 'ml-12 mt-4' : 'mt-6'}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>{comment.user.firstName[0]}{comment.user.lastName[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {comment.user.firstName} {comment.user.lastName}
                </span>
                <span className="text-xs text-slate-500">
                  {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {canDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-slate-400 hover:text-red-500"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 h-auto p-0 hover:bg-transparent hover:text-blue-600"
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>

          {isReplying && (
            <div className="mt-4 flex gap-3">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px]"
              />
              <div className="flex flex-col gap-2">
                <Button 
                  size="sm"
                  onClick={() => handleSubmit(comment.id, replyText)}
                  disabled={submitting || !replyText.trim()}
                >
                  Reply
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {comment.children?.map((child) => (
            <CommentItem key={child.id} comment={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-semibold">Discussion</h3>
        <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      <div className="flex gap-4 mb-8">
        <Avatar>
          <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 gap-2 flex flex-col items-end">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px]"
          />
          <Button 
            onClick={() => handleSubmit()}
            disabled={submitting || !newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
