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
    <div className="space-y-8 p-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">📝</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">Quiz Builder</h2>
            <p className="text-gray-500 text-sm">Create an engaging assessment for your students</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Save className="w-4 h-4 mr-2" /> Save Quiz
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Quiz Details Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-bold">1</span>
            Quiz Details
          </h3>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 font-medium">Quiz Title</Label>
              <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Module 1 Final Assessment"
                  className="bg-white/80 border-gray-200 focus:ring-purple-500 focus:border-purple-500 h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
              <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe what students will be tested on..."
                  className="bg-white/80 border-gray-200 focus:ring-purple-500 focus:border-purple-500 min-h-[100px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score" className="text-gray-700 font-medium">Passing Score (%)</Label>
              <div className="relative max-w-[200px]">
                <Input 
                    id="score" 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={passingScore} 
                    onChange={(e) => setPassingScore(Number(e.target.value))} 
                    className="bg-white/80 border-gray-200 focus:ring-purple-500 focus:border-purple-500 h-12 pl-4 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Questions ({questions.length})
            </h3>
            <AiQuizGenerator onGenerate={handleAiGenerate} />
          </div>
          
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div 
                key={question.id} 
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 p-6"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                      onClick={() => removeQuestion(qIndex)}
                  >
                      <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Question {qIndex + 1}</span>
                    {questions.length > 1 && (
                      <span className="h-px flex-1 bg-gray-100"></span>
                    )}
                  </div>
                  <Input 
                      value={question.text} 
                      onChange={(e) => updateQuestionText(qIndex, e.target.value)} 
                      placeholder="Enter your question here..."
                      className="border-0 border-b border-gray-200 rounded-none px-0 text-lg font-medium focus:ring-0 focus:border-purple-500 bg-transparent placeholder:text-gray-300"
                  />
                </div>
                
                <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Answer Options</Label>
                    <div className="grid gap-3">
                      {question.options.map((option, oIndex) => (
                          <div 
                            key={option.id} 
                            className={`flex items-center gap-3 p-2 rounded-xl border transition-all duration-200 ${
                              question.correctOptionId === option.id 
                                ? 'bg-green-50/50 border-green-200 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-gray-50'
                            }`}
                          >
                              <button
                                  type="button" 
                                  onClick={() => setCorrectOption(qIndex, option.id)}
                                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                      question.correctOptionId === option.id 
                                          ? 'bg-green-500 border-green-500 text-white scale-110 shadow-md' 
                                          : 'border-gray-300 text-transparent hover:border-green-400'
                                  }`}
                                  title="Mark as correct answer"
                              >
                                  <CheckCircle className="w-5 h-5" />
                              </button>
                              <Input 
                                  value={option.text}
                                  onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                  placeholder={`Option ${oIndex + 1}`}
                                  className={`flex-1 bg-transparent border-0 focus:ring-0 focus:bg-white/50 rounded-lg px-3 transition-colors ${
                                    question.correctOptionId === option.id 
                                      ? 'text-green-800 placeholder:text-green-800/40 font-medium' 
                                      : ''
                                  }`}
                              />
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  disabled={question.options.length <= 2}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                              >
                                  <X className="w-4 h-4" />
                              </Button>
                          </div>
                      ))}
                    </div>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => addOption(qIndex)}
                        className="mt-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Another Option
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={addQuestion} 
          className="w-full py-12 border-2 border-dashed border-gray-200 hover:border-purple-300 bg-gray-50/50 hover:bg-purple-50/50 text-gray-500 hover:text-purple-600 rounded-2xl transition-all duration-300 group" 
          variant="ghost"
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-3 text-gray-400 group-hover:text-purple-500">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-lg">Add New Question</span>
            <span className="text-sm font-normal mt-1 opacity-70">Multiple choice question</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
