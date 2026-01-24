import { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConfigStore } from '@/stores/config-store';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useToast } from '@/components/ui/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SetupScreen() {
  const router = useRouter();
  const { instanceUrl, setInstanceUrl } = useConfigStore();
  const { initialize, accessToken } = useAuthStore();
  const { showToast } = useToast();
  const [url, setUrl] = useState(__DEV__ ? 'http://localhost:3001' : '');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    await initialize();
    const state = useAuthStore.getState();
    const configState = useConfigStore.getState();
    
    if (configState.instanceUrl) {
       if (state.accessToken) {
         router.replace('/(app)/dashboard');
       } else {
         router.replace('/login');
       }
    }
    setChecking(false);
  };

  const handleConnect = async () => {
    if (!url) return;
    
    let formattedUrl = url.trim();
    if (formattedUrl.endsWith('/')) {
        formattedUrl = formattedUrl.slice(0, -1);
    }
    
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    setLoading(true);
    try {
      console.log('Connecting to:', formattedUrl);
      // Basic check
      const res = await fetch(`${formattedUrl}/api/v1/health`);
      if (!res.ok) throw new Error('Failed to connect to instance');
      
      const data = await res.json();
      if (data.app !== 'EduFlow') {
        throw new Error('This URL is not a valid EduFlow instance');
      }
      
      setInstanceUrl(formattedUrl);
      router.replace('/login');
      
    } catch (error: any) {
       console.error('Connection error:', error);
       showToast({ 
         type: 'error', 
         title: 'Connection Failed', 
         message: error.message || 'Could not connect to the server' 
       });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
        <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name="cloud" size={48} color="white" />
              </View>
              <Text style={styles.title}>Connect to EduFlow</Text>
              <Text style={styles.subtitle}>
                Enter your institution's URL to access your learning portal.
              </Text>
            </View>

            <Card style={styles.formCard} variant="elevated">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instance URL</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="link" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. https://learning.eduflow.com"
                    placeholderTextColor={Colors.light.textMuted}
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
              </View>

              <Button 
                title="Connect"
                onPress={handleConnect}
                loading={loading}
                disabled={!url || loading}
                fullWidth
                style={styles.button}
              />
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Powered by EduFlow</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    height: 50,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.light.text,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  button: {
    marginTop: Spacing.xs,
  },
  footer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});
