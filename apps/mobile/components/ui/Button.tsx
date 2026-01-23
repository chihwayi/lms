import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';

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
  textStyle
}: ButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.light.primary, text: Colors.light.primaryForeground, border: 'transparent' };
      case 'secondary':
        return { bg: Colors.light.secondary, text: Colors.light.secondaryForeground, border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: Colors.light.primary, border: Colors.light.border };
      case 'ghost':
        return { bg: 'transparent', text: Colors.light.primary, border: 'transparent' };
      case 'destructive':
        return { bg: Colors.light.destructive, text: Colors.light.destructiveForeground, border: 'transparent' };
      default:
        return { bg: Colors.light.primary, text: Colors.light.primaryForeground, border: 'transparent' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14 };
      case 'md': return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 16 };
      case 'lg': return { paddingVertical: 14, paddingHorizontal: 20, fontSize: 18 };
      default: return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 16 };
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
          opacity: disabled ? 0.5 : 1
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
              marginLeft: icon ? 8 : 0 
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
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
