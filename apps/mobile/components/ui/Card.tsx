
import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, TouchableOpacity, StyleProp } from 'react-native';
import { Colors, Shadows, BorderRadius } from '@/constants/theme';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'flat' | 'outlined' | 'elevated';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'default', onPress, ...props }: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: Colors.light.card,
          borderWidth: 1,
          borderColor: Colors.light.border,
          ...Shadows.sm
        };
      case 'elevated':
        return {
          backgroundColor: Colors.light.card,
          borderWidth: 0,
          ...Shadows.md
        };
      case 'flat':
        return {
          backgroundColor: Colors.light.secondary,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
      default:
        return {};
    }
  };

  const Content = (
    <View style={[styles.card, getVariantStyles(), style]} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 16,
    overflow: 'visible', // Needed for shadows on iOS
  },
});
