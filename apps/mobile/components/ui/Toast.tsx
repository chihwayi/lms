import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { getShadow } from '@/lib/styles';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (props: Omit<ToastMessage, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(({ type, title, message, duration = 3000 }: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={[styles.toastContainer, { pointerEvents: 'box-none' } as any]}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => hideToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const getIconName = () => {
    switch (toast.type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  };

  const getColors = () => {
    const colors = Colors.light; // Default to light mode colors for consistency or use hook
    switch (toast.type) {
      case 'success': return { bg: '#ECFDF5', border: '#10B981', icon: '#059669' };
      case 'error': return { bg: '#FEF2F2', border: '#EF4444', icon: '#DC2626' };
      case 'warning': return { bg: '#FFFBEB', border: '#F59E0B', icon: '#D97706' };
      default: return { bg: '#EFF6FF', border: '#3B82F6', icon: '#2563EB' };
    }
  };

  const theme = getColors();

  return (
    <Animated.View 
      style={[
        styles.toast, 
        { 
          opacity: fadeAnim, 
          transform: [{ translateY }],
          backgroundColor: theme.bg,
          borderLeftColor: theme.border,
          ...getShadow(Colors.light.text, { width: 0, height: 2 }, 0.1, 4, 3)
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Feather name={getIconName()} size={24} color={theme.icon} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: Colors.light.text }]}>{toast.title}</Text>
        {toast.message && <Text style={[styles.message, { color: Colors.light.textSecondary }]}>{toast.message}</Text>}
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
        <Feather name="x" size={18} color={Colors.light.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Adjust for safe area
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});
