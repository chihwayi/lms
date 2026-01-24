
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false
}: ButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { 
          bg: Colors.light.primary, 
          text: Colors.light.primaryForeground, 
          border: 'transparent',
          shadow: Shadows.sm
        };
      case 'secondary':
        return { 
          bg: Colors.light.secondary, 
          text: Colors.light.secondaryForeground, 
          border: 'transparent',
          shadow: {}
        };
      case 'outline':
        return { 
          bg: 'transparent', 
          text: Colors.light.primary, 
          border: Colors.light.border,
          shadow: {}
        };
      case 'ghost':
        return { 
          bg: 'transparent', 
          text: Colors.light.textSecondary, 
          border: 'transparent',
          shadow: {}
        };
      case 'destructive':
        return { 
          bg: Colors.light.destructive, 
          text: Colors.light.destructiveForeground, 
          border: 'transparent',
          shadow: Shadows.sm
        };
      default:
        return { 
          bg: Colors.light.primary, 
          text: Colors.light.primaryForeground, 
          border: 'transparent',
          shadow: Shadows.sm
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, height: 36 };
      case 'md': return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16, height: 48 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18, height: 56 };
      default: return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16, height: 48 };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { 
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          opacity: disabled ? 0.6 : 1,
          width: fullWidth ? '100%' : undefined,
          ...variantStyle.shadow
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text style={[
            styles.text, 
            { 
              color: variantStyle.text, 
              fontSize: sizeStyle.fontSize,
              marginLeft: icon ? 8 : 0,
              fontWeight: '600',
            },
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
