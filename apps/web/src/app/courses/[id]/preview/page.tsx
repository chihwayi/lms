'use client';

import { CoursePreview } from '@/components/courses/CoursePreview';

export default function CoursePreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <CoursePreview courseId={params.id} />
      </div>
    </div>
  );
}