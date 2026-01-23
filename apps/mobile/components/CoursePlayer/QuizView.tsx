import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation?: string;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

interface Props {
  data: QuizData;
  onComplete: (score: number, passed: boolean) => void;
}

export function QuizView({ data, onComplete }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = data.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === data.questions.length - 1;

  const handleSelectOption = (optionId: string) => {
    if (showResult || completed) return;
    setSelectedOption(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    // Record answer
    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);
    
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      calculateFinalScore();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const calculateFinalScore = () => {
    let correctCount = 0;
    data.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / data.questions.length) * 100);
    setScore(finalScore);
    setCompleted(true);
    
    const passed = finalScore >= (data.passingScore || 70);
    onComplete(finalScore, passed);
  };

  if (completed) {
    const passed = score >= (data.passingScore || 70);
    return (
      <View style={styles.resultContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
        <Text style={styles.resultTitle}>
          {passed ? 'Quiz Passed!' : 'Quiz Failed'}
        </Text>
        <Text style={styles.resultSubtitle}>
          You answered {Math.round((score / 100) * data.questions.length)} out of {data.questions.length} questions correctly.
        </Text>
        
        {!passed && (
            <TouchableOpacity 
                style={[styles.button, styles.retryButton]}
                onPress={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setShowResult(false);
                    setAnswers({});
                    setScore(0);
                    setCompleted(false);
                }}
            >
                <Text style={styles.retryButtonText}>Retry Quiz</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {data.questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / data.questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <Text style={styles.questionText}>{currentQuestion.text}</Text>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === currentQuestion.correctOptionId;
          const showCorrectness = showResult && (isSelected || isCorrect);
          
          let optionStyle = styles.option;
          if (isSelected) optionStyle = { ...optionStyle, ...styles.optionSelected };
          if (showResult && isCorrect) optionStyle = { ...optionStyle, ...styles.optionCorrect };
          if (showResult && isSelected && !isCorrect) optionStyle = { ...optionStyle, ...styles.optionWrong };

          return (
            <TouchableOpacity
              key={option.id}
              style={optionStyle}
              onPress={() => handleSelectOption(option.id)}
              disabled={showResult}
            >
              <View style={styles.optionContent}>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </View>
              
              {showResult && isCorrect && <Feather name="check-circle" size={20} color="#059669" />}
              {showResult && isSelected && !isCorrect && <Feather name="x-circle" size={20} color="#EF4444" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {showResult && currentQuestion.explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
        </View>
      )}

      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.button, !selectedOption && styles.buttonDisabled]}
            onPress={handleCheckAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.buttonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </Text>
            <Feather name="arrow-right" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionCorrect: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  explanationBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  explanationTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  explanationText: {
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#2563EB',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  retryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  }
});
