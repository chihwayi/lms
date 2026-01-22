'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle, Circle, Save, X } from 'lucide-react';
import { QuizData, Question } from './QuizRunner';
import { toast } from 'sonner';

interface QuizBuilderProps {
  initialData?: QuizData | null;
  onSave: (data: QuizData) => void;
  onCancel: () => void;
}

export function QuizBuilder({ initialData, onSave, onCancel }: QuizBuilderProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      options: [
        { id: crypto.randomUUID(), text: '' },
        { id: crypto.randomUUID(), text: '' },
      ],
      correctOptionId: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({
      id: crypto.randomUUID(),
      text: '',
    });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    
    // If we removed the correct answer, reset it
    const question = newQuestions[questionIndex];
    if (!question.options.find(o => o.id === question.correctOptionId)) {
        question.correctOptionId = '';
    }
    
    setQuestions(newQuestions);
  };

  const updateOptionText = (questionIndex: number, optionIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = text;
    setQuestions(newQuestions);
  };

  const setCorrectOption = (questionIndex: number, optionId: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctOptionId = optionId;
    setQuestions(newQuestions);
  };

  const handleSave = () => {
    // Validation
    if (!title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) {
            toast.error(`Question ${i + 1} text is required`);
            return;
        }
        if (q.options.length < 2) {
            toast.error(`Question ${i + 1} must have at least 2 options`);
            return;
        }
        if (!q.correctOptionId) {
            toast.error(`Select a correct answer for Question ${i + 1}`);
            return;
        }
        for (const opt of q.options) {
            if (!opt.text.trim()) {
                toast.error(`All options in Question ${i + 1} must have text`);
                return;
            }
        }
    }

    onSave({
      title,
      description,
      passingScore,
      questions,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Quiz Builder</h2>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" /> Save Quiz
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Final Assessment"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Brief description of what this quiz covers..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Passing Score (%)</Label>
            <Input 
                id="score" 
                type="number" 
                min="0" 
                max="100" 
                value={passingScore} 
                onChange={(e) => setPassingScore(Number(e.target.value))} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={question.id} className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                onClick={() => removeQuestion(qIndex)}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-base pr-8">Question {qIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Input 
                        value={question.text} 
                        onChange={(e) => updateQuestionText(qIndex, e.target.value)} 
                        placeholder="Enter your question here..."
                    />
                </div>
                
                <div className="space-y-3">
                    <Label>Options</Label>
                    {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center gap-3">
                            <button
                                type="button" 
                                onClick={() => setCorrectOption(qIndex, option.id)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                                    question.correctOptionId === option.id 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-gray-300 hover:border-green-400'
                                }`}
                                title="Mark as correct answer"
                            >
                                {question.correctOptionId === option.id && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <Input 
                                value={option.text}
                                onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className={`flex-1 ${question.correctOptionId === option.id ? 'border-green-500 ring-green-500' : ''}`}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(qIndex, oIndex)}
                                disabled={question.options.length <= 2}
                                className="flex-shrink-0"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addOption(qIndex)}
                        className="mt-2 w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Option
                    </Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addQuestion} className="w-full py-8 border-dashed border-2" variant="outline">
        <Plus className="w-6 h-6 mr-2" /> Add Question
      </Button>
    </div>
  );
}
