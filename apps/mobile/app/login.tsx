import { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConfigStore } from '@/stores/config-store';
import { useAuthStore } from '@/stores/auth-store';
import { Feather } from '@expo/vector-icons';
import { apiClient } from '@/lib/api-client';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={20} color="white" />
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
                  <Feather name="globe" size={12} color={Colors.light.primary} />
                  <Text style={styles.urlText} numberOfLines={1}>{displayUrl}</Text>
              </View>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to continue your learning journey.</Text>
            </View>

            <Card style={styles.formCard} variant="elevated">
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <Feather name="mail" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            placeholderTextColor={Colors.light.textMuted}
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
                        <Feather name="lock" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.light.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <Button 
                    title="Sign In"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    fullWidth
                    style={styles.loginButton}
                />
              </View>
            </Card>
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
  navBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  backText: {
    color: 'white',
    marginLeft: Spacing.xs,
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  urlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  urlText: {
    fontSize: 12,
    color: Colors.light.primary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
    maxWidth: 200,
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
  form: {
    width: '100%',
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
  loginButton: {
    marginTop: Spacing.sm,
  },
});
