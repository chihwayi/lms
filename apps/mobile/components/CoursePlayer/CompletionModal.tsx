import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';

interface CompletionModalProps {
  visible: boolean;
  onNext: () => void;
  onClose: () => void;
  isLastLesson?: boolean;
}

export function CompletionModal({ visible, onNext, onClose, isLastLesson = false }: CompletionModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptics
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12 });
      checkScale.value = withDelay(200, withSequence(
        withSpring(1.2),
        withSpring(1)
      ));
    } else {
      // Reset
      scale.value = 0;
      opacity.value = 0;
      checkScale.value = 0;
    }
  }, [visible]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }]
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, animatedContainerStyle]}>
          <LinearGradient
            colors={[Colors.light.background, '#F8FAFC']}
            style={styles.cardGradient}
          >
            <Animated.View style={[styles.iconContainer, animatedCheckStyle]}>
              <LinearGradient
                colors={[Colors.light.primary, '#4338CA']}
                style={styles.iconBackground}
              >
                <Feather name="check" size={40} color="white" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>
              {isLastLesson ? 'Course Completed!' : 'Lesson Completed!'}
            </Text>
            
            <Text style={styles.subtitle}>
              {isLastLesson 
                ? 'Congratulations! You have finished this course.' 
                : 'Great job! Ready for the next topic?'}
            </Text>

            <View style={styles.xpBadge}>
              <Feather name="zap" size={16} color="#F59E0B" />
              <Text style={styles.xpText}>+5 XP Earned</Text>
            </View>

            <View style={styles.buttonGroup}>
              <Button 
                title="Stay Here" 
                variant="ghost" 
                onPress={onClose}
                style={styles.secondaryBtn}
              />
              <Button 
                title={isLastLesson ? "Finish" : "Next Lesson"} 
                variant="primary" 
                onPress={onNext}
                style={styles.primaryBtn}
                icon={<Feather name={isLastLesson ? "flag" : "arrow-right"} size={16} color="white" />}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  cardGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 6,
  },
  xpText: {
    color: '#D97706',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
  },
  primaryBtn: {
    flex: 1.5,
  },
});
