import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Colors, Spacing, Shadows, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

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
            <Button 
                variant="outline"
                title="Retry Quiz"
                fullWidth
                onPress={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setShowResult(false);
                    setAnswers({});
                    setScore(0);
                    setCompleted(false);
                }}
            />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          
          let optionStyle: any = styles.option;
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
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.text}</Text>
              </View>
              
              {showResult && isCorrect && <Feather name="check-circle" size={20} color={Colors.light.success} />}
              {showResult && isSelected && !isCorrect && <Feather name="x-circle" size={20} color={Colors.light.destructive} />}
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
          <Button
            title="Check Answer"
            onPress={handleCheckAnswer}
            disabled={!selectedOption}
            fullWidth
          />
        ) : (
          <Button
            title={isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            onPress={handleNext}
            icon={<Feather name="arrow-right" size={20} color="white" />}
            fullWidth
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  resultContainer: {
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 4,
    borderColor: Colors.light.primary,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  resultSubtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.secondary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.xl,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
  },
  option: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  optionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.secondary,
  },
  optionCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: Colors.light.destructive,
    backgroundColor: '#FEF2F2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: Spacing.md,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  explanationBox: {
    backgroundColor: Colors.light.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  explanationTitle: {
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  explanationText: {
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: Spacing.md,
  },
});
