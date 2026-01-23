'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { apiClient } from '@/lib/api-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from "sonner";

export default function InnovationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    problem_statement: '',
    solution_description: '',
    budget_estimate: '',
  });

  const steps = [
    { number: 1, title: "The Problem" },
    { number: 2, title: "The Solution" },
    { number: 3, title: "Review" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      return formData.title.length >= 5 && formData.problem_statement.length >= 20;
    }
    if (currentStep === 2) {
      return formData.solution_description.length >= 20;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient('/innovations', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          budget_estimate: formData.budget_estimate ? parseFloat(formData.budget_estimate) : undefined
        })
      });

      if (res.ok) {
        toast.success('Innovation created successfully!');
        router.push('/innovations');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to create innovation');
      }
    } catch (error) {
      console.error('Error creating innovation:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2" />
        {steps.map((s) => (
          <div key={s.number} className="flex flex-col items-center bg-white px-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors
              ${step >= s.number ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
            `}>
              {step > s.number ? <CheckCircle2 className="w-6 h-6" /> : s.number}
            </div>
            <span className={`text-sm font-medium ${step >= s.number ? 'text-blue-600' : 'text-slate-500'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-8 shadow-xl border-slate-200">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Define the Problem</h2>
              <p className="text-slate-500">Every great innovation starts with a clear problem statement.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Solar-Powered Water Purifier"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="problem_statement">Problem Statement</Label>
                <Textarea
                  id="problem_statement"
                  name="problem_statement"
                  placeholder="Describe the problem you are solving in detail..."
                  className="h-32"
                  value={formData.problem_statement}
                  onChange={handleInputChange}
                  required
                  minLength={20}
                />
                <p className="text-xs text-slate-500 text-right">
                  {formData.problem_statement.length}/20 characters minimum
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Propose Your Solution</h2>
              <p className="text-slate-500">How will you solve the problem? Be specific.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="solution_description">Solution Description</Label>
                <Textarea
                  id="solution_description"
                  name="solution_description"
                  placeholder="Explain your innovative solution..."
                  className="h-48"
                  value={formData.solution_description}
                  onChange={handleInputChange}
                  required
                  minLength={20}
                />
                <p className="text-xs text-slate-500 text-right">
                  {formData.solution_description.length}/20 characters minimum
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_estimate">Estimated Budget ($)</Label>
                <Input
                  id="budget_estimate"
                  name="budget_estimate"
                  type="number"
                  placeholder="0.00"
                  value={formData.budget_estimate}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-slate-500">
                  Rough estimate of funds needed to build a prototype.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
              <p className="text-slate-500">Review your proposal before submitting.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-lg space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Title</h4>
                <p className="font-medium text-lg">{formData.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Problem</h4>
                <p className="text-slate-700">{formData.problem_statement}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Solution</h4>
                <p className="text-slate-700">{formData.solution_description}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Budget</h4>
                <p className="font-medium text-green-600">
                  {formData.budget_estimate ? `$${Number(formData.budget_estimate).toLocaleString()}` : 'No budget specified'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={step === 1 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} disabled={!validateStep(step)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
