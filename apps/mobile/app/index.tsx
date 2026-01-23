import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConfigStore } from '@/stores/config-store';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { getShadow } from '@/lib/styles';
import { useToast } from '@/components/ui/Toast';

export default function SetupScreen() {
  const router = useRouter();
  const { instanceUrl, setInstanceUrl } = useConfigStore();
  const { initialize, accessToken } = useAuthStore();
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
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
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Feather name="cloud" size={40} color="#4F46E5" />
            </View>
            <Text style={styles.title}>Connect to EduFlow</Text>
            <Text style={styles.subtitle}>
              Enter your organization's URL to access your learning portal.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instance URL</Text>
              <View style={styles.inputWrapper}>
                <Feather name="link" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="https://learning.yourcompany.com"
                  placeholderTextColor="#9CA3AF"
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="go"
                  onSubmitEditing={handleConnect}
                />
              </View>
            </View>

            <TouchableOpacity 
                style={[styles.button, (!url || loading) && styles.buttonDisabled]} 
                onPress={handleConnect}
                disabled={!url || loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.buttonText}>Connect</Text>
                        <Feather name="arrow-right" size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
            
            <View style={styles.helpContainer}>
                <Feather name="info" size={14} color="#6B7280" />
                <Text style={styles.helperText}>
                    Ask your administrator if you don't know your URL.
                </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    ...getShadow('#4F46E5', { width: 0, height: 4 }, 0.1, 12, 4),
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...getShadow('#000', { width: 0, height: 4 }, 0.05, 16, 2),
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    ...getShadow('#4F46E5', { width: 0, height: 4 }, 0.2, 8, 4),
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF',
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0, elevation: 0 }
    })
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
