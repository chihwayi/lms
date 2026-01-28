import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface InteractiveItem {
  id: string;
  content: string;
  type: 'text' | 'image';
}

interface InteractiveTarget {
  id: string;
  content: string; // usually placeholder text
  acceptsId: string; // the correct item ID
}

interface InteractiveData {
  items: InteractiveItem[];
  targets: InteractiveTarget[];
}

interface InteractiveActivityProps {
  data: InteractiveData;
  onComplete?: (results: any) => void;
}

export function InteractiveActivity({ data, onComplete }: InteractiveActivityProps) {
  const [items, setItems] = useState<InteractiveItem[]>([]);
  const [targets, setTargets] = useState<InteractiveTarget[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // targetId -> itemId
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (data) {
      // Shuffle items for the left side
      const shuffledItems = [...data.items].sort(() => Math.random() - 0.5);
      setItems(shuffledItems);
      setTargets(data.targets);
      setAssignments({});
      setChecked(false);
      setSelectedItemId(null);
      setScore(0);
    }
  }, [data]);

  const handleItemPress = (itemId: string) => {
    if (checked) return;
    
    // If tapping the already selected item, deselect it
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      return;
    }

    // If this item is already assigned to a target, unassign it first
    const targetIdWithItem = Object.keys(assignments).find(
      (tid) => assignments[tid] === itemId
    );
    if (targetIdWithItem) {
      const newAssignments = { ...assignments };
      delete newAssignments[targetIdWithItem];
      setAssignments(newAssignments);
    }

    setSelectedItemId(itemId);
    Haptics.selectionAsync();
  };

  const handleTargetPress = (targetId: string) => {
    if (checked) return;

    if (selectedItemId) {
      // Assign selected item to this target
      setAssignments((prev) => ({
        ...prev,
        [targetId]: selectedItemId,
      }));
      setSelectedItemId(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (assignments[targetId]) {
      // If no item selected, but target has an item, select that item (move it)
      setSelectedItemId(assignments[targetId]);
      const newAssignments = { ...assignments };
      delete newAssignments[targetId];
      setAssignments(newAssignments);
      Haptics.selectionAsync();
    }
  };

  const checkAnswers = () => {
    let correctCount = 0;
    targets.forEach((t) => {
      if (assignments[t.id] === t.acceptsId) {
        correctCount++;
      }
    });

    const total = targets.length;
    const finalScore = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = correctCount === total;
    
    setScore(finalScore);
    setChecked(true);
    Haptics.notificationAsync(
      passed
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );

    if (onComplete) {
      onComplete({
        score: finalScore,
        assignments,
        passed,
        correctCount,
        total,
      });
    }
  };

  const reset = () => {
    setAssignments({});
    setChecked(false);
    setSelectedItemId(null);
    setScore(0);
    // Re-shuffle
    setItems([...items].sort(() => Math.random() - 0.5));
  };

  // Helper to find which target an item is assigned to
  const isAssigned = (itemId: string) => {
    return Object.values(assignments).includes(itemId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Tap an item on the left, then tap a matching box on the right.
      </Text>

      <View style={styles.gameArea}>
        {/* Left Column: Items */}
        <View style={styles.column}>
          {items.map((item) => {
            const assigned = isAssigned(item.id);
            // Don't show if assigned (it "moves" to the target)
            if (assigned) return <View key={item.id} style={styles.placeholderItem} />;

            const isSelected = selectedItemId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => handleItemPress(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                  {item.content}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Column: Targets */}
        <View style={styles.column}>
          {targets.map((target) => {
            const assignedItemId = assignments[target.id];
            const assignedItem = items.find((i) => i.id === assignedItemId);
            
            let statusStyle = {};
            let statusIcon = null;

            if (checked) {
              const isCorrect = assignedItemId === target.acceptsId;
              statusStyle = isCorrect ? styles.targetCorrect : styles.targetIncorrect;
              statusIcon = isCorrect ? (
                <Feather name="check-circle" size={16} color="white" style={styles.statusIcon} />
              ) : (
                <Feather name="x-circle" size={16} color="white" style={styles.statusIcon} />
              );
            }

            return (
              <TouchableOpacity
                key={target.id}
                style={[
                  styles.targetZone,
                  assignedItem && styles.targetZoneFilled,
                  statusStyle,
                ]}
                onPress={() => handleTargetPress(target.id)}
                activeOpacity={0.8}
              >
                {assignedItem ? (
                  <>
                    <Text style={[
                        styles.cardText, 
                        checked && (assignedItemId === target.acceptsId ? { color: 'white' } : { color: 'white' })
                    ]}>
                      {assignedItem.content}
                    </Text>
                    {statusIcon}
                  </>
                ) : (
                  <Text style={styles.placeholderText}>{target.content || 'Drop here'}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        {!checked ? (
          <TouchableOpacity 
            style={[styles.button, Object.keys(assignments).length === 0 && styles.buttonDisabled]} 
            onPress={checkAnswers}
            disabled={Object.keys(assignments).length === 0}
          >
            <Text style={styles.buttonText}>Check Answers</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Score: {score}%</Text>
              {score === 100 ? (
                <Text style={styles.feedbackText}>Perfect! 🎉</Text>
              ) : (
                <Text style={styles.feedbackText}>Keep trying!</Text>
              )}
            </View>
            <TouchableOpacity style={styles.outlineButton} onPress={reset}>
              <Text style={styles.outlineButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    marginVertical: Spacing.sm,
  },
  instructions: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  gameArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  column: {
    flex: 1,
    gap: Spacing.md,
  },
  placeholderItem: {
    height: 60,
  },
  card: {
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  cardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EEF2FF', // Indigo 50
    transform: [{ scale: 1.02 }],
  },
  cardText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: Colors.light.primary,
  },
  targetZone: {
    backgroundColor: Colors.light.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetZoneFilled: {
    backgroundColor: 'white',
    borderStyle: 'solid',
    ...Shadows.sm,
  },
  targetCorrect: {
    backgroundColor: '#10B981', // Emerald 500
    borderColor: '#10B981',
  },
  targetIncorrect: {
    backgroundColor: '#EF4444', // Red 500
    borderColor: '#EF4444',
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  statusIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  outlineButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    minWidth: 160,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  feedbackText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
