'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface QuizData {
  title: string;
  description?: string;
  questions: Question[];
  passingScore?: number; // Percentage, default 70
}

interface QuizRunnerProps {
  data: QuizData;
  onComplete: (score: number, passed: boolean) => void;
}

export function QuizRunner({ data, onComplete }: QuizRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = data.questions[currentQuestionIndex];
  const totalQuestions = data.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const calculateResults = () => {
    let correctCount = 0;
    data.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionId) {
        correctCount++;
      }
    });

    const calculatedScore = (correctCount / totalQuestions) * 100;
    setScore(calculatedScore);
    setShowResults(true);
    
    const passed = calculatedScore >= (data.passingScore || 70);
    onComplete(calculatedScore, passed);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const passed = score >= (data.passingScore || 70);
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8">
            {passed ? (
              <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
            ) : (
              <XCircle className="w-24 h-24 text-red-500 mb-4" />
            )}
            <h3 className="text-3xl font-bold">{Math.round(score)}%</h3>
            <p className="text-gray-500 mt-2">
              {passed ? 'Congratulations! You passed.' : 'Keep studying and try again.'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">Review</h4>
            {data.questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOptionId;
                const correctOption = q.options.find(o => o.id === q.correctOptionId);
                const userOption = q.options.find(o => o.id === userAnswer);

                return (
                    <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                            <span className="font-mono text-sm bg-white border px-2 py-1 rounded">{index + 1}</span>
                            <div className="flex-1">
                                <p className="font-medium mb-2">{q.text}</p>
                                <div className="text-sm space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Your answer:</span>
                                        <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                            {userOption?.text || 'Skipped'}
                                        </span>
                                        {isCorrect ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                    </div>
                                    {!isCorrect && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Correct answer:</span>
                                            <span className="text-green-700 font-medium">{correctOption?.text}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleRetry} variant="outline">Retry Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">ID: {currentQuestion.id}</span>
        </div>
        <CardTitle>{currentQuestion.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
            value={answers[currentQuestion.id] || ''} 
            onValueChange={handleAnswer}
            className="space-y-4"
        >
            {currentQuestion.options.map((option) => (
                <div key={option.id} className={`flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${answers[currentQuestion.id] === option.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                </div>
            ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
        >
            Previous
        </Button>
        <Button 
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
        >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </CardFooter>
    </Card>
  );
}
