'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ChevronLeft, Trophy, AlertTriangle, ArrowRight } from 'lucide-react';

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
  onComplete: (score: number, passed: boolean, answers: Record<string, string>) => void;
}

export function QuizRunner({ data, onComplete }: QuizRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = data.questions[currentQuestionIndex];
  const totalQuestions = data.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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
    onComplete(calculatedScore, passed, answers);
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
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
        <div className={`text-center p-8 rounded-3xl border shadow-xl backdrop-blur-sm ${
          passed 
            ? 'bg-green-50/80 border-green-200' 
            : 'bg-red-50/80 border-red-200'
        }`}>
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${
             passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {passed ? <Trophy className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
          </div>
          
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {passed ? 'Assessment Passed!' : 'Assessment Failed'}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {passed 
              ? 'Great job! You have mastered this material.' 
              : 'Don\'t give up! Review the material and try again.'}
          </p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{Math.round(score)}%</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Score</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{data.passingScore || 70}%</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Required</div>
            </div>
          </div>

          <Button 
            onClick={handleRetry} 
            size="lg"
            className={`px-8 rounded-xl font-bold shadow-lg transition-all hover:scale-105 ${
              passed 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
          >
            {passed ? 'Review Answers' : 'Try Again'}
          </Button>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center text-lg">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-bold">i</span>
            Detailed Review
          </h4>
          <div className="space-y-4">
            {data.questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOptionId;
                const correctOption = q.options.find(o => o.id === q.correctOptionId);
                const userOption = q.options.find(o => o.id === userAnswer);

                return (
                    <div key={q.id} className={`p-5 rounded-xl border transition-all ${
                      isCorrect 
                        ? 'bg-green-50/50 border-green-100 hover:border-green-200' 
                        : 'bg-red-50/50 border-red-100 hover:border-red-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-3 text-lg">{q.text}</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 w-20">Your Answer</span>
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                {userOption?.text || 'Skipped'}
                                            </span>
                                            {isCorrect ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    </div>
                                    {!isCorrect && (
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50/50">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 w-20">Correct</span>
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
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% completed</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300">
        <div className="p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <div 
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50/50 shadow-md scale-[1.02]' 
                      : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 group-hover:border-purple-400'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-lg font-medium transition-colors ${
                    isSelected ? 'text-purple-900' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {option.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50/80 p-6 flex justify-between items-center border-t border-gray-100">
          <Button 
            variant="ghost" 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Previous
          </Button>

          <Button 
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className={`px-8 py-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
              !answers[currentQuestion.id]
                ? 'bg-gray-200 text-gray-400 shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 hover:shadow-xl'
            }`}
          >
            {isLastQuestion ? (
              <span className="flex items-center">Finish Quiz <CheckCircle className="ml-2 w-5 h-5" /></span>
            ) : (
              <span className="flex items-center">Next Question <ArrowRight className="ml-2 w-5 h-5" /></span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
