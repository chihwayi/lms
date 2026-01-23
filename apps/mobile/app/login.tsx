import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConfigStore } from '@/stores/config-store';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { apiClient } from '@/lib/api-client';
import { StatusBar } from 'expo-status-bar';
import { getShadow } from '@/lib/styles';

export default function LoginScreen() {
  const router = useRouter();
  const { instanceUrl, reset } = useConfigStore();
  const { setAccessToken, setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    reset(); // Clear instance URL
    router.replace('/');
  };

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
    }

    setLoading(true);
    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await setAccessToken(data.accessToken);
      if (data.user) {
          setUser(data.user);
      }
      
      router.replace('/(app)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayUrl = instanceUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color="#4F46E5" />
          <Text style={styles.backText}>Change Instance</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.urlBadge}>
                <Feather name="globe" size={12} color="#4F46E5" />
                <Text style={styles.urlText} numberOfLines={1}>{displayUrl}</Text>
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue your learning journey.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                    <Feather name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="name@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                    <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.loginButton, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Feather name="log-in" size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
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
  navBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignSelf: 'flex-start',
    ...getShadow('#000', { width: 0, height: 2 }, 0.05, 4, 2),
  },
  backText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 32,
  },
  urlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  urlText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    maxWidth: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...getShadow('#000', { width: 0, height: 4 }, 0.05, 16, 2),
  },
  inputGroup: {
    marginBottom: 20,
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
  loginButton: {
    height: 56,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    ...getShadow('#4F46E5', { width: 0, height: 4 }, 0.2, 8, 4),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
