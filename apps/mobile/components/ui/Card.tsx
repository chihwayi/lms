import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, TouchableOpacity, StyleProp } from 'react-native';
import { Colors } from '@/constants/theme';
import { getShadow } from '@/lib/styles';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'flat' | 'outlined';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'default', onPress, ...props }: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: Colors.light.card,
          ...getShadow(Colors.light.text, { width: 0, height: 1 }, 0.05, 2, 2)
        };
      case 'flat':
        return {
          backgroundColor: Colors.light.secondary,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.light.card,
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
    borderRadius: 12,
    padding: 16,
  },
});
