import { Platform, ViewStyle } from 'react-native';

export function getShadow(
  color: string = '#000',
  offset: { width: number; height: number } = { width: 0, height: 2 },
  opacity: number = 0.1,
  radius: number = 4,
  elevation: number = 2
): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      // @ts-ignore - react-native-web supports boxShadow
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    };
  }
  
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: elevation,
  };
}
