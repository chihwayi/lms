import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Edit2, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

export interface Innovation {
  id: string;
  title: string;
  problem_statement: string;
  solution_description: string;
  budget_estimate: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  created_at: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface InnovationCardProps {
  innovation: Innovation;
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
  isOwner?: boolean;
}

export function InnovationCard({ innovation, onDelete, onSubmit, isOwner }: InnovationCardProps) {
  const statusColors = {
    draft: "bg-gray-500",
    submitted: "bg-blue-500",
    under_review: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Badge className={`${statusColors[innovation.status]} text-white mb-2`}>
            {innovation.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <h3 className="text-xl font-bold line-clamp-1">{innovation.title}</h3>
          <p className="text-sm text-gray-500">
            Created {format(new Date(innovation.created_at), 'MMM d, yyyy')}
          </p>
        </div>
        {innovation.budget_estimate && (
          <div className="text-right">
            <span className="text-sm text-gray-500">Budget</span>
            <p className="font-bold text-green-600">
              ${Number(innovation.budget_estimate).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="mb-6 space-y-2">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Problem</span>
          <p className="text-gray-600 line-clamp-2 text-sm">{innovation.problem_statement}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase">Solution</span>
          <p className="text-gray-600 line-clamp-2 text-sm">{innovation.solution_description}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        {isOwner && (innovation.status === 'draft' || innovation.status === 'rejected') && (
          <>
             <Link href={`/innovations/${innovation.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            {onSubmit && (
              <Button 
                variant="default" 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => onSubmit(innovation.id)}
              >
                Submit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(innovation.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </>
        )}
        <Link href={`/innovations/${innovation.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
