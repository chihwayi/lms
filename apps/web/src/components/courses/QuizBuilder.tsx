'use client';

import { useState } from 'react';
import { generateUUID } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle, Circle, Save, X } from 'lucide-react';
import { QuizData, Question } from './QuizRunner';
import { toast } from 'sonner';
import { AiQuizGenerator } from '../ai/AiQuizGenerator';

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
      id: generateUUID(),
      text: '',
      options: [
        { id: generateUUID(), text: '' },
        { id: generateUUID(), text: '' },
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
      id: generateUUID(),
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

  const handleAiGenerate = (newQuestions: Question[]) => {
    setQuestions([...questions, ...newQuestions]);
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
      if (!questions[i].text.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (questions[i].options.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      if (!questions[i].correctOptionId) {
        toast.error(`Select a correct answer for question ${i + 1}`);
        return;
      }
      for (const option of questions[i].options) {
        if (!option.text.trim()) {
          toast.error(`An option in question ${i + 1} is empty`);
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
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quiz Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Algebra Fundamentals Quiz"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Brief description of what this quiz covers..."
            />
          </div>
          <div className="space-y-2">
            <Label>Passing Score (%)</Label>
            <Input 
              type="number" 
              min="0" 
              max="100" 
              value={passingScore} 
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Questions</h3>
        <div className="flex gap-2">
          <AiQuizGenerator onGenerate={handleAiGenerate} />
          <Button onClick={addQuestion} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Question {qIndex + 1}</Label>
                  <Textarea 
                    value={question.text} 
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    placeholder="Enter your question here..."
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="pl-4 space-y-2 border-l-2">
                <Label>Options</Label>
                {question.options.map((option, oIndex) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <button
                      onClick={() => setCorrectOption(qIndex, option.id)}
                      className="focus:outline-none"
                    >
                      {question.correctOptionId === option.id ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                    <Input 
                      value={option.text} 
                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className={question.correctOptionId === option.id ? "border-green-500" : ""}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeOption(qIndex, oIndex)}
                      disabled={question.options.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => addOption(qIndex)}
                  className="mt-2"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Option
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Quiz
        </Button>
      </div>
    </div>
  );
}
