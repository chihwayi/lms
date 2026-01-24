import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { Fonts, Colors } from '@/constants/theme';

export interface TextProps extends RNTextProps {
  variant?: 'default' | 'muted' | 'link';
}

export function Text({ style, variant = 'default', ...props }: TextProps) {
  const flatStyle = StyleSheet.flatten(style || {}) as TextStyle;
  
  let fontFamily = Fonts.regular;
  const weight = flatStyle.fontWeight;

  if (weight === 'bold' || weight === '700' || weight === '800' || weight === '900') {
    fontFamily = Fonts.bold;
  } else if (weight === '600') {
    fontFamily = Fonts.semiBold;
  } else if (weight === '500') {
    fontFamily = Fonts.medium;
  }

  // Remove fontWeight from style to rely on fontFamily
  const { fontWeight, ...restStyle } = flatStyle;

  const getTextColor = () => {
    switch (variant) {
      case 'muted': return Colors.light.textMuted;
      case 'link': return Colors.light.primary;
      default: return Colors.light.text;
    }
  };

  // If color is not explicitly provided in style, use default
  const color = (flatStyle.color as string) || getTextColor();

  return (
    <RNText 
      style={[
        { fontFamily, color }, 
        restStyle
      ]} 
      {...props} 
    />
  );
}
