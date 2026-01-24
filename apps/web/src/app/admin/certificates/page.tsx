'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await apiClient('/certificates/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-2">Manage certificate templates for your courses.</p>
        </div>
        <Button onClick={() => router.push('/admin/certificates/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-10 border rounded-lg bg-slate-50">
              <p className="text-muted-foreground">No templates found. Create your first one!</p>
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="h-40 bg-slate-100 relative">
                   {/* Thumbnail preview would go here */}
                   <img 
                     src={template.background_url} 
                     alt={template.name}
                     className="w-full h-full object-cover"
                   />
                </div>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Edit (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
